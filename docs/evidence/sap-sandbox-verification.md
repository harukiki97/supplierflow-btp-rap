# SAP Sandbox Verification Notes

## Current Status

| Item | Status |
| --- | --- |
| SAP Business Partner GET adapter | Implemented |
| Mock candidate lookup | Verified locally |
| Live SAP Sandbox API call evidence | Verified, see `generated/sap-sandbox-result.md` |
| S/4HANA Business Partner write | Mock ERP only |

The project includes code paths for SAP Sandbox-style Business Partner lookup. API keys and tenant-specific values are not committed. The generated evidence files include only the endpoint, HTTP status, row count, and mapped candidate results.

Once local credentials are configured, run:

```bash
npm run sap:sandbox:verify
```

On success, the script writes redacted evidence files under `docs/evidence/generated/`.

## Intended API

| Field | Value |
| --- | --- |
| API | `API_BUSINESS_PARTNER` |
| Entity | `A_BusinessPartner` |
| Method | `GET` |
| Local adapter | `srv/lib/sap-bp-adapter.js` |
| CAP action | `checkDuplicates` |

## Environment Variables

```bash
ERP_READ_MODE=sap_sandbox
SAP_API_BASE_URL=https://sandbox.api.sap.com
SAP_API_KEY=<not committed>
```

## Verification Procedure

1. Configure `SAP_API_BASE_URL` and `SAP_API_KEY` in `.env`.
2. Run `npm run sap:sandbox:verify`.
3. Confirm HTTP status `200`.
4. Confirm response rows are mapped to `DuplicateCandidatePayload` fields.
5. Commit only generated redacted evidence files. Never commit API keys.

## Verification Result

| Date | API | HTTP Status | Result | Evidence |
| --- | --- | --- | --- | --- |
| 2026-06-29 | `API_BUSINESS_PARTNER/A_BusinessPartner` | 200 | 3 rows mapped to duplicate candidate shape | `generated/sap-sandbox-result.md` |

## Portfolio Wording

Recommended wording:

> Implemented a SAP Business Partner lookup adapter and separated mock mode from SAP Sandbox mode through environment configuration. Live SAP Sandbox credentials are not committed; ERP write behavior is demonstrated through a local Mock ERP to show failure handling, retry, idempotency, and integration logging.

Avoid this wording unless live evidence is added:

> Created suppliers in a real S/4HANA system.
