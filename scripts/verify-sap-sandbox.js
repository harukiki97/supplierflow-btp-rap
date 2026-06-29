'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  buildSapBusinessPartnerUrl,
  mapSapBusinessPartner
} = require('../srv/lib/sap-bp-adapter');

require('dotenv').config();

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'evidence', 'generated');
const TOP = Number(process.env.SAP_SANDBOX_TOP || 3);

async function main() {
  const baseUrl = process.env.SAP_API_BASE_URL;
  const apiKey = process.env.SAP_API_KEY;

  if (!baseUrl || !apiKey || isPlaceholderApiKey(apiKey)) {
    console.error('SAP Sandbox verification skipped.');
    console.error('Required local .env values: SAP_API_BASE_URL and SAP_API_KEY.');
    console.error('Do not commit the API key. Add it only to your local .env file.');
    process.exitCode = 1;
    return;
  }

  const url = buildSapBusinessPartnerUrl(baseUrl);
  url.searchParams.set('$top', String(TOP));
  url.searchParams.set('$expand', 'to_BusinessPartnerAddress');

  const startedAt = new Date();
  const response = await fetch(url, {
    headers: {
      APIKey: apiKey,
      Accept: 'application/json'
    }
  });

  const body = await parseBody(response);
  const rows = Array.isArray(body.value)
    ? body.value
    : Array.isArray(body.d?.results)
      ? body.d.results
      : [];

  const mappedCandidates = rows.map(mapSapBusinessPartner).map((candidate) => ({
    sapBpId: candidate.sapBpId,
    name: candidate.name,
    country: candidate.country,
    city: candidate.city,
    score: candidate.score,
    source: candidate.source
  }));

  const evidence = {
    verifiedAt: startedAt.toISOString(),
    api: 'API_BUSINESS_PARTNER',
    entity: 'A_BusinessPartner',
    method: 'GET',
    endpoint: redactEndpoint(url),
    httpStatus: response.status,
    ok: response.ok,
    rowCount: rows.length,
    mappedCandidates,
    note: 'API key is loaded from local .env and is never written to evidence output.'
  };

  if (!response.ok) {
    evidence.error = summarizeErrorBody(body);
    console.error(JSON.stringify(evidence, null, 2));
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'sap-sandbox-result.json'),
    `${JSON.stringify(evidence, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'sap-sandbox-result.md'),
    renderMarkdown(evidence)
  );

  console.log(JSON.stringify({
    ok: evidence.ok,
    httpStatus: evidence.httpStatus,
    rowCount: evidence.rowCount,
    evidence: [
      'docs/evidence/generated/sap-sandbox-result.json',
      'docs/evidence/generated/sap-sandbox-result.md'
    ]
  }, null, 2));
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text.slice(0, 500)
    };
  }
}

function isPlaceholderApiKey(apiKey) {
  return [
    'replace-with-local-secret',
    'PASTE_YOUR_SAP_BUSINESS_ACCELERATOR_HUB_API_KEY_HERE'
  ].includes(apiKey);
}

function redactEndpoint(url) {
  const copy = new URL(url);
  copy.searchParams.sort();
  return copy.toString();
}

function summarizeErrorBody(body) {
  if (body.error?.message?.value) return body.error.message.value;
  if (body.error?.message) return body.error.message;
  if (body.message) return body.message;
  if (body.raw) return body.raw;
  return 'No JSON error body returned.';
}

function renderMarkdown(evidence) {
  const candidates = evidence.mappedCandidates.length > 0
    ? evidence.mappedCandidates
      .map((candidate) => `| ${candidate.sapBpId || ''} | ${candidate.name || ''} | ${candidate.country || ''} | ${candidate.city || ''} | ${candidate.score} | ${candidate.source} |`)
      .join('\n')
    : '| - | - | - | - | - | - |';

  return `# SAP Sandbox Verification Result

| Field | Value |
| --- | --- |
| Verified At | ${evidence.verifiedAt} |
| API | ${evidence.api} |
| Entity | ${evidence.entity} |
| Method | ${evidence.method} |
| HTTP Status | ${evidence.httpStatus} |
| Row Count | ${evidence.rowCount} |

## Endpoint

\`\`\`text
${evidence.endpoint}
\`\`\`

## Mapped Duplicate Candidates

| Business Partner | Name | Country | City | Score | Source |
| --- | --- | --- | --- | --- | --- |
${candidates}

## Security

The API key was loaded from local \`.env\` and was not written to this file.
`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
