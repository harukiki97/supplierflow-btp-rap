# 01. Fit-Gap and Module Scope

## Business Scenario

SupplierFlow는 신규 협력사 등록 요청을 SAP S/4HANA Business Partner와 Supplier Master 흐름에 연결하는 시나리오입니다. 실제 프로젝트에서는 구매 조직, 회사 코드, 지급 조건, 세금 정보, 은행 정보, 계정 관리 정보가 모듈별로 나뉘어 관리되므로 단순 화면 입력이 아니라 기준정보 거버넌스 프로세스로 다룹니다.

## Module Scope

| 모듈 | 관련 업무 | SupplierFlow 반영 범위 |
| --- | --- | --- |
| MM | 구매 조직별 Vendor/Supplier 생성, 구매 조건, 차단 여부 | `purchasingOrg`, supplier type, approval status |
| SCM | 협력사 공급망 등록, 위험도, 공급 가능 상태 | risk score, duplicate check, approval rule |
| FI | 회사 코드별 지급 조건, 조정계정, 세금번호, 지급 보류 | `paymentTerms`, `reconciliationAccount`, `taxNumber` migration field |
| CO | 원가 센터 또는 구매 비용 분석 연계 | 향후 확장 항목으로 분리 |
| SD | 고객/거래처 BP와 중복 가능성 확인 | Business Partner duplicate candidate 조회 |
| PP | 생산 자재 공급 협력사 영향도 | critical supplier flag를 향후 확장 항목으로 정의 |

## Requirement Backlog

| ID | 요구사항 | 유형 | 우선순위 | 처리 방향 |
| --- | --- | --- | --- | --- |
| REQ-001 | 신규 협력사 등록 요청을 승인 후 ERP에 반영한다 | Fit | High | CAP 승인 후 ERP write adapter 호출 |
| REQ-002 | 기존 Business Partner 중복 후보를 조회한다 | Fit | High | SAP BP API GET adapter |
| REQ-003 | 회사 코드별 지급 조건과 조정계정을 검증한다 | Gap | High | migration validation rule 및 IMG 설정 항목으로 정의 |
| REQ-004 | 운영 장애 시 동일 요청이 중복 생성되지 않아야 한다 | Fit | High | idempotency key, integration log |
| REQ-005 | 운영자는 실패 건을 재처리하고 원인을 추적해야 한다 | Fit | High | retry action, correlation id, masked payload |
| REQ-006 | 구매 조직별 권한을 분리해야 한다 | Gap | Medium | role design 문서화 |

## Fit-Gap Summary

| 구분 | 내용 | 구현/산출물 |
| --- | --- | --- |
| Fit | 승인 상태 전이, 중복 조회, ERP 반영, 실패 재처리 | CAP service, Mock ERP, tests |
| Gap | 실제 IMG 설정, SAP role import, 실제 Transport release | 운영 설계 문서와 체크리스트 |
| Future | 실제 S/4HANA API write, BTP Destination, IAS/role collection | 확장 포인트로 명시 |

## Acceptance Criteria

- 신규 협력사 요청은 승인 전 ERP에 반영되지 않는다.
- ERP 반영 실패 시 실패 로그, HTTP 상태, 오류 코드, correlation id가 남는다.
- 운영자가 재처리해도 idempotency key로 중복 생성을 방지한다.
- 마이그레이션 데이터는 필수 필드, 지급 조건, 조정계정, 구매 조직 단위로 검증한다.
- DEV에서 개발된 변경은 QAS 테스트 승인 후 PRD 반영 대상으로 관리한다.
