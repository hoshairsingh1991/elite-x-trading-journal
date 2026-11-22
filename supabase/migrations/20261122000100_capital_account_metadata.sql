BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT
-- MIGRATION: ACCOUNT METADATA
-- =========================================================


-- =========================================================
-- 1. ACCOUNT METADATA COLUMNS
-- =========================================================

ALTER TABLE capital_private.accounts
    ADD COLUMN account_number_last4 TEXT,
    ADD COLUMN trading_mode TEXT NOT NULL DEFAULT 'unknown';

-- Existing brokerage accounts have an unknown trading mode.
-- Non-brokerage accounts do not have a trading mode.

UPDATE capital_private.accounts
SET trading_mode = CASE
    WHEN account_type = 'brokerage' THEN 'unknown'
    ELSE 'not_applicable'
END;

ALTER TABLE capital_private.accounts
    ADD CONSTRAINT capital_accounts_account_number_last4_valid
    CHECK (
        account_number_last4 IS NULL
        OR account_number_last4 ~ '^[0-9]{4}$'
    );

ALTER TABLE capital_private.accounts
    ADD CONSTRAINT capital_accounts_trading_mode_valid
    CHECK (
        (
            account_type = 'brokerage'
            AND trading_mode IN (
                'cash',
                'margin',
                'portfolio_margin',
                'unknown'
            )
        )
        OR
        (
            account_type <> 'brokerage'
            AND trading_mode = 'not_applicable'
        )
    );

COMMENT ON COLUMN capital_private.accounts.account_number_last4 IS
    'Optional last four digits of the account number. Full account numbers must not be stored.';

COMMENT ON COLUMN capital_private.accounts.trading_mode IS
    'Trading configuration for brokerage accounts. Non-brokerage accounts use not_applicable.';


-- =========================================================
-- 2. DROP EXISTING ACCOUNT API WRAPPERS
-- =========================================================

DROP FUNCTION capital_api.list_accounts();

DROP FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_api.archive_account(UUID);


-- =========================================================
-- 3. DROP EXISTING PRIVATE IMPLEMENTATIONS
-- =========================================================

DROP FUNCTION capital_private.list_accounts_impl();

DROP FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_private.archive_account_impl(UUID);


-- =========================================================
-- 4. PRIVATE: LIST ACCOUNTS
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
        a.updated_at,
        a.account_number_last4,
        a.trading_mode
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
-- 5. PRIVATE: CREATE MANUAL ACCOUNT
-- =========================================================

CREATE FUNCTION capital_private.create_manual_account_impl(
    p_account_name TEXT,
    p_broker_name TEXT DEFAULT NULL,
    p_account_type TEXT DEFAULT 'brokerage',
    p_currency TEXT DEFAULT 'UNKNOWN',
    p_account_subtype TEXT DEFAULT NULL,
    p_account_number_last4 TEXT DEFAULT NULL,
    p_trading_mode TEXT DEFAULT NULL
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
    v_account_number_last4 TEXT;
    v_trading_mode TEXT;
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

    v_account_number_last4 :=
        NULLIF(pg_catalog.btrim(p_account_number_last4), '');

    IF v_account_number_last4 IS NOT NULL
       AND v_account_number_last4 !~ '^[0-9]{4}$'
    THEN
        RAISE EXCEPTION
            'Account number must contain exactly four digits.'
            USING ERRCODE = '22023';
    END IF;

    v_trading_mode :=
        pg_catalog.lower(
            NULLIF(pg_catalog.btrim(p_trading_mode), '')
        );

    IF v_account_type = 'brokerage' THEN
        v_trading_mode := COALESCE(v_trading_mode, 'unknown');

        IF v_trading_mode NOT IN (
            'cash',
            'margin',
            'portfolio_margin',
            'unknown'
        ) THEN
            RAISE EXCEPTION 'Invalid brokerage trading mode.'
                USING ERRCODE = '22023';
        END IF;
    ELSE
        IF v_trading_mode IS NOT NULL
           AND v_trading_mode <> 'not_applicable'
        THEN
            RAISE EXCEPTION
                'Trading mode is only applicable to brokerage accounts.'
                USING ERRCODE = '22023';
        END IF;

        v_trading_mode := 'not_applicable';
    END IF;

    INSERT INTO capital_private.accounts (
        user_id,
        account_name,
        broker_name,
        account_type,
        account_subtype,
        currency,
        account_source,
        account_number_last4,
        trading_mode
    )
    VALUES (
        v_user_id,
        v_account_name,
        v_broker_name,
        v_account_type,
        v_account_subtype,
        v_currency,
        'manual',
        v_account_number_last4,
        v_trading_mode
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
        a.updated_at,
        a.account_number_last4,
        a.trading_mode
    FROM capital_private.accounts AS a
    WHERE a.id = v_account_id
      AND a.user_id = v_user_id;
END;
$function$;


-- =========================================================
-- 6. PRIVATE: UPDATE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_private.update_account_impl(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT,
    p_account_subtype TEXT,
   p_account_number_last4 TEXT DEFAULT '__PRESERVE__',
p_trading_mode TEXT DEFAULT NULL
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
    v_account_number_last4 TEXT;
    v_requested_trading_mode TEXT;
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

IF p_account_number_last4 = '__PRESERVE__' THEN
    v_account_number_last4 := NULL;
ELSE
    v_account_number_last4 :=
        NULLIF(pg_catalog.btrim(p_account_number_last4), '');

    IF v_account_number_last4 IS NOT NULL
       AND v_account_number_last4 !~ '^[0-9]{4}$'
    THEN
        RAISE EXCEPTION
            'Account number must contain exactly four digits.'
            USING ERRCODE = '22023';
    END IF;
END IF;

v_requested_trading_mode :=
        pg_catalog.lower(
            NULLIF(pg_catalog.btrim(p_trading_mode), '')
        );

    IF v_account_type = 'brokerage' THEN
        IF v_requested_trading_mode IS NOT NULL
           AND v_requested_trading_mode NOT IN (
               'cash',
               'margin',
               'portfolio_margin',
               'unknown'
           )
        THEN
            RAISE EXCEPTION 'Invalid brokerage trading mode.'
                USING ERRCODE = '22023';
        END IF;
    ELSE
        IF v_requested_trading_mode IS NOT NULL
           AND v_requested_trading_mode <> 'not_applicable'
        THEN
            RAISE EXCEPTION
                'Trading mode is only applicable to brokerage accounts.'
                USING ERRCODE = '22023';
        END IF;
    END IF;

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
        currency = v_currency,
        account_number_last4 =
    CASE
        WHEN p_account_number_last4 = '__PRESERVE__'
            THEN a.account_number_last4
        ELSE v_account_number_last4
    END,

        -- Preserve an existing brokerage trading mode when an
        -- older caller omits the optional parameter.
        -- Switching into brokerage defaults to unknown.
        trading_mode =
            CASE
                WHEN v_account_type <> 'brokerage'
                    THEN 'not_applicable'

                WHEN v_requested_trading_mode IS NOT NULL
                    THEN v_requested_trading_mode

                WHEN a.account_type = 'brokerage'
                    THEN a.trading_mode

                ELSE 'unknown'
            END

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
        a.updated_at,
        a.account_number_last4,
        a.trading_mode
    FROM capital_private.accounts AS a
    WHERE a.id = v_account_id
      AND a.user_id = v_user_id;
END;
$function$;


-- =========================================================
-- 7. PRIVATE: ARCHIVE ACCOUNT
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
        a.updated_at,
        a.account_number_last4,
        a.trading_mode
    FROM capital_private.accounts AS a
    WHERE a.id = p_account_id
      AND a.user_id = v_user_id;
END;
$function$;


-- =========================================================
-- 8. EXPOSED API: LIST ACCOUNTS
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
-- 9. EXPOSED API: CREATE MANUAL ACCOUNT
-- =========================================================

CREATE FUNCTION capital_api.create_manual_account(
    p_account_name TEXT,
    p_broker_name TEXT DEFAULT NULL,
    p_account_type TEXT DEFAULT 'brokerage',
    p_currency TEXT DEFAULT 'UNKNOWN',
    p_account_subtype TEXT DEFAULT NULL,
    p_account_number_last4 TEXT DEFAULT NULL,
    p_trading_mode TEXT DEFAULT NULL
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
        p_account_subtype,
        p_account_number_last4,
        p_trading_mode
    );
$function$;


-- =========================================================
-- 10. EXPOSED API: UPDATE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_api.update_account(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT,
    p_account_subtype TEXT,
    p_account_number_last4 TEXT DEFAULT '__PRESERVE__',
p_trading_mode TEXT DEFAULT NULL
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
        p_account_subtype,
        p_account_number_last4,
        p_trading_mode
    );
$function$;


-- =========================================================
-- 11. EXPOSED API: ARCHIVE ACCOUNT
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
    updated_at TIMESTAMPTZ,
    account_number_last4 TEXT,
    trading_mode TEXT
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
-- 12. FUNCTION OWNERSHIP
-- =========================================================

ALTER FUNCTION capital_private.list_accounts_impl()
    OWNER TO postgres;

ALTER FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_private.archive_account_impl(UUID)
    OWNER TO postgres;

ALTER FUNCTION capital_api.list_accounts()
    OWNER TO postgres;

ALTER FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_api.archive_account(UUID)
    OWNER TO postgres;


-- =========================================================
-- 13. FUNCTION EXECUTION PRIVILEGES
-- =========================================================

-- Private implementations:
-- Required by SECURITY INVOKER API wrappers.

REVOKE ALL ON FUNCTION capital_private.list_accounts_impl()
    FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_private.archive_account_impl(UUID)
    FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_private.list_accounts_impl()
    TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.create_manual_account_impl(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.archive_account_impl(UUID)
    TO authenticated;


-- Exposed API wrappers:
-- Only authenticated users can invoke these operations.

REVOKE ALL ON FUNCTION capital_api.list_accounts()
    FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION capital_api.archive_account(UUID)
    FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_api.list_accounts()
    TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_api.archive_account(UUID)
    TO authenticated;


-- =========================================================
-- 14. FUNCTION DOCUMENTATION
-- =========================================================

COMMENT ON FUNCTION capital_api.list_accounts() IS
    'Lists all Capital Management accounts owned by the authenticated user, including account metadata.';

COMMENT ON FUNCTION capital_api.create_manual_account(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) IS
    'Creates a manual Capital Management account with optional subtype, last four account-number digits, and trading mode.';

COMMENT ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) IS
    'Updates a Capital Management account and its metadata. Broker integration identity is protected.';

COMMENT ON FUNCTION capital_api.archive_account(UUID) IS
    'Archives an account owned by the authenticated user. Accounts with pending transactions cannot be archived.';

COMMIT;
