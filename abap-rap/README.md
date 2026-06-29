# ABAP RAP Module: Supplier Approval Rule

이 폴더는 SAP BTP ABAP Environment Trial 또는 ABAP Cloud 학습 시스템에서 구현할 RAP 산출물입니다.

## Responsibility Split

- CAP main app: supplier request, approval state, SAP BP lookup, Mock ERP write, retry/logging.
- ABAP RAP app: approval rule master data and rule validation.

## Objects

| Object | Suggested Name | Purpose |
| --- | --- | --- |
| Table | `ZSUP_APPR_RULE` | Approval rule persistence |
| Root View | `ZI_SupApprRule` | RAP interface view |
| Projection View | `ZC_SupApprRule` | Fiori/API consumption view |
| Behavior | `ZI_SupApprRule` / `ZC_SupApprRule` | Managed CRUD, validation, determination, action |
| Behavior Pool | `ZBP_I_SUPAPPRRULE` | Rule logic |
| Service Definition | `ZUI_SUP_APPR_RULE` | OData exposure |
| Service Binding | `ZUI_SUP_APPR_RULE_V4` | OData V4 preview |

## Demo Points

1. Create a rule with invalid `RiskThreshold` and show validation.
2. Change threshold to 39, 40, 69, 70 and show automatic review level.
3. Run `activate` and show only one active rule for country + supplier type.
4. Show ABAP Unit coverage for boundary values.

## Interview Sentence

CAP과 RAP를 억지로 중복 구현하지 않고, CAP은 외부 연동과 상태 오케스트레이션을 담당하고 RAP는 ERP 확장에 가까운 승인 규칙 마스터를 담당하도록 경계를 나눴습니다.
