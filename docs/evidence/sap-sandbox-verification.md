# SAP Sandbox Verification Notes

## Current Status

| Item | Status |
| --- | --- |
| SAP Business Partner GET adapter | Implemented |
| Mock candidate lookup | Verified locally |
| Live SAP Sandbox API call evidence | Not included in this repository |
| S/4HANA Business Partner write | Mock ERP only |

The project includes code paths for SAP Sandbox-style Business Partner lookup, but API keys and tenant-specific values are not committed. Without those credentials, the repository should be described as **SAP Business Partner API adapter-ready**, not as a completed live SAP Sandbox verification.

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

1. Set `ERP_READ_MODE=sap_sandbox`.
2. Configure `SAP_API_BASE_URL` and `SAP_API_KEY` in `.env`.
3. Start the CAP service with `npm run watch`.
4. Trigger `checkDuplicates` for a supplier request.
5. Confirm the SAP response is mapped to `DuplicateCandidatePayload`.
6. Store only masked response samples or screenshots. Never commit API keys.

## Result Template

| Date | API | HTTP Status | Result | Evidence |
| --- | --- | --- | --- | --- |
| Pending | `API_BUSINESS_PARTNER/A_BusinessPartner` | Pending | Pending credential-based verification | Pending |

## Portfolio Wording

Recommended wording:

> Implemented a SAP Business Partner lookup adapter and separated mock mode from SAP Sandbox mode through environment configuration. Live SAP Sandbox credentials are not committed; ERP write behavior is demonstrated through a local Mock ERP to show failure handling, retry, idempotency, and integration logging.

Avoid this wording unless live evidence is added:

> Created suppliers in a real S/4HANA system.
