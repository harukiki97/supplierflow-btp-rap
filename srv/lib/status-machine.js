'use strict';

const crypto = require('node:crypto');

const STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  SYNC_FAILED: 'SYNC_FAILED',
  REJECTED: 'REJECTED'
});

const transitions = Object.freeze({
  [STATUS.DRAFT]: new Set([STATUS.SUBMITTED]),
  [STATUS.SUBMITTED]: new Set([STATUS.APPROVED, STATUS.REJECTED]),
  [STATUS.REJECTED]: new Set([STATUS.DRAFT]),
  [STATUS.APPROVED]: new Set([STATUS.SYNCING]),
  [STATUS.SYNCING]: new Set([STATUS.SYNCED, STATUS.SYNC_FAILED]),
  [STATUS.SYNC_FAILED]: new Set([STATUS.SYNCING]),
  [STATUS.SYNCED]: new Set([])
});

function canTransition(fromStatus, toStatus) {
  return Boolean(transitions[fromStatus] && transitions[fromStatus].has(toStatus));
}

function assertTransition(fromStatus, toStatus) {
  if (!canTransition(fromStatus, toStatus)) {
    const error = new Error(`Invalid status transition: ${fromStatus} -> ${toStatus}`);
    error.code = 'INVALID_STATUS_TRANSITION';
    error.status = 400;
    throw error;
  }
}

function validateSupplierRequest(request) {
  const missing = [];
  if (!request.companyName || !request.companyName.trim()) missing.push('companyName');
  if (!request.country || !request.country.trim()) missing.push('country');

  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    error.details = missing;
    throw error;
  }

  if (request.riskScore !== undefined && request.riskScore !== null) {
    const riskScore = Number(request.riskScore);
    if (!Number.isInteger(riskScore) || riskScore < 0 || riskScore > 100) {
      const error = new Error('riskScore must be an integer from 0 to 100');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
  }
}

function classifyHttpStatus(statusCode) {
  if (statusCode >= 400 && statusCode < 500) {
    return {
      retryable: false,
      category: 'BUSINESS_ERROR',
      message: 'Input or business error. Manual correction is required.'
    };
  }

  if (statusCode >= 500 || statusCode === 0) {
    return {
      retryable: true,
      category: 'TECHNICAL_ERROR',
      message: 'Technical error. Retry is allowed.'
    };
  }

  return {
    retryable: false,
    category: 'NONE',
    message: 'No error.'
  };
}

function buildIdempotencyKey(requestId, operation) {
  return crypto.createHash('sha256')
    .update(`${requestId}:${operation}`)
    .digest('hex')
    .slice(0, 32);
}

function hashPayload(payload) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 32);
}

function determineReviewLevel(riskThreshold) {
  const value = Number(riskThreshold);
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    const error = new Error('Risk threshold must be an integer from 0 to 100');
    error.code = 'INVALID_RISK_THRESHOLD';
    error.status = 400;
    throw error;
  }

  if (value <= 39) return 'LOW';
  if (value <= 69) return 'MEDIUM';
  return 'HIGH';
}

module.exports = {
  STATUS,
  canTransition,
  assertTransition,
  validateSupplierRequest,
  classifyHttpStatus,
  buildIdempotencyKey,
  hashPayload,
  determineReviewLevel
};
