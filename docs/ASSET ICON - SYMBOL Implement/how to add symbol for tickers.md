===============================================================

ELITE X — MASTER NOTES

ASSET ICON / VENDOR ICON IDENTITY SYSTEM

===============================================================


STATUS:

---------

IMPLEMENTED

STABLE

PRODUCTION-READY ARCHITECTURE

DO NOT REBUILD UNLESS THERE IS A REAL ARCHITECTURAL REASON



PURPOSE:

---------

Elite X now has TWO reusable visual identity systems:

    1. AssetIcon
       → financial instruments

    2. VendorIcon
       → business/service vendors

These systems may use the same external logo provider, but they are
intentionally separate because they represent different domain concepts.



CORE PRINCIPLE:

----------------

The goal is NOT simply:

    "show logos"



The real goal is:

    ONE REUSABLE ASSET IDENTITY SYSTEM

    ONE REUSABLE VENDOR IDENTITY SYSTEM



Both systems follow the same architectural philosophy:

    UI
      ↓
    reusable identity component
      ↓
    resolver
      ↓
    external logo provider
      ↓
    logo image
      ↓
    deterministic fallback if unavailable



Individual cards, tables, drawers, expense sections, and future
components MUST NOT contain provider-specific logo logic.



===============================================================

1. CORE ARCHITECTURE

===============================================================


ASSET SYSTEM:

    UI
      ↓
    AssetIcon
      ↓
    assetIconResolver
      ↓
    Logo Provider
      ↓
    Image URL
      ↓
    Fallback


VENDOR SYSTEM:

    UI
      ↓
    VendorIcon
      ↓
    vendorIconResolver
      ↓
    Logo Provider
      ↓
    Image URL
      ↓
    Fallback



COMPONENT RESPONSIBILITIES:

----------------------------

AssetIcon / VendorIcon are responsible for:

    - rendering the icon
    - sizing
    - presentation
    - fallback display
    - image failure handling

Resolvers are responsible for:

    - normalizing input
    - determining whether an identity is supported
    - selecting the provider source
    - constructing provider URLs
    - generating deterministic fallback text


Provider-specific logic MUST remain inside resolver files.



DO NOT place provider URLs directly inside:

    OpenPositionsCard.tsx

    RecentTradesCard.tsx

    TradesTable.tsx

    DailyReviewTradeTable

    DailyReviewTradeDrawer.tsx

    ExpensesOverviewSection.tsx

    ExpensesIntelligenceSection.tsx

    or any future component.



===============================================================

2. FILE STRUCTURE

===============================================================


CURRENT ASSET FILES:

    components/common/AssetIcon.tsx

    lib/assets/assetIconResolver.ts


CURRENT VENDOR FILES:

    components/common/VendorIcon.tsx

    lib/assets/vendorIconResolver.ts



DIRECTORIES:

    components/common/

    lib/assets/



ARCHITECTURAL RULE:

--------------------

Keep reusable visual identity components in:

    components/common/

Keep provider/resolution logic in:

    lib/assets/



===============================================================

3. ASSETICON

===============================================================


AssetIcon represents:

    FINANCIAL INSTRUMENT IDENTITY



Current reusable API:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />


SUPPORTED SIZES:

    sm
    md
    lg


INTENDED MEANING:

    sm
        compact tables / dense rows

    md
        medium UI/card usage

    lg
        prominent instrument/header usage



SUPPORTED PROPS:

    ticker
    assetType
    contractKey
    exchange
    size
    className



CONCEPTUAL INTERFACE:

    interface AssetIconProps {
      ticker: string;
      assetType?: string;
      contractKey?: string;
      exchange?: string;
      size?: "sm" | "md" | "lg";
      className?: string;
    }



IMPORTANT:

exchange is optional.

The canonical Trade object does NOT currently contain exchange
at the top level.

Exchange exists at execution level.

Therefore:

    DO NOT add exchange to Trade simply to support AssetIcon.



AssetIcon remains a presentation-layer component.



===============================================================

4. DO NOT MODIFY THE CANONICAL TRADE MODEL FOR ICONS

===============================================================


Asset icons are presentation/reference data.

They are NOT accounting data.

They are NOT trade reconstruction data.

They are NOT execution data.



DO NOT add the following to:

    types/trade.ts

just to support visual identity:

    logoUrl

    logoProvider

    logo

    iconUrl

    optionType

    exchange

    provider metadata



The canonical Trade model remains focused on:

    trading

    accounting

    lifecycle

    execution relationships

    P&L

    trade semantics



Existing architecture remains:

    executions
        ↓
    normalized executions
        ↓
    execution ledger
        ↓
    pairTrades()
        ↓
    trades
        ↓
    analytics
        ↓
    UI



The identity system MUST NEVER become another source of financial truth.



===============================================================

5. CURRENT LOGO PROVIDER

===============================================================


CURRENT PROVIDER:

    Logo.dev



Logo.dev is used as an external logo/image source.

The provider is intentionally isolated behind the resolver.



This means:

    AssetIcon
        ↓
    assetIconResolver
        ↓
    Logo.dev


and:

    VendorIcon
        ↓
    vendorIconResolver
        ↓
    Logo.dev



The UI should never need to know how Logo.dev URLs are constructed.



If Logo.dev is eventually replaced:

    DO NOT rewrite every component.



Only the resolver/provider layer should need to change.



===============================================================

6. ENVIRONMENT VARIABLES / SECURITY

===============================================================


CLIENT-SIDE LOGO KEY:

    NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY



This key is intentionally browser-visible.

The NEXT_PUBLIC_ prefix is expected because browser-side requests
need access to the publishable key.



IMPORTANT:

    PUBLISHABLE KEY
        →
    safe for browser-side use



    SECRET KEY
        →
    MUST remain private



NEVER place the Logo.dev Secret Key in:

    NEXT_PUBLIC_*

    AssetIcon.tsx

    VendorIcon.tsx

    resolver source code

    Git

    database

    frontend props

    public configuration



NEVER commit:

    .env.local

    secret provider credentials

    private API keys



LOCAL:

    .env.local



PRODUCTION:

    configure the required environment variables in Vercel.



IMPORTANT:

After changing NEXT_PUBLIC_* environment variables in Vercel:

    REDEPLOY THE APPLICATION

because public environment values are embedded during the build.



A previous implementation incorrectly used a Logo.dev Secret Key
in the browser and resulted in HTTP 401.

That issue was corrected by switching to the Publishable Key.



LESSON:

    Browser/client logo requests
        →
    publishable key only



    Private/server credentials
        →
    never expose through NEXT_PUBLIC_*



===============================================================

7. ASSETICON RESOLVER

===============================================================


FILE:

    lib/assets/assetIconResolver.ts



PRIMARY RESPONSIBILITY:

    Convert canonical instrument information into
    a provider-ready logo resolution.



INPUT CONCEPT:

    ticker

    assetType

    contractKey

    exchange



OUTPUT CONCEPT:

    src

    alt

    fallbackText



The resolver normalizes input before deciding what provider endpoint
should be used.



Example normalization:

    STOCK

    Stocks

    stock

    STOCKS

should all be interpreted consistently.



The UI should never need to know provider-specific URL rules.



===============================================================

8. STOCK / ETF / FUND / REIT / OPTIONS

===============================================================


Current stock-like categories include:

    stock

    stocks

    equity

    ETF

    etf

    fund

    funds

    REIT

    reit

    reits

    options



These use ticker-based logo resolution.



OPTIONS:

---------

Options intentionally use the UNDERLYING TICKER logo.



Example:

    QQQ CALL
        ↓
    QQQ logo



    QQQ PUT
        ↓
    QQQ logo



NOT:

    CALL logo

    PUT logo

    option-specific logo



The logo answers:

    "What underlying financial instrument is this?"



It does NOT answer:

    "Is this a CALL or PUT?"



===============================================================

9. OPTION SEMANTICS

===============================================================


AssetIcon does NOT determine option direction.

Existing trading logic remains responsible for CALL / PUT semantics.



Current concept:

    contractKey ending in "_C"
        ↓
    CALL



    contractKey ending in "_P"
        ↓
    PUT



The icon system only determines:

    underlying instrument identity



Existing trade semantics remain elsewhere.



DO NOT move:

    CALL / PUT

    LONG / SHORT

    P&L

    trade lifecycle

    execution logic

into AssetIcon.



===============================================================

10. CRYPTO

===============================================================


Crypto uses a dedicated crypto provider endpoint.



Conceptually:

    assetType === CRYPTO
        ↓
    crypto logo endpoint



Examples:

    BTC

    ETH

    etc.



The ticker remains the primary identifying input.



===============================================================

11. UNSUPPORTED ASSETS

===============================================================


Currently unsupported or unresolved categories may include:

    futures

    forex

    CFD

    unknown/custom instruments



Unless explicitly added later to the resolver, these should NOT force
an invalid provider request.



A clean fallback is better than:

    broken image

    broken URL

    empty box

    console noise



Future support must be added in:

    lib/assets/assetIconResolver.ts



NOT in individual UI components.



===============================================================

12. ASSETICON FALLBACK SYSTEM

===============================================================


AssetIcon must always render safely.



Fallback is used when:

    - provider key is missing

    - asset type is unsupported

    - provider URL cannot be generated

    - image request fails



Current fallback concept:

    first ticker character



Examples:

    QQQ
        ↓
    Q



    AAPL
        ↓
    A



    BTC
        ↓
    B



Empty ticker:

    ?



IMPORTANT:

Never show a broken-image presentation to the user.



===============================================================

13. IMAGE FAILURE HANDLING

===============================================================


AssetIcon maintains local image-failure state.



Conceptually:

    image request
        ↓
    onError
        ↓
    imageFailed = true
        ↓
    fallback displayed



When the resolved source changes:

    imageFailed
        ↓
    reset



This prevents one failed provider image from permanently breaking
a component instance.



The same principle applies to VendorIcon.



===============================================================

14. ASSETICON VISUAL SYSTEM

===============================================================


AssetIcon uses a consistent circular visual presentation.



Current characteristics:

    rounded-full

    overflow-hidden

    shrink-0

    subtle border

    subtle background

    object-contain



CURRENT SIZES:

    sm
        h-5 w-5

    md
        h-6 w-6

    lg
        h-8 w-8



DO NOT globally change these sizes just to solve one local table
alignment issue.



For local UI tuning, prefer:

    relative left-[...]

    relative right-[...]

    translate-x-[...]

    translate-y-[...]



rather than changing the global component geometry.



===============================================================

15. CURRENT ASSETICON IMPLEMENTATIONS

===============================================================


AssetIcon is currently used in:

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



The intended visual result is:

    same instrument
        ↓
    same recognizable identity
        ↓
    consistent presentation throughout Elite X



===============================================================

16. OPEN POSITIONS

===============================================================


FILE:

    components/dashboard-v2/OpenPositionsCard.tsx



CURRENT PATTERN:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />



Existing position-label logic remains unchanged.



OPTIONS:

    _C → CALL

    _P → PUT



NON-OPTIONS:

    LONG

    SHORT



DO NOT mix identity logic with position-direction logic.



OpenPositionsCard remains responsible for:

    open-trade filtering

    position semantics

    P&L

    table layout



AssetIcon remains responsible only for:

    instrument identity



===============================================================

17. RECENT TRADES

===============================================================


FILE:

    components/dashboard-v2/RecentTradesCard.tsx



CURRENT PATTERN:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />



RecentTradesCard remains responsible for:

    closed-trade filtering

    sorting

    date presentation

    P&L



AssetIcon remains responsible only for instrument identity.



===============================================================

18. DAILY REVIEW TRADE TABLE

===============================================================


Daily Review Trade Table now uses AssetIcon in the Symbol column.



PATTERN:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />



Ticker remains displayed beside the logo.



Do not move:

    option semantics

    P&L

    lifecycle

    execution logic

into AssetIcon.



===============================================================

19. TRADE HISTORY

===============================================================


FILE:

    TradesTable.tsx



The Symbol area now contains:

    AssetIcon

    ticker

    exchange



Conceptually:

    [LOGO]  QQQ
            NASDAQ



Exchange is still derived from execution-level data.



Do NOT add exchange to Trade simply to make the Symbol UI easier.



Trade History remains responsible for:

    table structure

    row behavior

    trade values

    execution-derived information



AssetIcon remains responsible only for identity.



===============================================================

20. DAILY REVIEW TRADE DRAWER

===============================================================


FILE:

    components/dashboard/daily-review/DailyReviewTradeDrawer.tsx



The Overview → Instrument section previously used a simple
letter-based placeholder.



Previous concept:

    QQQ
      ↓
    [ Q ]



This was replaced by the real AssetIcon.



CURRENT PATTERN:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="lg"
    />



The surrounding drawer geometry remains unchanged.



The existing approximately 50px instrument area does not need to
be redesigned just because the icon implementation changed.



===============================================================

21. VENDORICON

===============================================================


VendorIcon represents:

    BUSINESS / SERVICE VENDOR IDENTITY



This is intentionally NOT part of AssetIcon.



AssetIcon:

    Financial instrument



VendorIcon:

    Business/service vendor



Examples:

    TradingView

    Bookmap

    Rithmic

    CQG

    Interactive Brokers

    NinjaTrader

    Edgeful

    TradeZella

    Udemy



These are expense/vendor concepts rather than tradable instruments.



===============================================================

22. VENDORICON FILES

===============================================================


FILES:

    components/common/VendorIcon.tsx

    lib/assets/vendorIconResolver.ts



DIRECTORY:

    components/common/

    lib/assets/



The same architectural rules used for AssetIcon apply:

    UI component
        ↓
    resolver
        ↓
    provider
        ↓
    image
        ↓
    fallback



===============================================================

23. VENDORICON API

===============================================================


STANDARD USAGE:

    <VendorIcon
      vendor={renewal.vendor}
      size="sm"
    />



SUPPORTED SIZES:

    sm

    md

    lg



VendorIcon may also accept:

    className



The component is intentionally simple.

It receives a vendor name and handles visual identity resolution.



The UI does NOT need to know:

    provider domain

    provider URL

    logo CDN rules

    fallback rules



===============================================================

24. VENDOR RESOLVER

===============================================================


FILE:

    lib/assets/vendorIconResolver.ts



PRIMARY RESPONSIBILITY:

    Normalize vendor names and resolve them into a provider-ready
    company logo source.



CONCEPTUAL INPUT:

    vendor



CONCEPTUAL OUTPUT:

    src

    alt

    fallbackText



The resolver is responsible for vendor-specific mapping.



The UI should simply provide:

    vendor={vendor}



===============================================================

25. CURRENT EXPENSE VENDOR LIST

===============================================================


CURRENT VENDOR OPTIONS:

    TradingView

    Bookmap

    Rithmic

    CQG

    Interactive Brokers

    NinjaTrader

    Edgeful

    TradeZella

    Udemy

    Other



These are the current named vendor choices used by the expense UI.



"Other" does not require a dedicated provider mapping.

It should safely use the fallback behavior.



IMPORTANT:

Historical/example expenses may contain other names such as:

    DigitalOcean

    Rogers

    CME



Those historical records do NOT automatically make them current
dropdown vendors.

Only add provider mappings when there is a real requirement.



===============================================================

26. CURRENT VENDOR LOGO MAPPINGS

===============================================================


CURRENT VENDOR LOGO SOURCES:

    tradingview
        → chart-tradingview.ai

    bookmap
        → bookmap.com

    rithmic
        → rithmic.com

    cqg
        → cqg.com

    ibkr
        → interactivebrokers.com

    interactive brokers
        → interactivebrokers.com

    ninjatrader
        → ninjatrader.com

    edgeful
        → edgeful.com

    tradezella
        → tradezella.com

    udemy
        → udemy.com



These mappings are provider/logo-source mappings.

They are NOT business identity data.



===============================================================

27. TRADINGVIEW LOGO-SOURCE OVERRIDE

===============================================================


SPECIAL CASE:

    TradingView



The standard:

    tradingview.com

logo source did not produce the desired visual result in the
Logo.dev image output.



Testing showed that:

    chart-tradingview.ai

provided the desired recognizable TradingView visual.



Therefore the CURRENT logo mapping is:

    tradingview
        →
    chart-tradingview.ai



IMPORTANT ARCHITECTURAL DISTINCTION:

The expense/vendor value remains:

    TradingView



The logo-source mapping is simply:

    TradingView
        ↓
    chart-tradingview.ai
        ↓
    displayed logo



DO NOT treat:

    chart-tradingview.ai

as the vendor's canonical business domain.



It is currently only a presentation/logo-source override.



If this mapping is changed later, the vendor data itself should
NOT need to change.



===============================================================

28. VENDORICON FALLBACK SYSTEM

===============================================================


VendorIcon must always render safely.



Fallback is used when:

    - provider key is missing

    - vendor is unsupported

    - provider URL cannot be generated

    - logo image fails



Current fallback concept:

    first character of the vendor



Examples:

    TradingView
        ↓
    T



    Bookmap
        ↓
    B



    Rithmic
        ↓
    R



Empty vendor:

    ?



Fallback behavior prevents:

    broken images

    empty visual boxes

    inconsistent placeholders

    layout breakage



===============================================================

29. VENDORICON IMAGE FAILURE

===============================================================


VendorIcon uses local image-failure handling.



Conceptually:

    resolved image
        ↓
    image request
        ↓
    onError
        ↓
    fallback



When the resolved source changes:

    failure state resets



This keeps the component resilient when vendor values change
between rows or renders.



===============================================================

30. VENDORICON VISUAL SYSTEM

===============================================================


VendorIcon follows the same general visual language as AssetIcon.



CURRENT CHARACTERISTICS:

    circular wrapper

    overflow hidden

    shrink-0

    subtle border

    subtle background

    object-contain



CURRENT SIZE CONCEPT:

    sm
        h-5 w-5

    md
        h-6 w-6

    lg
        h-8 w-8



VendorIcon should remain visually compact inside expense UI.



Do not globally enlarge the icon to solve one particular row's
positioning.



Tune the local layout instead.



===============================================================

31. UPCOMING RENEWALS

===============================================================


FILE:

    components/dashboard-v2/ExpensesIntelligenceSection.tsx



Previous implementation used manually maintained image paths such as:

    /icons/expenses/tradingview.png

    /icons/expenses/digitalocean.png

    /icons/expenses/ninjatrader.png

    /icons/expenses/cme.png



That model is obsolete for the current reusable vendor identity
architecture.



The reusable VendorIcon system is now used instead.



CURRENT CONCEPT:

    <VendorIcon
      vendor={renewal.vendor}
      size="sm"
      className={`${renewalIconX} ${renewalIconY}`}
    />



This removes the need for the Upcoming Renewals UI to manually
manage vendor image URLs.



===============================================================

32. UPCOMING RENEWALS — VISUAL TUNING

===============================================================


Existing visual tuning must remain intact unless there is a real
design requirement.



CURRENT TUNING CONCEPTS INCLUDE:

    renewalsHeaderX

    renewalsHeaderY

    renewalsListX

    renewalsListY

    renewalsWidth

    renewalIconX

    renewalIconY

    renewalNameX

    renewalNameY

    renewalDateX

    renewalDateY

    renewalDaysX

    renewalDaysY



Current values:

    renewalsHeaderX = "translate-x-2"

    renewalsHeaderY = "translate-y-2"

    renewalsListX = "translate-x-4"

    renewalsListY = "translate-y-4"

    renewalsWidth = "w-[90%]"

    renewalIconX = "translate-x-0"

    renewalIconY = "translate-y-1.5"

    renewalNameX = "translate-x-3"

    renewalNameY = "translate-y-2"

    renewalDateX = "translate-x-4"

    renewalDateY = "translate-y-2"

    renewalDaysX = "-translate-x-6"

    renewalDaysY = "translate-y-2"



DO NOT change unrelated text/date positioning merely because
VendorIcon was introduced.



The icon replacement should preserve existing card geometry.



===============================================================

33. VENDOR BREAKDOWN

===============================================================


FILE:

    components/dashboard-v2/ExpensesOverviewSection.tsx



Vendor Breakdown now uses VendorIcon for REAL vendor rows.



Important requirement:

    Real populated vendors
        →
    VendorIcon



    Empty placeholder rows
        →
    existing small slate dot



This preserves the previous empty-state appearance.



===============================================================

34. VENDOR BREAKDOWN ROW LOGIC

===============================================================


Current concept:

    vendorRows =

        real vendor data
            +
        placeholder rows until six rows exist



Placeholder structure:

    vendor: "—"

    amount: 0

    percentage: 0



Therefore the icon behavior is intentionally conditional.



REAL ROW:

    vendor.amount > 0
        →
    VendorIcon



PLACEHOLDER ROW:

    vendor.amount === 0
        →
    small slate dot



This is intentional.



DO NOT replace empty-state dots with a fake vendor logo.



===============================================================

35. VENDOR BREAKDOWN CURRENT UI PATTERN

===============================================================


CONCEPTUAL LEFT SIDE:

    <div
      className={`
        flex
        items-center
        gap-3
        ${
          vendor.amount > 0
            ? "relative left-[-8px]"
            : ""
        }
      `}
    >

      {vendor.amount > 0 ? (
        <VendorIcon
          vendor={vendor.vendor}
          size="sm"
        />
      ) : (
        <span className="h-2 w-2 rounded-full bg-slate-600" />
      )}

      <span
        className={`text-[13px] ${
          vendor.amount > 0
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {vendor.vendor}
      </span>

    </div>



IMPORTANT:

The populated vendor group currently uses a local:

    relative left-[-8px]

offset.



This is a local layout decision.

Do NOT modify VendorIcon globally to solve this alignment.



===============================================================

36. VENDOR BREAKDOWN RIGHT-SIDE VALUES

===============================================================


Existing amount/percentage positioning remains unchanged.



CURRENT CONCEPT:

    amount
        →
    right-aligned
    approximately -translate-x-8



    percentage
        →
    right-aligned
    approximately -translate-x-4



The vendor identity change must NOT disturb those values.



===============================================================

37. VENDOR BREAKDOWN PLACEHOLDER RULE

===============================================================


This is an important UI rule.

When fewer than six real vendors exist:

    fill remaining rows with:

        vendor = "—"
        amount = 0
        percentage = 0



These placeholders must retain the previous visual treatment:

    small slate dot

    muted vendor text

    muted amount

    muted percentage



Do NOT make placeholder rows look like real vendors.



This keeps the populated/empty distinction visually obvious.



===============================================================

38. CURRENT VENDOR BREAKDOWN TUNING

===============================================================


Current tuning concepts include:

    vendorTitleX

    vendorTitleY

    vendorListX

    vendorListY

    vendorRowSpacing

    vendorAmountWidth

    vendorPercentWidth



Current values:

    vendorTitleX = "translate-x-[14px]"

    vendorTitleY = "translate-y-[0px]"

    vendorListX = "translate-x-[20px]"

    vendorListY = "translate-y-[0px]"

    vendorRowSpacing = "h-2"

    vendorAmountWidth = "w-[70px]"

    vendorPercentWidth = "w-[40px]"



Do not globally alter these values to solve a single icon position.



===============================================================

39. ASSETICON VS VENDORICON

===============================================================


THESE ARE SEPARATE SYSTEMS:

    AssetIcon
        →
    financial instrument identity



    VendorIcon
        →
    business/service vendor identity



Examples:

    QQQ
        →
    AssetIcon



    AAPL
        →
    AssetIcon



    BTC
        →
    AssetIcon



    TradingView
        →
    VendorIcon



    Bookmap
        →
    VendorIcon



    NinjaTrader
        →
    VendorIcon



Do NOT combine these into one generic component merely because
both display logos.



The domain concepts are different.



===============================================================

40. PROVIDER LOGIC BOUNDARIES

===============================================================


ASSET PROVIDER LOGIC:

    lib/assets/assetIconResolver.ts



VENDOR PROVIDER LOGIC:

    lib/assets/vendorIconResolver.ts



UI COMPONENTS:

    AssetIcon.tsx

    VendorIcon.tsx



The UI components should not contain:

    hard-coded provider domain lists

    provider URL construction

    business-domain mapping logic

    fallback URL logic



Resolvers should own these responsibilities.



===============================================================

41. DO NOT DUPLICATE LOGO PROVIDER LOGIC

===============================================================


DO NOT:

    manually fetch Logo.dev inside a card



DO NOT:

    manually construct Logo.dev URLs inside a table



DO NOT:

    hard-code vendor URLs inside ExpensesOverviewSection.tsx



DO NOT:

    hard-code vendor URLs inside ExpensesIntelligenceSection.tsx



DO NOT:

    create one-off image paths for every vendor



DO NOT:

    create another icon component for the same identity problem



If a logo provider changes:

    update resolver layer

    test shared component

    existing consumers inherit the change



===============================================================

42. DO NOT STORE LOGOS IN THE DATABASE

===============================================================


Logo identity is presentation/reference data.



Do not add logo URL columns to expense records simply to support
the VendorIcon system.



Do not duplicate:

    vendor logo URL

    provider name

    icon URL



inside every expense record.



The expense record should continue storing the vendor identity.



VendorIcon resolves the presentation independently.



===============================================================

43. DO NOT POLLUTE EXPENSE DOMAIN DATA

===============================================================


Expense data should continue to represent business data such as:

    vendor

    expense name

    expense date

    frequency

    recurring group

    amount

    status

    category

etc.



VendorIcon should remain completely outside canonical expense
accounting logic.



VendorIcon answers:

    "What does this vendor visually look like?"



Expense logic answers:

    "What expense happened?"



These are separate responsibilities.



===============================================================

44. ARCHITECTURAL BOUNDARY

===============================================================


CANONICAL TRADING SYSTEM:

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



ASSET IDENTITY SYSTEM:

    Trade ticker
        +
    asset type
        +
    optional contract context
        ↓
    AssetIcon
        ↓
    provider / fallback



CANONICAL EXPENSE SYSTEM:

    expense records
        ↓
    expense analytics
        ↓
    expense UI



VENDOR IDENTITY SYSTEM:

    expense vendor
        ↓
    VendorIcon
        ↓
    vendor resolver
        ↓
    provider / fallback



These identity systems MUST remain presentation-only.



===============================================================

45. HOW TO ADD ASSETICON TO A NEW COMPONENT

===============================================================


STEP 1:

Import:

    import AssetIcon from "@/components/common/AssetIcon";



STEP 2:

Find the instrument/ticker UI.



STEP 3:

Place AssetIcon beside the ticker.



STANDARD PATTERN:

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

Choose size based on context:

    dense table
        →
    sm

    medium card
        →
    md

    prominent instrument area
        →
    lg



STEP 5:

Run the application and visually inspect the result.



STEP 6:

If alignment is wrong:

    adjust the local wrapper first.



DO NOT immediately change global AssetIcon geometry.



===============================================================

46. HOW TO ADD VENDORICON TO A NEW COMPONENT

===============================================================


STEP 1:

Import:

    import VendorIcon from "@/components/common/VendorIcon";



STEP 2:

Find the vendor value.



STEP 3:

Place VendorIcon beside the vendor name.



STANDARD PATTERN:

    <div className="flex items-center gap-2">

      <VendorIcon
        vendor={vendor}
        size="sm"
      />

      <span>
        {vendor}
      </span>

    </div>



STEP 4:

Choose size:

    compact table/list
        →
    sm

    medium card
        →
    md

    prominent vendor area
        →
    lg



STEP 5:

Visually inspect the result.



STEP 6:

Use local positioning if necessary.



DO NOT modify VendorIcon globally to solve a single component's
alignment problem.



===============================================================

47. ADDING A NEW ASSET TYPE

===============================================================


When a new financial asset type is required:

    DO NOT begin by editing the UI.



First inspect:

    lib/assets/assetIconResolver.ts



Determine:

    - normalization requirements
    - provider endpoint
    - ticker mapping
    - fallback behavior



Then:

    update resolver

    test AssetIcon

    test existing consumers

    verify unsupported behavior



The UI should inherit the improvement automatically.



===============================================================

48. ADDING A NEW VENDOR

===============================================================


When a new expense vendor is introduced:

    1. Confirm the vendor value used by the expense system.

    2. Normalize the vendor name.

    3. Add the logo-source mapping in:

           lib/assets/vendorIconResolver.ts

    4. Do NOT add a hard-coded image URL to the component.

    5. Test the vendor through VendorIcon.

    6. Test all existing vendor rows.

    7. Test fallback behavior.



Example concept:

    newvendor
        →
    newvendor.com



Only add a mapping when there is a real provider/logo requirement.



===============================================================

49. VENDOR NAME VS LOGO SOURCE

===============================================================


The vendor value stored by Elite X represents the application/domain
identity.



The logo source represents presentation infrastructure.



Example:

    vendor:

        TradingView



logo source:

    chart-tradingview.ai



These are intentionally not treated as the same field.



This allows:

    vendor data
        →
    remain stable



while:

    logo provider/source
        →
    can change independently.



===============================================================

50. WHAT NOT TO DO

===============================================================


DO NOT:

    manually upload logos



DO NOT:

    hard-code provider URLs inside UI components



DO NOT:

    add logoUrl to Trade



DO NOT:

    add logoProvider to Trade



DO NOT:

    add exchange to Trade just for icon rendering



DO NOT:

    add optionType to Trade simply for icon rendering



DO NOT:

    store vendor logo URLs in expense records



DO NOT:

    duplicate provider URL construction



DO NOT:

    expose Logo.dev Secret Key



DO NOT:

    make every card/table implement its own fallback



DO NOT:

    make AssetIcon responsible for P&L



DO NOT:

    make AssetIcon responsible for CALL/PUT



DO NOT:

    make AssetIcon responsible for LONG/SHORT



DO NOT:

    make VendorIcon responsible for expense accounting



DO NOT:

    make VendorIcon responsible for vendor business logic



DO NOT:

    make identity components part of canonical financial data



===============================================================

51. VISUAL TUNING RULES

===============================================================


Elite X contains many carefully tuned layouts.



For icon alignment, prefer:

    relative left-[...]

    relative right-[...]

    translate-x-[...]

    translate-y-[...]



when a specific component requires adjustment.



Do not assume:

    px-*

    pt-*

    mt-*



will always produce the desired result in the current layouts.



For this project, local positioning has already been used successfully
for:

    Symbol header

    Type header

    Account header

    Side header

    Entry header

    Type value

    Account value

    Entry value

    vendor rows

    vendor icons

    renewal icons



LOCAL TUNING IS PREFERRED OVER GLOBAL COMPONENT MODIFICATION.



===============================================================

52. PERFORMANCE

===============================================================


AssetIcon / VendorIcon may appear many times in large tables.



Current approach uses lightweight external image loading.



Important principles:

    loading="lazy"

    decoding="async"



Avoid:

    large client-side asset-fetching systems

    unnecessary API requests

    duplicate logo requests

    local database logo synchronization



unless measured performance requirements justify it.



The current implementation relies on the external image provider/CDN.



===============================================================

53. FALLBACK PHILOSOPHY

===============================================================


A fallback is a FEATURE, not an error state.



The UI must remain usable when:

    provider is unavailable

    key is missing

    vendor is new

    asset is unsupported

    image fails

    internet/CDN request fails



Expected result:

    deterministic fallback



Unexpected result:

    broken image

    broken layout

    blank component

    console noise

    missing row



A visually simple fallback is preferable to unreliable logo rendering.



===============================================================

54. TESTING CHECKLIST — ASSETICON

===============================================================


Whenever AssetIcon or its resolver changes, test at minimum:



STOCK:

    QQQ

    AAPL



ETF:

    SPY



OPTION:

    QQQ CALL

    QQQ PUT



CRYPTO:

    BTC



UNSUPPORTED:

    unsupported asset
        →
    fallback



EMPTY:

    empty ticker
        →
    fallback



FAILED IMAGE:

    invalid image/provider result
        →
    deterministic fallback



MISSING ENV KEY:

    component should still render safely



MULTIPLE COMPONENTS:

    Dashboard

    Trade History

    Daily Review

    Trade Drawer



===============================================================

55. TESTING CHECKLIST — VENDORICON

===============================================================


Whenever VendorIcon or its resolver changes, test at minimum:



TradingView

    →
    chart-tradingview.ai logo source



Bookmap

    →
    bookmap.com



Rithmic

    →
    rithmic.com



CQG

    →
    cqg.com



Interactive Brokers

    →
    interactivebrokers.com



NinjaTrader

    →
    ninjatrader.com



Edgeful

    →
    edgeful.com



TradeZella

    →
    tradezella.com



Udemy

    →
    udemy.com



Other

    →
    fallback



UNKNOWN VENDOR:

    →
    fallback



EMPTY VENDOR:

    →
    fallback



FAILED IMAGE:

    →
    deterministic fallback



MISSING ENV KEY:

    →
    component remains safe



===============================================================

56. TESTING CHECKLIST — EXPENSE UI

===============================================================


Whenever VendorIcon changes, test:

    Upcoming Renewals

    Vendor Breakdown



Upcoming Renewals must:

    display real vendor logos

    preserve vendor name position

    preserve date position

    preserve days-remaining position

    preserve card width/geometry



Vendor Breakdown must:

    show VendorIcon for populated vendors

    preserve existing vendor text styling

    preserve amount position

    preserve percentage position

    retain slate-dot placeholders

    preserve six-row structure



===============================================================

57. PRODUCTION ENVIRONMENT CHECK

===============================================================


LOCAL:

    NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY
        →
    .env.local



PRODUCTION:

    NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY
        →
    Vercel Production



Also verify any other required application environment variables.



Production env changes require a redeploy.



A working local logo system does NOT guarantee production will work
until the production environment contains the required variables.



===============================================================

58. PROVIDER REPLACEMENT STRATEGY

===============================================================


If Logo.dev is ever replaced:

    DO NOT modify every consumer.



Instead:

    update resolver/provider layer

        ↓

    test shared identity component

        ↓

    all consuming components inherit the change



INTENDED FUTURE ARCHITECTURE:

    AssetIcon
        ↓
    asset resolver
        ↓
    provider abstraction



    VendorIcon
        ↓
    vendor resolver
        ↓
    provider abstraction



The UI remains:

    <AssetIcon ... />

    <VendorIcon ... />



===============================================================

59. FUTURE PROVIDER ABSTRACTION

===============================================================


The current resolver model already provides a useful separation.



Future architecture may evolve toward:

    identity component
        ↓
    resolver
        ↓
    provider adapter
        ↓
    selected logo provider



Potential future provider:

    Provider B



The UI should not need to know which provider is active.



This is an architectural extension point, not a requirement to
build a provider abstraction prematurely.



Do not over-engineer this system unless there is a real need.



===============================================================

60. FUTURE ASSET EXPANSION

===============================================================


Potential future asset types:

    FUTURES

    FOREX

    CFD

    CUSTOM CONTRACTS

    ADDITIONAL CRYPTO FORMATS

    SPECIAL OPTION FORMATS



First place to inspect:

    lib/assets/assetIconResolver.ts



Do not immediately edit:

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

    all existing consumers inherit the improvement



===============================================================

61. FUTURE EXCHANGE-AWARE RESOLUTION

===============================================================


Exchange may eventually become necessary for ambiguous instruments.



AssetIcon already allows:

    exchange?: string



However:

    current primary stock / ETF / option workflow
    does not require exchange-based logo resolution.



Do NOT introduce exchange-aware provider logic simply because the
prop exists.



Only introduce it when there is a genuine data-quality or
instrument-resolution requirement.



Remember:

    exchange belongs to execution-level information
    unless the domain model is intentionally changed later.



===============================================================

62. IMPORTANT DESIGN PRINCIPLE

===============================================================


AssetIcon should remain visually simple.



Its job is:

    "Identify the instrument."



Not:

    "Explain the trade."



VendorIcon should remain visually simple.



Its job is:

    "Identify the vendor."



Not:

    "Explain the expense."



Trade meaning remains elsewhere.



AssetIcon:

    WHAT is being traded



Side:

    HOW the position is oriented



CALL / PUT:

    OPTION STRUCTURE



Status:

    CURRENT TRADE STATE



P&L:

    FINANCIAL RESULT



VendorIcon:

    WHO / WHAT SERVICE PROVIDED THE EXPENSE



Expense accounting:

    AMOUNT / DATE / CATEGORY / FREQUENCY / STATUS / ETC.



This separation keeps the application understandable.



===============================================================

63. IDENTITY SYSTEMS ARE PRESENTATION-ONLY

===============================================================


Neither AssetIcon nor VendorIcon should modify:

    trade accounting

    FIFO

    execution pairing

    trade reconstruction

    expense calculation

    P&L

    reporting currency

    recurring expense generation

    canonical database truth



They only render identity.



This is a hard architectural boundary.



===============================================================

64. CHANGE MANAGEMENT RULE

===============================================================


Before modifying AssetIcon or VendorIcon:

    1. Confirm the requested visual/functional change.

    2. Identify whether the problem belongs in:

           component
           resolver
           provider mapping
           local layout



    3. Do not make a global change for a local issue.

    4. Preserve existing visual tuning.

    5. Test fallback behavior.

    6. Run a production build after meaningful code changes.

    7. Verify affected screens visually.

    8. Push the verified change to Git.



This project prefers surgical changes over unnecessary refactors.



===============================================================

65. CURRENT VISUAL DESIGN PHILOSOPHY

===============================================================


Elite X uses recognizable logos to improve visual scanning.



The intended hierarchy is:

    logo
        +
    identifier
        +
    surrounding semantic data



The logo should support recognition.

It should NOT dominate the data.



Tables should remain:

    compact

    readable

    information-dense



Cards should remain:

    visually clean

    restrained

    consistent



Drawers should remain:

    compact

    structured

    readable



===============================================================

66. NO MANUAL LOGO UPLOAD SYSTEM

===============================================================


Elite X does NOT use a manual logo-upload architecture for this
identity system.



Advantages:

    no logo storage management

    no stale image management

    no database logo URLs

    no manual per-company maintenance

    no duplicated assets



The resolver/provider handles presentation automatically.



A fallback remains available whenever the provider cannot resolve
an identity.



===============================================================

67. CURRENT ARCHITECTURAL RULES FOR ASSET IDENTITY

===============================================================


RULE 1:

    Financial instruments use AssetIcon.



RULE 2:

    Vendors/services use VendorIcon.



RULE 3:

    Provider logic belongs in resolver files.



RULE 4:

    Canonical Trade data must not be polluted with logo metadata.



RULE 5:

    Expense records must not be polluted with logo metadata.



RULE 6:

    Logo.dev Secret Key must never be exposed.



RULE 7:

    Browser-side requests may use the publishable key.



RULE 8:

    Unsupported identities must gracefully fall back.



RULE 9:

    Image failures must gracefully fall back.



RULE 10:

    Local visual tuning should not modify global identity components
    without a real reason.



RULE 11:

    Vendor name and logo-source domain are separate concepts.



RULE 12:

    TradingView currently uses a dedicated logo-source override.



RULE 13:

    Placeholder expense rows should preserve their existing
    placeholder appearance.



RULE 14:

    No second identity implementation should be created for the
    same domain concept.



===============================================================

68. QUICK REFERENCE — ASSETICON

===============================================================


IMPORT:

    import AssetIcon from "@/components/common/AssetIcon";



STANDARD:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="sm"
    />



LARGER:

    <AssetIcon
      ticker={trade.ticker}
      assetType={trade.assetType}
      contractKey={trade.contractKey}
      size="lg"
    />



FIRST FILE TO INSPECT:

    lib/assets/assetIconResolver.ts



===============================================================

69. QUICK REFERENCE — VENDORICON

===============================================================


IMPORT:

    import VendorIcon from "@/components/common/VendorIcon";



STANDARD:

    <VendorIcon
      vendor={vendor}
      size="sm"
    />



LARGER:

    <VendorIcon
      vendor={vendor}
      size="lg"
    />



FIRST FILE TO INSPECT:

    lib/assets/vendorIconResolver.ts



===============================================================

70. QUICK REFERENCE — CURRENT VENDOR MAPPINGS

===============================================================


TradingView:

    chart-tradingview.ai



Bookmap:

    bookmap.com



Rithmic:

    rithmic.com



CQG:

    cqg.com



Interactive Brokers:

    interactivebrokers.com



NinjaTrader:

    ninjatrader.com



Edgeful:

    edgeful.com



TradeZella:

    tradezella.com



Udemy:

    udemy.com



Other:

    fallback



===============================================================

71. QUICK REFERENCE — CURRENT ASSETICON LOCATIONS

===============================================================


Dashboard:

    OpenPositionsCard

    RecentTradesCard



Daily Review:

    Trade Table

    Trade Drawer → Overview → Instrument



Trade History:

    TradesTable



===============================================================

72. QUICK REFERENCE — CURRENT VENDORICON LOCATIONS

===============================================================


Expenses:

    Upcoming Renewals

    Vendor Breakdown



Future expense UI should reuse VendorIcon instead of inventing
another vendor-image implementation.



===============================================================

73. PRODUCTION READINESS CHECKLIST

===============================================================


Before public launch verify:

    Logo.dev current commercial-use terms

    attribution requirements

    request limits

    pricing

    provider reliability

    publishable-key requirements

    Vercel Production environment variables

    no Secret Key exposure

    no .env.local committed

    fallback behavior

    image-failure behavior

    unsupported-asset behavior

    unsupported-vendor behavior

    production build

    major dashboards

    trade history

    daily review

    trade drawer

    upcoming renewals

    vendor breakdown



Do NOT assume a current free/community plan or provider policy will
remain unchanged forever.



===============================================================

74. REGRESSION CHECK

===============================================================


After any identity-system change:

    npm run build



Then verify visually:

    Dashboard

    Trade History

    Daily Review

    Trade Drawer

    Expenses Overview

    Expenses Intelligence



Pay particular attention to:

    icon size

    row alignment

    spacing

    fallback rendering

    table width

    placeholder rows

    mobile/responsive behavior where applicable



===============================================================

75. FINAL ARCHITECTURAL RULE

===============================================================


ELITE X HAS:

    ONE ASSET IDENTITY SYSTEM

        AssetIcon
            ↓
        assetIconResolver
            ↓
        provider
            ↓
        fallback



    ONE VENDOR IDENTITY SYSTEM

        VendorIcon
            ↓
        vendorIconResolver
            ↓
        provider
            ↓
        fallback



Everything else consumes these systems.



Future developers and future changes should EXTEND these systems
rather than creating new logo/icon implementations.



DO NOT:

    create another AssetIcon

    create another VendorIcon

    hard-code provider URLs in a component

    store logo URLs in canonical data

    expose secret keys

    duplicate fallback systems



Instead:

    improve the resolver

    improve the shared component

    add controlled provider mappings

    preserve the domain boundaries

    preserve existing UI tuning



===============================================================

76. FINAL SYSTEM SUMMARY

===============================================================


FINANCIAL INSTRUMENT:

    Trade
      ↓
    AssetIcon
      ↓
    Asset Resolver
      ↓
    Logo Provider
      ↓
    Fallback



EXPENSE VENDOR:

    Expense Vendor
      ↓
    VendorIcon
      ↓
    Vendor Resolver
      ↓
    Logo Provider
      ↓
    Fallback



CANONICAL DATA:

    remains untouched by logo presentation concerns



UI:

    gets consistent visual identity



PROVIDER:

    remains replaceable



FALLBACK:

    always available



SECURITY:

    Secret Keys remain private



SCALABILITY:

    new consumers reuse existing systems



MAINTAINABILITY:

    provider logic remains centralized



This is the current approved architecture for the Elite X
Asset Identity and Vendor Identity systems.



===============================================================

END OF MASTER NOTES

===============================================================