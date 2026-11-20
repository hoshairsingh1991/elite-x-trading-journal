
BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 001: SECURITY FOUNDATION
-- =========================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace
    WHERE nspname IN (
      'capital_private',
      'capital_api'
    )
  ) THEN
    RAISE EXCEPTION
      'Capital Management schemas already exist. Inspect before proceeding.';
  END IF;
END
$$;

-- =========================================================
-- 1. CREATE DEDICATED SCHEMAS
-- =========================================================

CREATE SCHEMA capital_private
  AUTHORIZATION postgres;

CREATE SCHEMA capital_api
  AUTHORIZATION postgres;

COMMENT ON SCHEMA capital_private IS
  'Private Capital Management tables and data. Must never be exposed through the Supabase Data API.';

COMMENT ON SCHEMA capital_api IS
  'Approved Capital Management RPC interface. Only explicitly authorized functions belong here.';

-- =========================================================
-- 2. RESTRICT SCHEMA ACCESS
-- =========================================================

REVOKE ALL ON SCHEMA capital_private
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON SCHEMA capital_api
  FROM PUBLIC, anon, authenticated, service_role;

-- Authenticated callers require USAGE to execute the
-- approved SECURITY INVOKER API functions.
--
-- USAGE alone does not grant access to private tables.
-- Individual table privileges and RLS will be configured
-- explicitly in the table-creation migrations.

GRANT USAGE ON SCHEMA capital_private
  TO authenticated;

GRANT USAGE ON SCHEMA capital_api
  TO authenticated;

COMMIT;
