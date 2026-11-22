CREATE OR REPLACE FUNCTION capital_private.create_manual_account_impl(
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

    INSERT INTO capital_private.accounts AS inserted_account (
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
    RETURNING inserted_account.id INTO v_account_id;

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
