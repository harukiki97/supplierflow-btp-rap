'use strict';

require('dotenv').config();

const cds = require('@sap/cds');
const {
  STATUS,
  assertTransition,
  validateSupplierRequest,
  classifyHttpStatus,
  buildIdempotencyKey,
  hashPayload
} = require('./lib/status-machine');
const { readBusinessPartners } = require('./lib/sap-bp-adapter');
const { createBusinessPartner } = require('./lib/mock-erp-client');
const { maskObject } = require('./lib/masking');

module.exports = cds.service.impl(async function supplierService() {
  const {
    SupplierRequests,
    DuplicateCandidates,
    ApprovalHistories,
    IntegrationLogs
  } = this.entities;

  this.before(['CREATE', 'UPDATE'], SupplierRequests, (req) => {
    if (req.data.status && req.data.status !== STATUS.DRAFT && req.event === 'CREATE') {
      req.reject(400, 'New supplier requests must start as DRAFT');
    }
    validateSupplierRequest(req.data);
  });

  this.on('checkDuplicates', SupplierRequests, async (req) => {
    const requestId = req.params[0].ID;
    const supplierRequest = await loadRequestOrReject(requestId, req);
    const candidates = await readBusinessPartners({
      companyName: supplierRequest.companyName,
      country: supplierRequest.country
    });

    await DELETE.from(DuplicateCandidates).where({ request_ID: requestId });
    if (candidates.length > 0) {
      await INSERT.into(DuplicateCandidates).entries(
        candidates.map((candidate) => ({
          request_ID: requestId,
          sapBpId: candidate.sapBpId,
          name: candidate.name,
          country: candidate.country,
          city: candidate.city,
          street: candidate.street,
          score: candidate.score,
          source: candidate.source,
          rawHash: hashPayload(candidate)
        }))
      );
    }

    await UPDATE(SupplierRequests)
      .set({ sapDuplicateCheckedAt: new Date().toISOString() })
      .where({ ID: requestId });

    return candidates;
  });

  this.on('submit', SupplierRequests, async (req) => {
    const requestId = req.params[0].ID;
    const supplierRequest = await loadRequestOrReject(requestId, req);
    validateSupplierRequest(supplierRequest);
    let fromStatus = supplierRequest.status;

    if (supplierRequest.status === STATUS.REJECTED) {
      await transition(requestId, supplierRequest.status, STATUS.DRAFT, 'REOPEN', req.user.id);
      fromStatus = STATUS.DRAFT;
    }

    assertTransition(fromStatus, STATUS.SUBMITTED);
    await transition(requestId, fromStatus, STATUS.SUBMITTED, 'SUBMIT', req.user.id, {
      submittedAt: new Date().toISOString()
    });

    return loadRequestOrReject(requestId, req);
  });

  this.on('approve', SupplierRequests, async (req) => {
    const requestId = req.params[0].ID;
    const supplierRequest = await loadRequestOrReject(requestId, req);
    assertTransition(supplierRequest.status, STATUS.APPROVED);

    await transition(requestId, supplierRequest.status, STATUS.APPROVED, 'APPROVE', req.user.id, {
      approvedAt: new Date().toISOString()
    });

    return syncToMockErp(requestId, req.user.id);
  });

  this.on('rejectRequest', SupplierRequests, async (req) => {
    const requestId = req.params[0].ID;
    const reason = req.data.reason;
    if (!reason || !reason.trim()) {
      req.reject(400, 'Rejection reason is required');
    }

    const supplierRequest = await loadRequestOrReject(requestId, req);
    assertTransition(supplierRequest.status, STATUS.REJECTED);
    await transition(requestId, supplierRequest.status, STATUS.REJECTED, 'REJECT', req.user.id, {
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    }, reason);

    return loadRequestOrReject(requestId, req);
  });

  this.on('retrySync', SupplierRequests, async (req) => {
    const requestId = req.params[0].ID;
    const supplierRequest = await loadRequestOrReject(requestId, req);
    assertTransition(supplierRequest.status, STATUS.SYNCING);
    return syncToMockErp(requestId, req.user.id);
  });

  async function loadRequestOrReject(requestId, req) {
    const supplierRequest = await SELECT.one.from(SupplierRequests).where({ ID: requestId });
    if (!supplierRequest) {
      req.reject(404, `SupplierRequest not found: ${requestId}`);
    }
    return supplierRequest;
  }

  async function transition(requestId, fromStatus, toStatus, action, actor, extra = {}, reason = null) {
    assertTransition(fromStatus, toStatus);
    await UPDATE(SupplierRequests).set({ status: toStatus, ...extra }).where({ ID: requestId });
    await INSERT.into(ApprovalHistories).entries({
      request_ID: requestId,
      action,
      actor,
      reason,
      fromStatus,
      toStatus
    });
  }

  async function syncToMockErp(requestId, actor) {
    const supplierRequest = await SELECT.one.from(SupplierRequests).where({ ID: requestId });
    assertTransition(supplierRequest.status, STATUS.SYNCING);

    const nextAttempt = (supplierRequest.syncAttemptCount || 0) + 1;
    await transition(requestId, supplierRequest.status, STATUS.SYNCING, 'SYNC_START', actor, {
      syncAttemptCount: nextAttempt
    });

    const payload = {
      externalRequestId: requestId,
      companyName: supplierRequest.companyName,
      country: supplierRequest.country,
      taxNumber: supplierRequest.taxNumber,
      supplierType: supplierRequest.supplierType,
      riskScore: supplierRequest.riskScore
    };

    const idempotencyKey = buildIdempotencyKey(requestId, 'CREATE_BP');

    try {
      const result = await createBusinessPartner(payload, idempotencyKey);
      await INSERT.into(IntegrationLogs).entries({
        request_ID: requestId,
        operation: 'CREATE_BP',
        httpStatus: result.httpStatus,
        correlationId: result.correlationId,
        attemptNo: nextAttempt,
        retryable: false,
        payloadHash: hashPayload(maskObject(payload)),
        responseBody: JSON.stringify(maskObject(result.raw))
      });

      await transition(requestId, STATUS.SYNCING, STATUS.SYNCED, 'SYNC_SUCCESS', actor, {
        mockBpId: result.businessPartnerId,
        lastErrorCode: null,
        lastErrorMessage: null
      });
    } catch (error) {
      const httpStatus = error.httpStatus || 0;
      const classification = classifyHttpStatus(httpStatus);
      await INSERT.into(IntegrationLogs).entries({
        request_ID: requestId,
        operation: 'CREATE_BP',
        httpStatus,
        errorCode: error.code || classification.category,
        errorMessage: error.message,
        correlationId: error.correlationId,
        attemptNo: nextAttempt,
        retryable: classification.retryable,
        payloadHash: hashPayload(maskObject(payload)),
        responseBody: JSON.stringify(maskObject(error.responseBody || {}))
      });

      await transition(requestId, STATUS.SYNCING, STATUS.SYNC_FAILED, 'SYNC_FAILED', actor, {
        lastErrorCode: error.code || classification.category,
        lastErrorMessage: error.message
      });
    }

    return SELECT.one.from(SupplierRequests).where({ ID: requestId });
  }
});
