# SupplierFlow BTP + RAP

SAP BTP 기반 협력사 등록, 승인, ERP 연동 포트폴리오 프로젝트입니다. CAP은 요청/승인/연동 오케스트레이션을 담당하고, ABAP RAP는 승인 규칙 마스터와 비즈니스 룰 검증을 담당하도록 분리했습니다.

## Why This Fits Solution Developer

- SAP BTP/CAP: OData V4 서비스, Fiori elements 메타데이터, 상태 전이, 외부 연동 Adapter.
- SAP ERP 이해: Business Partner 기준정보 조회와 협력사 등록 승인 프로세스.
- SAP ABAP/RAP: CDS View Entity, Behavior Definition, Validation, Determination, Action, Service Binding, ABAP Unit 산출물.
- 운영 관점: 4xx/5xx 분리, retry, idempotency, integration log, payload masking.

## Scope Boundary

이 프로젝트는 실제 S/4HANA 테넌트에 협력사를 생성했다고 주장하지 않습니다.

- 실제 구현: CAP/Fiori 서비스, SAP API 조회 Adapter, Mock ERP 쓰기, ABAP RAP 코드 산출물.
- 실제 SAP 연동 가능 지점: SAP Business Accelerator Hub Business Partner GET.
- 모의 구현: Business Partner POST/PATCH 쓰기와 실패/재시도 시나리오.

## Project Structure

```text
db/                  CAP data model
srv/                 CAP service, handlers, adapters
app/                 Fiori elements manifest and annotations
mock-erp/            Local ERP write simulator
abap-rap/            RAP reference artifacts for ADT implementation
docs/                Architecture and demo notes
test/                Node test runner tests for business rules
```

## Local Run

```bash
npm install
copy .env.example .env
npm run mock-erp
```

Open another terminal:

```bash
npm run watch
```

Default URLs:

- CAP service: `http://localhost:4004/odata/v4/supplier`
- Mock ERP: `http://localhost:4010/health`

## Test

```bash
npm test
```

## Demo Flow

1. Create a supplier request in DRAFT.
2. Run `checkDuplicates` to map SAP Business Partner candidates.
3. Submit the request.
4. Approve it and call Mock ERP with an idempotency key.
5. Force a 500/timeout scenario in Mock ERP and retry from `SYNC_FAILED`.
6. Show ABAP RAP approval rule artifacts and explain CAP/RAP responsibility split.

## Resume Line

SAP BTP에서 CAP(Node.js)·Fiori 기반 협력사 등록/승인 시스템과 ABAP Cloud RAP 승인 규칙 앱을 설계했습니다. S/4HANA Business Partner API 조회, Mock ERP 쓰기, 상태 전이, 멱등성, 실패 재처리, CDS/Behavior/OData V4/ABAP Unit 산출물을 구현했습니다.
