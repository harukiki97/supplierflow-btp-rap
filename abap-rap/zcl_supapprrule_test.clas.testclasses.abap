CLASS ltcl_supapprrule_logic DEFINITION FINAL FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    METHODS review_level_boundaries FOR TESTING.
ENDCLASS.

CLASS ltcl_supapprrule_logic IMPLEMENTATION.
  METHOD review_level_boundaries.
    cl_abap_unit_assert=>assert_equals( act = 'LOW' exp = 'LOW' ).
    cl_abap_unit_assert=>assert_equals( act = 'MEDIUM' exp = 'MEDIUM' ).
    cl_abap_unit_assert=>assert_equals( act = 'HIGH' exp = 'HIGH' ).
  ENDMETHOD.
ENDCLASS.
