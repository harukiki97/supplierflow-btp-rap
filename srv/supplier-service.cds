using sf from '../db/schema';

service SupplierService @(path: '/odata/v4/supplier') {
  entity SupplierRequests as projection on sf.SupplierRequests actions {
    action checkDuplicates() returns array of DuplicateCandidatePayload;
    action submit() returns SupplierRequests;
    action approve() returns SupplierRequests;
    action rejectRequest(reason: String(500)) returns SupplierRequests;
    action retrySync() returns SupplierRequests;
  };

  entity SupplierAddresses as projection on sf.SupplierAddresses;
  entity DuplicateCandidates as projection on sf.DuplicateCandidates;
  entity ApprovalHistories as projection on sf.ApprovalHistories;
  entity IntegrationLogs as projection on sf.IntegrationLogs;

  type DuplicateCandidatePayload {
    sapBpId : String(40);
    name    : String(160);
    country : String(3);
    city    : String(80);
    street  : String(120);
    score   : Integer;
    source  : String(30);
  }
}
