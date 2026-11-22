-- =========================================================
-- Capital Management: explicit taxonomy replacement semantics
-- Migration: 20261122000500
--
-- Compatibility contract:
--   - Existing callers that omit p_taxonomy_fields_provided retain
--     the legacy NULL-means-preserve behavior.
--   - Updated callers pass TRUE to replace the ownership/registration
--     fields as a complete group; NULL then intentionally clears a field.
--   - Trading-mode and trading-mode-custom semantics remain unchanged.
-- =========================================================

-- Drop the API wrapper first because it depends on the private implementation.
-- The new signatures add a trailing BOOLEAN with a default, so old callers
-- can continue invoking the functions with the original 12 arguments.
DROP FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT
);

DROP FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT
);

-- =========================================================
-- PRIVATE: UPDATE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_private.update_account_impl(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT,
    p_account_subtype TEXT,
    p_account_number_last4 TEXT DEFAULT '__PRESERVE__',
    p_trading_mode TEXT DEFAULT NULL,
    p_ownership TEXT DEFAULT NULL,
    p_ownership_custom TEXT DEFAULT NULL,
    p_registration TEXT DEFAULT NULL,
    p_trading_mode_custom TEXT DEFAULT NULL,
    p_taxonomy_fields_provided BOOLEAN DEFAULT FALSE
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
    trading_mode TEXT,
    ownership TEXT,
    ownership_custom TEXT,
    registration TEXT,
    trading_mode_custom TEXT
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
    v_ownership TEXT;
    v_ownership_custom TEXT;
    v_registration TEXT;
    v_trading_mode_custom TEXT;
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

    v_broker_name := NULLIF(pg_catalog.btrim(p_broker_name), '');

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

    IF v_account_subtype IS NOT NULL
       AND char_length(v_account_subtype) > 80
    THEN
        RAISE EXCEPTION 'Account subtype is too long'
            USING ERRCODE = '22023';
    END IF;

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
                'limited_margin',
                'other',
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

    v_ownership := NULLIF(pg_catalog.btrim(p_ownership), '');
    v_ownership_custom := NULLIF(pg_catalog.btrim(p_ownership_custom), '');
    v_registration := NULLIF(pg_catalog.btrim(p_registration), '');
    v_trading_mode_custom := NULLIF(pg_catalog.btrim(p_trading_mode_custom), '');

    IF v_ownership IS NOT NULL
       AND char_length(v_ownership) > 40
    THEN
        RAISE EXCEPTION 'Ownership value is too long'
            USING ERRCODE = '22023';
    END IF;

    IF v_ownership = 'other' THEN
        IF v_ownership_custom IS NULL THEN
            RAISE EXCEPTION 'Custom ownership is required'
                USING ERRCODE = '22023';
        END IF;
    ELSE
        v_ownership_custom := NULL;
    END IF;

    IF v_ownership_custom IS NOT NULL
       AND char_length(v_ownership_custom) > 80
    THEN
        RAISE EXCEPTION 'Custom ownership is too long'
            USING ERRCODE = '22023';
    END IF;

    IF v_registration IS NOT NULL
       AND char_length(v_registration) > 80
    THEN
        RAISE EXCEPTION 'Registration is too long'
            USING ERRCODE = '22023';
    END IF;

    IF v_requested_trading_mode = 'other' THEN
        IF v_trading_mode_custom IS NULL THEN
            RAISE EXCEPTION 'Custom trading mode is required'
                USING ERRCODE = '22023';
        END IF;
    ELSE
        v_trading_mode_custom := NULL;
    END IF;

    IF v_trading_mode_custom IS NOT NULL
       AND char_length(v_trading_mode_custom) > 80
    THEN
        RAISE EXCEPTION 'Custom trading mode is too long'
            USING ERRCODE = '22023';
    END IF;

    UPDATE capital_private.accounts AS a
    SET
        account_name = v_account_name,

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

        trading_mode =
            CASE
                WHEN v_account_type <> 'brokerage'
                    THEN 'not_applicable'
                WHEN v_requested_trading_mode IS NOT NULL
                    THEN v_requested_trading_mode
                WHEN a.account_type = 'brokerage'
                    THEN a.trading_mode
                ELSE 'unknown'
            END,

        ownership =
            CASE
                WHEN p_taxonomy_fields_provided
                    THEN v_ownership
                ELSE COALESCE(v_ownership, a.ownership)
            END,

        ownership_custom =
            CASE
                WHEN p_taxonomy_fields_provided
                    THEN v_ownership_custom
                ELSE COALESCE(v_ownership_custom, a.ownership_custom)
            END,

        registration =
            CASE
                WHEN p_taxonomy_fields_provided
                    THEN v_registration
                ELSE COALESCE(v_registration, a.registration)
            END,

        trading_mode_custom =
            CASE
                WHEN v_requested_trading_mode = 'other'
                    THEN v_trading_mode_custom
                WHEN v_requested_trading_mode IS NULL
                    THEN a.trading_mode_custom
                ELSE NULL
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
        a.trading_mode,
        a.ownership,
        a.ownership_custom,
        a.registration,
        a.trading_mode_custom
    FROM capital_private.accounts AS a
    WHERE a.id = v_account_id
      AND a.user_id = v_user_id;
END;
$function$;

-- =========================================================
-- API: UPDATE ACCOUNT
-- =========================================================

CREATE FUNCTION capital_api.update_account(
    p_account_id UUID,
    p_account_name TEXT,
    p_broker_name TEXT,
    p_account_type TEXT,
    p_currency TEXT,
    p_account_subtype TEXT,
    p_account_number_last4 TEXT DEFAULT '__PRESERVE__',
    p_trading_mode TEXT DEFAULT NULL,
    p_ownership TEXT DEFAULT NULL,
    p_ownership_custom TEXT DEFAULT NULL,
    p_registration TEXT DEFAULT NULL,
    p_trading_mode_custom TEXT DEFAULT NULL,
    p_taxonomy_fields_provided BOOLEAN DEFAULT FALSE
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
    trading_mode TEXT,
    ownership TEXT,
    ownership_custom TEXT,
    registration TEXT,
    trading_mode_custom TEXT
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
        p_trading_mode,
        p_ownership,
        p_ownership_custom,
        p_registration,
        p_trading_mode_custom,
        p_taxonomy_fields_provided
    );
$function$;

-- =========================================================
-- OWNERSHIP, PRIVILEGES, AND FUNCTION COMMENT
-- =========================================================

ALTER FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) OWNER TO postgres;

ALTER FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_private.update_account_impl(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO authenticated;

REVOKE ALL ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO authenticated;

COMMENT ON FUNCTION capital_api.update_account(
    UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
    TEXT, TEXT, TEXT, TEXT, BOOLEAN
) IS
    'Updates a user-owned Capital Management account. When p_taxonomy_fields_provided is true, ownership and registration taxonomy fields are replaced as a complete group, including intentional NULL clears. When false, legacy NULL-means-preserve behavior is retained. Broker integration identity is protected.';

-- Make PostgREST refresh the changed RPC signature.
NOTIFY pgrst, 'reload schema';
