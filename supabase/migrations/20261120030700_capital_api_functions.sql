
BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 004: ACCOUNT API FUNCTIONS
-- =========================================================

-- =========================================================
-- 1. INTERNAL ACCOUNT READ
-- =========================================================

CREATE FUNCTION capital_private.list_accounts_impl()
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '28000';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.account_name,
        a.broker_name,
        a.account_type,
        a.currency,
        a.account_source,
        a.status,
        a.created_at,
        a.updated_at
    FROM capital_private.accounts AS a
    WHERE a.user_id = v_user_id
    ORDER BY
        CASE WHEN a.status = 'active' THEN 0 ELSE 1 END,
        a.account_name ASC,
        a.created_at DESC,
        a.id ASC;
END;
$function$;

-- =========================================================
-- 2. INTERNAL MANUAL ACCOUNT CREATION
-- =========================================================

CREATE FUNCTION capital_private.create_manual_account_impl(
    p_account_name TEXT,
    p_broker_name TEXT DEFAULT NULL,
    p_account_type TEXT DEFAULT 'brokerage',
    p_currency TEXT DEFAULT 'UNKNOWN'
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_account_id UUID;

    v_account_name TEXT;
    v_broker_name TEXT;
    v_account_type TEXT;
    v_currency TEXT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '28000';
    END IF;

    v_account_name := pg_catalog.btrim(p_account_name);

    IF v_account_name IS NULL OR v_account_name = '' THEN
        RAISE EXCEPTION 'Account name is required'
            USING ERRCODE = '22023';
    END IF;

    v_broker_name :=
        NULLIF(pg_catalog.btrim(p_broker_name), '');

    v_account_type :=
        pg_catalog.lower(
            COALESCE(
                NULLIF(pg_catalog.btrim(p_account_type), ''),
                'brokerage'
            )
        );

    v_currency :=
        pg_catalog.upper(
            COALESCE(
                NULLIF(pg_catalog.btrim(p_currency), ''),
                'UNKNOWN'
            )
        );

    INSERT INTO capital_private.accounts (
        user_id,
        account_name,
        broker_name,
        account_type,
        currency,
        account_source
    )
    VALUES (
        v_user_id,
        v_account_name,
        v_broker_name,
        v_account_type,
        v_currency,
        'manual'
    )
    RETURNING id INTO v_account_id;

    RETURN QUERY
    SELECT
        a.id,
        a.account_name,
        a.broker_name,
        a.account_type,
        a.currency,
        a.account_source,
        a.status,
        a.created_at,
        a.updated_at
    FROM capital_private.accounts AS a
    WHERE a.id = v_account_id
      AND a.user_id = v_user_id;
END;
$function$;

-- =========================================================
-- 3. INTERNAL ACCOUNT UPDATE
-- =========================================================

CREATE FUNCTION capital_private.update_account_impl(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_account_id UUID;

    v_account_name TEXT;
    v_broker_name TEXT;
    v_account_type TEXT;
    v_currency TEXT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '28000';
    END IF;

    v_account_name := pg_catalog.btrim(p_account_name);

    IF v_account_name IS NULL OR v_account_name = '' THEN
        RAISE EXCEPTION 'Account name is required'
            USING ERRCODE = '22023';
    END IF;

    v_broker_name :=
        NULLIF(pg_catalog.btrim(p_broker_name), '');

    v_account_type :=
        pg_catalog.lower(
            COALESCE(
                NULLIF(pg_catalog.btrim(p_account_type), ''),
                'brokerage'
            )
        );

    v_currency :=
        pg_catalog.upper(
            COALESCE(
                NULLIF(pg_catalog.btrim(p_currency), ''),
                'UNKNOWN'
            )
        );

    UPDATE capital_private.accounts AS a
    SET
        account_name = v_account_name,

        -- Broker identity is integration-managed once linked
        -- or when the account originated from a broker import.
        broker_name =
            CASE
                WHEN a.account_source = 'manual'
                 AND a.external_account_id IS NULL
                THEN v_broker_name
                ELSE a.broker_name
            END,

        account_type = v_account_type,
        currency = v_currency

    WHERE a.id = p_account_id
      AND a.user_id = v_user_id

    RETURNING a.id INTO v_account_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account not found'
            USING ERRCODE = 'P0002';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.account_name,
        a.broker_name,
        a.account_type,
        a.currency,
        a.account_source,
        a.status,
        a.created_at,
        a.updated_at
    FROM capital_private.accounts AS a
    WHERE a.id = v_account_id
      AND a.user_id = v_user_id;
END;
$function$;

-- =========================================================
-- 4. INTERNAL ACCOUNT ARCHIVING
-- =========================================================

CREATE FUNCTION capital_private.archive_account_impl(
    p_account_id UUID
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '28000';
    END IF;

    -- Lock the account while checking whether it can be archived.
    PERFORM a.id
    FROM capital_private.accounts AS a
    WHERE a.id = p_account_id
      AND a.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account not found'
            USING ERRCODE = 'P0002';
    END IF;

    -- Pending transactions must be resolved first.
    IF EXISTS (
        SELECT 1
        FROM capital_private.transactions AS t
        WHERE t.user_id = v_user_id
          AND t.status = 'PENDING'
          AND (
              t.from_account_id = p_account_id
              OR t.to_account_id = p_account_id
          )
    ) THEN
        RAISE EXCEPTION
            'Resolve pending transactions before archiving this account.'
            USING ERRCODE = '55000';
    END IF;

    -- Archiving preserves historical account relationships.
    UPDATE capital_private.accounts AS a
    SET status = 'archived'
    WHERE a.id = p_account_id
      AND a.user_id = v_user_id
      AND a.status <> 'archived';

    RETURN QUERY
    SELECT
        a.id,
        a.account_name,
        a.broker_name,
        a.account_type,
        a.currency,
        a.account_source,
        a.status,
        a.created_at,
        a.updated_at
    FROM capital_private.accounts AS a
    WHERE a.id = p_account_id
      AND a.user_id = v_user_id;
END;
$function$;

-- =========================================================
-- 5. PUBLIC API WRAPPERS
-- These SECURITY DEFINER wrappers execute as their trusted owner.
-- Private implementations derive ownership from auth.uid().
-- Never accept user_id from the client.
-- =========================================================

CREATE FUNCTION capital_api.list_accounts()
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.list_accounts_impl();
$function$;

CREATE FUNCTION capital_api.create_manual_account(
    p_account_name TEXT,
    p_broker_name TEXT DEFAULT NULL,
    p_account_type TEXT DEFAULT 'brokerage',
    p_currency TEXT DEFAULT 'UNKNOWN'
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.create_manual_account_impl(
        p_account_name,
        p_broker_name,
        p_account_type,
        p_currency
    );
$function$;

CREATE FUNCTION capital_api.update_account(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.update_account_impl(
        p_account_id,
        p_account_name,
        p_broker_name,
        p_account_type,
        p_currency
    );
$function$;

CREATE FUNCTION capital_api.archive_account(
    p_account_id UUID
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.archive_account_impl(
        p_account_id
    );
$function$;

-- =========================================================
-- 6. FUNCTION EXECUTION PRIVILEGES
-- =========================================================

-- Private schema must not be accessible to application roles.
-- SECURITY DEFINER API wrappers execute with their owner's privileges.

REVOKE ALL ON SCHEMA capital_private
    FROM PUBLIC, anon, authenticated, service_role;

-- Private implementation functions:
-- Application roles cannot execute these functions directly.
-- SECURITY DEFINER API wrappers invoke them using owner privileges.
-- capital_private must remain outside Supabase Exposed Schemas.

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

-- API wrapper functions:
-- Only authenticated users can invoke these operations.

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
-- 7. FUNCTION DOCUMENTATION
-- =========================================================

COMMENT ON FUNCTION capital_api.list_accounts() IS
    'Lists all Capital Management accounts owned by the authenticated user.';

COMMENT ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT
) IS
    'Creates a manual Capital Management account for the authenticated user.';

COMMENT ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT
) IS
    'Updates an account owned by the authenticated user. Broker integration identity is protected.';

COMMENT ON FUNCTION capital_api.archive_account(UUID) IS
    'Archives an account owned by the authenticated user. Accounts with pending transactions cannot be archived.';

COMMIT;
