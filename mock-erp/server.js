'use strict';

require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');

const app = express();
const port = Number(process.env.MOCK_ERP_PORT || 4010);
const idempotencyStore = new Map();

app.use(express.json());

app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', correlationId);
  req.correlationId = correlationId;
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'mock-erp',
    time: new Date().toISOString()
  });
});

app.post('/business-partners', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({
      code: 'MISSING_IDEMPOTENCY_KEY',
      message: 'idempotency-key header is required'
    });
  }

  const forcedStatus = Number(req.query.forceStatus || req.body.forceStatus || 0);
  if (forcedStatus === 400) {
    return res.status(400).json({
      code: 'VALIDATION_FAILED',
      message: 'Mock validation failed for supplier payload'
    });
  }

  if (forcedStatus >= 500) {
    return res.status(forcedStatus).json({
      code: 'ERP_TEMPORARY_FAILURE',
      message: 'Mock ERP technical failure'
    });
  }

  if (req.query.timeout === 'true' || req.body.timeout === true) {
    await delay(35000);
  }

  if (idempotencyStore.has(idempotencyKey)) {
    return res.status(200).json({
      ...idempotencyStore.get(idempotencyKey),
      idempotentReplay: true
    });
  }

  const businessPartnerId = createMockBusinessPartnerId(req.body.externalRequestId);
  const response = {
    businessPartnerId,
    externalRequestId: req.body.externalRequestId,
    companyName: req.body.companyName,
    createdAt: new Date().toISOString(),
    idempotentReplay: false
  };

  idempotencyStore.set(idempotencyKey, response);
  return res.status(201).json(response);
});

app.patch('/business-partners/:businessPartnerId', (req, res) => {
  res.json({
    businessPartnerId: req.params.businessPartnerId,
    updatedAt: new Date().toISOString(),
    changedFields: Object.keys(req.body || {})
  });
});

function createMockBusinessPartnerId(seed) {
  const digest = crypto.createHash('sha1')
    .update(String(seed || crypto.randomUUID()))
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();
  return `MOCK-BP-${digest}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(port, () => {
  console.log(`Mock ERP listening on http://localhost:${port}`);
});
