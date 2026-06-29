# 04. Data Migration and Reconciliation

## Migration Object

| 항목 | 설명 |
| --- | --- |
| 대상 오브젝트 | Supplier / Business Partner master data |
| 기준 키 | legacySupplierId, supplierId, taxNumber |
| 대상 범위 | 신규 협력사 및 기존 협력사 보정 데이터 |
| 대상 시스템 | S/4HANA DEV -> QAS -> PRD |
| 검증 방식 | 필수 필드, 코드값, 중복 후보, ERP 반영 결과 대사 |

## Field Mapping

| Legacy Field | SAP Field 의미 | SupplierFlow Field | 검증 |
| --- | --- | --- | --- |
| LEGACY_VENDOR_NO | legacy supplier number | legacySupplierId | 선택 |
| VENDOR_NAME | company name | companyName | 필수 |
| COUNTRY | country code | country | ISO-2 필수 |
| TAX_NO | tax number | taxNumber | 필수 |
| PAY_TERM | payment terms | paymentTerms | 필수, 코드값 검증 |
| RECON_ACCOUNT | reconciliation account | reconciliationAccount | 필수 |
| PUR_ORG | purchasing organization | purchasingOrg | 필수 |
| RISK_SCORE | supplier risk score | riskScore | 0-100 |

## Migration Steps

1. Legacy source에서 협력사 후보 데이터를 추출한다.
2. 필수 필드, 코드값, 중복 후보를 사전 검증한다.
3. DEV에서 샘플 데이터를 적재하고 오류 유형을 정리한다.
4. QAS에서 전체 변환 파일을 rehearsal load한다.
5. UAT에서 key user가 샘플 협력사와 FI/MM 필드를 확인한다.
6. Cutover 기간에 PRD 적재 파일을 freeze한다.
7. PRD load 후 생성 건수, 실패 건수, field mismatch를 대사한다.

## Reconciliation Rule

| Rule | 설명 | 실패 시 조치 |
| --- | --- | --- |
| Count Match | source row 수와 target 생성 수 비교 | 누락 키 식별 |
| Key Match | supplierId 또는 taxNumber 기준 매칭 | 중복 또는 누락 검토 |
| Field Match | 지급조건, 조정계정, 구매조직 비교 | 변경 문서 또는 보정 요청 |
| Error Log Review | load 실패 메시지 분류 | business/technical 오류 구분 |

## Project Artifacts

- `templates/supplier_master_migration_sample.csv`
- `scripts/ops-readiness-check.js`
- `srv/lib/ops-readiness.js`

`npm run ops:check` 명령으로 샘플 마이그레이션 데이터 필수값과 Go-Live readiness를 점검합니다.
