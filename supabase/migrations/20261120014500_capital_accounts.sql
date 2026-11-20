
BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 002: CANONICAL CAPITAL ACCOUNTS
-- =========================================================

CREATE TABLE capital_private.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    account_name TEXT NOT NULL,

    broker_name TEXT,

    account_type TEXT NOT NULL DEFAULT 'brokerage',

    currency TEXT NOT NULL DEFAULT 'UNKNOWN',

    account_source TEXT NOT NULL DEFAULT 'manual',

    external_account_id TEXT,

    status TEXT NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- -----------------------------------------------------
    -- VALIDATION
    -- -----------------------------------------------------

    CONSTRAINT capital_accounts_name_valid
        CHECK (
            length(account_name) > 0
            AND account_name = btrim(account_name)
        ),

    CONSTRAINT capital_accounts_broker_name_valid
        CHECK (
            broker_name IS NULL
            OR (
                length(btrim(broker_name)) > 0
                AND broker_name = btrim(broker_name)
            )
        ),

    CONSTRAINT capital_accounts_external_id_valid
        CHECK (
            external_account_id IS NULL
            OR (
                length(btrim(external_account_id)) > 0
                AND external_account_id = btrim(external_account_id)
            )
        ),

    CONSTRAINT capital_accounts_currency_valid
        CHECK (
            currency IN (
                'USD',
                'CAD',
                'EUR',
                'GBP',
                'JPY',
                'INR',
                'UNKNOWN'
            )
        ),

    CONSTRAINT capital_accounts_type_valid
        CHECK (
            account_type IN (
                'brokerage',
                'bank',
                'cash',
                'other'
            )
        ),

    CONSTRAINT capital_accounts_source_valid
        CHECK (
            account_source IN (
                'manual',
                'broker_import'
            )
        ),

    CONSTRAINT capital_accounts_status_valid
        CHECK (
            status IN (
                'active',
                'archived'
            )
        ),

    -- An external account ID requires a broker identity.
    CONSTRAINT capital_accounts_external_identity_valid
        CHECK (
            external_account_id IS NULL
            OR broker_name IS NOT NULL
        ),

    -- Imported accounts must have a complete broker identity.
    -- Manual accounts may be linked to a broker later.
    CONSTRAINT capital_accounts_import_identity_valid
        CHECK (
            account_source <> 'broker_import'
            OR (
                broker_name IS NOT NULL
                AND external_account_id IS NOT NULL
            )
        ),

    -- Enforce account ownership in future composite foreign keys.
    CONSTRAINT capital_accounts_user_id_id_unique
        UNIQUE (user_id, id)
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX capital_accounts_user_status_idx
    ON capital_private.accounts(user_id, status);

CREATE INDEX capital_accounts_user_currency_idx
    ON capital_private.accounts(user_id, currency);

-- Prevent duplicate broker identities for the same user.
-- Broker names are compared case-insensitively.
-- Applies to both manual and imported accounts once linked.
CREATE UNIQUE INDEX capital_accounts_external_unique_idx
    ON capital_private.accounts(
        user_id,
        lower(btrim(broker_name)),
        btrim(external_account_id)
    )
    WHERE external_account_id IS NOT NULL;

-- =========================================================
-- AUTOMATIC UPDATED_AT MANAGEMENT
-- =========================================================

CREATE FUNCTION capital_private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := pg_catalog.now();
    RETURN NEW;
END;
$$;

-- Trigger functions only need EXECUTE permission when
-- the trigger is created. Do not expose direct execution.
REVOKE ALL ON FUNCTION capital_private.set_updated_at()
    FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER capital_accounts_set_updated_at
BEFORE UPDATE ON capital_private.accounts
FOR EACH ROW
EXECUTE FUNCTION capital_private.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE capital_private.accounts
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE capital_private.accounts
    FORCE ROW LEVEL SECURITY;

-- No policies or direct table access are granted in this
-- migration. Access remains denied until explicitly
-- configured through the subsequent security/API work.

-- =========================================================
-- PRIVILEGES
-- =========================================================

REVOKE ALL ON TABLE capital_private.accounts
    FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
