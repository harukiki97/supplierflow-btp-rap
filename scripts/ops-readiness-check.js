'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  parseCsv,
  validateMigrationRow,
  evaluateGoLiveReadiness
} = require('../srv/lib/ops-readiness');

const migrationFile = path.join(
  __dirname,
  '..',
  'implementation-ops',
  'templates',
  'supplier_master_migration_sample.csv'
);

const rows = parseCsv(fs.readFileSync(migrationFile, 'utf8'));
const validations = rows.map(validateMigrationRow);
const invalidRows = validations.filter((result) => !result.valid);
const warningRows = validations.filter((result) => result.warnings.length > 0);

const readiness = evaluateGoLiveReadiness([
  {
    id: 'MIGRATION_REQUIRED_FIELDS',
    status: invalidRows.length === 0 ? 'pass' : 'fail'
  },
  {
    id: 'MIGRATION_WARNINGS_REVIEWED',
    status: warningRows.length === 0 ? 'pass' : 'warning'
  },
  {
    id: 'CUTOVER_PLAN_READY',
    status: 'pass'
  },
  {
    id: 'OPERATIONS_RUNBOOK_READY',
    status: 'pass'
  }
]);

console.log(JSON.stringify({
  migrationFile,
  rowCount: rows.length,
  invalidRows: invalidRows.length,
  warningRows: warningRows.length,
  readiness
}, null, 2));
