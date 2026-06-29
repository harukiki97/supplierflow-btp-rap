# 07. Incident, Change, and Problem Management

## Incident Management

| 단계 | 설명 | 산출물 |
| --- | --- | --- |
| 접수 | 사용자 문의, 시스템 알림, 로그 확인 | incident register |
| 분류 | P1-P4, business/technical, 모듈 영향도 | severity, category |
| 조치 | 데이터 보완, retry, 권한 수정, 배포 rollback | action log |
| 종료 | 사용자 확인, 재발 방지 필요성 판단 | closure note |

## Change Management

| 유형 | 예시 | 승인 기준 |
| --- | --- | --- |
| Standard Change | 승인 문구 수정, threshold 조정 | 사전 승인된 절차 |
| Normal Change | IMG 설정, 권한 role 변경, API endpoint 변경 | CAB 또는 담당 승인 |
| Emergency Change | 운영 중단 복구를 위한 긴급 배포 | 사후 리뷰 필수 |

## Problem Management

반복되는 장애는 단일 incident로 닫지 않고 Problem record로 승격합니다.

| 반복 현상 | 가능한 원인 | 개선 방향 |
| --- | --- | --- |
| 동일 paymentTerms 오류 반복 | 코드값 검증 부족 | migration validation 강화 |
| 특정 구매 조직만 생성 실패 | 권한 또는 customizing 누락 | role/IMG 재점검 |
| timeout 반복 | Destination 또는 ERP API 성능 문제 | retry/backoff, timeout 조정 |
| 중복 후보 과다 | 중복 조회 기준 부정확 | matching score 개선 |

## Registers

- `templates/incident_register.csv`: 운영 장애 관리 샘플
- `templates/change_request_register.csv`: 변경 요청 관리 샘플

이 자료는 실제 ITSM 도구를 대체하지 않고, 개인 프로젝트에서 운영 절차를 설명하기 위한 포트폴리오용 예시입니다.
