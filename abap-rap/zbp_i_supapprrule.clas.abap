CLASS zbp_i_supapprrule DEFINITION
  PUBLIC
  ABSTRACT
  FINAL
  FOR BEHAVIOR OF zi_supapprrule.
ENDCLASS.

CLASS zbp_i_supapprrule IMPLEMENTATION.
ENDCLASS.

CLASS lhc_rule DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validateRiskThreshold FOR VALIDATE ON SAVE
      IMPORTING keys FOR Rule~validateRiskThreshold.

    METHODS validateDuplicateActive FOR VALIDATE ON SAVE
      IMPORTING keys FOR Rule~validateDuplicateActive.

    METHODS determineReviewLevel FOR DETERMINE ON MODIFY
      IMPORTING keys FOR Rule~determineReviewLevel.

    METHODS activate FOR MODIFY
      IMPORTING keys FOR ACTION Rule~activate RESULT result.

    METHODS review_level_for_threshold
      IMPORTING risk_threshold TYPE i
      RETURNING VALUE(review_level) TYPE string.
ENDCLASS.

CLASS lhc_rule IMPLEMENTATION.
  METHOD validateRiskThreshold.
    READ ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      FIELDS ( RiskThreshold )
      WITH CORRESPONDING #( keys )
      RESULT DATA(rules).

    LOOP AT rules ASSIGNING FIELD-SYMBOL(<rule>).
      IF <rule>-RiskThreshold < 0 OR <rule>-RiskThreshold > 100.
        APPEND VALUE #( %tky = <rule>-%tky ) TO failed-rule.
        APPEND VALUE #(
          %tky = <rule>-%tky
          %msg = new_message_with_text(
            severity = if_abap_behv_message=>severity-error
            text = 'RiskThreshold must be between 0 and 100' )
          %element-RiskThreshold = if_abap_behv=>mk-on
        ) TO reported-rule.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD validateDuplicateActive.
    READ ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      FIELDS ( Country SupplierType IsActive )
      WITH CORRESPONDING #( keys )
      RESULT DATA(rules).

    LOOP AT rules ASSIGNING FIELD-SYMBOL(<rule>) WHERE IsActive = abap_true.
      SELECT COUNT( * )
        FROM zsup_appr_rule
        WHERE country = @<rule>-Country
          AND supplier_type = @<rule>-SupplierType
          AND is_active = @abap_true
        INTO @DATA(active_count).

      IF active_count > 0.
        APPEND VALUE #( %tky = <rule>-%tky ) TO failed-rule.
        APPEND VALUE #(
          %tky = <rule>-%tky
          %msg = new_message_with_text(
            severity = if_abap_behv_message=>severity-error
            text = 'Only one active rule is allowed for country and supplier type' )
          %element-IsActive = if_abap_behv=>mk-on
        ) TO reported-rule.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD determineReviewLevel.
    READ ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      FIELDS ( RiskThreshold )
      WITH CORRESPONDING #( keys )
      RESULT DATA(rules).

    MODIFY ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      UPDATE FIELDS ( ReviewLevel )
      WITH VALUE #(
        FOR rule IN rules
        ( %tky = rule-%tky
          ReviewLevel = review_level_for_threshold( rule-RiskThreshold ) ) ).
  ENDMETHOD.

  METHOD activate.
    READ ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      FIELDS ( Country SupplierType )
      WITH CORRESPONDING #( keys )
      RESULT DATA(rules).

    LOOP AT rules ASSIGNING FIELD-SYMBOL(<rule>).
      UPDATE zsup_appr_rule
        SET is_active = @abap_false
        WHERE country = @<rule>-Country
          AND supplier_type = @<rule>-SupplierType.
    ENDLOOP.

    MODIFY ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      UPDATE FIELDS ( IsActive )
      WITH VALUE #( FOR key IN keys ( %tky = key-%tky IsActive = abap_true ) )
      REPORTED reported.

    READ ENTITIES OF zi_supapprrule IN LOCAL MODE
      ENTITY Rule
      ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(activated).

    result = VALUE #( FOR activated_rule IN activated
      ( %tky = activated_rule-%tky %param = activated_rule ) ).
  ENDMETHOD.

  METHOD review_level_for_threshold.
    IF risk_threshold <= 39.
      review_level = 'LOW'.
    ELSEIF risk_threshold <= 69.
      review_level = 'MEDIUM'.
    ELSE.
      review_level = 'HIGH'.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
