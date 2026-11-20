
BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 005: RPC SECURITY BOUNDARY
-- =========================================================

-- =========================================================
-- 1. SCHEMA ACCESS
-- =========================================================

REVOKE ALL ON SCHEMA capital_private
    FROM PUBLIC, anon, authenticated, service_role;

-- Required because SECURITY INVOKER API wrappers call
-- the private implementation functions as authenticated.
-- This does NOT expose capital_private through the Data API.

GRANT USAGE ON SCHEMA capital_private
    TO authenticated;

REVOKE ALL ON SCHEMA capital_api
    FROM PUBLIC, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA capital_api
    TO authenticated;

-- =========================================================
-- 2. PRIVATE IMPLEMENTATION FUNCTIONS
-- SECURITY DEFINER — execute with trusted owner privileges.
-- Ownership is still derived from auth.uid() inside each function.
-- =========================================================

ALTER FUNCTION capital_private.list_accounts_impl()
    SECURITY DEFINER;

ALTER FUNCTION capital_private.list_accounts_impl()
    SET search_path = '';

ALTER FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT
) SECURITY DEFINER;

ALTER FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT
) SET search_path = '';

ALTER FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT
) SECURITY DEFINER;

ALTER FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT
) SET search_path = '';

ALTER FUNCTION capital_private.archive_account_impl(
    UUID
) SECURITY DEFINER;

ALTER FUNCTION capital_private.archive_account_impl(
    UUID
) SET search_path = '';

-- =========================================================
-- 3. EXPOSED API WRAPPERS
-- SECURITY INVOKER — execute as the authenticated caller.
-- =========================================================

ALTER FUNCTION capital_api.list_accounts()
    SECURITY INVOKER;

ALTER FUNCTION capital_api.list_accounts()
    SET search_path = '';

ALTER FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT
) SECURITY INVOKER;

ALTER FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT
) SET search_path = '';

ALTER FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT
) SECURITY INVOKER;

ALTER FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT
) SET search_path = '';

ALTER FUNCTION capital_api.archive_account(
    UUID
) SECURITY INVOKER;

ALTER FUNCTION capital_api.archive_account(
    UUID
) SET search_path = '';

-- =========================================================
-- 4. PRIVATE FUNCTION EXECUTION PRIVILEGES
-- =========================================================

REVOKE ALL ON FUNCTION capital_private.list_accounts_impl()
    FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.archive_account_impl(
    UUID
) FROM PUBLIC, anon, authenticated, service_role;

-- The authenticated role needs EXECUTE to invoke these
-- helpers through the SECURITY INVOKER API wrappers.
-- capital_private must remain outside Exposed Schemas.

GRANT EXECUTE ON FUNCTION capital_private.list_accounts_impl()
    TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.archive_account_impl(
    UUID
) TO authenticated;

-- =========================================================
-- 5. API WRAPPER EXECUTION PRIVILEGES
-- =========================================================

REVOKE ALL ON FUNCTION capital_api.list_accounts()
    FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.archive_account(
    UUID
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_api.list_accounts()
    TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.archive_account(
    UUID
) TO authenticated;

-- =========================================================
-- 6. DOCUMENTATION
-- =========================================================

COMMENT ON SCHEMA capital_private IS
    'Private Capital Management implementation schema. Not exposed through the Supabase Data API.';

COMMENT ON SCHEMA capital_api IS
    'Approved Capital Management API schema. Contains SECURITY INVOKER RPC wrappers only.';

COMMIT;
