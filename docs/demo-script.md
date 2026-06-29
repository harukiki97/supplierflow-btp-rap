# Four-Minute Demo Script

## 0:00-0:25 Problem and Boundary

협력사 등록 요청이 이메일/엑셀로 흩어지면 중복 확인, 승인 이력, ERP 반영 결과가 분리됩니다. 이 프로젝트는 CAP/Fiori로 요청과 승인을 구현하고, SAP API 조회와 Mock ERP 쓰기를 분리해 무료 환경에서도 정직하게 시연합니다.

## 0:25-0:55 Standard SAP Context

S/4HANA 평가판 또는 Business Accelerator Hub의 Business Partner 구조를 보여줍니다. 실제 쓰기 권한이 없기 때문에 GET 조회는 SAP API, POST/PATCH는 Mock ERP로 처리한다고 설명합니다.

## 0:55-1:35 CAP/Fiori Request

신규 협력사 요청을 만들고 `checkDuplicates`로 SAP 후보를 조회합니다. 후보 스냅샷은 `DuplicateCandidates`에 저장됩니다.

## 1:35-2:10 ABAP RAP Rule

RAP 승인 규칙 앱에서 `RiskThreshold` 검증, `ReviewLevel` 자동 결정, `activate` action을 설명합니다.

## 2:10-2:55 Approval and Sync

승인자가 승인하면 CAP이 idempotency key를 만들고 Mock ERP에 Business Partner 생성을 요청합니다. 성공 시 `MOCK-BP-xxxx` 번호가 저장됩니다.

## 2:55-3:35 Failure and Retry

Mock ERP에서 500 오류를 발생시키고 `SYNC_FAILED`, correlation id, retryable flag, attempt count를 보여줍니다. 관리자 재시도로 같은 idempotency key를 사용해 중복 생성을 막습니다.

## 3:35-4:00 Wrap-Up

CAP은 승인/연동 오케스트레이션, RAP는 승인 규칙 마스터로 역할을 분리했습니다. 실제 S/4HANA 쓰기 권한을 받으면 Adapter와 Destination 설정을 교체하면 됩니다.
