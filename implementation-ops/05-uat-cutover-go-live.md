# 05. UAT, Cutover, and Go-Live

## UAT Scenario

| ID | 시나리오 | 기대 결과 |
| --- | --- | --- |
| UAT-001 | 요청자가 신규 협력사 등록 요청을 생성한다 | DRAFT 요청 생성 |
| UAT-002 | 필수 FI/MM 필드가 누락된 요청을 제출한다 | validation error 발생 |
| UAT-003 | 승인자가 중복 후보를 확인한다 | SAP BP candidate 조회 |
| UAT-004 | 승인자가 정상 요청을 승인한다 | APPROVED 후 ERP sync 진행 |
| UAT-005 | Mock ERP가 500 오류를 반환한다 | SYNC_FAILED와 retryable log 기록 |
| UAT-006 | 운영자가 실패 건을 재처리한다 | 동일 idempotency key로 중복 없이 SYNCED |
| UAT-007 | 권한 없는 사용자가 재처리를 시도한다 | authorization error |

## Cutover Plan

| 단계 | 작업 | 담당 | 완료 기준 |
| --- | --- | --- | --- |
| D-5 | Transport import sequence 확정 | SAP Lead | dependency 확인 |
| D-3 | PRD migration file freeze | Data Lead | 승인된 파일 보관 |
| D-2 | 권한 role assignment 사전 점검 | Security Lead | 주요 사용자 로그인 확인 |
| D-1 | Mock run 결과와 rollback plan 확인 | PM/Tech Lead | blocker 0건 |
| D-Day | PRD 배포, smoke test, migration load | 전체 | 핵심 시나리오 통과 |
| D+1 | Hypercare incident triage | Operations | P1/P2 즉시 대응 |

## Go-Live Readiness Checklist

| ID | 점검 항목 | 기준 |
| --- | --- | --- |
| GL-001 | DEV/QAS Transport import 완료 | 완료 |
| GL-002 | UAT P1/P2 결함 종료 | 0건 |
| GL-003 | 권한 role assignment 완료 | 핵심 사용자 100% |
| GL-004 | 마이그레이션 rehearsal 성공 | 실패 건 조치 완료 |
| GL-005 | 운영 Runbook 배포 | 완료 |
| GL-006 | rollback plan 승인 | 완료 |
| GL-007 | integration monitoring 기준 확정 | 완료 |

## Hypercare Monitoring

- PRD 배포 후 1주간 매일 실패 로그를 확인한다.
- ERP write 실패는 business error와 technical error로 분류한다.
- 반복 장애는 Problem record로 승격한다.
- 마이그레이션 대사 결과는 key user와 sign-off한다.
