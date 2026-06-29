# 03. IMG Configuration and Authorization

## IMG Configuration Candidates

아래 항목은 실제 S/4HANA 프로젝트에서 협력사 기준정보 등록과 연결될 수 있는 설정 후보입니다. 본 프로젝트에서는 실제 IMG를 변경하지 않고, 필요한 설정 항목과 검증 관점을 산출물로 정의합니다.

| 영역 | 설정 항목 | 검증 관점 |
| --- | --- | --- |
| Business Partner | BP role, grouping, number range | 협력사 유형별 번호 범위와 role 매핑 |
| Supplier Master | account group, purchasing organization data | 구매 조직별 필수 필드와 차단 상태 |
| FI Vendor | company code data, reconciliation account, payment terms | 회사 코드별 지급 조건과 조정계정 |
| Tax | tax number category, withholding tax relevance | 국가별 세금번호 포맷과 원천세 적용 |
| Workflow/Approval | approval rule, risk threshold | 위험도 기준 승인자 분기 |
| Integration | RFC/Destination, communication arrangement | API 인증, endpoint, timeout, retry |

## Authorization Design

| 역할 | 권한 범위 | 주요 기능 |
| --- | --- | --- |
| Requester | 본인 요청 생성/조회 | 협력사 등록 요청, 보완 제출 |
| Approver | 구매 조직 또는 회사 코드 기준 승인 | 승인, 반려, 중복 후보 검토 |
| Master Data Admin | 기준정보 관리 및 재처리 | ERP 반영, 실패 재처리, 로그 조회 |
| Operations Admin | 운영 이슈 처리 | incident triage, retry, payload masking 확인 |
| Auditor | 조회 전용 | 변경 이력, 승인 이력, integration log 조회 |

## Fiori and BTP Authorization Mapping

| SAP 영역 | SupplierFlow 대응 |
| --- | --- |
| Fiori catalog/tile | Supplier Request List Report, Object Page |
| PFCG role | Requester, Approver, Master Data Admin 역할로 분리 |
| BTP Role Collection | CAP service scope와 Fiori 앱 접근 권한 매핑 |
| Destination 권한 | SAP BP 조회 Destination과 ERP write Destination 분리 |

## Control Points

- 운영자는 승인 없이 직접 ERP write action을 실행할 수 없다.
- 요청자와 승인자가 동일한 경우 segregation of duties 위반으로 관리한다.
- 운영 로그에는 민감정보 원문 대신 masking된 payload를 남긴다.
- PRD 권한 변경은 Change Request 승인 후 반영한다.
- 장애 재처리 권한은 Master Data Admin 또는 Operations Admin으로 제한한다.
