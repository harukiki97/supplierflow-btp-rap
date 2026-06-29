@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Supplier Approval Rule Interface'
@Metadata.allowExtensions: true
define root view entity ZI_SupApprRule
  as select from zsup_appr_rule
{
  key rule_uuid       as RuleUUID,
      country         as Country,
      supplier_type   as SupplierType,
      risk_threshold  as RiskThreshold,
      review_level    as ReviewLevel,
      is_active       as IsActive,
      created_by      as CreatedBy,
      created_at      as CreatedAt,
      last_changed_by as LastChangedBy,
      last_changed_at as LastChangedAt
}
