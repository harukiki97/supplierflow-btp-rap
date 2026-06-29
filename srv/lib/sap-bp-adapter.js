'use strict';

const mockCandidates = [
  {
    sapBpId: '100000001',
    name: 'Hankook Precision Parts',
    country: 'KR',
    city: 'Seoul',
    street: 'Teheran-ro 152',
    score: 86,
    source: 'MOCK_SAP'
  },
  {
    sapBpId: '100000045',
    name: 'Global Mobility Components',
    country: 'US',
    city: 'Irvine',
    street: 'Technology Dr 10',
    score: 63,
    source: 'MOCK_SAP'
  }
];

function scoreCandidate(criteria, candidate) {
  let score = 0;
  const name = normalize(candidate.name);
  const companyName = normalize(criteria.companyName);

  if (criteria.country && candidate.country === criteria.country) score += 35;
  if (companyName && name.includes(companyName.slice(0, Math.min(6, companyName.length)))) score += 35;
  if (criteria.city && normalize(candidate.city).includes(normalize(criteria.city))) score += 10;

  return Math.max(candidate.score || 0, score);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function readMockBusinessPartners(criteria) {
  return mockCandidates
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(criteria, candidate)
    }))
    .filter((candidate) => !criteria.country || candidate.country === criteria.country || candidate.score >= 60)
    .sort((a, b) => b.score - a.score);
}

function mapSapBusinessPartner(row) {
  const address = Array.isArray(row.to_BusinessPartnerAddress?.results)
    ? row.to_BusinessPartnerAddress.results[0]
    : Array.isArray(row.to_BusinessPartnerAddress)
      ? row.to_BusinessPartnerAddress[0]
      : row.to_BusinessPartnerAddress;

  return {
    sapBpId: row.BusinessPartner,
    name: row.BusinessPartnerFullName || row.OrganizationBPName1 || row.SearchTerm1 || row.BusinessPartner,
    country: address?.Country || row.Country,
    city: address?.CityName || row.CityName,
    street: address?.StreetName || row.StreetName,
    score: 70,
    source: 'SAP_SANDBOX'
  };
}

async function readBusinessPartners(criteria, options = {}) {
  const mode = options.mode || process.env.ERP_READ_MODE || 'mock';
  if (mode !== 'sap_sandbox') {
    return readMockBusinessPartners(criteria);
  }

  const baseUrl = options.baseUrl || process.env.SAP_API_BASE_URL;
  const apiKey = options.apiKey || process.env.SAP_API_KEY;
  const fetchImpl = options.fetchImpl || fetch;

  if (!baseUrl || !apiKey) {
    const error = new Error('SAP_API_BASE_URL and SAP_API_KEY are required for sap_sandbox mode');
    error.code = 'MISSING_SAP_CONFIG';
    error.status = 500;
    throw error;
  }

  const url = new URL('/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner', baseUrl);
  url.searchParams.set('$top', '10');
  url.searchParams.set('$format', 'json');
  url.searchParams.set('$select', 'BusinessPartner,BusinessPartnerFullName,OrganizationBPName1,SearchTerm1');

  const response = await fetchImpl(url, {
    headers: {
      APIKey: apiKey,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const error = new Error(`SAP Business Partner API failed with HTTP ${response.status}`);
    error.code = 'SAP_BP_READ_FAILED';
    error.status = response.status;
    throw error;
  }

  const body = await response.json();
  const rows = body.value || body.d?.results || [];
  return rows.map(mapSapBusinessPartner);
}

module.exports = {
  readBusinessPartners,
  readMockBusinessPartners,
  mapSapBusinessPartner
};
