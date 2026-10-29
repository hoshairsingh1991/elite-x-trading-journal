# ELITE X — INSTRUMENT NAME RESOLVER

**Project:** Elite X Trading Journal\
**Module:** Instrument Identity / Company Name Resolution\
**Status:** Implemented and tested locally; final Git review and commit pending\
**Date:** October 28, 2026\
**Initial provider:** OpenFIGI\
**Initial scope:** Supported stocks, ADRs, ETFs, and the underlying stock or ETF for supported option trades\
**Excluded from initial scope:** Futures, futures options, forex, crypto, CFDs, and instruments without recognized market context

---

## 1. OBJECTIVE

Display a verified company or instrument name above the ticker in the Daily Review trade drawer.

Examples from the OpenFIGI research include:

- `T` + Canadian market context → `TELUS CORP`
- `T` + US market context → `AT&T INC`
- `GOOGL` + US market context → `ALPHABET INC-CL A`
- `MSTR` + US market context → `STRATEGY INC`
- `BRK.B` + US market context → `BERKSHIRE HATHAWAY INC-CL B`
- `GLD` + US market context → `SPDR GOLD SHARES`
- `QQQ` + US market context → `INVESCO QQQ TRUST SERIES 1`

The resolver uses both ticker and market context. It must not guess the identity from the ticker alone.

**Core rule:** If the instrument identity cannot pass the resolver's acceptance checks, keep displaying the existing ticker and exchange without a company name. Accuracy is more important than returning a name for every ticker.

---

## 2. FINAL IMPLEMENTATION STATUS

The initial feature has been implemented and tested in the local Elite X application.

Completed:

- Added a server-only OpenFIGI resolver.
- Added an authenticated Next.js API route.
- Connected the Daily Review drawer to the API route.
- Confirmed that the company name displays for the tested Canadian instruments, including TELUS and Rogers Communications.
- Adjusted the drawer's instrument row to bring the icon, company name, and ticker closer together.
- Kept longer names on one line; an ellipsis appears when the name exceeds the available width, and the element's `title` attribute exposes the full name on hover.
- Passed TypeScript validation and the Next.js production build.

Still pending:

- Review the final Git diff and current status before staging.
- Commit only the three implementation paths listed in Section 10.
- Push only after confirming the intended changes.

This document supersedes the earlier blueprint. The intended project-note destination is `docs/OpenFIGI.md`. Keep the documentation replacement deliberate and separate from the implementation-code commit so it is not staged accidentally.

---

## 3. WHY THE RESOLVER IS SEPARATE FROM LOGO.DEV

Elite X already has an integration for ticker logos:

`lib/assets/assetIconResolver.ts`

Logo.dev remains responsible for instrument icons. Its Brand API did not consistently return the exact listed issuer or fund name required by the trading UI.

### Logo.dev research results

| Requested ticker | Returned name | Issue observed |
|---|---|---|
| `T.TO` | Telus | Suitable in this test |
| `GLD` | State Street Global Advisors | Asset manager rather than the fund name |
| `QQQ` | Invesco | Brand/manager rather than the fund name |
| `BRK.B` | FTSE Russell | Incorrect company for the requested ticker |
| `GOOGL` | Google | Brand name rather than the listed issuer name |
| `MSTR` | MicroStrategy | Outdated compared with the tested OpenFIGI result, Strategy Inc. |

**Decision:** Keep Logo.dev for icons and use OpenFIGI Mapping API for the initial instrument-name resolver. The existing logo resolver has not been changed as part of this feature.

---

## 4. RESEARCH AND TEST FINDINGS

Official references consulted during the investigation:

- OpenFIGI API documentation: https://www.openfigi.com/api/documentation
- OpenFIGI exchange codes: https://www.openfigi.com/about/exchange-codes

### 4.1 Canadian stock mapping tests

Sixteen Canadian stocks were tested with exchange codes `CT` and `TR`:

`T`, `SHOP`, `RY`, `TD`, `BMO`, `BNS`, `ENB`, `SU`, `CNQ`, `TRP`, `CNR`, `CP`, `BAM`, `BCE`, `AEM`, and `MFC`.

All sixteen returned the expected company names in those tests. Venue-level FIGIs differed, while composite and share-class FIGIs matched within the paired results.

Important distinction:

- `CT` represents the Toronto Stock Exchange.
- `TR` represents TriAct Toronto.
- These are distinct venue codes and must not be treated as interchangeable.
- The implemented resolver uses the country-composite market code `CN` for the supported Canadian context rather than attempting to prove the primary venue.

### 4.2 US stock and ADR mapping tests

The tested sample included:

`T`, `NOK`, `BABA`, `KO`, `JPM`, `BRK.B` (lookup normalized to `BRK/B`), `AAPL`, `MSFT`, `GOOGL`, `MSTR`, `ARM`, `MELI`, and `SHOP`.

All thirteen returned the expected name using the tested US market-composite code `US`.

### 4.3 Exchange-filter false-positive tests

Deliberately incorrect exchange combinations were tested. Some returned no match, but several returned plausible records even when the queried exchange was not the expected primary listing. Examples included Alphabet, Strategy, Arm Holdings, MercadoLibre, Apple, Microsoft, and QQQ when queried against NYSE.

**Conclusion:** An exchange-filtered OpenFIGI response does not independently establish a security's primary listing venue. The `CN`/`US` lookup identifies the market context for name resolution, not the exact primary exchange. Elite X continues displaying exchange data from its existing trade metadata.

### 4.4 Country-composite mapping tests

The tested country-composite codes were:

- `CN` — Canada composite
- `US` — United States composite

Selected observed matches:

| Context | Ticker | Expected/observed name |
|---|---|---|
| Canada | `T` | `TELUS CORP` |
| United States | `T` | `AT&T INC` |
| Canada | `SHOP` | `SHOPIFY INC - CLASS A` |
| Canada | `RY` | `ROYAL BANK OF CANADA` |
| United States | `GOOGL` | `ALPHABET INC-CL A` |
| United States | `MSTR` | `STRATEGY INC` |
| United States | `ARM` | `ARM HOLDINGS PLC-ADR` |
| United States | `MELI` | `MERCADOLIBRE INC` |
| United States | `BRK/B` | `BERKSHIRE HATHAWAY INC-CL B` |

In the tested cases, the returned country-composite record's `figi` equalled its `compositeFIGI`. Cross-listed securities could have different country-composite FIGIs while sharing a share-class FIGI.

### 4.5 Mixed stock, ADR, and ETF mapping test

A mixed test covered 33 mapping requests: 16 Canadian stock cases, 13 US stock/ADR cases, and four ETF cases. All 33 selected requests returned a plausible expected name and type. This validates the sample; it is not a guarantee of universal coverage.

| Ticker | Expected returned name | Returned type |
|---|---|---|
| `GLD` | `SPDR GOLD SHARES` | `ETP` |
| `QQQ` | `INVESCO QQQ TRUST SERIES 1` | `ETP` |
| `XIU` | `ISHARES S&P/TSX 60 INDEX ETF` | `ETP` |
| `VFV` | `VANGUARD S&P 500 INDEX ETF` | `ETP` |

### 4.6 Futures investigation

Generic search testing for gold futures, Micro E-mini Nasdaq-100 futures, E-mini Nasdaq-100 futures, WTI crude oil futures, and the Canadian S&P/TSX 60 future did not establish reliable exact-contract identification. The generic gold search included old historical contracts; subsequent searches encountered apparent rate limiting; the `SXF` search did not establish the intended contract.

**Decision:** Futures and futures options remain outside the initial release until they can be identified with sufficiently specific contract identifiers and details such as exchange and expiry.

---

## 5. CURRENT ARCHITECTURE

The request flow is:

1. `DailyReviewTradeDrawer.tsx` reads the existing trade's ticker, asset type, and first available non-empty execution exchange.
2. The drawer retrieves the current Supabase session and sends the access token to the new API route.
3. `app/api/instrument-name/route.ts` authenticates the token, validates the request, and calls the resolver.
4. `lib/instruments/openFigiResolver.ts` maps the known market context, calls OpenFIGI Mapping API, validates the returned record, and applies in-memory caching.
5. The API returns the normalized result. The drawer displays the name only when the result is `resolved` and the returned ticker matches the requested ticker.
6. If the request fails or the result is not accepted, the existing ticker and trade details remain visible without a company name.

### New implementation files

- `lib/instruments/openFigiResolver.ts`
- `app/api/instrument-name/route.ts`

### Existing UI file updated

- `components/dashboard/daily-review/DailyReviewTradeDrawer.tsx`

### API contract

The endpoint accepts an authenticated `POST` request with a JSON body containing:

- `ticker`
- `exchange`
- `assetType`

The response uses `success` and a `result` object. The resolver's result has `status: "resolved" | "unresolved"`, plus the ticker, name, market, security type, FIGI, and an optional unresolved reason.

The route returns HTTP 401 for an unauthenticated request and HTTP 400 for invalid request data. Provider or internal failures do not expose raw provider errors to the browser.

---

## 6. VALIDATION AND LOOKUP RULES

### Market mapping

The implemented resolver recognizes a limited list of Canadian and US exchange labels:

- Canadian examples include `TSE`, `TSX`, `XTSE`, `TORONTO STOCK EXCHANGE`, `TSXV`, `XTSX`, `TSX VENTURE`, `TSX VENTURE EXCHANGE`, and `TORONTO VENTURE EXCHANGE`. These resolve to OpenFIGI market context `CN`.
- US examples include `NYSE`, `NASDAQ`, recognised Nasdaq market labels, `NYSE ARCA`, `ARCA`, `AMEX`, `NYSE AMERICAN`, and selected US market aliases. These resolve to market context `US`.

This is a deliberately limited alias list, not universal venue coverage. Missing or unsupported exchange context results in `unresolved`; the resolver does not infer a market from the ticker alone.

### Ticker normalization

- The original ticker is preserved for display.
- Input is trimmed and uppercased for lookup.
- Only the controlled share-class normalization `BRK.B` → `BRK/B` is applied by the current implementation.
- Meaningful suffixes, digits, and other punctuation are not broadly removed.

### Acceptance checks in the current code

The resolver accepts a name only when:

1. The ticker is non-empty and passes its format check.
2. The asset type is one of the supported types: stock/stocks, ETF/ETFs, or options.
3. The exchange maps to a supported `CN` or `US` context.
4. The OpenFIGI Mapping API response has the expected shape and one mapping job.
5. At least one returned record matches the normalized ticker and requested market code.
6. Exactly one matching record passes the supported market-sector and security-type checks.
7. The accepted record has a non-empty name, FIGI, and security type.

If no result passes these checks, the resolver returns `unresolved`. It does not guess a name or arbitrarily choose among multiple acceptable records.

The current resolver checks the record-level FIGI, returned ticker, market code, market sector, and security type. The external investigation considered composite and share-class FIGIs, but the current implementation does not persist `compositeFIGI` or `shareClassFIGI`.

### Supported security types

The code accepts selected equity/fund sectors and types, including common stock, depositary receipts/shares, American depositary receipts, preferred stock, ETP, ETF, mutual fund, REIT, and exchange-traded product values. The returned sector and type must pass the configured allowlists; unsupported or incompatible results are rejected.

For option trades, the displayed name is the supported underlying instrument's name. It is not presented as the exact name of the option contract.

---

## 7. CACHE, PROVIDER AND FAILURE BEHAVIOR

The resolver is guarded with `import "server-only"` and is intended for server-side use only.

Current in-memory cache behavior:

| Outcome | Cache lifetime |
|---|---:|
| Resolved name | 24 hours |
| Ordinary unresolved result | 5 minutes |
| Provider/response error | 30 seconds |
| Provider rate limit | 60 seconds |

Additional behavior:

- Maximum of 500 cache entries; the oldest entry is evicted when the cache is full.
- Duplicate concurrent lookups for the same normalized ticker and market share a pending promise.
- OpenFIGI requests have an 8-second timeout.
- HTTP 429 is treated as a provider rate limit.
- The resolver supports optional `OPENFIGI_API_KEY` from a server-only environment variable. The implementation does not require a key for the tested mapping requests. Never use a `NEXT_PUBLIC_` prefix for a secret key.
- In-memory cache is per running server process; it is not persistent across process restarts or serverless instances.
- No persistent database cache or new Supabase table has been added.

The drawer does not block on a name lookup. When there is no verified name, the ticker and rest of the drawer remain usable.

---

## 8. DAILY REVIEW DISPLAY

The only existing UI component connected to this feature is:

`components/dashboard/daily-review/DailyReviewTradeDrawer.tsx`

The current Instrument section displays:

- Existing asset icon (still provided through the Logo.dev integration).
- Resolved company/instrument name above the ticker, when available.
- The existing ticker.
- The existing asset-type label.
- Existing trade status and option-side badge.

The name remains on one line. If it exceeds the available width, it is truncated with an ellipsis. The full name is available through the element's `title` tooltip on hover.

The layout has been tightened by reducing the gap between the icon and text, giving the left group and text block the available flex width, and using a 90px width for the option-side badge. The current spacing is acceptable for this iteration; no further layout redesign is part of the current scope.

Runtime browser testing has confirmed successful name display for TELUS and Rogers Communications. The previous OpenFIGI API research also tested AAPL, QQQ, and other symbols, but a separate browser/UI test for AAPL and QQQ has not been confirmed in the current checkpoint.

---

## 9. EXISTING SYSTEMS PRESERVED

The following systems were not modified for this feature:

- `lib/assets/assetIconResolver.ts` and Logo.dev icon integration.
- IBKR CSV parser.
- `NormalizedExecution` and `Trade` types in `types/trade.ts`.
- Supabase execution schema and execution-storage functions.
- `pairTrades()` and FIFO reconstruction.
- Trade lifecycle identifiers.
- Entry/exit values, quantities, dates, currency, fees, and commissions.
- Realized/unrealized P&L calculations.
- Existing trade creation, editing, and deletion routes.

The resolver does not read or write trade records and does not save an instrument name to the existing execution table. The name is fetched for display through the dedicated API route and cached in server memory.

No database migration or execution-schema change was required.

---

## 10. FILES AND CURRENT GIT STATUS

Implementation paths for the feature:

1. Modified: `components/dashboard/daily-review/DailyReviewTradeDrawer.tsx`
2. New: `app/api/instrument-name/route.ts`
3. New: `lib/instruments/openFigiResolver.ts`

The most recent reported `git status --short` also showed:

- `?? docs/OpenFIGI.md`

That documentation file was untracked at the time of the check. Replace its previous blueprint content with this final master-note content as a separate, deliberate documentation update. Do not include it in the implementation-code commit unless documentation is intentionally being committed as a separate change. Review `git status --short` again before staging to account for any later changes.

Do not stage or commit unrelated documentation or other user work as part of the code change.

---

## 11. VALIDATION COMPLETED

### Build and compiler

- `npx tsc --noEmit` completed successfully with exit code `0` after creation of the resolver and API route and again during the implementation validation sequence.
- `git diff --check` completed without reported whitespace errors during validation.
- `npm run build` passed after the final drawer layout adjustments.
- The production build listed `/api/instrument-name` as a dynamic route, confirming that Next.js included the endpoint.

### Browser verification

- TELUS name lookup: confirmed working in the Daily Review drawer.
- Rogers Communications name lookup: confirmed working in the Daily Review drawer.
- Company name appears above the ticker.
- When a name is longer than the available single-line width, an ellipsis appears and the title tooltip provides the complete name.

### Known limits

- The live Daily Review UI test for AAPL and QQQ remains unconfirmed in this checkpoint.
- Futures remain unsupported.
- An unrecognized exchange deliberately prevents lookup.
- The OpenFIGI market composite does not prove the exact primary exchange.
- The cache is process-local, not persistent.

---

## 12. FINAL ACCEPTANCE CHECKLIST

- [x] Dedicated server-only OpenFIGI resolver created.
- [x] Authenticated `/api/instrument-name` endpoint created.
- [x] Daily Review drawer connected to the endpoint.
- [x] Verified company/instrument name displays for tested TELUS and Rogers trades.
- [x] Unsupported or unresolved results do not invent a name.
- [x] Existing ticker and exchange/trade metadata remain the source for existing display fields.
- [x] Existing Logo.dev icon integration left unchanged.
- [x] IBKR parser, shared trade types, execution storage, FIFO, and P&L logic left unchanged.
- [x] TypeScript validation passed.
- [x] Production build passed after final UI spacing adjustments.
- [ ] Final Git diff reviewed for all three implementation paths.
- [ ] Implementation paths staged and committed without including unrelated files.
- [ ] Commit pushed to `origin main` after review.

---

## 13. RESUME POINT / NEXT ACTION

The resolver is implemented, appears correctly in the Daily Review drawer for the tested Canadian instruments, and passes the reported TypeScript and production build checks. No implementation commit has been reported yet.

Before committing, run:

```bash
cd "/Volumes/Storage Drive/EliteX Trading Journal/elite-x-trading-journal"

git status --short
git diff --check
git diff --stat
git diff -- components/dashboard/daily-review/DailyReviewTradeDrawer.tsx
```

Review the new files as well:

```bash
sed -n '1,320p' lib/instruments/openFigiResolver.ts
sed -n '1,240p' app/api/instrument-name/route.ts
```

Then stage only the implementation paths:

```bash
git add components/dashboard/daily-review/DailyReviewTradeDrawer.tsx app/api/instrument-name/route.ts lib/instruments/openFigiResolver.ts

git diff --cached --check
git diff --cached --stat
git status --short
```

Inspect the staged diff before committing. Only after the staged changes are confirmed, commit with a message such as:

```bash
git commit -m "Add OpenFIGI instrument name resolver"
```

Push to `origin main` only after verifying the commit and intended working-tree state.

---

## 14. ACCURACY COMMITMENT

No reference-data provider guarantees a correct name for every financial instrument. Elite X's policy is to display a name only when the resolver's configured validation checks pass. Otherwise, the existing ticker remains visible and no guessed name is shown.

The resolver is intentionally separate from canonical trading and accounting logic so instrument-name resolution can evolve without changing trade reconstruction or financial results.
