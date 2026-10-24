## Broker Sync — Manual Entry Protection

**Date:** October 24, 2026  
**Status:** Database protection deployed; direct transaction test completed.

### Issue identified

The original `public.replace_broker_executions_atomically` function deleted executions based on user ID, broker account, and execution date without explicitly excluding Manual Entry executions.

### Fix implemented

Created migration:

`supabase/migrations/20261024231200_protect_manual_executions_from_broker_sync.sql`

Updated the database deletion condition to:

```sql
AND (
    contract_key IS NULL
    OR contract_key NOT LIKE 'MANUAL-%'
)
```

Executions with a `MANUAL-` contract key are now excluded from the broker-sync deletion query. Existing replacement scope and atomic delete-and-insert behavior remain unchanged.

### Verification

- `npx supabase db push --linked` completed successfully.
- `pg_get_functiondef` confirmed that the deployed database function contains the Manual Entry exclusion.
- `npx supabase migration list --linked` confirmed that migration `20261024231200` is recorded locally and remotely.
- A database transaction test called the actual replacement function using a Manual Entry execution's account and date. The test completed without an error and rolled back its changes.
- The subsequent on-demand sync processed three IBKR accounts, each returning zero executions. The application skipped replacement for all three accounts.

### Remaining limitation

A live broker replacement using populated execution data has not yet been verified. The database-level test validates the Manual Entry deletion guard, but it is not a substitute for testing a populated broker replacement.

### Architecture preserved

No changes were made to `fetchFlex.ts`, the Manual Entry creation/edit/delete helpers, or `pairTrades.ts`. Manual Entry and broker executions continue to share the canonical executions ledger.