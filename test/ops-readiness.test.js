'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  parseCsv,
  validateMigrationRow,
  classifyIncident,
  evaluateGoLiveReadiness,
  reconcileMigration
} = require('../srv/lib/ops-readiness');

test('parses supplier migration CSV rows', () => {
  const rows = parseCsv('supplierId,companyName,country\nSUP-1,Acme Parts,KR\n');

  assert.deepEqual(rows, [
    {
      supplierId: 'SUP-1',
      companyName: 'Acme Parts',
      country: 'KR'
    }
  ]);
});

test('validates required migration fields', () => {
  const result = validateMigrationRow({
    supplierId: 'SUP-1',
    companyName: 'Acme Parts',
    country: 'KR',
    taxNumber: 'KR-123',
    paymentTerms: 'Z030',
    reconciliationAccount: '210000',
    purchasingOrg: 'KR01',
    riskScore: '55'
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.warnings, []);
});

test('reports missing migration fields and warnings', () => {
  const result = validateMigrationRow({
    supplierId: '',
    companyName: 'Acme Parts',
    country: 'KOR',
    taxNumber: '',
    paymentTerms: '30DAYS',
    reconciliationAccount: '210000',
    purchasingOrg: 'KR01',
    riskScore: '120'
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['supplierId', 'taxNumber']);
  assert.equal(result.warnings.length, 3);
});

test('classifies incidents by impact and urgency', () => {
  assert.equal(classifyIncident('high', 'high'), 'P1');
  assert.equal(classifyIncident('high', 'low'), 'P2');
  assert.equal(classifyIncident('medium', 'low'), 'P3');
  assert.equal(classifyIncident('low', 'low'), 'P4');
});

test('blocks go-live readiness when checks fail', () => {
  const readiness = evaluateGoLiveReadiness([
    { id: 'UAT_SIGNOFF', status: 'pass' },
    { id: 'P1_DEFECTS', status: 'fail' },
    { id: 'MINOR_WARNINGS', status: 'warning' }
  ]);

  assert.equal(readiness.ready, false);
  assert.deepEqual(readiness.blocked, ['P1_DEFECTS']);
  assert.deepEqual(readiness.warnings, ['MINOR_WARNINGS']);
});

test('reconciles source and target migration rows', () => {
  const result = reconcileMigration(
    [
      { supplierId: 'SUP-1', paymentTerms: 'Z030' },
      { supplierId: 'SUP-2', paymentTerms: 'Z060' }
    ],
    [
      { supplierId: 'SUP-1', paymentTerms: 'Z045' }
    ]
  );

  assert.equal(result.sourceCount, 2);
  assert.equal(result.targetCount, 1);
  assert.equal(result.matched, 1);
  assert.deepEqual(result.missingInTarget, ['SUP-2']);
  assert.deepEqual(result.mismatched, [
    {
      key: 'SUP-1',
      fields: ['paymentTerms']
    }
  ]);
});
