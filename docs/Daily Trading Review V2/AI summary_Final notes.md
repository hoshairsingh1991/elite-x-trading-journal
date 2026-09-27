============================================================
ELITE X TRADING JOURNAL
TRADE INTELLIGENCE — IMPLEMENTATION CHECKPOINT
============================================================

DATE
------------------------------------------------------------

2026-09-27


CURRENT STATUS
------------------------------------------------------------

Trade Intelligence is now fully wired through the application
architecture and has successfully completed a real live AI
generation using Google Gemini.

The current external blocker is:

    GEMINI FREE-TIER DAILY REQUEST QUOTA = EXHAUSTED

The latest Gemini error reported:

    HTTP 429

    RESOURCE_EXHAUSTED

    GenerateRequestsPerDayPerProjectPerModel-FreeTier

    quotaValue = 20

    model = gemini-3.6-flash

Therefore:

    CODE / ARCHITECTURE = READY

    SUPABASE AUTH       = READY

    CANONICAL DATA      = READY

    AI INPUT PIPELINE   = READY

    GEMINI API KEY      = CONFIGURED

    GEMINI CONNECTION   = VERIFIED

    LIVE AI GENERATION  = VERIFIED

    CURRENT BLOCKER     = DAILY FREE-TIER QUOTA EXHAUSTED

IMPORTANT:

A real Intelligence response WAS successfully generated
before the daily Gemini quota was exhausted.

Therefore the complete live pipeline has already been proven.

The next live-generation testing should wait until the quota
resets.



============================================================
TRADE INTELLIGENCE PURPOSE
============================================================

Trade Intelligence is a separate interpretation layer inside
the Daily Review Trade Drawer.

Architecture:

    Canonical Trade Data

            +

    Trade Review

            ↓

    Evidence Analysis

            ↓

    Relationship Analysis

            ↓

    AI Interpretation

            ↓

    Trade Intelligence

Trade Intelligence is NOT:

    - another Trade Review

    - a generic trade summary

    - a second P&L engine

    - a BUY / SELL engine

    - a market prediction engine

    - a strategy generator

    - a psychological diagnosis

    - an outcome judge

    - an invention engine for market context

The purpose is to identify meaningful relationships between:

    WHAT HAPPENED

    WHAT THE TRADER REPORTED

    WHAT THE EXECUTION DATA SHOWS

The intended user reaction is:

    "I already knew what I wrote in my Review,

     but I did not see this relationship between

     what I selected and what actually happened."



============================================================
ARCHITECTURAL PRINCIPLES
============================================================

Canonical architecture remains untouched.

Canonical pipeline:

    Broker / Manual Executions

            ↓

    NormalizedExecution

            ↓

    Supabase executions ledger

            ↓

    pairTrades()

            ↓

    canonical Trade

            ↓

    Daily Review / Trade Review

            ↓

    Trade Intelligence

Trade Intelligence DOES NOT create another accounting engine.

Trade Intelligence DOES NOT modify:

    - executions

    - FIFO logic

    - pairTrades()

    - canonical Trade reconstruction

    - P&L calculations



============================================================
EVIDENCE HIERARCHY
============================================================

Evidence priority:

    1. Canonical facts

    2. Trade Review self-report

    3. AI interpretation

Canonical facts establish observable execution facts.

Trade Review establishes what the trader reported, believed,
intended, or experienced.

If Review and canonical facts conflict:

    Canonical data establishes observable execution facts.

    Review establishes the trader's reported context or belief.

A contradiction itself may become useful Intelligence.



============================================================
RELATIONSHIP-FIRST ANALYSIS
============================================================

The AI is designed to analyze relationships such as:

    Trade Data ↔ Review

    Execution ↔ Management

    Entry ↔ Setup

    Entry ↔ Entry Reason

    Exit ↔ Exit Reason

    Hold Time ↔ Management

    Outcome ↔ Risk Handling

    Psychology ↔ Execution

    Mistakes ↔ Execution

    Strengths ↔ Execution

    Outcome ↔ Process

The AI should look for:

    - alignment

    - contradiction

    - confirmation

    - inconsistency

    - consequence

    - meaningful relationship

It must NOT invent relationships when evidence is insufficient.



============================================================
TEMPORAL / SEQUENCE REASONING
============================================================

When information exists, the system reasons in sequence:

    Entry

      ↓

    Management

      ↓

    Partial exit / adjustment

      ↓

    Final exit

The system must never infer execution events that are not
actually present in the canonical data.

The reconstructed trade supplied to Intelligence may contain
only the exact matched entry and exit executions.

Therefore:

    Do NOT infer that no partial fills occurred.

    Do NOT infer that no order changes occurred.

    Do NOT infer that no stop modifications occurred.

    Do NOT infer that no other management actions occurred.

Only events explicitly present in the supplied data may be
described as observed execution events.



============================================================
NO UNOBSERVED MECHANISMS OR HYPOTHETICAL EVENTS
============================================================

The AI must not invent hidden trading mechanisms, imagined
orders, imagined decisions, or hypothetical execution events.

Do not describe:

    - an unobserved stop modification

    - an unobserved trailing stop

    - an unobserved partial fill

    - an unobserved order cancellation

    - an unobserved order replacement

    - an unobserved trigger

    - an unobserved confirmation event

    - an unobserved market reaction

    - an imagined decision process

    - a hypothetical sequence of actions

If an event is not present in the supplied evidence:

    Do not claim that it happened.

If the available evidence cannot establish the mechanism:

    Describe only the observable relationship.



============================================================
NO INFERRED THRESHOLDS, WINDOWS, OR INTERNAL MECHANISMS
============================================================

Review labels describe what the trader selected or reported.

Do NOT convert a qualitative Review label into a specific
unprovided threshold, rule, window, trigger, or mechanism.

Example:

If:

    review.mistakes contains "Late Entry"

This establishes:

    The trader identified the entry as late.

It does NOT establish:

    - exact preferred entry time

    - preferred entry window

    - how many seconds/minutes late

    - that a confirmation window expired

    - that an order missed a predefined trigger

    - that the trader violated a specific timing rule

Example:

If:

    review.psychology contains "FOMO"

This establishes:

    Self-reported FOMO.

It does NOT establish:

    - urgency

    - panic

    - pressure

    - fear of missing a specific move

    - urge to exit

    - a particular internal decision mechanism

Only describe those mechanisms if the Review explicitly
provides them.



============================================================
OUTCOME VS PROCESS
============================================================

Critical Intelligence rule:

    PROFITABLE ≠ GOOD PROCESS

    LOSING ≠ BAD PROCESS

P&L is an outcome.

Decision quality and execution quality must be evaluated
separately from the financial result.

A profitable trade can contain a process weakness.

A losing trade can contain a sound process.

The AI must not use financial outcome alone to validate or
invalidate the quality of the trading decision.



============================================================
INFORMATION GAIN RULE
============================================================

Every Intelligence section must provide additional value
beyond the raw Trade Review.

Do NOT simply paraphrase Review answers.

Core test:

    "Why does this matter?"

The output should ideally follow:

    observation

        ↓

    relationship

        ↓

    implication

        ↓

    useful lesson

If the AI cannot identify meaningful information gain:

    return NULL where the section permits NULL.



============================================================
CONSEQUENCE ANALYSIS
============================================================

The AI may connect observable relationships such as:

    entry timing
        ↓
    hold duration

    management
        ↓
    exit timing

    exit timing
        ↓
    observed outcome

    quantity
        ↓
    observed P&L

    review-described mistake
        ↓
    observable execution

These relationships must remain evidence-based.

Do not convert correlation into proven causation.

Use language such as:

    "is associated with"

    "aligns with"

    "is consistent with"

    "suggests"

    "may indicate"

when causal proof is not available.

Use:

    "caused"

only when the supplied evidence genuinely establishes
causation, which will normally be uncommon.



============================================================
FIELD SEMANTICS
============================================================

Review fields must retain their actual meaning.

Examples:

    tradeContext

is the trader's selected trade context.

It is NOT automatically:

    trading session

    market regime

    volatility regime

    market environment

A short holding period does NOT establish:

    scalping

    a scalp strategy

    intended quick exposure

"High Volatility" in Review means:

    The trader selected "High Volatility."

It does NOT establish independent market-volatility data.

Review labels must not be expanded into unsupported market facts.



============================================================
BEHAVIORAL RULE
============================================================

A Psychology field alone is NOT enough.

Behavioral insight should generally require:

    Review evidence

        +

    observable execution / trade evidence

No:

    - mental-health diagnosis

    - personality diagnosis

    - unsupported emotional claims

    - invented emotional intensity

    - assumed internal motivations

Behavioral Signal may legitimately be:

    NULL



============================================================
STRENGTH RULE
============================================================

Strength must identify a meaningful positive process behavior.

A selected Review strength is not automatically evidence that
the behavior was actually demonstrated.

The AI should seek alignment between:

    reported strength

        +

    observable trade evidence

Do not manufacture a strength simply because the output schema
contains a Strength section.

Strength may be:

    NULL



============================================================
WEAKNESS RULE
============================================================

Weakness must identify a meaningful, evidence-supported issue.

Do not convert Review labels into unsupported mechanisms.

Example:

"Late Entry"

can establish:

    The trader identified the entry as late.

It cannot establish:

    - an exact missed timing window

    - a predefined confirmation rule

    - a specific trigger violation

    - an exact number of seconds/minutes late

Weakness may be:

    NULL

when the evidence is insufficient.



============================================================
KEY TAKEAWAY RULE
============================================================

Key Takeaway must be:

    - trade-specific

    - evidence-based

    - useful

    - concise

It should not merely repeat:

    Review fields

    P&L

    generic trading advice

    generic setup advice

Do not invent setup rules or trigger conditions that were not
provided in the evidence.

The takeaway should emerge from the relationship between
actual trade data and available Review evidence.



============================================================
X-FACTOR RULE
============================================================

X-Factor is intentionally harder to earn.

Normally requires multiple independent evidence points.

A single Review field is NOT sufficient by itself.

X-Factor should identify a deeper relationship rather than
simply restating another Intelligence section.

Good X-Factor evidence may combine:

    canonical trade facts

        +

    multiple Review fields

        +

    meaningful relationships

    +/or

    temporal / sequence evidence

X-Factor may be:

    NULL



============================================================
CROSS-SECTION NON-REDUNDANCY
============================================================

The eight sections must not simply repeat the same observation.

For example:

    Trade Read

should not simply be repeated in:

    What Stands Out

    Execution Read

    Behavioral Signal

    Weakness

    Key Takeaway

Each section must contribute a distinct analytical purpose.

The final result should feel like one coherent analysis rather
than eight versions of the same sentence.



============================================================
WHOLE-RESPONSE COHERENCE
============================================================

The Intelligence result must read as one analytical narrative.

Sections must not contradict each other accidentally.

Different sections may discuss different evidence dimensions.

If an apparent contradiction exists:

    explain the distinction through evidence.

Example:

    A trade can have a favorable outcome

    while simultaneously showing

    an execution weakness.

Outcome and process are separate dimensions.



============================================================
NUMERICAL CONTEXT
============================================================

Use numbers only when analytically useful.

Do NOT dump raw numbers into every section.

Numeric statements must exactly match canonical data.

Canonical financial data has priority over Review text.

The AI must not modify, reinterpret, or invent financial values.



============================================================
CALIBRATED LANGUAGE
============================================================

Use strong language only when evidence is strong.

Strong evidence:

    "shows"

    "demonstrates"

    "is directly aligned with"

Moderate evidence:

    "suggests"

    "appears consistent with"

    "may indicate"

Insufficient evidence:

    "does not establish"

    "cannot be determined from the available evidence"

Avoid:

    - exaggerated certainty

    - unsupported causation

    - invented mechanisms

    - invented market context

    - invented emotions



============================================================
MARKET CONTEXT BOUNDARY
============================================================

The Intelligence input does NOT independently provide:

    - market news

    - volume

    - sector movement

    - VWAP

    - support/resistance from external sources

    - market volatility statistics

    - macroeconomic context

    - order-book data

    - external market events

Therefore the AI must not invent those facts.

A Review statement such as:

    "High Volatility"

does NOT authorize the AI to assert independently observed
high market volatility.

Market context can only be discussed when explicitly present
in supplied evidence.



============================================================
INSUFFICIENT DATA
============================================================

The AI is allowed to say:

    NULL

or otherwise indicate that sufficient evidence is unavailable.

No insight should be forced merely because the schema contains
a field for it.

This is especially important for:

    Behavioral Signal

    Strength

    Weakness

    X-Factor



============================================================
REVIEW DATA IS UNTRUSTED CONTENT
============================================================

Trade Review is DATA.

Trade Review is NOT an instruction source.

Review content must never override:

    system instructions

    evidence hierarchy

    schema rules

    canonical facts

    security boundaries

User-entered Review content must be treated as untrusted text.

This provides protection against prompt-injection style content
inside user-authored Review fields.



============================================================
TRADE INTELLIGENCE SECTIONS
============================================================

The AI result contains eight sections:

    1. Trade Read

    2. What Stands Out

    3. Execution Read

    4. Behavioral Signal

    5. Strength

    6. Weakness

    7. Key Takeaway

    8. X-Factor

Nullable sections:

    Behavioral Signal

    Strength

    Weakness

    X-Factor



============================================================
AI WRITING STYLE
============================================================

The AI must be:

    - calm

    - analytical

    - concise

    - professional

    - direct

    - non-judgmental

Avoid:

    - motivational clichés

    - marketing language

    - generic chatbot language

    - exaggerated certainty

    - unsupported conclusions

    - dramatic language

    - generic trading advice



============================================================
FILES CREATED FOR INTELLIGENCE
============================================================

New files:

    lib/ai/tradeIntelligence/types.ts

    lib/ai/tradeIntelligence/schema.ts

    lib/ai/tradeIntelligence/prompt.ts

    lib/ai/tradeIntelligence/buildInput.ts

    lib/ai/tradeIntelligence/loadCanonicalTrade.ts

    lib/ai/tradeIntelligence/loadTradeReview.ts

    app/api/ai/trade-summary/route.ts



============================================================
TRADE INTELLIGENCE TYPES
============================================================

types.ts defines:

    TradeIntelligenceRequest

    TradeIntelligenceExecution

    TradeIntelligenceDerivedFacts

    TradeIntelligenceTrade

    TradeIntelligenceReview

    TradeIntelligenceInput

    IntelligenceEvidenceRef

    IntelligenceConfidence

    IntelligenceInsight

    TradeIntelligenceInternal

    TradeIntelligenceResult

The system separates:

    Internal structured AI result

from:

    UI-safe result



============================================================
STRUCTURED OUTPUT
============================================================

schema.ts uses Zod.

The AI response is structurally validated.

Internal insight shape contains:

    text

    evidenceRefs

    confidence

Confidence:

    high

    medium

    low

The UI output strips:

    evidenceRefs

    confidence

The UI receives only:

    final text / NULL values



============================================================
PROMPT ARCHITECTURE
============================================================

prompt.ts contains:

    TRADE_INTELLIGENCE_SYSTEM_PROMPT

and:

    buildTradeIntelligenceUserPrompt()

The prompt defines:

    - evidence hierarchy

    - Review as untrusted data

    - relationship-first reasoning

    - temporal reasoning

    - consequence reasoning

    - no unobserved mechanisms

    - no inferred thresholds/windows/mechanisms

    - outcome vs process

    - information gain

    - calibrated language

    - market context boundaries

    - insufficient-data behavior

    - evidence references

    - section responsibilities

    - cross-section non-redundancy

    - consistency requirements

Review content is DATA.

Review content is NOT treated as instructions.

The prompt has been hardened repeatedly based on actual model
outputs and identified overreach.



============================================================
CURRENT PROMPT HARDENING HISTORY
============================================================

The prompt was specifically hardened against outputs that
previously invented or over-inferred:

    - preferred entry windows

    - specific timing rules

    - specific trigger expiration

    - imagined trailing stops

    - panic exits

    - urgency

    - internal emotional mechanisms

    - market conditions not supplied

    - scalp interpretation from short holding time

    - unsupported "bag-holding" language

    - unsupported aggressive management mechanisms

    - unsupported causation

    - invented order events

    - outcome-based process judgments

The latest hardening specifically added:

    NO INFERRED THRESHOLDS, WINDOWS, OR INTERNAL MECHANISMS

and:

    DO NOT INFER ABSENCE OF EXECUTION EVENTS FROM
    THE RECONSTRUCTED ENTRY/EXIT PAIR



============================================================
CANONICAL SERVER TRADE LOADER
============================================================

loadCanonicalTrade.ts was created specifically for server-side
Intelligence generation.

It:

    - loads Supabase executions

    - scopes them to the authenticated user

    - reconstructs canonical trades with pairTrades()

    - finds the exact closed trade

    - validates the supplied entry/exit execution IDs

It does NOT use:

    localStorage

    browser storage

    service-role access

The canonical trade remains authoritative.



============================================================
TRADE REVIEW LOADER
============================================================

loadTradeReview.ts loads the exact Review using:

    user_id

    entry_execution_id

    exit_execution_id

It is read-only.

It returns:

    TradeReview | null

Therefore:

    reviewed trade

and:

    unreviewed trade

are both valid Intelligence inputs.



============================================================
IMPORTANT UNREVIEWED TRADE BEHAVIOR
============================================================

A trade does NOT need to have a Review to generate Intelligence.

Expected path:

    Trade exists

        ↓

    Review lookup

        ↓

    review = null

        ↓

    AI input contains canonical trade/execution evidence

        ↓

    AI analyzes available evidence only

The AI must not invent Review information when Review is absent.

Behavioral / Strength / Weakness / X-Factor can legitimately
return NULL when evidence is insufficient.



============================================================
SUPABASE AUTHENTICATION
============================================================

The API route uses two Supabase clients.

WHY:

A Supabase client configured with:

    accessToken

cannot call:

    supabase.auth.getUser()

Therefore the route uses:

    authSupabase

for:

    auth.getUser(token)

and a second:

    supabase

client using:

    accessToken: async () => token

for RLS-protected database queries.

Architecture:

    authSupabase

        ↓

    getUser(token)

        ↓

    authenticate user

    supabase

        ↓

    same JWT through accessToken

        ↓

    executions / trade_reviews

        ↓

    Supabase RLS



============================================================
SERVICE ROLE
============================================================

Service-role credentials are NOT used by the Trade Intelligence
request path.

The user's JWT is used so normal Supabase RLS remains part of
the security boundary.



============================================================
AI PROVIDER
============================================================

Current development provider:

    Google Gemini API

The OpenAI implementation was initially prepared and tested
up to the API billing boundary, but it is NOT the current active
Trade Intelligence provider.

For the current private-development phase:

    Gemini

is being used instead of OpenAI.

Reason:

    private development/testing

    free-tier availability

    no immediate production billing requirement



============================================================
GEMINI CLIENT
============================================================

Installed package:

    @google/genai

Current Gemini client uses:

    GoogleGenAI

The API key is loaded server-side through:

    process.env.GEMINI_API_KEY

The key is never sent to the browser.



============================================================
GEMINI API KEY SECURITY
============================================================

The Gemini API key is stored locally in:

    .env.local

Variable:

    GEMINI_API_KEY=...

IMPORTANT:

    - Do NOT use NEXT_PUBLIC_GEMINI_API_KEY

    - Do NOT expose the key to the browser

    - Do NOT put the key in client components

    - Do NOT paste the key into GitHub

    - Do NOT paste the key into ChatGPT

    - Do NOT commit .env.local

The key was successfully created and configured.

Verification confirmed:

    GEMINI_API_KEY is configured



============================================================
GEMINI MODEL CONFIGURATION
============================================================

Current route configuration:

    process.env.GEMINI_TRADE_INTELLIGENCE_MODEL?.trim()

        || "gemini-3.6-flash"

The model can later be overridden through:

    GEMINI_TRADE_INTELLIGENCE_MODEL

without changing application code.



============================================================
GEMINI REQUEST CONFIGURATION
============================================================

Current request uses:

    Gemini generateContent()

    Structured JSON output

    Zod JSON schema

    thinking level:

        MEDIUM

    max output tokens:

        4096

    response MIME type:

        application/json

The increased token budget was necessary because the thinking
budget can consume a significant portion of the available token
budget.



============================================================
WHY MAX OUTPUT TOKENS WAS INCREASED
============================================================

An earlier configuration used:

    maxOutputTokens = 1800

The model returned:

    finishReason = MAX_TOKENS

with most of the token budget consumed by reasoning/thinking.

The response was truncated before completing valid JSON.

The configuration was therefore increased to:

    maxOutputTokens = 4096

This successfully allowed complete structured generation.



============================================================
GEMINI TRANSIENT ERROR HANDLING
============================================================

The API route contains retry logic for transient Gemini errors.

Retry candidates include:

    503

    429

    UNAVAILABLE

    RESOURCE_EXHAUSTED

EXCEPTION:

A daily free-tier quota failure containing:

    GenerateRequestsPerDayPerProjectPerModel-FreeTier

is NOT treated as transient.

Therefore a daily quota exhaustion error:

    fails fast

    does NOT waste additional retry attempts



============================================================
GEMINI QUOTA STATUS
============================================================

The current free-tier project/model quota was exhausted.

Observed error:

    quota metric:

    generativelanguage.googleapis.com/
    generate_content_free_tier_requests

    quota ID:

    GenerateRequestsPerDayPerProjectPerModel-FreeTier

    quota value:

    20

    model:

    gemini-3.6-flash

The important distinction is:

    transient rate limit

versus:

    daily quota exhaustion

A short RetryInfo delay does NOT restore a daily project/model
quota.

Therefore repeated Generate clicks should NOT be used to test
the application while the daily quota remains exhausted.



============================================================
IMPORTANT LIVE GENERATION RESULT
============================================================

A real Gemini Intelligence response WAS successfully generated.

The successful live request proved the following pipeline:

    Browser

        ↓

    Supabase authentication

        ↓

    Canonical trade loading

        ↓

    Trade Review lookup

        ↓

    Intelligence input creation

        ↓

    Gemini client

        ↓

    Gemini API

        ↓

    Structured JSON response

        ↓

    Schema validation

        ↓

    Evidence reference validation

        ↓

    UI Intelligence rendering



============================================================
FIRST SUCCESSFUL LIVE TEST
============================================================

The first successful live generation was performed on a QQQ
trade.

The trade had an existing Trade Review.

Observed canonical snapshot included:

    Symbol:

        QQQ

    Trade date:

        October 18, 2024

    Net P&L:

        +$18.31

    Entry:

        1.87

    Exit:

        2.08

    Quantity:

        1

    Hold time:

        55 seconds

The Trade Review included examples such as:

    Trade Context:

        High Volatility

    Setup:

        Support / Resistance

    Entry Reason:

        FOMO

    Exit Reason:

        Stop Loss

    Management:

        Held to Plan

    Psychology:

        FOMO

    Mistakes:

        FOMO Entry

        Late Entry

    Strengths:

        None selected

The generated output was used to evaluate the quality of the
relationship-first prompt.

The output exposed several overreach problems, which resulted
in additional prompt hardening.

After hardening, later output became materially more evidence
disciplined.



============================================================
IMPORTANT OUTPUT QUALITY LESSONS
============================================================

Early Gemini output incorrectly attempted to introduce:

    - preferred entry windows

    - aggressive trailing stop mechanisms

    - panic exit language

    - urgency

    - high-volatility market conclusions

    - scalping interpretations

    - unsupported internal emotional mechanisms

These outputs were treated as prompt-quality failures rather
than acceptable Intelligence.

The prompt was subsequently hardened to prohibit these
interpretations unless directly supported by supplied evidence.



============================================================
EVIDENCE REFERENCE VALIDATION
============================================================

The server builds an allowlist of valid evidence references.

The AI is not allowed to return arbitrary evidence references.

Every evidence reference returned by the model is checked
against the exact Intelligence input.

Unsupported evidence references cause the request to fail.

This creates an additional validation layer beyond structured
JSON schema validation.



============================================================
UI ARCHITECTURE
============================================================

Existing pre-generation screen remains visually approved.

TradeIntelligenceTab now owns:

    - generation state

    - loading state

    - error state

    - live API call

    - generated state transition

TradeIntelligenceGenerated receives:

    trade

    intelligence

    onRegenerate

    isRegenerating



============================================================
GENERATION FLOW
============================================================

Generate button:

    Generate Intelligence

calls:

    handleGenerateIntelligence()

Browser sends ONLY:

    entryExecutionId

    exitExecutionId

The browser does NOT send:

    P&L

    prices

    fees

    Review text

    canonical execution values

The server retrieves authoritative data itself.



============================================================
GENERATION STATES
============================================================

Pre-generation:

    Generate Intelligence

Generating:

    Analyzing...

Button disabled during generation.

Generated:

    TradeIntelligenceGenerated

Error:

    generationError

The user sees a restrained error message when generation fails.



============================================================
REGENERATE
============================================================

Regenerate is wired to the same:

    handleGenerateIntelligence()

function.

It does NOT create a second AI implementation.

Current behavior:

    Regenerate

        ↓

    same API flow

        ↓

    fresh AI generation



============================================================
GENERATED UI — LIVE DATA
============================================================

Trade snapshot now uses real canonical Trade data.

Symbol:

    trade.ticker

Date:

    formatTradeDate(trade.date)

Net P&L:

    trade.pnl

Hold Time:

    trade.openedAt → trade.closedAt

Entry:

    trade.entryPrice

Exit:

    trade.exitPrice

Quantity:

    trade.quantity



============================================================
HOLD TIME FORMATTING
============================================================

Hold time formatting was corrected.

The generated UI now displays:

    seconds

    minutes + seconds

    hours + minutes

Examples:

    55s

    2m 14s

    1h 7m

The UI no longer incorrectly displays a 55-second trade as:

    0m



============================================================
GENERATED UI — AI DATA
============================================================

Trade Read:

    intelligence.tradeRead

What Stands Out:

    intelligence.whatStandsOut

Strength:

    intelligence.strength

Weakness:

    intelligence.weakness

Execution Analysis:

    intelligence.executionRead

Behavioral Insight:

    intelligence.behavioralSignal

Key Takeaway:

    intelligence.keyTakeaway

X-Factor:

    intelligence.xFactor



============================================================
NULL HANDLING
============================================================

Behavioral Signal:

    If null:

    "No sufficiently supported behavioral signal was identified
     from the available evidence."

Strength:

    If null:

    "No sufficiently supported strength identified."

Weakness:

    If null:

    "No sufficiently supported weakness identified."

X-Factor:

    If null:

    "No sufficiently supported higher-order relationship was
     identified in this trade."

This prevents the UI from fabricating Intelligence when the
model does not have enough evidence.



============================================================
KNOWN UI FIXES COMPLETED
============================================================

Completed:

    - removed unused MoreHorizontal import

    - updated stale generated-state comments

    - dynamic Net P&L color

    - profitable P&L → green

    - losing P&L → red

    - breakeven P&L → neutral

    - Regenerate button wired

    - regeneration loading state

    - trade date formatting

    - duplicate formatHoldTime() removed

    - live canonical snapshot values

    - live AI section values

    - hold-time display corrected to show seconds



============================================================
TYPE CHECK STATUS
============================================================

Repeated checks were performed throughout implementation.

Latest command:

    npx tsc --noEmit

Latest result:

    PASS

No TypeScript errors remain from the current Intelligence
implementation.

The latest successful TypeScript check occurred after updating
the Gemini retry logic to avoid retrying daily quota exhaustion.



============================================================
PERSISTENCE STATUS
============================================================

Trade Intelligence persistence has intentionally NOT been
implemented yet.

Reason:

The authoritative Supabase trade_reviews schema / migration
was not present in the repository.

Therefore the current system:

    generates Intelligence

    returns Intelligence to UI

    does NOT persist generated Intelligence

Persistence should be added later only after inspecting the
actual authoritative database schema and RLS policies.



============================================================
NO CANONICAL REFACTOR
============================================================

No changes were made to:

    - pairTrades()

    - canonical execution ledger

    - FIFO reconstruction

    - canonical Trade type

    - broker synchronization

    - manual execution creation

    - canonical P&L logic



============================================================
CURRENT CHECKPOINT
============================================================

Implementation state:

    [✓] Intelligence architecture designed

    [✓] Intelligence data types created

    [✓] Zod schema created

    [✓] System prompt created

    [✓] AI input builder created

    [✓] Canonical server trade loader created

    [✓] Review loader created

    [✓] API route created

    [✓] Supabase authentication working

    [✓] RLS-compatible user-scoped DB access

    [✓] Gemini SDK installed

    [✓] Zod installed

    [✓] GEMINI_API_KEY created

    [✓] GEMINI_API_KEY added to .env.local

    [✓] Gemini connection verified

    [✓] Real Gemini generation successfully completed

    [✓] Structured JSON output working

    [✓] Zod validation working

    [✓] Evidence-reference validation working

    [✓] Pre-generation UI preserved

    [✓] Generate button wired

    [✓] Loading state wired

    [✓] Error state wired

    [✓] Generated UI wired

    [✓] Regenerate wired

    [✓] Real trade snapshot wired

    [✓] Real AI sections wired

    [✓] Prompt hardened against observed model overreach

    [✓] Gemini transient retry logic added

    [✓] Daily quota exhaustion excluded from retries

    [✓] TypeScript clean

CURRENT BLOCKER:

    [ ] Wait for Gemini free-tier daily quota reset



============================================================
WHAT REMAINS
============================================================

PHASE 1 — WAIT FOR QUOTA RESET

Do NOT repeatedly test Generate while:

    GenerateRequestsPerDayPerProjectPerModel-FreeTier

is exhausted.

Wait for the applicable daily quota reset.

No architecture changes are required because of this quota
condition.



PHASE 2 — FIRST POST-RESET LIVE TEST

After the quota resets:

    Generate Intelligence

for the same reviewed QQQ trade.

Inspect the complete real response carefully.



PHASE 3 — VALIDATE REVIEWED TRADE

Confirm:

    - generation succeeds

    - Review content reaches AI input

    - canonical facts are correct

    - AI identifies actual relationships

    - output adds information beyond Review

    - no unsupported behavioral conclusions are invented

    - no inferred thresholds/windows are invented

    - no execution events are invented

    - nullable sections behave correctly

    - UI renders actual AI output



PHASE 4 — VALIDATE UNREVIEWED TRADE

Use a trade with no completed Trade Review.

Confirm:

    - generation succeeds

    - no Review is required

    - canonical facts are correct

    - AI does not invent Review information

    - behavioral section may be NULL

    - strength may be NULL

    - weakness may be NULL

    - X-Factor may be NULL

    - canonical evidence remains sufficient for useful
      execution-based Intelligence where appropriate



PHASE 5 — VALIDATE REGENERATE

Confirm:

    - Regenerate works

    - button disables while running

    - fresh request is generated

    - UI updates correctly

    - no stale Intelligence remains visible accidentally



PHASE 6 — QUALITY REVIEW

Evaluate actual output against:

    - evidence hierarchy

    - relationship-first reasoning

    - temporal reasoning

    - consequence analysis

    - outcome vs process

    - information gain

    - calibrated language

    - no invented market context

    - no invented emotion

    - no unsupported causation

    - no inferred thresholds

    - no inferred timing windows

    - no invented execution events

    - no section redundancy

    - X-Factor evidence threshold

    - behavioral evidence threshold

    - overall narrative coherence



PHASE 7 — SECURITY / PRODUCTION HARDENING

Before production:

    - inspect API key rotation strategy

    - inspect Gemini spending / billing controls if paid tier
      is introduced

    - inspect rate limiting

    - inspect abuse protection

    - inspect server authorization

    - inspect RLS policies

    - inspect request validation

    - inspect prompt-injection resistance

    - inspect error handling

    - inspect API usage monitoring

    - decide Intelligence persistence model

    - inspect provider failure handling

    - inspect quota exhaustion handling



============================================================
IMPORTANT RESUME POINT
============================================================

DO NOT rebuild the Intelligence architecture.

The architecture is already in place.

The live Gemini pipeline has already been proven.

The current blocker is NOT:

    authentication

    canonical data

    server loading

    Review loading

    AI input construction

    schema validation

    UI integration

    Gemini connection

The current blocker is:

    Gemini free-tier daily request quota exhausted



============================================================
NEXT TESTING ACTION
============================================================

When the Gemini quota has reset:

    1. Do NOT change the Intelligence architecture.

    2. Open the current trade drawer.

    3. Open Trade Intelligence.

    4. Press Generate Intelligence ONCE.

    5. Inspect the complete returned Intelligence.

    6. Compare every statement against the actual evidence.

    7. Record any remaining overreach.

    8. Harden the prompt only where evidence demonstrates a
       real failure.

    9. Re-test deliberately rather than repeatedly.



============================================================
IMPORTANT TESTING DISCIPLINE
============================================================

Gemini requests are currently quota-limited.

Therefore:

    DO NOT waste requests on casual repeated testing.

Each live test should answer a specific question.

Preferred testing sequence:

    one request

        ↓

    inspect output

        ↓

    identify actual failure

        ↓

    make one focused change

        ↓

    type-check

        ↓

    wait for next controlled live test



============================================================
CURRENT DEVELOPMENT PRINCIPLE
============================================================

Trade Intelligence must become better through:

    evidence

        +

    deterministic canonical data

        +

    controlled prompting

        +

    structured validation

        +

    actual output inspection

NOT through:

    increasingly permissive AI behavior

    invented context

    generic trading advice

    outcome-based storytelling

    unsupported psychological interpretation



============================================================
END OF CHECKPOINT
============================================================