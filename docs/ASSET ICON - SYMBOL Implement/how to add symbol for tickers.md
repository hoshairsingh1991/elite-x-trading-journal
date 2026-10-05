===============================================================
ELITE X — MASTER NOTES
ASSET ICON / SYMBOL IDENTITY SYSTEM
===============================================================

STATUS:
---------
IMPLEMENTED
STABLE
DO NOT REBUILD UNLESS THERE IS A REAL ARCHITECTURAL REASON

PURPOSE:
---------
Elite X now uses one reusable AssetIcon system to visually
identify financial instruments throughout the application.

Instead of displaying only:

    QQQ
    AAPL
    NVDA
    BTC

the application can display the real instrument logo/icon
together with the ticker.

The important architectural goal is NOT simply "show logos".

The real goal is:

    ONE REUSABLE ASSET IDENTITY SYSTEM
    ----------------------------------

    UI
     ↓
    AssetIcon
     ↓
    assetIconResolver
     ↓
    external logo provider
     ↓
    logo image
     ↓
    deterministic fallback if unavailable

This means individual cards, tables, drawers, and future
components do NOT contain provider-specific logo logic.

===============================================================
1. CORE ARCHITECTURE
===============================================================

The current architecture is:

    components/common/AssetIcon.tsx
                    ↓
    lib/assets/assetIconResolver.ts
                    ↓
              Logo Provider
                    ↓
                Image URL

The UI component is responsible for:

    - rendering the icon
    - sizing
    - fallback display
    - image failure handling

The resolver is responsible for:

    - deciding whether an asset is supported
    - constructing the provider URL
    - selecting the appropriate provider endpoint
    - generating deterministic fallback text

The provider itself must remain replaceable.

DO NOT place provider-specific URLs directly inside:

    OpenPositionsCard.tsx
    RecentTradesCard.tsx
    TradesTable.tsx
    DailyReviewTradeTable
    DailyReviewTradeDrawer.tsx
    or any future component.

All provider logic belongs in:

    lib/assets/assetIconResolver.ts


===============================================================
2. FILES CREATED
===============================================================

Directory:

    components/common/
    lib/assets/

Files:

    components/common/AssetIcon.tsx

    lib/assets/assetIconResolver.ts


===============================================================
3. ASSETICON COMPONENT
===============================================================

Current reusable API:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />

Supported sizes:

    sm
    md
    lg

Current intended meaning:

    sm = compact table usage
    md = medium UI usage
    lg = prominent instrument/header usage


Optional props include:

    ticker
    assetType
    contractKey
    exchange
    size
    className


Current interface concept:

    interface AssetIconProps {
      ticker: string;
      assetType?: string;
      contractKey?: string;
      exchange?: string;
      size?: "sm" | "md" | "lg";
      className?: string;
    }


IMPORTANT:

exchange is optional because the canonical Trade object does NOT
currently contain exchange at the top level.

Exchange exists on:

    NormalizedExecution


Therefore:

DO NOT add exchange to Trade simply for AssetIcon.

The component can accept exchange when a future use case
actually needs it.


===============================================================
4. DO NOT MODIFY THE CANONICAL TRADE MODEL FOR ICONS
===============================================================

Asset icons are presentation/reference data.

Do NOT add:

    logoUrl
    logoProvider
    logo
    iconUrl
    optionType

to:

    types/trade.ts

just to support the icon system.

The canonical Trade model remains focused on trading/accounting
data.

AssetIcon is a presentation-layer concern.

This preserves the existing:

    execution
        ↓
    pairTrades()
        ↓
    trades
        ↓
    analytics
        ↓
    UI

architecture.

The icon system must never become a second source of financial
truth.


===============================================================
5. CURRENT PROVIDER
===============================================================

Current provider:

    Logo.dev

Current implementation uses the provider as an external image
source.

The provider is intentionally isolated behind the resolver.

This allows Elite X to replace Logo.dev in the future without
rewriting every table/card/drawer that uses AssetIcon.

DO NOT create provider-specific code outside:

    lib/assets/assetIconResolver.ts


===============================================================
6. ENVIRONMENT VARIABLE
===============================================================

The browser-safe Logo.dev key currently lives in:

    .env.local

Variable:

    NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY=...


IMPORTANT SECURITY RULE:

ONLY the Logo.dev PUBLISHABLE KEY is used client-side.

NEVER place the Logo.dev SECRET KEY in:

    NEXT_PUBLIC_*

or in:

    AssetIcon.tsx
    resolver source code
    Git
    database
    frontend props
    public configuration

The publishable key is intentionally exposed to the browser.

The secret key must remain private and should never be committed
to the repository.

A previous implementation mistake used the Logo.dev Secret Key
in the browser and resulted in:

    HTTP 401

The issue was corrected by using the Publishable Key.

LESSON:

    Client/browser logo requests
        →
    publishable key only

    Private/server-only credentials
        →
    never expose through NEXT_PUBLIC_*


===============================================================
7. CURRENT RESOLVER RESPONSIBILITIES
===============================================================

File:

    lib/assets/assetIconResolver.ts

Main concepts:

    AssetIconResolverInput

    AssetIconResolution

The resolver receives:

    ticker
    assetType
    contractKey
    exchange


The resolver normalizes asset type values.

Example:

    STOCK
    Stocks
    stock
    STOCKS

can be normalized before provider logic is applied.

The resolver generates:

    src
    alt
    fallbackText


The UI does not need to understand provider-specific URL
construction.


===============================================================
8. STOCK / ETF / OPTIONS BEHAVIOR
===============================================================

Current stock-like assets are routed through the ticker logo
endpoint.

Supported stock-like categories currently include:

    stock
    stocks
    equity
    etf
    fund
    funds
    reit
    reits
    options

Options intentionally use the UNDERLYING TICKER logo.

Example:

    QQQ option
    →
    QQQ logo

NOT:

    CALL logo
    PUT logo
    option-specific logo

Call/Put remains a trading-semantic concept.

The logo represents the underlying instrument.


===============================================================
9. OPTIONS LOGIC
===============================================================

The icon system does NOT determine whether an option is a CALL
or PUT.

Existing Elite X trading logic remains responsible for that.

Current option semantics remain:

    contractKey ending in "_C"
        →
    CALL

    contractKey ending in "_P"
        →
    PUT

The icon system only asks:

    "What underlying asset does this trade belong to?"

and displays that asset's logo.

This separation is intentional.


===============================================================
10. CRYPTO BEHAVIOR
===============================================================

Crypto uses a dedicated crypto provider endpoint.

Conceptually:

    assetType === CRYPTO
        →
    crypto logo endpoint

Example:

    BTC
    ETH
    etc.

The ticker remains the identifying input.


===============================================================
11. UNSUPPORTED ASSETS
===============================================================

Currently unsupported or unresolved categories do NOT produce
broken images.

Examples may include:

    futures
    forex
    CFD
    unknown/custom instruments

unless they are explicitly added to the resolver later.

These assets use the deterministic fallback behavior.

DO NOT force unsupported provider requests simply to make an
icon appear.

A clean fallback is better than:

    broken image
    broken URL
    empty box
    console errors


===============================================================
12. FALLBACK SYSTEM
===============================================================

AssetIcon always needs a safe fallback.

If:

    no provider key exists
    OR
    asset type is unsupported
    OR
    provider URL cannot be generated
    OR
    image request fails

then AssetIcon displays deterministic fallback text.

Current fallback concept:

    ticker first character

Example:

    QQQ
      →
    Q

    AAPL
      →
    A

    BTC
      →
    B

If ticker is empty:

    ?


IMPORTANT:

Never show a broken-image icon to the user.


===============================================================
13. IMAGE FAILURE HANDLING
===============================================================

AssetIcon maintains local image failure state.

When the external image reports an error:

    onError
        ↓
    imageFailed = true
        ↓
    fallback displayed

When the resolved image source changes:

    imageFailed resets

This ensures that one failed provider request does not permanently
break the component instance.


===============================================================
14. CURRENT ASSETICON VISUAL SYSTEM
===============================================================

The component provides a consistent circular presentation.

Current characteristics:

    rounded-full
    overflow-hidden
    shrink-0
    subtle border
    subtle background
    object-contain for provider image

Sizes:

    sm:
        h-5 w-5

    md:
        h-6 w-6

    lg:
        h-8 w-8

DO NOT change these globally just to solve one table's alignment.

For individual layouts, prefer local positioning through:

    relative left-*
    relative right-*
    translate-x-*
    translate-y-*

when visual tuning is required.


===============================================================
15. CURRENT IMPLEMENTATIONS
===============================================================

AssetIcon is now used in:

    Dashboard
        └── OpenPositionsCard

    Dashboard
        └── RecentTradesCard

    Daily Review
        └── Daily Review Trade Table

    Trade History
        └── TradesTable

    Daily Review
        └── Trade Drawer
            └── Overview
                └── Instrument section


This establishes the desired visual language:

    same asset
        →
    same recognizable logo
        →
    consistent identity throughout Elite X


===============================================================
16. OPEN POSITIONS
===============================================================

File:

    components/dashboard-v2/OpenPositionsCard.tsx

Current pattern:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />

The existing position label logic remains unchanged.

For options:

    _C → CALL
    _P → PUT

For non-options:

    LONG
    SHORT

Do not mix logo identity with position-direction logic.


===============================================================
17. RECENT TRADES
===============================================================

File:

    components/dashboard-v2/RecentTradesCard.tsx

Current AssetIcon pattern is the same:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />

Recent Trades remains responsible for:

    closed trade filtering
    sorting
    date presentation
    P&L

AssetIcon remains responsible ONLY for asset identity.


===============================================================
18. DAILY REVIEW TRADE TABLE
===============================================================

The Daily Review Trade Table now uses AssetIcon in the Symbol
column.

Pattern:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />

Ticker text remains next to the icon.

This table already contains extensive trade semantics.

DO NOT move option logic, P&L logic, lifecycle logic, or execution
logic into AssetIcon.


===============================================================
19. TRADE HISTORY
===============================================================

File:

    TradesTable.tsx

The Symbol cell now contains:

    AssetIcon
    ticker
    exchange

Conceptually:

    [LOGO]  QQQ
            NASDAQ

The exchange is still derived from:

    trade.executions

because exchange belongs to execution-level data.

Do not add exchange to Trade just for this UI.


===============================================================
20. DAILY REVIEW TRADE DRAWER
===============================================================

File:

    components/dashboard/daily-review/DailyReviewTradeDrawer.tsx

The Overview → Instrument card previously used a fake circular
placeholder that displayed only the first character of the ticker.

Previous concept:

    QQQ
    ↓
    [ Q ]

That placeholder has now been replaced by the real AssetIcon.

Current pattern:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="lg"
    />

The surrounding 50px layout area remains in place so the drawer
geometry does not need to change.

This produced a significant visual improvement throughout the
drawer.


===============================================================
21. WHY THIS SYSTEM IS IMPORTANT
===============================================================

Before AssetIcon:

    every UI could invent its own representation.

Examples:

    letter circle
    ticker only
    text abbreviation
    manually uploaded image
    provider-specific URL
    custom fallback

That creates visual inconsistency and technical duplication.

After AssetIcon:

    instrument
       ↓
    AssetIcon
       ↓
    same visual identity everywhere


The user sees:

    QQQ

as the same recognizable instrument across the application.


===============================================================
22. HOW TO ADD ASSETICON TO A NEW COMPONENT
===============================================================

When adding a new UI component containing a financial instrument:

STEP 1:

Import:

    import AssetIcon from "@/components/common/AssetIcon";


STEP 2:

Locate the ticker/instrument UI.

Example:

    {trade.ticker}


STEP 3:

Place AssetIcon beside the ticker.

Example:

    <div className="flex items-center gap-2">
      <AssetIcon
        ticker={trade.ticker}
        assetType={trade.assetType}
        contractKey={trade.contractKey}
        size="sm"
      />

      <span>
        {trade.ticker}
      </span>
    </div>


STEP 4:

Choose size based on context.

Small table:

    size="sm"

Medium card:

    size="md"

Large instrument/header area:

    size="lg"


STEP 5:

Run the application and visually inspect alignment.

Do NOT immediately change the global AssetIcon component to fix
a local positioning problem.

First adjust the local wrapper.


===============================================================
23. DEFAULT INSERTION PATTERN
===============================================================

For most trade-based UI:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />


This is the standard Elite X pattern.

Only pass:

    exchange

when the specific component actually has a reason to provide
execution-level exchange information.


===============================================================
24. WHAT NOT TO DO
===============================================================

DO NOT:

    manually upload company logos

DO NOT:

    hard-code logo URLs inside UI components

DO NOT:

    add logoUrl to Trade

DO NOT:

    add logoProvider to Trade

DO NOT:

    add optionType to Trade simply for icon rendering

DO NOT:

    duplicate Logo.dev URL construction in components

DO NOT:

    expose a Logo.dev Secret Key

DO NOT:

    make every card/table implement its own fallback

DO NOT:

    make AssetIcon responsible for P&L

DO NOT:

    make AssetIcon responsible for CALL/PUT semantics

DO NOT:

    make AssetIcon responsible for LONG/SHORT semantics

DO NOT:

    make AssetIcon part of canonical accounting logic


===============================================================
25. ARCHITECTURAL BOUNDARY
===============================================================

Canonical trading system:

    Executions
        ↓
    normalized executions
        ↓
    execution ledger
        ↓
    pairTrades()
        ↓
    Trade
        ↓
    analytics / accounting


Asset identity system:

    Trade ticker
        +
    asset type
        +
    optional contract context
        ↓
    AssetIcon
        ↓
    provider / fallback


These systems are intentionally separate.

AssetIcon MUST remain presentation-only.


===============================================================
26. PROVIDER REPLACEMENT STRATEGY
===============================================================

If Logo.dev ever needs to be replaced:

DO NOT modify every UI component.

Only update:

    lib/assets/assetIconResolver.ts

The intended future architecture is:

    AssetIcon
       ↓
    resolver
       ↓
    provider adapter


Possible future provider:

    Provider B

The UI should remain:

    <AssetIcon ... />


This is why the provider is intentionally isolated.


===============================================================
27. FUTURE EXPANSION
===============================================================

When Elite X eventually needs additional asset types:

    FUTURES
    FOREX
    CFD
    OPTIONS WITH SPECIAL CASES
    CUSTOM CONTRACTS
    OTHER CRYPTO FORMATS

the first place to inspect is:

    lib/assets/assetIconResolver.ts


Do NOT add asset-specific provider logic directly inside:

    OpenPositionsCard
    RecentTradesCard
    TradesTable
    DailyReviewTradeTable
    DailyReviewTradeDrawer


Instead:

    update resolver
        ↓
    test AssetIcon
        ↓
    all existing components inherit the improvement


===============================================================
28. FUTURE EXCHANGE-AWARE LOGOS
===============================================================

Exchange may eventually become useful for resolving ambiguous
instruments.

The component already allows:

    exchange?: string

but the current implementation does NOT require it for the
primary stock/ETF/options workflow.

Do not introduce exchange-based resolution until there is a real
data-quality requirement.

Remember:

    exchange belongs to execution-level data
    unless the domain model is intentionally changed later.


===============================================================
29. VISUAL TUNING NOTES
===============================================================

The current Elite X UI uses many precise visual offsets.

For icon-related tuning, prefer:

    relative left-[...]
    relative right-[...]
    translate-x-[...]
    translate-y-[...]

when a particular table/card needs adjustment.

This has already been used successfully for:

    Symbol header
    Type header
    Account header
    Side header
    Entry header
    Type value
    Account value
    Entry value

Do not assume that changing:

    px-*
    pt-*
    mt-*

will produce the desired visual result in these layouts.

The current application is intentionally tuned at the component
level.


===============================================================
30. IMPORTANT DESIGN PRINCIPLE
===============================================================

The AssetIcon system should remain visually simple.

Its job is:

    "Identify the instrument."

Not:

    "Explain the trade."

Trade meaning remains elsewhere:

    AssetIcon
        = WHAT is being traded

    Side
        = HOW the position is oriented

    CALL / PUT
        = OPTION STRUCTURE

    Status
        = CURRENT TRADE STATE

    P&L
        = FINANCIAL RESULT


This separation keeps the UI understandable and the architecture
clean.


===============================================================
31. TESTING CHECKLIST FOR FUTURE CHANGES
===============================================================

Whenever AssetIcon is modified, test at minimum:

    STOCK
        QQQ
        AAPL

    ETF
        SPY

    OPTION
        QQQ CALL
        QQQ PUT

    CRYPTO
        BTC

    UNSUPPORTED ASSET
        fallback should appear

    EMPTY TICKER
        fallback should not break layout

    INVALID / FAILED IMAGE
        deterministic fallback should appear

    MISSING ENV KEY
        component should still render safely

    MULTIPLE COMPONENTS
        dashboard
        trade history
        daily review
        drawer


===============================================================
32. SECURITY NOTES
===============================================================

Browser-visible environment variable:

    NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY

is intentionally public.

Private credentials must NEVER use:

    NEXT_PUBLIC_

Never commit:

    .env.local
    Secret Key
    private provider credentials

to Git.

Before production launch, re-check the chosen provider's current
commercial-use, attribution, request-limit, and pricing terms.

Do NOT assume a current free/community plan will remain unchanged
forever.


===============================================================
33. PERFORMANCE NOTES
===============================================================

AssetIcon uses lazy image loading:

    loading="lazy"

and asynchronous image decoding:

    decoding="async"

This is appropriate because Elite X may display many symbols
across large tables.

Do not add heavy client-side asset fetching logic unless there is
a measured need.

The current model relies on the external image CDN/provider.


===============================================================
34. CURRENT REFERENCE PATTERN
===============================================================

The canonical simple usage pattern is:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />


For a larger instrument display:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="lg"
    />


This should be the first pattern considered whenever a new Elite X
component needs a financial instrument identity.


===============================================================
35. FINAL ARCHITECTURAL RULE
===============================================================

Elite X has ONE asset identity system.

ONE:

    AssetIcon

ONE:

    assetIconResolver

ONE:

    provider abstraction

ONE:

    fallback behavior


Everything else simply consumes it.

Future developers/changes should extend this system rather than
creating a second logo/icon implementation.

===============================================================
END OF MASTER NOTES
===============================================================