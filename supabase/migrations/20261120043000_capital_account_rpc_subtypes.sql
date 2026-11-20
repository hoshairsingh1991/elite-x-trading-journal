BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 007: ACCOUNT RPC SUBTYPE SUPPORT
-- =========================================================

-- ---------------------------------------------------------
-- 1. DROP EXISTING API WRAPPERS FIRST
-- ---------------------------------------------------------

DROP FUNCTION capital_api.list_accounts();

DROP FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_api.archive_account(UUID);

-- ---------------------------------------------------------
-- 2. DROP EXISTING PRIVATE IMPLEMENTATIONS
-- ---------------------------------------------------------

DROP FUNCTION capital_private.list_accounts_impl();

DROP FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_private.archive_account_impl(UUID);

-- =========================================================
-- 3. PRIVATE: LIST ACCOUNTS
-- =========================================================

CREATE FUNCTION capital_private.list_accounts_impl()
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
        a.account_subtype,
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
-- 4. PRIVATE: CREATE MANUAL ACCOUNT
-- =========================================================

CREATE FUNCTION capital_private.create_manual_account_impl(
    p_account_name TEXT,
    p_broker_name TEXT DEFAULT NULL,
    p_account_type TEXT DEFAULT 'brokerage',
    p_currency TEXT DEFAULT 'UNKNOWN',
    p_account_subtype TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_account_id UUID;

    v_account_name TEXT;
    v_broker_name TEXT;
    v_account_type TEXT;
    v_account_subtype TEXT;
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

    v_account_subtype :=
        NULLIF(pg_catalog.btrim(p_account_subtype), '');

    INSERT INTO capital_private.accounts (
        user_id,
        account_name,
        broker_name,
        account_type,
        account_subtype,
        currency,
        account_source
    )
    VALUES (
        v_user_id,
        v_account_name,
        v_broker_name,
        v_account_type,
        v_account_subtype,
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
        a.account_subtype,
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
-- 5. PRIVATE: UPDATE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_private.update_account_impl(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT,
    p_account_subtype TEXT
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_account_id UUID;

    v_account_name TEXT;
    v_broker_name TEXT;
    v_account_type TEXT;
    v_account_subtype TEXT;
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

    v_account_subtype :=
        NULLIF(pg_catalog.btrim(p_account_subtype), '');

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
        account_subtype = v_account_subtype,
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
        a.account_subtype,
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
-- 6. PRIVATE: ARCHIVE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_private.archive_account_impl(
    p_account_id UUID
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
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

    PERFORM a.id
    FROM capital_private.accounts AS a
    WHERE a.id = p_account_id
      AND a.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account not found'
            USING ERRCODE = 'P0002';
    END IF;

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
        a.account_subtype,
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
-- 7. EXPOSED API: LIST ACCOUNTS
-- =========================================================

CREATE FUNCTION capital_api.list_accounts()
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.list_accounts_impl();
$function$;

-- =========================================================
-- 8. EXPOSED API: CREATE MANUAL ACCOUNT
-- =========================================================

CREATE FUNCTION capital_api.create_manual_account(
    p_account_name TEXT,
    p_broker_name TEXT DEFAULT NULL,
    p_account_type TEXT DEFAULT 'brokerage',
    p_currency TEXT DEFAULT 'UNKNOWN',
    p_account_subtype TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.create_manual_account_impl(
        p_account_name,
        p_broker_name,
        p_account_type,
        p_currency,
        p_account_subtype
    );
$function$;

-- =========================================================
-- 9. EXPOSED API: UPDATE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_api.update_account(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT,
    p_account_subtype TEXT
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.update_account_impl(
        p_account_id,
        p_account_name,
        p_broker_name,
        p_account_type,
        p_currency,
        p_account_subtype
    );
$function$;

-- =========================================================
-- 10. EXPOSED API: ARCHIVE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_api.archive_account(
    p_account_id UUID
)
RETURNS TABLE (
    id UUID,
    account_name TEXT,
    broker_name TEXT,
    account_type TEXT,
    account_subtype TEXT,
    currency TEXT,
    account_source TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT *
    FROM capital_private.archive_account_impl(
        p_account_id
    );
$function$;

-- =========================================================
-- 11. FUNCTION OWNERSHIP
-- =========================================================

ALTER FUNCTION capital_private.list_accounts_impl()
    OWNER TO postgres;

ALTER FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_private.archive_account_impl(UUID)
    OWNER TO postgres;

ALTER FUNCTION capital_api.list_accounts()
    OWNER TO postgres;

ALTER FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_api.archive_account(UUID)
    OWNER TO postgres;

-- =========================================================
-- 12. EXECUTION PRIVILEGES
-- =========================================================

-- Private implementations:
-- Required by SECURITY INVOKER API wrappers.

REVOKE ALL ON FUNCTION capital_private.list_accounts_impl()
    FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.archive_account_impl(UUID)
    FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_private.list_accounts_impl()
    TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.archive_account_impl(UUID)
    TO authenticated;

-- Exposed API wrappers:
-- Only authenticated users can invoke these operations.

REVOKE ALL ON FUNCTION capital_api.list_accounts()
    FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.archive_account(UUID)
    FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_api.list_accounts()
    TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.archive_account(UUID)
    TO authenticated;

-- =========================================================
-- 13. FUNCTION DOCUMENTATION
-- =========================================================

COMMENT ON FUNCTION capital_api.list_accounts() IS
    'Lists all Capital Management accounts owned by the authenticated user.';

COMMENT ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT
) IS
    'Creates a manual Capital Management account, including an optional account subtype.';

COMMENT ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
) IS
    'Updates an account owned by the authenticated user, including its account subtype. Broker integration identity is protected.';

COMMENT ON FUNCTION capital_api.archive_account(UUID) IS
    'Archives an account owned by the authenticated user. Accounts with pending transactions cannot be archived.';

COMMIT;
