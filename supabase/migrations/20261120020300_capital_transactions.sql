
BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 003: CANONICAL CAPITAL TRANSACTIONS
-- =========================================================

CREATE TABLE capital_private.transactions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE RESTRICT,

    -- Stable request identifier for duplicate-submission protection.
    -- The backend must reuse the same key when retrying a request.
    idempotency_key UUID NOT NULL,

    transaction_type TEXT NOT NULL,

    status TEXT NOT NULL,

    -- Sending amount and currency.
    -- Fixed-decimal storage: never use floating-point.
   amount NUMERIC NOT NULL,

    currency TEXT NOT NULL,

    from_account_id UUID,

    to_account_id UUID,

    -- Receiving-side values for internal transfers.
    received_amount NUMERIC,

    received_currency TEXT,

    -- Receiving currency units per one sending currency unit.
    exchange_rate NUMERIC,

    -- Transaction initiation / recorded date.
    transaction_date DATE NOT NULL,

    -- Actual financial effective date.
    -- Required when status is COMPLETED.
    effective_date DATE,

    method TEXT,

    counterparty_institution TEXT,

    reference_number TEXT,

    notes TEXT,

    -- Reversal records point to the original transaction.
    reversal_of_transaction_id UUID,

    reversal_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- -----------------------------------------------------
    -- OWNERSHIP AND IDEMPOTENCY
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_user_id_id_unique
        UNIQUE (user_id, id),

    CONSTRAINT capital_transactions_idempotency_unique
        UNIQUE (user_id, idempotency_key),

    -- -----------------------------------------------------
    -- TRANSACTION TYPE AND STATUS
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_type_valid
        CHECK (
            transaction_type IN (
                'DEPOSIT',
                'WITHDRAWAL',
                'TRANSFER'
            )
        ),

    CONSTRAINT capital_transactions_status_valid
        CHECK (
            status IN (
                'PENDING',
                'COMPLETED',
                'CANCELLED'
            )
        ),

    -- -----------------------------------------------------
    -- FINANCIAL VALIDATION
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_amount_positive
        CHECK (amount > 0),

    CONSTRAINT capital_transactions_currency_valid
        CHECK (
            currency IN (
                'CAD',
                'USD',
                'EUR',
                'GBP',
                'JPY',
                'INR'
            )
        ),

    CONSTRAINT capital_transactions_received_amount_valid
        CHECK (
            received_amount IS NULL
            OR received_amount > 0
        ),

    CONSTRAINT capital_transactions_received_currency_valid
        CHECK (
            received_currency IS NULL
            OR received_currency IN (
                'CAD',
                'USD',
                'EUR',
                'GBP',
                'JPY',
                'INR'
            )
        ),

    CONSTRAINT capital_transactions_exchange_rate_valid
        CHECK (
            exchange_rate IS NULL
            OR exchange_rate > 0
        ),

    -- -----------------------------------------------------
    -- FINANCIAL PRECISION VALIDATION
    -- -----------------------------------------------------

    -- Currency-specific decimal precision for sent amounts.
    CONSTRAINT capital_transactions_amount_precision_valid
        CHECK (
            amount = trunc(
                amount,
                CASE
                    WHEN currency = 'JPY' THEN 0
                    ELSE 2
                END
            )
            AND amount < 'Infinity'::numeric
        ),

    -- Currency-specific decimal precision for received amounts.
    CONSTRAINT capital_transactions_received_precision_valid
        CHECK (
            received_amount IS NULL
            OR (
                received_amount = trunc(
                    received_amount,
                    CASE
                        WHEN received_currency = 'JPY' THEN 0
                        ELSE 2
                    END
                )
                AND received_amount < 'Infinity'::numeric
            )
        ),

    -- Exchange rates support up to 12 decimal places.
    CONSTRAINT capital_transactions_exchange_precision_valid
        CHECK (
            exchange_rate IS NULL
            OR (
                exchange_rate = trunc(exchange_rate, 12)
                AND exchange_rate < 'Infinity'::numeric
            )
        ),

    -- -----------------------------------------------------
    -- TRANSACTION STRUCTURE
    -- -----------------------------------------------------

    -- Deposits: external funds entering a tracked account.
    -- Withdrawals: funds leaving a tracked account.
    -- Transfers: one canonical record with two account references.
    CONSTRAINT capital_transactions_structure_valid
        CHECK (
            (
                transaction_type = 'DEPOSIT'
                AND from_account_id IS NULL
                AND to_account_id IS NOT NULL
                AND received_amount IS NULL
                AND received_currency IS NULL
                AND exchange_rate IS NULL
            )
            OR
            (
                transaction_type = 'WITHDRAWAL'
                AND from_account_id IS NOT NULL
                AND to_account_id IS NULL
                AND received_amount IS NULL
                AND received_currency IS NULL
                AND exchange_rate IS NULL
            )
            OR
            (
                transaction_type = 'TRANSFER'
                AND from_account_id IS NOT NULL
                AND to_account_id IS NOT NULL
                AND from_account_id <> to_account_id
                AND received_amount IS NOT NULL
                AND received_currency IS NOT NULL
                AND exchange_rate IS NOT NULL
                AND (
                    (
                        currency = received_currency
                        AND received_amount = amount
                        AND exchange_rate = 1
                    )
                    OR
                    currency <> received_currency
                )
            )
        ),

    -- -----------------------------------------------------
    -- DATE AND STATUS VALIDATION
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_effective_date_valid
        CHECK (
            (
                status = 'COMPLETED'
                AND effective_date IS NOT NULL
            )
            OR
            (
                status IN ('PENDING', 'CANCELLED')
                AND effective_date IS NULL
            )
        ),

    -- -----------------------------------------------------
    -- OPTIONAL TEXT VALIDATION
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_method_valid
        CHECK (
            method IS NULL
            OR (
                length(btrim(method)) > 0
                AND method = btrim(method)
                AND length(method) <= 100
            )
        ),

    CONSTRAINT capital_transactions_counterparty_valid
        CHECK (
            counterparty_institution IS NULL
            OR length(counterparty_institution) <= 255
        ),

    CONSTRAINT capital_transactions_reference_valid
        CHECK (
            reference_number IS NULL
            OR length(reference_number) <= 255
        ),

    CONSTRAINT capital_transactions_notes_valid
        CHECK (
            notes IS NULL
            OR length(notes) <= 4000
        ),

    -- -----------------------------------------------------
    -- REVERSAL VALIDATION
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_reversal_valid
        CHECK (
            (
                reversal_of_transaction_id IS NULL
                AND reversal_reason IS NULL
            )
            OR
            (
                reversal_of_transaction_id IS NOT NULL
                AND reversal_of_transaction_id <> id
                AND reversal_reason IS NOT NULL
                AND length(btrim(reversal_reason)) > 0
                AND length(reversal_reason) <= 500
            )
        ),

    -- -----------------------------------------------------
    -- ACCOUNT OWNERSHIP FOREIGN KEYS
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_from_account_fkey
        FOREIGN KEY (user_id, from_account_id)
        REFERENCES capital_private.accounts(user_id, id)
        ON DELETE NO ACTION
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT capital_transactions_to_account_fkey
        FOREIGN KEY (user_id, to_account_id)
        REFERENCES capital_private.accounts(user_id, id)
        ON DELETE NO ACTION
        DEFERRABLE INITIALLY DEFERRED,

    -- -----------------------------------------------------
    -- REVERSAL OWNERSHIP FOREIGN KEY
    -- -----------------------------------------------------

    CONSTRAINT capital_transactions_reversal_fkey
        FOREIGN KEY (user_id, reversal_of_transaction_id)
        REFERENCES capital_private.transactions(user_id, id)
        ON DELETE CASCADE
        DEFERRABLE INITIALLY DEFERRED
);

-- =========================================================
-- INDEXES
-- =========================================================

-- Completed transactions ordered by effective date.
CREATE INDEX capital_transactions_user_effective_date_idx
    ON capital_private.transactions(
        user_id,
        effective_date DESC,
        id DESC
    )
    WHERE status = 'COMPLETED';

-- Pending activity.
CREATE INDEX capital_transactions_user_pending_date_idx
    ON capital_private.transactions(
        user_id,
        transaction_date DESC,
        id DESC
    )
    WHERE status = 'PENDING';

-- Source-account activity.
CREATE INDEX capital_transactions_from_account_idx
    ON capital_private.transactions(
        user_id,
        from_account_id,
        effective_date DESC
    )
    WHERE from_account_id IS NOT NULL;

-- Destination-account activity.
CREATE INDEX capital_transactions_to_account_idx
    ON capital_private.transactions(
        user_id,
        to_account_id,
        effective_date DESC
    )
    WHERE to_account_id IS NOT NULL;

-- An original transaction can have at most one reversal.
CREATE UNIQUE INDEX capital_transactions_single_reversal_idx
    ON capital_private.transactions(
        user_id,
        reversal_of_transaction_id
    )
    WHERE reversal_of_transaction_id IS NOT NULL;


-- =========================================================
-- AUTOMATIC UPDATED_AT
-- Reuses the function created in Migration 002.
-- =========================================================

CREATE TRIGGER capital_transactions_set_updated_at
BEFORE UPDATE
ON capital_private.transactions
FOR EACH ROW
EXECUTE FUNCTION capital_private.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE capital_private.transactions
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE capital_private.transactions
    FORCE ROW LEVEL SECURITY;

-- No direct table-access policies are created.
-- Approved access will be configured through the secure
-- Capital Management API/RPC implementation.

-- =========================================================
-- PRIVILEGES
-- =========================================================

REVOKE ALL ON TABLE capital_private.transactions
    FROM PUBLIC, anon, authenticated, service_role;

-- =========================================================
-- DOCUMENTATION
-- =========================================================

COMMENT ON TABLE capital_private.transactions IS
    'Canonical Capital Management financial transactions. Deposits, withdrawals and internal transfers. Separate from trading executions and trading P&L.';

COMMENT ON COLUMN capital_private.transactions.effective_date IS
    'Actual date the completed financial movement takes effect. Required for completed transactions and used for historical reporting.';

COMMENT ON COLUMN capital_private.transactions.idempotency_key IS
    'Unique per-user request key used by backend operations to prevent duplicate transaction creation during retries.';

COMMENT ON COLUMN capital_private.transactions.reversal_of_transaction_id IS
    'References the original transaction being reversed. Reversals are new records; original completed records remain unchanged.';

COMMIT;
