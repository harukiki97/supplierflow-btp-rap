# 02. Landscape and Transport Strategy

## Target Landscape

| 구분 | 목적 | 주요 활동 | 통제 기준 |
| --- | --- | --- | --- |
| DEV | 개발 및 단위 테스트 | CAP/RAP 개발, CDS 변경, Mock ERP 연동, IMG 변경 초안 | 개발자 권한, feature branch, unit test |
| QAS | 통합 테스트 및 UAT | SAP API 연결 검증, role 테스트, regression test, UAT | 승인된 Transport만 import |
| PRD | 운영 서비스 | 협력사 요청 처리, ERP 반영, 장애 대응 | Change 승인, 배포 창구, rollback plan |

## Transport Objects

| 오브젝트 | 예시 | Transport 구분 |
| --- | --- | --- |
| ABAP RAP Repository | CDS View Entity, Behavior Definition, Service Definition, Class | Workbench Request |
| Customizing | BP role, vendor account group, payment term mapping | Customizing Request |
| Authorization | PFCG role, Fiori catalog/group, BTP role collection | Workbench/Config + BTP deployment |
| BTP CAP App | service handler, destination config, mta deployment | CI/CD deployment artifact |

## Deployment Flow

1. DEV에서 기능 개발 및 unit test를 완료한다.
2. 개발 변경은 Workbench Request로 묶고, 설정 변경은 Customizing Request로 분리한다.
3. QAS에 import한 뒤 SIT/UAT 시나리오를 실행한다.
4. UAT sign-off와 Change 승인 후 PRD 배포 창구를 확정한다.
5. PRD 반영 후 smoke test와 integration log를 확인한다.
6. 장애 발생 시 rollback 또는 retry 기준에 따라 처리한다.

## Release Gate

| Gate | 확인 항목 | 기준 |
| --- | --- | --- |
| DEV Exit | unit test, lint, local mock ERP test | 실패 0건 |
| QAS Entry | Transport dependency, customizing sequence | 누락 0건 |
| UAT Exit | key user sign-off, defect closure | P1/P2 defect 0건 |
| PRD Go-Live | cutover checklist, authorization check | blocker 0건 |
| Hypercare Exit | incident trend, reconciliation result | 반복 장애 없음 |

## Rollback Strategy

- CAP app 배포 실패: 이전 artifact로 redeploy한다.
- Customizing 오류: 변경 전 IMG 값과 Transport 번호를 기준으로 복원 Transport를 준비한다.
- ERP 데이터 생성 오류: 이미 생성된 BP/Supplier는 삭제보다 차단 또는 변경 문서 기준 보정으로 처리한다.
- 중복 생성 가능성: idempotency key와 migration reconciliation 결과를 기준으로 영향 범위를 식별한다.
