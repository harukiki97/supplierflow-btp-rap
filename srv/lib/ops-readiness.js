'use strict';

const REQUIRED_MIGRATION_FIELDS = Object.freeze([
  'supplierId',
  'companyName',
  'country',
  'taxNumber',
  'paymentTerms',
  'reconciliationAccount',
  'purchasingOrg'
]);

function parseCsv(text) {
  const lines = String(text || '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;

  for (const char of String(line)) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function validateMigrationRow(row) {
  const missing = REQUIRED_MIGRATION_FIELDS.filter((field) => !String(row[field] || '').trim());
  const warnings = [];

  if (row.country && !/^[A-Z]{2}$/.test(row.country)) {
    warnings.push('country should use ISO-2 uppercase code');
  }

  if (row.paymentTerms && !/^(Z\d{3}|NT\d{2})$/.test(row.paymentTerms)) {
    warnings.push('paymentTerms should match ERP payment-term code pattern');
  }

  if (row.riskScore !== undefined && row.riskScore !== '') {
    const riskScore = Number(row.riskScore);
    if (!Number.isInteger(riskScore) || riskScore < 0 || riskScore > 100) {
      warnings.push('riskScore should be an integer from 0 to 100');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

function classifyIncident(impact, urgency) {
  const normalizedImpact = normalizePriorityInput(impact);
  const normalizedUrgency = normalizePriorityInput(urgency);

  if (normalizedImpact === 'high' && normalizedUrgency === 'high') return 'P1';
  if (normalizedImpact === 'high' || normalizedUrgency === 'high') return 'P2';
  if (normalizedImpact === 'medium' || normalizedUrgency === 'medium') return 'P3';
  return 'P4';
}

function normalizePriorityInput(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['high', 'medium', 'low'].includes(normalized)) return normalized;
  return 'low';
}

function evaluateGoLiveReadiness(checks) {
  const blocked = checks
    .filter((check) => check.status === 'fail')
    .map((check) => check.id);
  const warnings = checks
    .filter((check) => check.status === 'warning')
    .map((check) => check.id);

  return {
    ready: blocked.length === 0,
    blocked,
    warnings
  };
}

function reconcileMigration(sourceRows, targetRows, key = 'supplierId') {
  const targetByKey = new Map(targetRows.map((row) => [String(row[key]), row]));
  const missingInTarget = [];
  const mismatched = [];
  let matched = 0;

  for (const source of sourceRows) {
    const target = targetByKey.get(String(source[key]));

    if (!target) {
      missingInTarget.push(source[key]);
      continue;
    }

    matched += 1;

    const changedFields = Object.keys(source)
      .filter((field) => field !== key)
      .filter((field) => String(source[field] || '') !== String(target[field] || ''));

    if (changedFields.length > 0) {
      mismatched.push({
        key: source[key],
        fields: changedFields
      });
    }
  }

  return {
    sourceCount: sourceRows.length,
    targetCount: targetRows.length,
    matched,
    missingInTarget,
    mismatched
  };
}

module.exports = {
  REQUIRED_MIGRATION_FIELDS,
  parseCsv,
  validateMigrationRow,
  classifyIncident,
  evaluateGoLiveReadiness,
  reconcileMigration
};
