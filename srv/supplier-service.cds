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

annotate SupplierService.SupplierRequests with @(
  UI.HeaderInfo: {
    TypeName: 'Supplier Request',
    TypeNamePlural: 'Supplier Requests',
    Title: {
      $Type: 'UI.DataField',
      Value: companyName
    },
    Description: {
      $Type: 'UI.DataField',
      Value: status
    }
  },
  UI.SelectionFields: [
    status,
    country,
    supplierType
  ],
  UI.LineItem: [
    {
      $Type: 'UI.DataField',
      Value: companyName,
      Label: 'Company'
    },
    {
      $Type: 'UI.DataField',
      Value: country,
      Label: 'Country'
    },
    {
      $Type: 'UI.DataField',
      Value: supplierType,
      Label: 'Type'
    },
    {
      $Type: 'UI.DataField',
      Value: riskScore,
      Label: 'Risk'
    },
    {
      $Type: 'UI.DataField',
      Value: status,
      Label: 'Status'
    },
    {
      $Type: 'UI.DataField',
      Value: mockBpId,
      Label: 'ERP BP'
    }
  ],
  UI.FieldGroup #General: {
    Data: [
      {
        $Type: 'UI.DataField',
        Value: companyName,
        Label: 'Company'
      },
      {
        $Type: 'UI.DataField',
        Value: country,
        Label: 'Country'
      },
      {
        $Type: 'UI.DataField',
        Value: taxNumber,
        Label: 'Tax Number'
      },
      {
        $Type: 'UI.DataField',
        Value: supplierType,
        Label: 'Supplier Type'
      },
      {
        $Type: 'UI.DataField',
        Value: riskScore,
        Label: 'Risk Score'
      }
    ]
  },
  UI.Facets: [
    {
      $Type: 'UI.ReferenceFacet',
      Label: 'General',
      Target: '@UI.FieldGroup#General'
    }
  ]
);
