namespace sf;

using { cuid, managed } from '@sap/cds/common';

type SupplierStatus : String enum {
  DRAFT;
  SUBMITTED;
  APPROVED;
  SYNCING;
  SYNCED;
  SYNC_FAILED;
  REJECTED;
}

type SupplierType : String enum {
  MATERIAL;
  SERVICE;
  LOGISTICS;
  IT;
}

entity SupplierRequests : cuid, managed {
  companyName           : String(120) not null;
  country               : String(3) not null;
  taxNumber             : String(40);
  supplierType          : SupplierType default 'MATERIAL';
  riskScore             : Integer default 0;
  status                : SupplierStatus default 'DRAFT';
  mockBpId              : String(40);
  sapDuplicateCheckedAt : Timestamp;
  syncAttemptCount      : Integer default 0;
  lastErrorCode         : String(80);
  lastErrorMessage      : String(500);
  submittedAt           : Timestamp;
  approvedAt            : Timestamp;
  rejectedAt            : Timestamp;
  rejectionReason       : String(500);

  addresses             : Composition of many SupplierAddresses on addresses.request = $self;
  duplicateCandidates   : Composition of many DuplicateCandidates on duplicateCandidates.request = $self;
  approvalHistory       : Composition of many ApprovalHistories on approvalHistory.request = $self;
  integrationLogs       : Composition of many IntegrationLogs on integrationLogs.request = $self;
}

entity SupplierAddresses : cuid, managed {
  request    : Association to SupplierRequests not null;
  street     : String(120);
  city       : String(80);
  postalCode : String(20);
  country    : String(3);
  isPrimary  : Boolean default true;
}

entity DuplicateCandidates : cuid, managed {
  request : Association to SupplierRequests not null;
  sapBpId : String(40);
  name    : String(160);
  country : String(3);
  city    : String(80);
  street  : String(120);
  score   : Integer;
  source  : String(30) default 'SAP_SANDBOX';
  rawHash : String(80);
}

entity ApprovalHistories : cuid, managed {
  request : Association to SupplierRequests not null;
  action  : String(40);
  actor   : String(120);
  reason  : String(500);
  fromStatus : SupplierStatus;
  toStatus   : SupplierStatus;
}

entity IntegrationLogs : cuid, managed {
  request       : Association to SupplierRequests not null;
  operation     : String(40);
  httpStatus    : Integer;
  errorCode     : String(80);
  errorMessage  : String(500);
  correlationId : String(80);
  attemptNo     : Integer;
  retryable     : Boolean;
  payloadHash   : String(80);
  responseBody  : LargeString;
}

entity IdempotencyLocks : cuid, managed {
  requestId : UUID not null;
  operation : String(40) not null;
  lockKey   : String(120) not null;
  resultId  : String(80);
  status    : String(30);
}
