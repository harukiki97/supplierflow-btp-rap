# 06. Operations Runbook

## Daily Checks

| 항목 | 확인 방법 | 이상 기준 | 조치 |
| --- | --- | --- | --- |
| Integration Log | SupplierFlow log table | SYNC_FAILED 증가 | 오류 분류 후 retry 또는 사용자 보완 요청 |
| SAP BP Duplicate | duplicate candidate result | score 80 이상 중복 후보 | 승인자 검토 |
| API Health | SAP Destination, Mock ERP health | timeout 또는 HTTP 5xx | 기술 장애 등록 |
| Authorization | role assignment | 주요 사용자 접근 실패 | 권한 요청 및 승인 |
| Migration Reconciliation | source/target count | 누락 또는 mismatch | 데이터 보정 |

## Incident Triage

| Severity | 기준 | 예시 | SLA 방향 |
| --- | --- | --- | --- |
| P1 | 운영 전체 중단 또는 대량 데이터 오류 | PRD ERP write 전체 실패 | 즉시 대응 |
| P2 | 핵심 업무 지연 | 특정 구매 조직 협력사 생성 실패 | 당일 대응 |
| P3 | 일부 사용자 또는 일부 데이터 오류 | 지급조건 코드 오류 | 계획 대응 |
| P4 | 문의 또는 개선 요청 | 화면 문구 수정 | backlog 등록 |

## Retry Policy

- HTTP 4xx: business error로 분류하고 요청 데이터 보완 후 재처리한다.
- HTTP 5xx/timeout: technical error로 분류하고 retry 가능 상태로 관리한다.
- 동일 요청은 idempotency key로 중복 생성을 방지한다.
- retry 횟수와 마지막 오류 메시지를 운영 로그에 남긴다.

## Communication Template

| 상황 | 공유 내용 |
| --- | --- |
| 장애 접수 | 영향 범위, 시작 시각, 현재 상태, 임시 우회 방법 |
| 원인 파악 | business/technical 구분, 관련 Transport 또는 배포 여부 |
| 복구 완료 | 조치 내용, 데이터 보정 여부, 재발 방지 항목 |

## Post-Incident Review

장애가 반복되거나 P1/P2로 분류된 경우 다음 항목을 남깁니다.

- 발생 원인
- 영향 받은 협력사 요청 수
- ERP 데이터 보정 필요 여부
- 모니터링 또는 validation 보강 항목
- 변경관리 등록 여부
