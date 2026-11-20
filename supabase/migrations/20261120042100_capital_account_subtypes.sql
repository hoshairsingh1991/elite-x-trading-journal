BEGIN;

-- =========================================================
-- ELITE X CAPITAL MANAGEMENT V1
-- MIGRATION 006: ACCOUNT SUBTYPES
-- =========================================================

ALTER TABLE capital_private.accounts
ADD COLUMN account_subtype TEXT;

ALTER TABLE capital_private.accounts
ADD CONSTRAINT capital_accounts_subtype_valid
CHECK (
    account_subtype IS NULL
    OR (
        pg_catalog.char_length(account_subtype) BETWEEN 1 AND 80
        AND account_subtype = pg_catalog.btrim(account_subtype)
    )
);

COMMENT ON COLUMN capital_private.accounts.account_subtype IS
    'Specific account classification such as Margin, TFSA, RRSP, IRA or Cash.';

COMMIT;
