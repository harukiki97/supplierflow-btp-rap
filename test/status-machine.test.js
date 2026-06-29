'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  STATUS,
  canTransition,
  assertTransition,
  validateSupplierRequest,
  classifyHttpStatus,
  buildIdempotencyKey,
  determineReviewLevel
} = require('../srv/lib/status-machine');

test('allows expected supplier request transitions', () => {
  assert.equal(canTransition(STATUS.DRAFT, STATUS.SUBMITTED), true);
  assert.equal(canTransition(STATUS.SUBMITTED, STATUS.APPROVED), true);
  assert.equal(canTransition(STATUS.APPROVED, STATUS.SYNCING), true);
  assert.equal(canTransition(STATUS.SYNC_FAILED, STATUS.SYNCING), true);
});

test('rejects invalid status transitions', () => {
  assert.equal(canTransition(STATUS.SUBMITTED, STATUS.SYNCED), false);
  assert.throws(
    () => assertTransition(STATUS.SUBMITTED, STATUS.SYNCED),
    /Invalid status transition/
  );
});

test('validates required supplier fields and risk range', () => {
  assert.doesNotThrow(() => validateSupplierRequest({
    companyName: 'Hankook Precision Parts',
    country: 'KR',
    riskScore: 42
  }));

  assert.throws(() => validateSupplierRequest({ companyName: '', country: 'KR' }), /companyName/);
  assert.throws(() => validateSupplierRequest({ companyName: 'A', country: 'KR', riskScore: 101 }), /riskScore/);
});

test('classifies 4xx as business error and 5xx as retryable technical error', () => {
  assert.deepEqual(classifyHttpStatus(400), {
    retryable: false,
    category: 'BUSINESS_ERROR',
    message: 'Input or business error. Manual correction is required.'
  });

  assert.equal(classifyHttpStatus(500).retryable, true);
  assert.equal(classifyHttpStatus(0).retryable, true);
});

test('idempotency key is stable for same request and operation', () => {
  const keyA = buildIdempotencyKey('11111111-1111-4111-8111-111111111111', 'CREATE_BP');
  const keyB = buildIdempotencyKey('11111111-1111-4111-8111-111111111111', 'CREATE_BP');
  const keyC = buildIdempotencyKey('11111111-1111-4111-8111-111111111111', 'UPDATE_BP');

  assert.equal(keyA, keyB);
  assert.notEqual(keyA, keyC);
  assert.equal(keyA.length, 32);
});

test('determines RAP-style review level boundaries', () => {
  assert.equal(determineReviewLevel(0), 'LOW');
  assert.equal(determineReviewLevel(39), 'LOW');
  assert.equal(determineReviewLevel(40), 'MEDIUM');
  assert.equal(determineReviewLevel(69), 'MEDIUM');
  assert.equal(determineReviewLevel(70), 'HIGH');
  assert.equal(determineReviewLevel(100), 'HIGH');
  assert.throws(() => determineReviewLevel(101), /Risk threshold/);
});
