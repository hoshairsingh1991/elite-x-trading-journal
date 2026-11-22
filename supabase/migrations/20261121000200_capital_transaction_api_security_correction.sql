-- =========================================================
-- CAPITAL TRANSACTION API — SECURITY BOUNDARY CORRECTION
-- Migration: 20261121000200
--
-- Purpose:
-- 1. Make transaction API wrappers SECURITY DEFINER.
-- 2. Preserve postgres ownership and empty search_path.
-- 3. Remove direct authenticated EXECUTE privileges from
--    private transaction implementation functions.
-- 4. Preserve authenticated access through capital_api.
--
-- No transaction business logic or schema changes.
-- =========================================================


-- =========================================================
-- 1. API WRAPPERS — SECURITY DEFINER
-- =========================================================

ALTER FUNCTION capital_api.create_transaction(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) SECURITY DEFINER;

ALTER FUNCTION capital_api.list_transactions(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) SECURITY DEFINER;

ALTER FUNCTION capital_api.update_transaction(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) SECURITY DEFINER;

ALTER FUNCTION capital_api.complete_transaction(
    UUID, DATE, TIMESTAMPTZ
) SECURITY DEFINER;

ALTER FUNCTION capital_api.cancel_transaction(
    UUID, TIMESTAMPTZ
) SECURITY DEFINER;

ALTER FUNCTION capital_api.delete_transaction(
    UUID
) SECURITY DEFINER;

ALTER FUNCTION capital_api.reverse_transaction(
    UUID, UUID, DATE, DATE, TEXT
) SECURITY DEFINER;


-- =========================================================
-- 2. PRESERVE EMPTY SEARCH PATH ON API WRAPPERS
-- =========================================================

ALTER FUNCTION capital_api.create_transaction(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) SET search_path = '';

ALTER FUNCTION capital_api.list_transactions(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) SET search_path = '';

ALTER FUNCTION capital_api.update_transaction(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) SET search_path = '';

ALTER FUNCTION capital_api.complete_transaction(
    UUID, DATE, TIMESTAMPTZ
) SET search_path = '';

ALTER FUNCTION capital_api.cancel_transaction(
    UUID, TIMESTAMPTZ
) SET search_path = '';

ALTER FUNCTION capital_api.delete_transaction(
    UUID
) SET search_path = '';

ALTER FUNCTION capital_api.reverse_transaction(
    UUID, UUID, DATE, DATE, TEXT
) SET search_path = '';


-- =========================================================
-- 3. PRIVATE IMPLEMENTATIONS — REVOKE DIRECT EXECUTION
-- =========================================================

REVOKE ALL ON FUNCTION capital_private.create_transaction_impl(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.list_transactions_impl(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.update_transaction_impl(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.complete_transaction_impl(
    UUID, DATE, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.cancel_transaction_impl(
    UUID, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.delete_transaction_impl(
    UUID
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.reverse_transaction_impl(
    UUID, UUID, DATE, DATE, TEXT
) FROM PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 4. API WRAPPERS — RESET EXECUTION PRIVILEGES
-- =========================================================

REVOKE ALL ON FUNCTION capital_api.create_transaction(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.list_transactions(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.update_transaction(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.complete_transaction(
    UUID, DATE, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.cancel_transaction(
    UUID, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.delete_transaction(
    UUID
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.reverse_transaction(
    UUID, UUID, DATE, DATE, TEXT
) FROM PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 5. API WRAPPERS — GRANT AUTHENTICATED EXECUTION
-- =========================================================

GRANT EXECUTE ON FUNCTION capital_api.create_transaction(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.list_transactions(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.update_transaction(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.complete_transaction(
    UUID, DATE, TIMESTAMPTZ
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.cancel_transaction(
    UUID, TIMESTAMPTZ
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.delete_transaction(
    UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.reverse_transaction(
    UUID, UUID, DATE, DATE, TEXT
) TO authenticated;


-- =========================================================
-- MIGRATION COMPLETE
-- =========================================================
