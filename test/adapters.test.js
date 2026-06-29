'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildSapBusinessPartnerUrl,
  readBusinessPartners,
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

test('SAP BP sandbox URL keeps the Business Accelerator Hub base path', async () => {
  const url = buildSapBusinessPartnerUrl('https://sandbox.api.sap.com/s4hanacloud');

  assert.equal(
    url.origin + url.pathname,
    'https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner'
  );
});

test('SAP BP adapter can call sandbox mode with injected credentials', async () => {
  let requestedUrl;
  let requestedApiKey;
  const fetchImpl = async (url, options) => {
    requestedUrl = String(url);
    requestedApiKey = options.headers.APIKey;
    return new Response(JSON.stringify({
      value: [
        {
          BusinessPartner: '100000999',
          BusinessPartnerFullName: 'Sandbox Supplier'
        }
      ]
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    });
  };

  const result = await readBusinessPartners(
    { companyName: 'Sandbox Supplier' },
    {
      mode: 'sap_sandbox',
      baseUrl: 'https://sandbox.api.sap.com/s4hanacloud',
      apiKey: 'secret-key',
      fetchImpl
    }
  );

  assert.match(requestedUrl, /^https:\/\/sandbox\.api\.sap\.com\/s4hanacloud\/sap\/opu\/odata\/sap\/API_BUSINESS_PARTNER/);
  assert.equal(requestedApiKey, 'secret-key');
  assert.deepEqual(result, [
    {
      sapBpId: '100000999',
      name: 'Sandbox Supplier',
      country: undefined,
      city: undefined,
      street: undefined,
      score: 70,
      source: 'SAP_SANDBOX'
    }
  ]);
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
