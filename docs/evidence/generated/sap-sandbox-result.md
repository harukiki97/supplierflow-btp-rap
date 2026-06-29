# SAP Sandbox Verification Result

| Field | Value |
| --- | --- |
| Verified At | 2026-06-29T08:00:28.782Z |
| API | API_BUSINESS_PARTNER |
| Entity | A_BusinessPartner |
| Method | GET |
| HTTP Status | 200 |
| Row Count | 3 |

## Endpoint

```text
https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?%24expand=to_BusinessPartnerAddress&%24format=json&%24select=BusinessPartner%2CBusinessPartnerFullName%2COrganizationBPName1%2CSearchTerm1&%24top=3
```

## Mapped Duplicate Candidates

| Business Partner | Name | Country | City | Score | Source |
| --- | --- | --- | --- | --- | --- |
| 11 | Cust15 Cust15 |  |  | 70 | SAP_SANDBOX |
| 202 | Nue tech inc |  |  | 70 | SAP_SANDBOX |
| 203 | Expo technologies Plc |  |  | 70 | SAP_SANDBOX |

## Security

The API key was loaded from local `.env` and was not written to this file.
