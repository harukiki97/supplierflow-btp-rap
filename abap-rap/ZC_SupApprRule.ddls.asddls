@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Supplier Approval Rule'
@Metadata.allowExtensions: true
@UI.headerInfo: {
  typeName: 'Approval Rule',
  typeNamePlural: 'Approval Rules',
  title: { value: 'Country' },
  description: { value: 'SupplierType' }
}
define root view entity ZC_SupApprRule
  provider contract transactional_query
  as projection on ZI_SupApprRule
{
  @UI.lineItem: [{ position: 10 }]
  @UI.identification: [{ position: 10 }]
  key RuleUUID,

  @UI.lineItem: [{ position: 20 }]
  @UI.identification: [{ position: 20 }]
  Country,

  @UI.lineItem: [{ position: 30 }]
  @UI.identification: [{ position: 30 }]
  SupplierType,

  @UI.lineItem: [{ position: 40 }]
  @UI.identification: [{ position: 40 }]
  RiskThreshold,

  @UI.lineItem: [{ position: 50 }]
  @UI.identification: [{ position: 50 }]
  ReviewLevel,

  @UI.lineItem: [{ position: 60 }]
  @UI.identification: [{ position: 60 }]
  IsActive,

  CreatedBy,
  CreatedAt,
  LastChangedBy,
  LastChangedAt
}
