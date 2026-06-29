# SAP ERP Implementation & Operations Linkage

이 폴더는 SupplierFlow를 실제 SAP ERP/S/4HANA 구축·운영 프로젝트에서 다루는 업무 범위와 연결하기 위한 확장 산출물입니다.

중요한 경계는 명확히 둡니다. 이 확장은 실제 고객사 또는 사내 SAP 운영 테넌트를 사용했다는 의미가 아닙니다. 대신 실제 프로젝트에서 요구되는 모듈 범위, DEV/QAS/PRD landscape, IMG 설정, 권한, Transport, 테스트, Cutover, 장애·변경관리, 데이터 마이그레이션 절차를 개인 프로젝트에 맞게 재구성했습니다.

## 확장 범위

| 실제 SAP 구축·운영 항목 | SupplierFlow 확장 산출물 |
| --- | --- |
| 고객사/사내 SAP ERP 또는 S/4HANA 시스템 사용 | 실제 연동 시 교체해야 할 Destination, API, 권한, Transport 지점을 정의 |
| FI/CO, MM, SD, PP, SCM 모듈 설정 또는 개발 | 협력사 기준정보를 MM/SCM 중심으로 두고 FI 지급조건, 조정계정, 세금정보와 연결 |
| 운영 테넌트 및 DEV/QAS/PRD landscape | 개발·검증·운영 landscape와 Transport 전략 문서화 |
| IMG 설정, 권한, Transport, 배포, 테스트, 장애 대응 | IMG 설정 항목, 역할/권한, Transport 절차, 테스트·장애 대응 Runbook 작성 |
| 실사용자 요구사항, 변경관리, 운영 이슈 처리 | 요구사항/Fit-Gap, Change Request, Incident Register 템플릿 작성 |
| 실제 ERP 데이터 생성·변경·마이그레이션 | 마이그레이션 템플릿, 검증 규칙, reconciliation 체크 스크립트 추가 |

## 문서 구성

- `01-fit-gap-and-module-scope.md`: 업무 요구사항, 모듈 영향도, Fit-Gap
- `02-landscape-transport-strategy.md`: DEV/QAS/PRD, Transport, 배포 전략
- `03-img-configuration-and-authorization.md`: IMG 설정 후보, 권한 역할, 승인 통제
- `04-data-migration-and-reconciliation.md`: 데이터 마이그레이션, 검증, 대사
- `05-uat-cutover-go-live.md`: UAT, Cutover, Go-Live readiness
- `06-operations-runbook.md`: 운영 Runbook, 장애 대응, 재처리
- `07-incident-change-problem-management.md`: Incident, Change, Problem 관리
- `templates/`: 마이그레이션, 장애, 변경관리 샘플

## 설명 포인트

이 확장은 지원서나 면접에서 다음처럼 설명할 수 있습니다.

> 실제 운영 테넌트를 사용한 경험은 아니지만, 협력사 기준정보 등록이라는 SAP ERP 업무를 기준으로 MM/SCM, FI 연계 정보, 권한, Transport, UAT, Cutover, 운영 장애 대응, 데이터 마이그레이션까지 구축·운영 프로젝트에서 필요한 산출물 형태로 확장했습니다. 단순 개발 과제가 아니라 실제 ERP 운영에서 변경이 배포되고 안정화되는 흐름을 이해하려고 구성했습니다.
