@EndUserText.label : 'Supplier Approval Rule'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zsup_appr_rule {
  key client      : abap.clnt not null;
  key rule_uuid   : sysuuid_x16 not null;
  country         : land1;
  supplier_type   : abap.char(20);
  risk_threshold  : abap.int1;
  review_level    : abap.char(10);
  is_active       : abap_boolean;
  created_by      : syuname;
  created_at      : timestampl;
  last_changed_by : syuname;
  last_changed_at : timestampl;
}
