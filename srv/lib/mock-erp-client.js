'use strict';

class ErpClientError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ErpClientError';
    Object.assign(this, details);
  }
}

async function createBusinessPartner(payload, idempotencyKey, options = {}) {
  const baseUrl = options.baseUrl || process.env.MOCK_ERP_BASE_URL || 'http://localhost:4010';
  const fetchImpl = options.fetchImpl || fetch;
  const url = new URL('/business-partners', baseUrl);

  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey
    },
    body: JSON.stringify(payload)
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = { message: 'Non-JSON ERP response' };
  }

  if (!response.ok) {
    throw new ErpClientError(body.message || `Mock ERP failed with HTTP ${response.status}`, {
      code: body.code || 'MOCK_ERP_ERROR',
      httpStatus: response.status,
      correlationId: response.headers.get('x-correlation-id'),
      responseBody: body
    });
  }

  return {
    businessPartnerId: body.businessPartnerId,
    raw: body,
    httpStatus: response.status,
    correlationId: response.headers.get('x-correlation-id')
  };
}

module.exports = {
  ErpClientError,
  createBusinessPartner
};
