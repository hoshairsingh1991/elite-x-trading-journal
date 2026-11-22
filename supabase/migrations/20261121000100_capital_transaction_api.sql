
-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 008: TRANSACTION API
-- PART 1A: PRIVATE FOUNDATION, CREATE AND LIST
-- =========================================================

-- ---------------------------------------------------------
-- ---------------------------------------------------------
-- 1. DURABLE IDEMPOTENCY LEDGER
-- ---------------------------------------------------------

-- Idempotency records must survive physical transaction
-- deletion. Otherwise a delayed retry could recreate a
-- previously deleted financial movement.
--
-- Intentionally NO foreign key to transactions:
-- transaction_id remains as a tombstone after deletion.

CREATE TABLE capital_private.transaction_idempotency (
    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    idempotency_key UUID NOT NULL,

    operation TEXT NOT NULL,

    request_fingerprint JSONB NOT NULL,

    transaction_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT capital_transaction_idempotency_pkey
        PRIMARY KEY (user_id, idempotency_key),

    CONSTRAINT capital_transaction_idempotency_transaction_unique
        UNIQUE (user_id, transaction_id),

    CONSTRAINT capital_transaction_idempotency_operation_valid
        CHECK (
            operation IN (
                'CREATE_TRANSACTION',
                'REVERSE_TRANSACTION'
            )
        ),

    CONSTRAINT capital_transaction_idempotency_fingerprint_valid
        CHECK (
            pg_catalog.jsonb_typeof(request_fingerprint) = 'object'
        )
);

ALTER TABLE capital_private.transaction_idempotency
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE capital_private.transaction_idempotency
    FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE capital_private.transaction_idempotency
    FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON TABLE capital_private.transaction_idempotency IS
    'Durable per-user idempotency ledger. Request keys and fingerprints survive physical transaction deletion to prevent delayed retries from recreating deleted financial movements. Transaction UUIDs are intentionally retained without a foreign key.';


-- ---------------------------------------------------------
-- 2. ACTIVITY DATE PAGINATION INDEX
-- ---------------------------------------------------------

-- Completed rows use effective_date.
-- Pending and cancelled rows use transaction_date.

CREATE INDEX capital_transactions_activity_cursor_idx
ON capital_private.transactions (
    user_id,
    (COALESCE(effective_date, transaction_date)) DESC,
    id DESC
);

-- =========================================================
-- 3. PRIVATE HELPER: TRANSACTION PAYLOAD VALIDATION
-- =========================================================

CREATE FUNCTION capital_private.assert_transaction_payload(
    p_transaction_type TEXT,
    p_status TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_received_amount NUMERIC,
    p_received_currency TEXT,
    p_exchange_rate NUMERIC,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_validate_fx_relationship BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_received_scale INTEGER;
BEGIN
    IF p_validate_fx_relationship IS NULL THEN
        RAISE EXCEPTION
            'FX validation mode must be specified.'
            USING ERRCODE = '22023';
    END IF;
    IF p_transaction_type IS NULL
       OR p_transaction_type NOT IN (
           'DEPOSIT',
           'WITHDRAWAL',
           'TRANSFER'
       ) THEN
        RAISE EXCEPTION 'Invalid transaction type.'
            USING ERRCODE = '22023';
    END IF;

    IF p_status IS NULL
       OR p_status NOT IN ('PENDING', 'COMPLETED') THEN
        RAISE EXCEPTION
            'New or updated transactions must be PENDING or COMPLETED.'
            USING ERRCODE = '22023';
    END IF;

    IF p_transaction_date IS NULL THEN
        RAISE EXCEPTION 'Transaction date is required.'
            USING ERRCODE = '22023';
    END IF;

    IF p_status = 'COMPLETED'
       AND p_effective_date IS NULL THEN
        RAISE EXCEPTION
            'Completed transactions require an effective date.'
            USING ERRCODE = '22023';
    END IF;

    IF p_status = 'PENDING'
       AND p_effective_date IS NOT NULL THEN
        RAISE EXCEPTION
            'Pending transactions cannot have an effective date.'
            USING ERRCODE = '22023';
    END IF;

    IF p_currency IS NULL
       OR p_currency NOT IN (
           'CAD', 'USD', 'EUR', 'GBP', 'JPY', 'INR'
       ) THEN
        RAISE EXCEPTION 'Unsupported transaction currency.'
            USING ERRCODE = '22023';
    END IF;

    IF p_amount IS NULL
       OR NOT (
           p_amount > 0
           AND p_amount < 'Infinity'::NUMERIC
       ) THEN
        RAISE EXCEPTION
            'Transaction amount must be a finite positive value.'
            USING ERRCODE = '22023';
    END IF;

    IF p_amount <> pg_catalog.trunc(
        p_amount,
        CASE WHEN p_currency = 'JPY' THEN 0 ELSE 2 END
    ) THEN
        RAISE EXCEPTION
            'Transaction amount exceeds the supported currency precision.'
            USING ERRCODE = '22023';
    END IF;

    IF p_transaction_type = 'DEPOSIT' THEN
        IF p_from_account_id IS NOT NULL
           OR p_to_account_id IS NULL
           OR p_received_amount IS NOT NULL
           OR p_received_currency IS NOT NULL
           OR p_exchange_rate IS NOT NULL THEN
            RAISE EXCEPTION
                'Invalid deposit transaction structure.'
                USING ERRCODE = '22023';
        END IF;

        RETURN;
    END IF;

    IF p_transaction_type = 'WITHDRAWAL' THEN
        IF p_from_account_id IS NULL
           OR p_to_account_id IS NOT NULL
           OR p_received_amount IS NOT NULL
           OR p_received_currency IS NOT NULL
           OR p_exchange_rate IS NOT NULL THEN
            RAISE EXCEPTION
                'Invalid withdrawal transaction structure.'
                USING ERRCODE = '22023';
        END IF;

        RETURN;
    END IF;

    -- TRANSFER

    IF p_from_account_id IS NULL
       OR p_to_account_id IS NULL
       OR p_from_account_id = p_to_account_id THEN
        RAISE EXCEPTION
            'A transfer requires two different accounts.'
            USING ERRCODE = '22023';
    END IF;

    IF p_received_amount IS NULL
       OR NOT (
           p_received_amount > 0
           AND p_received_amount < 'Infinity'::NUMERIC
       ) THEN
        RAISE EXCEPTION
            'Received amount must be a finite positive value.'
            USING ERRCODE = '22023';
    END IF;

    IF p_received_currency IS NULL
       OR p_received_currency NOT IN (
           'CAD', 'USD', 'EUR', 'GBP', 'JPY', 'INR'
       ) THEN
        RAISE EXCEPTION
            'Unsupported receiving currency.'
            USING ERRCODE = '22023';
    END IF;

    IF p_exchange_rate IS NULL
       OR NOT (
           p_exchange_rate > 0
           AND p_exchange_rate < 'Infinity'::NUMERIC
       ) THEN
        RAISE EXCEPTION
            'Exchange rate must be a finite positive value.'
            USING ERRCODE = '22023';
    END IF;

    IF p_exchange_rate <> pg_catalog.trunc(
        p_exchange_rate,
        12
    ) THEN
        RAISE EXCEPTION
            'Exchange rate supports a maximum of 12 decimal places.'
            USING ERRCODE = '22023';
    END IF;

    v_received_scale :=
        CASE WHEN p_received_currency = 'JPY' THEN 0 ELSE 2 END;

    IF p_received_amount <> pg_catalog.trunc(
        p_received_amount,
        v_received_scale
    ) THEN
        RAISE EXCEPTION
            'Received amount exceeds the receiving currency precision.'
            USING ERRCODE = '22023';
    END IF;

    IF p_currency = p_received_currency THEN
        IF p_received_amount <> p_amount
           OR p_exchange_rate <> 1 THEN
            RAISE EXCEPTION
                'Same-currency transfers require equal amounts and an exchange rate of 1.'
                USING ERRCODE = '22023';
        END IF;
    ELSIF p_validate_fx_relationship THEN
        IF p_received_amount <> pg_catalog.round(
            p_amount * p_exchange_rate,
            v_received_scale
        ) THEN
            RAISE EXCEPTION
                'Received amount does not match the sending amount and exchange rate after currency rounding.'
                USING ERRCODE = '22023';
        END IF;
    END IF;
END;
$function$;

ALTER FUNCTION capital_private.assert_transaction_payload(
    TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, BOOLEAN
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.assert_transaction_payload(
    TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, BOOLEAN
) FROM PUBLIC, anon, authenticated, service_role;

-- =========================================================
-- 4. PRIVATE HELPER: DETERMINISTIC ACCOUNT LOCKING
-- =========================================================

CREATE FUNCTION capital_private.lock_transaction_accounts(
    p_user_id UUID,
    p_account_ids UUID[],
    p_allow_archived_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_account_id UUID;
    v_account_status TEXT;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    -- Every account is locked in ascending UUID order.
    -- This prevents opposite-direction transfers from
    -- acquiring account locks in inconsistent order.

    FOR v_account_id IN
        SELECT DISTINCT account_id
        FROM pg_catalog.unnest(
            COALESCE(p_account_ids, ARRAY[]::UUID[])
        ) AS account_ids(account_id)
        WHERE account_id IS NOT NULL
        ORDER BY account_id
    LOOP
        SELECT a.status
        INTO v_account_status
        FROM capital_private.accounts AS a
        WHERE a.id = v_account_id
          AND a.user_id = p_user_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Account not found.'
                USING ERRCODE = 'P0002';
        END IF;

IF v_account_status <> 'active'
   AND NOT COALESCE(
       v_account_id = ANY(
           pg_catalog.array_remove(
               COALESCE(
                   p_allow_archived_ids,
                   ARRAY[]::UUID[]
               ),
               NULL::UUID
           )
       ),
       FALSE
   ) THEN
            RAISE EXCEPTION
                'Archived accounts cannot be used for this operation.'
                USING ERRCODE = '55000';
        END IF;
    END LOOP;
END;
$function$;

ALTER FUNCTION capital_private.lock_transaction_accounts(
    UUID, UUID[], UUID[]
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.lock_transaction_accounts(
    UUID, UUID[], UUID[]
) FROM PUBLIC, anon, authenticated, service_role;

-- =========================================================
-- 5. PRIVATE IMPLEMENTATION: CREATE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_private.create_transaction_impl(
    p_idempotency_key UUID,
    p_transaction_type TEXT,
    p_status TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_received_amount NUMERIC,
    p_received_currency TEXT,
    p_exchange_rate NUMERIC,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_method TEXT,
    p_counterparty_institution TEXT,
    p_reference_number TEXT,
    p_notes TEXT
)
RETURNS SETOF capital_private.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;

    v_method TEXT;
    v_counterparty TEXT;
    v_reference TEXT;
    v_notes TEXT;

    v_fingerprint JSONB;

    v_ledger_operation TEXT;
    v_ledger_fingerprint JSONB;
    v_ledger_transaction_id UUID;

    v_transaction capital_private.transactions%ROWTYPE;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_idempotency_key IS NULL THEN
        RAISE EXCEPTION 'Idempotency key is required.'
            USING ERRCODE = '22023';
    END IF;

    v_method := NULLIF(pg_catalog.btrim(p_method), '');
    v_counterparty :=
        NULLIF(pg_catalog.btrim(p_counterparty_institution), '');
    v_reference :=
        NULLIF(pg_catalog.btrim(p_reference_number), '');
    v_notes := NULLIF(pg_catalog.btrim(p_notes), '');

    v_fingerprint := pg_catalog.jsonb_build_object(
        'operation', 'create_transaction',
        'transaction_type', p_transaction_type,
        'status', p_status,
        'amount', p_amount,
        'currency', p_currency,
        'from_account_id', p_from_account_id,
        'to_account_id', p_to_account_id,
        'received_amount', p_received_amount,
        'received_currency', p_received_currency,
        'exchange_rate', p_exchange_rate,
        'transaction_date', p_transaction_date,
        'effective_date', p_effective_date,
        'method', v_method,
        'counterparty_institution', v_counterparty,
        'reference_number', v_reference,
        'notes', v_notes
    );

    -- -----------------------------------------------------
    -- 1. CHECK DURABLE IDEMPOTENCY LEDGER
    -- -----------------------------------------------------

    SELECT
        l.operation,
        l.request_fingerprint,
        l.transaction_id
    INTO
        v_ledger_operation,
        v_ledger_fingerprint,
        v_ledger_transaction_id
    FROM capital_private.transaction_idempotency AS l
    WHERE l.user_id = v_user_id
      AND l.idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_ledger_operation <> 'CREATE_TRANSACTION'
           OR v_ledger_fingerprint IS DISTINCT FROM v_fingerprint THEN
            RAISE EXCEPTION
                'Idempotency key has already been used for a different request.'
                USING ERRCODE = '23505';
        END IF;

        SELECT t.*
        INTO v_transaction
        FROM capital_private.transactions AS t
        WHERE t.user_id = v_user_id
          AND t.id = v_ledger_transaction_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'This transaction was previously created and subsequently deleted. A new idempotency key is required.'
                USING ERRCODE = '55000';
        END IF;

        RETURN NEXT v_transaction;
        RETURN;
    END IF;

    -- -----------------------------------------------------
    -- 2. VALIDATE TRANSACTION PAYLOAD
    -- -----------------------------------------------------

    PERFORM capital_private.assert_transaction_payload(
        p_transaction_type,
        p_status,
        p_amount,
        p_currency,
        p_from_account_id,
        p_to_account_id,
        p_received_amount,
        p_received_currency,
        p_exchange_rate,
        p_transaction_date,
        p_effective_date,
        TRUE
    );

    -- -----------------------------------------------------
    -- 3. LOCK AND VALIDATE ACCOUNT OWNERSHIP
    -- -----------------------------------------------------

    PERFORM capital_private.lock_transaction_accounts(
        v_user_id,
        ARRAY[
            p_from_account_id,
            p_to_account_id
        ]::UUID[]
    );

    -- -----------------------------------------------------
    -- 4. INSERT CANONICAL TRANSACTION
    -- -----------------------------------------------------

    INSERT INTO capital_private.transactions (
        user_id,
        idempotency_key,
        transaction_type,
        status,
        amount,
        currency,
        from_account_id,
        to_account_id,
        received_amount,
        received_currency,
        exchange_rate,
        transaction_date,
        effective_date,
        method,
        counterparty_institution,
        reference_number,
        notes
    )
    VALUES (
        v_user_id,
        p_idempotency_key,
        p_transaction_type,
        p_status,
        p_amount,
        p_currency,
        p_from_account_id,
        p_to_account_id,
        p_received_amount,
        p_received_currency,
        p_exchange_rate,
        p_transaction_date,
        p_effective_date,
        v_method,
        v_counterparty,
        v_reference,
        v_notes
    )
    ON CONFLICT ON CONSTRAINT capital_transactions_idempotency_unique
    DO NOTHING
    RETURNING *
    INTO v_transaction;

    -- -----------------------------------------------------
    -- 5. HANDLE CONCURRENT DUPLICATE REQUEST
    -- -----------------------------------------------------

    IF NOT FOUND THEN
        SELECT
            l.operation,
            l.request_fingerprint,
            l.transaction_id
        INTO
            v_ledger_operation,
            v_ledger_fingerprint,
            v_ledger_transaction_id
        FROM capital_private.transaction_idempotency AS l
        WHERE l.user_id = v_user_id
          AND l.idempotency_key = p_idempotency_key;

        IF FOUND THEN
            IF v_ledger_operation <> 'CREATE_TRANSACTION'
               OR v_ledger_fingerprint IS DISTINCT FROM v_fingerprint THEN
                RAISE EXCEPTION
                    'Idempotency key has already been used for a different request.'
                    USING ERRCODE = '23505';
            END IF;

            SELECT t.*
            INTO v_transaction
            FROM capital_private.transactions AS t
            WHERE t.user_id = v_user_id
              AND t.id = v_ledger_transaction_id;

            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'This transaction was previously created and subsequently deleted.'
                    USING ERRCODE = '55000';
            END IF;

            RETURN NEXT v_transaction;
            RETURN;
        END IF;

        -- A transaction with this key exists without a
        -- durable ledger entry. Do not guess its original
        -- request or silently treat it as a valid retry.

        RAISE EXCEPTION
            'An existing transaction uses this idempotency key but has no durable ledger entry. Manual reconciliation is required.'
            USING ERRCODE = '23505';
    END IF;

    -- -----------------------------------------------------
    -- 6. REGISTER DURABLE IDEMPOTENCY RECORD
    -- -----------------------------------------------------

    INSERT INTO capital_private.transaction_idempotency (
        user_id,
        idempotency_key,
        operation,
        request_fingerprint,
        transaction_id
    )
    VALUES (
        v_user_id,
        p_idempotency_key,
        'CREATE_TRANSACTION',
        v_fingerprint,
        v_transaction.id
    );

    -- Both inserts commit or roll back atomically.
    -- The ledger intentionally survives later transaction deletion.

    RETURN NEXT v_transaction;
    RETURN;
END;
$function$;

ALTER FUNCTION capital_private.create_transaction_impl(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE,
    TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.create_transaction_impl(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE,
    TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

-- =========================================================
-- 6. PRIVATE IMPLEMENTATION: LIST TRANSACTIONS
-- =========================================================

CREATE FUNCTION capital_private.list_transactions_impl(
    p_status TEXT,
    p_transaction_type TEXT,
    p_account_id UUID,
    p_currency TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_limit INTEGER,
    p_before_activity_date DATE,
    p_before_id UUID
)
RETURNS SETOF capital_private.transactions
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
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_status IS NOT NULL
       AND p_status NOT IN (
           'PENDING',
           'COMPLETED',
           'CANCELLED'
       ) THEN
        RAISE EXCEPTION 'Invalid transaction status filter.'
            USING ERRCODE = '22023';
    END IF;

    IF p_transaction_type IS NOT NULL
       AND p_transaction_type NOT IN (
           'DEPOSIT',
           'WITHDRAWAL',
           'TRANSFER'
       ) THEN
        RAISE EXCEPTION 'Invalid transaction type filter.'
            USING ERRCODE = '22023';
    END IF;

    IF p_currency IS NOT NULL
       AND p_currency NOT IN (
           'CAD', 'USD', 'EUR', 'GBP', 'JPY', 'INR'
       ) THEN
        RAISE EXCEPTION 'Invalid currency filter.'
            USING ERRCODE = '22023';
    END IF;

    IF p_start_date IS NOT NULL
       AND p_end_date IS NOT NULL
       AND p_start_date > p_end_date THEN
        RAISE EXCEPTION
            'Start date cannot be after end date.'
            USING ERRCODE = '22023';
    END IF;

    IF (p_before_activity_date IS NULL)
       <> (p_before_id IS NULL) THEN
        RAISE EXCEPTION
            'Both pagination cursor values must be provided together.'
            USING ERRCODE = '22023';
    END IF;

    IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
        RAISE EXCEPTION
            'Page size must be between 1 and 100.'
            USING ERRCODE = '22023';
    END IF;

    RETURN QUERY
    SELECT t.*
    FROM capital_private.transactions AS t
    WHERE t.user_id = v_user_id

      AND (
          p_status IS NULL
          OR t.status = p_status
      )

      AND (
          p_transaction_type IS NULL
          OR t.transaction_type = p_transaction_type
      )

      AND (
          p_account_id IS NULL
          OR t.from_account_id = p_account_id
          OR t.to_account_id = p_account_id
      )

      -- A transfer matches either its sending or receiving
      -- currency. The returned row retains both sides.
      AND (
          p_currency IS NULL
          OR t.currency = p_currency
          OR (
              t.transaction_type = 'TRANSFER'
              AND t.received_currency = p_currency
          )
      )

      -- Completed rows use effective_date.
      -- Pending/cancelled rows use transaction_date.
      AND (
          p_start_date IS NULL
          OR COALESCE(
              t.effective_date,
              t.transaction_date
          ) >= p_start_date
      )

      AND (
          p_end_date IS NULL
          OR COALESCE(
              t.effective_date,
              t.transaction_date
          ) <= p_end_date
      )

      -- Descending keyset pagination.
      AND (
          p_before_activity_date IS NULL
          OR (
              COALESCE(
                  t.effective_date,
                  t.transaction_date
              ),
              t.id
          ) < (
              p_before_activity_date,
              p_before_id
          )
      )

    ORDER BY
        COALESCE(
            t.effective_date,
            t.transaction_date
        ) DESC,
        t.id DESC

    LIMIT p_limit;
END;
$function$;

ALTER FUNCTION capital_private.list_transactions_impl(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.list_transactions_impl(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) FROM PUBLIC, anon, authenticated, service_role;

-- =========================================================
-- PART 1A COMPLETE
-- Remaining private operations and API wrappers follow.
-- =========================================================

-- =========================================================
-- 7. PRIVATE IMPLEMENTATION: UPDATE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_private.update_transaction_impl(
    p_transaction_id UUID,
    p_expected_updated_at TIMESTAMPTZ,
    p_transaction_type TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_received_amount NUMERIC,
    p_received_currency TEXT,
    p_exchange_rate NUMERIC,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_method TEXT,
    p_counterparty_institution TEXT,
    p_reference_number TEXT,
    p_notes TEXT
)
RETURNS SETOF capital_private.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_transaction capital_private.transactions%ROWTYPE;

    v_method TEXT;
    v_counterparty TEXT;
    v_reference TEXT;
    v_notes TEXT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_transaction_id IS NULL
       OR p_expected_updated_at IS NULL THEN
        RAISE EXCEPTION
            'Transaction ID and expected update timestamp are required.'
            USING ERRCODE = '22023';
    END IF;

    SELECT t.*
    INTO v_transaction
    FROM capital_private.transactions AS t
    WHERE t.id = p_transaction_id
      AND t.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_transaction.reversal_of_transaction_id IS NOT NULL THEN
        RAISE EXCEPTION
            'Reversal transactions cannot be edited.'
            USING ERRCODE = '55000';
    END IF;

    IF v_transaction.status = 'CANCELLED' THEN
        RAISE EXCEPTION
            'Cancelled transactions cannot be edited.'
            USING ERRCODE = '55000';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM capital_private.transactions AS r
        WHERE r.user_id = v_user_id
          AND r.reversal_of_transaction_id = v_transaction.id
    ) THEN
        RAISE EXCEPTION
            'A transaction with an existing reversal cannot be edited.'
            USING ERRCODE = '55000';
    END IF;

    -- Optimistic concurrency protection.
    IF v_transaction.updated_at IS DISTINCT FROM
       p_expected_updated_at THEN
        RAISE EXCEPTION
            'Transaction was modified by another request. Reload before editing.'
            USING ERRCODE = '40001';
    END IF;

    v_method := NULLIF(pg_catalog.btrim(p_method), '');
    v_counterparty :=
        NULLIF(pg_catalog.btrim(p_counterparty_institution), '');
    v_reference :=
        NULLIF(pg_catalog.btrim(p_reference_number), '');
    v_notes := NULLIF(pg_catalog.btrim(p_notes), '');

PERFORM capital_private.assert_transaction_payload(
    p_transaction_type,
    v_transaction.status,
    p_amount,
    p_currency,
    p_from_account_id,
    p_to_account_id,
    p_received_amount,
    p_received_currency,
    p_exchange_rate,
    p_transaction_date,
    p_effective_date,
    TRUE
);

    -- Lock both old and new account references.
    -- Existing archived accounts may remain attached to
    -- their historical transactions, but new account
    -- assignments must target active accounts.

    PERFORM capital_private.lock_transaction_accounts(
        v_user_id,
        ARRAY[
            v_transaction.from_account_id,
            v_transaction.to_account_id,
            p_from_account_id,
            p_to_account_id
        ]::UUID[],
        ARRAY[
            v_transaction.from_account_id,
            v_transaction.to_account_id
        ]::UUID[]
    );

    UPDATE capital_private.transactions AS t
    SET
        transaction_type = p_transaction_type,
        amount = p_amount,
        currency = p_currency,
        from_account_id = p_from_account_id,
        to_account_id = p_to_account_id,
        received_amount = p_received_amount,
        received_currency = p_received_currency,
        exchange_rate = p_exchange_rate,
        transaction_date = p_transaction_date,
        effective_date = p_effective_date,
        method = v_method,
        counterparty_institution = v_counterparty,
        reference_number = v_reference,
        notes = v_notes
    WHERE t.id = v_transaction.id
      AND t.user_id = v_user_id
    RETURNING t.* INTO v_transaction;

    RETURN NEXT v_transaction;
    RETURN;
END;
$function$;

ALTER FUNCTION capital_private.update_transaction_impl(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.update_transaction_impl(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 8. PRIVATE IMPLEMENTATION: COMPLETE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_private.complete_transaction_impl(
    p_transaction_id UUID,
    p_effective_date DATE,
    p_expected_updated_at TIMESTAMPTZ
)
RETURNS SETOF capital_private.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_transaction capital_private.transactions%ROWTYPE;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_transaction_id IS NULL
       OR p_effective_date IS NULL
       OR p_expected_updated_at IS NULL THEN
        RAISE EXCEPTION
            'Transaction ID, effective date and expected update timestamp are required.'
            USING ERRCODE = '22023';
    END IF;

    SELECT t.*
    INTO v_transaction
    FROM capital_private.transactions AS t
    WHERE t.id = p_transaction_id
      AND t.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found.'
            USING ERRCODE = 'P0002';
    END IF;

    -- A retry after successful completion is harmless.
    IF v_transaction.status = 'COMPLETED' THEN
        IF v_transaction.effective_date = p_effective_date THEN
            RETURN NEXT v_transaction;
            RETURN;
        END IF;

        RAISE EXCEPTION
            'Transaction has already been completed with a different effective date.'
            USING ERRCODE = '55000';
    END IF;

    IF v_transaction.status <> 'PENDING' THEN
        RAISE EXCEPTION
            'Only pending transactions can be completed.'
            USING ERRCODE = '55000';
    END IF;

    IF v_transaction.reversal_of_transaction_id IS NOT NULL THEN
        RAISE EXCEPTION
            'A reversal transaction cannot be completed again.'
            USING ERRCODE = '55000';
    END IF;

    IF v_transaction.updated_at IS DISTINCT FROM
       p_expected_updated_at THEN
        RAISE EXCEPTION
            'Transaction was modified by another request. Reload before completing.'
            USING ERRCODE = '40001';
    END IF;

    -- Completion and account archival must serialize on
    -- the same account rows.
    --
    -- An account with a pending transaction cannot normally
    -- already be archived because archive_account_impl
    -- rejects that state.

    PERFORM capital_private.lock_transaction_accounts(
        v_user_id,
        ARRAY[
            v_transaction.from_account_id,
            v_transaction.to_account_id
        ]::UUID[]
    );

    UPDATE capital_private.transactions AS t
    SET
        status = 'COMPLETED',
        effective_date = p_effective_date
    WHERE t.id = v_transaction.id
      AND t.user_id = v_user_id
    RETURNING t.* INTO v_transaction;

    RETURN NEXT v_transaction;
    RETURN;
END;
$function$;

ALTER FUNCTION capital_private.complete_transaction_impl(
    UUID, DATE, TIMESTAMPTZ
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.complete_transaction_impl(
    UUID, DATE, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 9. PRIVATE IMPLEMENTATION: CANCEL TRANSACTION
-- =========================================================

CREATE FUNCTION capital_private.cancel_transaction_impl(
    p_transaction_id UUID,
    p_expected_updated_at TIMESTAMPTZ
)
RETURNS SETOF capital_private.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_transaction capital_private.transactions%ROWTYPE;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_transaction_id IS NULL
       OR p_expected_updated_at IS NULL THEN
        RAISE EXCEPTION
            'Transaction ID and expected update timestamp are required.'
            USING ERRCODE = '22023';
    END IF;

    SELECT t.*
    INTO v_transaction
    FROM capital_private.transactions AS t
    WHERE t.id = p_transaction_id
      AND t.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found.'
            USING ERRCODE = 'P0002';
    END IF;

    -- Cancellation retry is harmless.
    IF v_transaction.status = 'CANCELLED' THEN
        RETURN NEXT v_transaction;
        RETURN;
    END IF;

    IF v_transaction.status <> 'PENDING' THEN
        RAISE EXCEPTION
            'Only pending transactions can be cancelled.'
            USING ERRCODE = '55000';
    END IF;

    IF v_transaction.reversal_of_transaction_id IS NOT NULL THEN
        RAISE EXCEPTION
            'Reversal transactions cannot be cancelled.'
            USING ERRCODE = '55000';
    END IF;

    IF v_transaction.updated_at IS DISTINCT FROM
       p_expected_updated_at THEN
        RAISE EXCEPTION
            'Transaction was modified by another request. Reload before cancelling.'
            USING ERRCODE = '40001';
    END IF;

    UPDATE capital_private.transactions AS t
    SET
        status = 'CANCELLED',
        effective_date = NULL
    WHERE t.id = v_transaction.id
      AND t.user_id = v_user_id
    RETURNING t.* INTO v_transaction;

    RETURN NEXT v_transaction;
    RETURN;
END;
$function$;

ALTER FUNCTION capital_private.cancel_transaction_impl(
    UUID, TIMESTAMPTZ
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.cancel_transaction_impl(
    UUID, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 10. PRIVATE IMPLEMENTATION: DELETE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_private.delete_transaction_impl(
    p_transaction_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;
    v_transaction capital_private.transactions%ROWTYPE;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_transaction_id IS NULL THEN
        RAISE EXCEPTION 'Transaction ID is required.'
            USING ERRCODE = '22023';
    END IF;

    SELECT t.*
    INTO v_transaction
    FROM capital_private.transactions AS t
    WHERE t.id = p_transaction_id
      AND t.user_id = v_user_id
    FOR UPDATE;

    -- A repeated delete is a harmless no-op.
    -- The same result is returned for an unknown or
    -- non-owned transaction to avoid revealing its existence.

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_transaction.status = 'PENDING' THEN
        RAISE EXCEPTION
            'Pending transactions must be cancelled before deletion.'
            USING ERRCODE = '55000';
    END IF;

    -- The original row must not be deleted while a reversal
    -- exists. The table FK is ON DELETE CASCADE, so this
    -- explicit guard prevents an unexpected cascade delete.

    IF v_transaction.reversal_of_transaction_id IS NULL
       AND EXISTS (
           SELECT 1
           FROM capital_private.transactions AS r
           WHERE r.user_id = v_user_id
             AND r.reversal_of_transaction_id = v_transaction.id
       ) THEN
        RAISE EXCEPTION
            'Delete the reversal transaction before deleting its original.'
            USING ERRCODE = '55000';
    END IF;

    DELETE FROM capital_private.transactions AS t
    WHERE t.id = v_transaction.id
      AND t.user_id = v_user_id;

    RETURN TRUE;
END;
$function$;

ALTER FUNCTION capital_private.delete_transaction_impl(
    UUID
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.delete_transaction_impl(
    UUID
) FROM PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 11. PRIVATE IMPLEMENTATION: REVERSE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_private.reverse_transaction_impl(
    p_original_transaction_id UUID,
    p_idempotency_key UUID,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_reversal_reason TEXT
)
RETURNS SETOF capital_private.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id UUID;

    v_original capital_private.transactions%ROWTYPE;
    v_reversal capital_private.transactions%ROWTYPE;

    v_reversal_type TEXT;
    v_amount NUMERIC;
    v_currency TEXT;
    v_from_account_id UUID;
    v_to_account_id UUID;
    v_received_amount NUMERIC;
    v_received_currency TEXT;
    v_exchange_rate NUMERIC;

    v_reversal_reason TEXT;
    v_fingerprint JSONB;

    v_ledger_operation TEXT;
    v_ledger_fingerprint JSONB;
    v_ledger_transaction_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    IF p_original_transaction_id IS NULL
       OR p_idempotency_key IS NULL
       OR p_transaction_date IS NULL
       OR p_effective_date IS NULL THEN
        RAISE EXCEPTION
            'Original transaction, idempotency key, transaction date and effective date are required.'
            USING ERRCODE = '22023';
    END IF;

    v_reversal_reason :=
        NULLIF(pg_catalog.btrim(p_reversal_reason), '');

    IF v_reversal_reason IS NULL
       OR pg_catalog.char_length(v_reversal_reason) > 500 THEN
        RAISE EXCEPTION
            'A reversal reason between 1 and 500 characters is required.'
            USING ERRCODE = '22023';
    END IF;

    v_fingerprint := pg_catalog.jsonb_build_object(
        'operation', 'reverse_transaction',
        'original_transaction_id', p_original_transaction_id,
        'transaction_date', p_transaction_date,
        'effective_date', p_effective_date,
        'reversal_reason', v_reversal_reason
    );

    -- Initial durable idempotency lookup.
    SELECT
        l.operation,
        l.request_fingerprint,
        l.transaction_id
    INTO
        v_ledger_operation,
        v_ledger_fingerprint,
        v_ledger_transaction_id
    FROM capital_private.transaction_idempotency AS l
    WHERE l.user_id = v_user_id
      AND l.idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_ledger_operation <> 'REVERSE_TRANSACTION'
           OR v_ledger_fingerprint IS DISTINCT FROM v_fingerprint THEN
            RAISE EXCEPTION
                'Idempotency key has already been used for a different request.'
                USING ERRCODE = '23505';
        END IF;

        SELECT t.*
        INTO v_reversal
        FROM capital_private.transactions AS t
        WHERE t.user_id = v_user_id
          AND t.id = v_ledger_transaction_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'This reversal was previously created and subsequently deleted. A new idempotency key is required.'
                USING ERRCODE = '55000';
        END IF;

        RETURN NEXT v_reversal;
        RETURN;
    END IF;

    -- Serialize all reversals and original deletion against
    -- the original transaction row.

    SELECT t.*
    INTO v_original
    FROM capital_private.transactions AS t
    WHERE t.id = p_original_transaction_id
      AND t.user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Original transaction not found.'
            USING ERRCODE = 'P0002';
    END IF;

    -- Repeat the idempotency lookup after acquiring the
    -- original lock. A concurrent identical reversal may
    -- have completed while this request was waiting.

    SELECT
        l.operation,
        l.request_fingerprint,
        l.transaction_id
    INTO
        v_ledger_operation,
        v_ledger_fingerprint,
        v_ledger_transaction_id
    FROM capital_private.transaction_idempotency AS l
    WHERE l.user_id = v_user_id
      AND l.idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_ledger_operation <> 'REVERSE_TRANSACTION'
           OR v_ledger_fingerprint IS DISTINCT FROM v_fingerprint THEN
            RAISE EXCEPTION
                'Idempotency key has already been used for a different request.'
                USING ERRCODE = '23505';
        END IF;

        SELECT t.*
        INTO v_reversal
        FROM capital_private.transactions AS t
        WHERE t.user_id = v_user_id
          AND t.id = v_ledger_transaction_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'This reversal was previously created and subsequently deleted. A new idempotency key is required.'
                USING ERRCODE = '55000';
        END IF;

        RETURN NEXT v_reversal;
        RETURN;
    END IF;

    IF v_original.status <> 'COMPLETED' THEN
        RAISE EXCEPTION
            'Only completed transactions can be reversed.'
            USING ERRCODE = '55000';
    END IF;

    IF v_original.reversal_of_transaction_id IS NOT NULL THEN
        RAISE EXCEPTION
            'A reversal transaction cannot itself be reversed.'
            USING ERRCODE = '55000';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM capital_private.transactions AS r
        WHERE r.user_id = v_user_id
          AND r.reversal_of_transaction_id = v_original.id
    ) THEN
        RAISE EXCEPTION
            'This transaction already has a reversal.'
            USING ERRCODE = '23505';
    END IF;

    -- Derive the reversal from the original record.
    -- No new user-supplied amount or FX rate is accepted.

    CASE v_original.transaction_type

        WHEN 'DEPOSIT' THEN
            v_reversal_type := 'WITHDRAWAL';
            v_amount := v_original.amount;
            v_currency := v_original.currency;
            v_from_account_id := v_original.to_account_id;
            v_to_account_id := NULL;
            v_received_amount := NULL;
            v_received_currency := NULL;
            v_exchange_rate := NULL;

        WHEN 'WITHDRAWAL' THEN
            v_reversal_type := 'DEPOSIT';
            v_amount := v_original.amount;
            v_currency := v_original.currency;
            v_from_account_id := NULL;
            v_to_account_id := v_original.from_account_id;
            v_received_amount := NULL;
            v_received_currency := NULL;
            v_exchange_rate := NULL;

        WHEN 'TRANSFER' THEN
            v_reversal_type := 'TRANSFER';

            -- Reverse the actual amounts and currencies.
            v_amount := v_original.received_amount;
            v_currency := v_original.received_currency;

            v_from_account_id := v_original.to_account_id;
            v_to_account_id := v_original.from_account_id;

            v_received_amount := v_original.amount;
            v_received_currency := v_original.currency;

            IF v_original.currency = v_original.received_currency THEN
                v_exchange_rate := 1;
            ELSE
                -- Derive the reciprocal from the actual
                -- recorded amounts, not a current market rate.
                v_exchange_rate := pg_catalog.round(
                    v_original.amount / v_original.received_amount,
                    12
                );
            END IF;

        ELSE
            RAISE EXCEPTION
                'Unsupported original transaction type.'
                USING ERRCODE = '22023';
    END CASE;

    PERFORM capital_private.assert_transaction_payload(
        v_reversal_type,
        'COMPLETED',
        v_amount,
        v_currency,
        v_from_account_id,
        v_to_account_id,
        v_received_amount,
        v_received_currency,
        v_exchange_rate,
        p_transaction_date,
        p_effective_date,
        FALSE
    );

   -- Original accounts may now be archived.
    -- Reversals must still be possible to correct historical
    -- com -pleted movements, so these original account IDs
    -- are explicitly permitted to remain archived.

    PERFORM capital_private.lock_transaction_accounts(
        v_user_id,
        ARRAY[
            v_from_account_id,
            v_to_account_id
        ]::UUID[],
        ARRAY[
            v_original.from_account_id,
            v_original.to_account_id
        ]::UUID[]
    );

INSERT INTO capital_private.transactions AS inserted (
    user_id,
    idempotency_key,
    transaction_type,
        status,
        amount,
        currency,
        from_account_id,
        to_account_id,
        received_amount,
        received_currency,
        exchange_rate,
        transaction_date,
        effective_date,
        method,
        counterparty_institution,
        reference_number,
        notes,
        reversal_of_transaction_id,
        reversal_reason
    )
VALUES (
    v_user_id,
    p_idempotency_key,
    v_reversal_type,
        'COMPLETED',
        v_amount,
        v_currency,
        v_from_account_id,
        v_to_account_id,
        v_received_amount,
        v_received_currency,
        v_exchange_rate,
        p_transaction_date,
        p_effective_date,
        v_original.method,
        v_original.counterparty_institution,
        NULL,
        NULL,
        v_original.id,
        v_reversal_reason
    )
    ON CONFLICT ON CONSTRAINT capital_transactions_idempotency_unique
    DO NOTHING
    RETURNING inserted.* INTO v_reversal;

    IF v_reversal.id IS NOT NULL THEN
        INSERT INTO capital_private.transaction_idempotency (
            user_id,
            idempotency_key,
            operation,
            request_fingerprint,
            transaction_id
        )
        VALUES (
            v_user_id,
            p_idempotency_key,
            'REVERSE_TRANSACTION',
            v_fingerprint,
            v_reversal.id
        );

        RETURN NEXT v_reversal;
        RETURN;
    END IF;

    -- Concurrent request may have created the transaction first.
    -- Reconcile through the durable idempotency ledger.
    SELECT
        l.operation,
        l.request_fingerprint,
        l.transaction_id
    INTO
        v_ledger_operation,
        v_ledger_fingerprint,
        v_ledger_transaction_id
    FROM capital_private.transaction_idempotency AS l
    WHERE l.user_id = v_user_id
      AND l.idempotency_key = p_idempotency_key;

    IF FOUND THEN
        IF v_ledger_operation <> 'REVERSE_TRANSACTION'
           OR v_ledger_fingerprint IS DISTINCT FROM v_fingerprint THEN
            RAISE EXCEPTION
                'Idempotency key has already been used for a different request.'
                USING ERRCODE = '23505';
        END IF;

        SELECT t.*
        INTO v_reversal
        FROM capital_private.transactions AS t
        WHERE t.user_id = v_user_id
          AND t.id = v_ledger_transaction_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'This reversal was previously created and subsequently deleted. A new idempotency key is required.'
                USING ERRCODE = '55000';
        END IF;

        RETURN NEXT v_reversal;
        RETURN;
    END IF;

    RAISE EXCEPTION
        'Reversal creation conflict could not be reconciled. Retry with the same idempotency key.'
        USING ERRCODE = '40001';
END;
$function$;

ALTER FUNCTION capital_private.reverse_transaction_impl(
    UUID, UUID, DATE, DATE, TEXT
) OWNER TO postgres;

REVOKE ALL ON FUNCTION capital_private.reverse_transaction_impl(
    UUID, UUID, DATE, DATE, TEXT
) FROM PUBLIC, anon, authenticated, service_role;

-- =========================================================
-- PART 1B COMPLETE
-- Exposed API wrappers and final privileges follow.
-- =========================================================


-- =========================================================
-- PART 1C — EXPOSED API WRAPPERS
-- =========================================================

-- ---------------------------------------------------------
-- SHARED PUBLIC RESPONSE CONTRACT
-- ---------------------------------------------------------
-- Internal fields intentionally omitted:
--   user_id
--   idempotency_key
--
-- All record-returning RPCs expose the same transaction shape.
-- ---------------------------------------------------------


-- =========================================================
-- 1. CREATE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_api.create_transaction(
    p_idempotency_key UUID,
    p_transaction_type TEXT,
    p_status TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_received_amount NUMERIC,
    p_received_currency TEXT,
    p_exchange_rate NUMERIC,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_method TEXT,
    p_counterparty_institution TEXT,
    p_reference_number TEXT,
    p_notes TEXT
)
RETURNS TABLE (
    id UUID,
    transaction_type TEXT,
    status TEXT,
    amount NUMERIC,
    currency TEXT,
    from_account_id UUID,
    to_account_id UUID,
    received_amount NUMERIC,
    received_currency TEXT,
    exchange_rate NUMERIC,
    transaction_date DATE,
    effective_date DATE,
    method TEXT,
    counterparty_institution TEXT,
    reference_number TEXT,
    notes TEXT,
    reversal_of_transaction_id UUID,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT
        t.id,
        t.transaction_type,
        t.status,
        t.amount,
        t.currency,
        t.from_account_id,
        t.to_account_id,
        t.received_amount,
        t.received_currency,
        t.exchange_rate,
        t.transaction_date,
        t.effective_date,
        t.method,
        t.counterparty_institution,
        t.reference_number,
        t.notes,
        t.reversal_of_transaction_id,
        t.reversal_reason,
        t.created_at,
        t.updated_at
    FROM capital_private.create_transaction_impl(
        p_idempotency_key,
        p_transaction_type,
        p_status,
        p_amount,
        p_currency,
        p_from_account_id,
        p_to_account_id,
        p_received_amount,
        p_received_currency,
        p_exchange_rate,
        p_transaction_date,
        p_effective_date,
        p_method,
        p_counterparty_institution,
        p_reference_number,
        p_notes
    ) AS t;
$function$;


-- =========================================================
-- 2. LIST TRANSACTIONS
-- =========================================================

CREATE FUNCTION capital_api.list_transactions(
    p_status TEXT,
    p_transaction_type TEXT,
    p_account_id UUID,
    p_currency TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_limit INTEGER,
    p_before_activity_date DATE,
    p_before_id UUID
)
RETURNS TABLE (
    id UUID,
    transaction_type TEXT,
    status TEXT,
    amount NUMERIC,
    currency TEXT,
    from_account_id UUID,
    to_account_id UUID,
    received_amount NUMERIC,
    received_currency TEXT,
    exchange_rate NUMERIC,
    transaction_date DATE,
    effective_date DATE,
    method TEXT,
    counterparty_institution TEXT,
    reference_number TEXT,
    notes TEXT,
    reversal_of_transaction_id UUID,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT
        t.id,
        t.transaction_type,
        t.status,
        t.amount,
        t.currency,
        t.from_account_id,
        t.to_account_id,
        t.received_amount,
        t.received_currency,
        t.exchange_rate,
        t.transaction_date,
        t.effective_date,
        t.method,
        t.counterparty_institution,
        t.reference_number,
        t.notes,
        t.reversal_of_transaction_id,
        t.reversal_reason,
        t.created_at,
        t.updated_at
    FROM capital_private.list_transactions_impl(
        p_status,
        p_transaction_type,
        p_account_id,
        p_currency,
        p_start_date,
        p_end_date,
        p_limit,
        p_before_activity_date,
        p_before_id
    ) AS t;
$function$;


-- =========================================================
-- 3. UPDATE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_api.update_transaction(
    p_transaction_id UUID,
    p_expected_updated_at TIMESTAMPTZ,
    p_transaction_type TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_received_amount NUMERIC,
    p_received_currency TEXT,
    p_exchange_rate NUMERIC,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_method TEXT,
    p_counterparty_institution TEXT,
    p_reference_number TEXT,
    p_notes TEXT
)
RETURNS TABLE (
    id UUID,
    transaction_type TEXT,
    status TEXT,
    amount NUMERIC,
    currency TEXT,
    from_account_id UUID,
    to_account_id UUID,
    received_amount NUMERIC,
    received_currency TEXT,
    exchange_rate NUMERIC,
    transaction_date DATE,
    effective_date DATE,
    method TEXT,
    counterparty_institution TEXT,
    reference_number TEXT,
    notes TEXT,
    reversal_of_transaction_id UUID,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT
        t.id,
        t.transaction_type,
        t.status,
        t.amount,
        t.currency,
        t.from_account_id,
        t.to_account_id,
        t.received_amount,
        t.received_currency,
        t.exchange_rate,
        t.transaction_date,
        t.effective_date,
        t.method,
        t.counterparty_institution,
        t.reference_number,
        t.notes,
        t.reversal_of_transaction_id,
        t.reversal_reason,
        t.created_at,
        t.updated_at
    FROM capital_private.update_transaction_impl(
        p_transaction_id,
        p_expected_updated_at,
        p_transaction_type,
        p_amount,
        p_currency,
        p_from_account_id,
        p_to_account_id,
        p_received_amount,
        p_received_currency,
        p_exchange_rate,
        p_transaction_date,
        p_effective_date,
        p_method,
        p_counterparty_institution,
        p_reference_number,
        p_notes
    ) AS t;
$function$;


-- =========================================================
-- 4. COMPLETE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_api.complete_transaction(
    p_transaction_id UUID,
    p_effective_date DATE,
    p_expected_updated_at TIMESTAMPTZ
)
RETURNS TABLE (
    id UUID,
    transaction_type TEXT,
    status TEXT,
    amount NUMERIC,
    currency TEXT,
    from_account_id UUID,
    to_account_id UUID,
    received_amount NUMERIC,
    received_currency TEXT,
    exchange_rate NUMERIC,
    transaction_date DATE,
    effective_date DATE,
    method TEXT,
    counterparty_institution TEXT,
    reference_number TEXT,
    notes TEXT,
    reversal_of_transaction_id UUID,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT
        t.id,
        t.transaction_type,
        t.status,
        t.amount,
        t.currency,
        t.from_account_id,
        t.to_account_id,
        t.received_amount,
        t.received_currency,
        t.exchange_rate,
        t.transaction_date,
        t.effective_date,
        t.method,
        t.counterparty_institution,
        t.reference_number,
        t.notes,
        t.reversal_of_transaction_id,
        t.reversal_reason,
        t.created_at,
        t.updated_at
    FROM capital_private.complete_transaction_impl(
        p_transaction_id,
        p_effective_date,
        p_expected_updated_at
    ) AS t;
$function$;


-- =========================================================
-- 5. CANCEL TRANSACTION
-- =========================================================

CREATE FUNCTION capital_api.cancel_transaction(
    p_transaction_id UUID,
    p_expected_updated_at TIMESTAMPTZ
)
RETURNS TABLE (
    id UUID,
    transaction_type TEXT,
    status TEXT,
    amount NUMERIC,
    currency TEXT,
    from_account_id UUID,
    to_account_id UUID,
    received_amount NUMERIC,
    received_currency TEXT,
    exchange_rate NUMERIC,
    transaction_date DATE,
    effective_date DATE,
    method TEXT,
    counterparty_institution TEXT,
    reference_number TEXT,
    notes TEXT,
    reversal_of_transaction_id UUID,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT
        t.id,
        t.transaction_type,
        t.status,
        t.amount,
        t.currency,
        t.from_account_id,
        t.to_account_id,
        t.received_amount,
        t.received_currency,
        t.exchange_rate,
        t.transaction_date,
        t.effective_date,
        t.method,
        t.counterparty_institution,
        t.reference_number,
        t.notes,
        t.reversal_of_transaction_id,
        t.reversal_reason,
        t.created_at,
        t.updated_at
    FROM capital_private.cancel_transaction_impl(
        p_transaction_id,
        p_expected_updated_at
    ) AS t;
$function$;


-- =========================================================
-- 6. DELETE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_api.delete_transaction(
    p_transaction_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT capital_private.delete_transaction_impl(
        p_transaction_id
    );
$function$;


-- =========================================================
-- 7. REVERSE TRANSACTION
-- =========================================================

CREATE FUNCTION capital_api.reverse_transaction(
    p_original_transaction_id UUID,
    p_idempotency_key UUID,
    p_transaction_date DATE,
    p_effective_date DATE,
    p_reversal_reason TEXT
)
RETURNS TABLE (
    id UUID,
    transaction_type TEXT,
    status TEXT,
    amount NUMERIC,
    currency TEXT,
    from_account_id UUID,
    to_account_id UUID,
    received_amount NUMERIC,
    received_currency TEXT,
    exchange_rate NUMERIC,
    transaction_date DATE,
    effective_date DATE,
    method TEXT,
    counterparty_institution TEXT,
    reference_number TEXT,
    notes TEXT,
    reversal_of_transaction_id UUID,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $function$
    SELECT
        t.id,
        t.transaction_type,
        t.status,
        t.amount,
        t.currency,
        t.from_account_id,
        t.to_account_id,
        t.received_amount,
        t.received_currency,
        t.exchange_rate,
        t.transaction_date,
        t.effective_date,
        t.method,
        t.counterparty_institution,
        t.reference_number,
        t.notes,
        t.reversal_of_transaction_id,
        t.reversal_reason,
        t.created_at,
        t.updated_at
    FROM capital_private.reverse_transaction_impl(
        p_original_transaction_id,
        p_idempotency_key,
        p_transaction_date,
        p_effective_date,
        p_reversal_reason
    ) AS t;
$function$;


-- =========================================================
-- FUNCTION OWNERSHIP
-- =========================================================

ALTER FUNCTION capital_api.create_transaction(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_api.list_transactions(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) OWNER TO postgres;

ALTER FUNCTION capital_api.update_transaction(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) OWNER TO postgres;

ALTER FUNCTION capital_api.complete_transaction(
    UUID, DATE, TIMESTAMPTZ
) OWNER TO postgres;

ALTER FUNCTION capital_api.cancel_transaction(
    UUID, TIMESTAMPTZ
) OWNER TO postgres;

ALTER FUNCTION capital_api.delete_transaction(
    UUID
) OWNER TO postgres;

ALTER FUNCTION capital_api.reverse_transaction(
    UUID, UUID, DATE, DATE, TEXT
) OWNER TO postgres;


-- =========================================================
-- PRIVATE IMPLEMENTATION EXECUTION PRIVILEGES
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


GRANT EXECUTE ON FUNCTION capital_private.create_transaction_impl(
    UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT,
    TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.list_transactions_impl(
    TEXT, TEXT, UUID, TEXT, DATE, DATE, INTEGER, DATE, UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.update_transaction_impl(
    UUID, TIMESTAMPTZ, TEXT, NUMERIC, TEXT, UUID, UUID,
    NUMERIC, TEXT, NUMERIC, DATE, DATE, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.complete_transaction_impl(
    UUID, DATE, TIMESTAMPTZ
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.cancel_transaction_impl(
    UUID, TIMESTAMPTZ
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.delete_transaction_impl(
    UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION capital_private.reverse_transaction_impl(
    UUID, UUID, DATE, DATE, TEXT
) TO authenticated;


-- =========================================================
-- PUBLIC API EXECUTION PRIVILEGES
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
