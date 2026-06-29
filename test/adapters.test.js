'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  readMockBusinessPartners,
  mapSapBusinessPartner
} = require('../srv/lib/sap-bp-adapter');
const { createBusinessPartner } = require('../srv/lib/mock-erp-client');

test('mock SAP BP adapter returns scored candidates', () => {
  const candidates = readMockBusinessPartners({
    companyName: 'Hankook Precision',
    country: 'KR'
  });

  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].country, 'KR');
  assert.ok(candidates[0].score >= 80);
});

test('SAP BP response mapper handles nested address data', () => {
  const mapped = mapSapBusinessPartner({
    BusinessPartner: '100000123',
    BusinessPartnerFullName: 'Acme Parts',
    to_BusinessPartnerAddress: {
      results: [
        {
          Country: 'US',
          CityName: 'Irvine',
          StreetName: 'Technology Dr'
        }
      ]
    }
  });

  assert.deepEqual(mapped, {
    sapBpId: '100000123',
    name: 'Acme Parts',
    country: 'US',
    city: 'Irvine',
    street: 'Technology Dr',
    score: 70,
    source: 'SAP_SANDBOX'
  });
});

test('mock ERP client returns business partner id on success', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({
    businessPartnerId: 'MOCK-BP-1234',
    idempotentReplay: false
  }), {
    status: 201,
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': 'corr-1'
    }
  });

  const result = await createBusinessPartner(
    { externalRequestId: 'REQ-1', companyName: 'Acme' },
    'stable-key',
    { baseUrl: 'http://mock.local', fetchImpl }
  );

  assert.equal(result.businessPartnerId, 'MOCK-BP-1234');
  assert.equal(result.httpStatus, 201);
  assert.equal(result.correlationId, 'corr-1');
});

test('mock ERP client throws structured error on failed write', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({
    code: 'ERP_TEMPORARY_FAILURE',
    message: 'Temporary outage'
  }), {
    status: 500,
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': 'corr-2'
    }
  });

  await assert.rejects(
    () => createBusinessPartner(
      { externalRequestId: 'REQ-1', companyName: 'Acme' },
      'stable-key',
      { baseUrl: 'http://mock.local', fetchImpl }
    ),
    (error) => {
      assert.equal(error.code, 'ERP_TEMPORARY_FAILURE');
      assert.equal(error.httpStatus, 500);
      assert.equal(error.correlationId, 'corr-2');
      return true;
    }
  );
});
