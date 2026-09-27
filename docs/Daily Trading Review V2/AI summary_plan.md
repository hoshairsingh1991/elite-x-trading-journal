```text
============================================================
ELITE X TRADING JOURNAL
TRADE INTELLIGENCE — SUMMARY MASTER NOTES
============================================================

PURPOSE
------------------------------------------------------------

Trade Intelligence is a separate interpretation layer that sits
on top of the canonical Trade data and the user's Trade Review.

Its purpose is NOT to repeat the Review.

Its purpose is to analyze the relationship between:

    Canonical Trade Data
            +
       Trade Review
            ↓
      AI Interpretation
            ↓
     Meaningful Intelligence

The final result should feel like analysis of the trade rather
than an AI-generated summary of form selections.

============================================================
1. CORE PRINCIPLE
============================================================

Trade Intelligence must ADD interpretation.

It must NOT simply concatenate, paraphrase, or restate:

    - Trade Context
    - Setup
    - Entry Reason
    - Exit Reason
    - Trade Management
    - Psychology
    - Mistakes
    - Strengths

Example of BAD Intelligence:

    Setup: Breakout
    Entry Reason: Momentum
    Exit Reason: Target Hit
    Strength: Followed Plan

This is only a restatement of the Review.

That is NOT considered meaningful Intelligence.

Example of GOOD Intelligence:

    The trade aligned with the selected breakout setup and the
    recorded execution shows that the position remained intact
    long enough for momentum to develop. The management choices
    indicate the trader stayed aligned with the original plan,
    while the exit timing suggests the trade was managed around
    realized momentum rather than exited immediately after entry.

The exact wording will depend on the actual trade data.

The AI must connect evidence and identify relationships,
contrasts, patterns, strengths, weaknesses, and meaningful
observations that are not directly stated in the Review.

============================================================
2. WHAT THE AI SHOULD ANALYZE
============================================================

Trade Intelligence should combine available evidence from:

    CANONICAL TRADE DATA
    --------------------------------------------------------
    - Entry information
    - Exit information
    - Position direction
    - Quantity
    - Entry price
    - Exit price
    - Hold duration
    - Realized P&L
    - Gross P&L
    - Fees / commissions
    - Execution sequence
    - Partial entry / partial exit information
    - Other trusted canonical trade facts available to the AI


    TRADE REVIEW
    --------------------------------------------------------
    - Trade Context
    - Setup
    - Entry Reason
    - Exit Reason
    - Trade Management
    - Psychology
    - Mistakes
    - Strengths

The AI should use the combination of these inputs rather than
treating either source independently.

============================================================
3. INTELLIGENCE SUMMARY SECTIONS
============================================================

The planned Intelligence Summary contains the following:

------------------------------------------------------------
3.1 TRADE READ
------------------------------------------------------------

Purpose:

Explain what the trade actually says when the canonical trade
data and the completed Review are considered together.

This is the high-level interpretation of the specific trade.

It should answer:

    "What is the overall read on this trade?"

It should be specific to the actual evidence.

It should NOT be a generic motivational statement.

------------------------------------------------------------
3.2 WHAT STANDS OUT
------------------------------------------------------------

Purpose:

Identify the most meaningful relationship, contrast, or
observation in the trade.

Examples of the type of insight this section may surface:

    - A mismatch between the intended setup and actual execution
    - A management decision that materially affected the outcome
    - A strong alignment between plan and execution
    - A notable relationship between hold time and exit behavior
    - A contradiction between selected psychology and execution
    - A meaningful trade-management decision that changed the result

This should be one of the most useful analytical sections.

------------------------------------------------------------
3.3 EXECUTION READ
------------------------------------------------------------

Purpose:

Interpret how the trade was actually entered, managed, and exited
relative to the evidence available.

It should consider the relationship between:

    - Entry
    - Exit
    - Execution sequence
    - Management decisions
    - Trade outcome
    - Review selections

It should not merely repeat "clean execution" or "early exit."

It should explain WHY the execution matters.

------------------------------------------------------------
3.4 BEHAVIORAL SIGNAL
------------------------------------------------------------

Purpose:

Identify a meaningful behavioral observation when the evidence
supports one.

This can connect:

    - Psychology selections
    - Mistakes
    - Strengths
    - Entry behavior
    - Exit behavior
    - Management behavior

The AI must only produce a Behavioral Signal when there is
sufficient supporting evidence.

This field may legitimately be:

    null

when there is no reliable behavioral observation to make.

The AI must NOT diagnose the trader psychologically.

The AI must NOT invent emotional states that are not supported
by the available evidence.

------------------------------------------------------------
3.5 STRENGTH
------------------------------------------------------------

Purpose:

Identify one meaningful thing the trader did well.

The strength should be supported by the actual trade and Review.

It should provide interpretation rather than simply repeat:

    "Followed Plan"

For example, if the Review says "Followed Plan," the AI should
explain what the trader actually did that demonstrates alignment
with the plan.

------------------------------------------------------------
3.6 WEAKNESS
------------------------------------------------------------

Purpose:

Identify one meaningful weakness, inconsistency, or execution issue
that is actually supported by the evidence.

The AI should explain the issue rather than merely restating:

    "Early Exit"
    "FOMO Entry"
    "Moved Stop"

If no meaningful weakness is supported by the evidence, the AI
should avoid manufacturing one.

------------------------------------------------------------
3.7 KEY TAKEAWAY
------------------------------------------------------------

Purpose:

Produce the single most important lesson from this specific trade.

This should be:

    - concise
    - specific
    - evidence-based
    - useful for future reflection

It should not become generic trading advice.

The Key Takeaway should describe what THIS trade teaches.

------------------------------------------------------------
3.8 X-FACTOR
------------------------------------------------------------

Purpose:

Provide the deeper or less-obvious insight.

This is intended to be the premium part of Trade Intelligence.

The X-Factor should capture something that would be easy to miss
if the user simply looked at:

    - the Trade
    - the Review selections
    - the raw numbers

It should emerge from relationships between multiple pieces of
evidence.

The X-Factor should make the Intelligence feature feel different
from a normal AI recap.

It must NOT be a fabricated "hidden truth."

It must be grounded in the available trade and review evidence.

============================================================
4. INTERNAL STRUCTURED OUTPUT
============================================================

The planned internal AI response structure is:

{
  tradeRead: string;
  whatStandsOut: string;
  executionRead: string;
  behavioralSignal: string | null;
  strength: string | null;
  weakness: string | null;
  keyTakeaway: string;
  xFactor: string;
}

Each field represents a distinct analytical purpose.

The final UI may present these sections with different visual
hierarchy, but the underlying conceptual structure remains the same.

============================================================
5. INTELLIGENCE MUST BE TRADE-SPECIFIC
============================================================

Different trades must produce materially different Intelligence
when their evidence is different.

Identical Review selections must NOT automatically produce
identical summaries.

For example:

    Trade A:
        same Review selections
        different hold time
        different execution sequence
        different P&L
        different entry/exit relationship

    Trade B:
        same Review selections
        different canonical trade facts

The Intelligence should reflect those differences.

The AI should use canonical trade facts as meaningful evidence.

At the same time:

    Identical underlying evidence
            →
    Same underlying conclusion

The AI should not manufacture differences simply to make two
summaries appear unique.

Different wording is acceptable on regeneration, but the underlying
analytical conclusion must remain consistent with the evidence.

============================================================
6. WHAT INTELLIGENCE IS NOT
============================================================

Trade Intelligence is NOT:

    - A copy of the Trade Review
    - A field-by-field restatement of the Review
    - A generic AI motivational message
    - A BUY / SELL engine
    - A market prediction engine
    - A strategy generator
    - An automated trade recommendation system
    - A replacement for the canonical P&L engine
    - A psychological diagnosis
    - A source of invented emotional states
    - A source of invented market conditions
    - A source of invented facts

Trade Intelligence should remain a constrained reflection and
interpretation engine.

============================================================
7. EVIDENCE / FACTUALITY RULE
============================================================

The AI must never invent information.

Every meaningful statement should be grounded in one or more of:

    - Canonical Trade data
    - Trade Review data
    - Trusted derived values available from the canonical system

The AI must NOT claim that something happened if the source data
does not establish it.

Examples of prohibited invention:

    - "The market suddenly became volatile"
      when volatility data is not supplied

    - "You felt anxious during the trade"
      when Psychology does not establish that

    - "You saw strong buying pressure"
      when no such evidence is available

    - "The breakout failed because of news"
      when no news/catalyst evidence is available

When evidence is insufficient, the AI should acknowledge that
limitation rather than fill the gap with speculation.

============================================================
8. RELATIONSHIP-FIRST ANALYSIS
============================================================

The Intelligence engine should prioritize relationships between
data points.

The strongest insights may come from comparing:

    Trade Data ↔ Review
    Execution ↔ Management
    Entry ↔ Setup
    Exit ↔ Exit Reason
    Hold Time ↔ Management
    Outcome ↔ Risk Handling
    Psychology ↔ Execution
    Mistakes ↔ Actual execution behavior
    Strengths ↔ Actual execution behavior

The AI should look for:

    - alignment
    - contradiction
    - confirmation
    - inconsistency
    - consequence
    - meaningful relationship

This relationship-first approach is what separates Intelligence
from a summary.

============================================================
9. UI CONCEPT FOR GENERATED SUMMARY
============================================================

The generated Intelligence page is expected to present the result
with a hierarchy similar to:

    TRADE INTELLIGENCE


    Trade Read
    ------------------------------------------------
    [meaningful interpretation]


    What Stands Out
    ------------------------------------------------
    [important observation]


    Execution Read
    ------------------------------------------------
    [execution interpretation]


    Behavioral Signal
    ------------------------------------------------
    [behavioral observation, when supported]


    Strength
    ------------------------------------------------
    [supported strength]


    Weakness
    ------------------------------------------------
    [supported weakness]


    KEY TAKEAWAY
    ------------------------------------------------
    [single most important lesson]


    X-FACTOR
    ------------------------------------------------
    [deeper / less-obvious insight]

The UI should visually distinguish major insight sections rather
than presenting one large undifferentiated paragraph.

X-Factor and Key Takeaway should have stronger visual hierarchy
because they represent the highest-value outputs.

============================================================
10. FINAL QUALITY TEST
============================================================

An Intelligence result should pass the following test:

    "Could a user have created this exact output simply by
     concatenating the Review selections?"

If the answer is YES:

    The output is not intelligent enough.

If the answer is NO, and the output instead demonstrates that the
AI connected actual trade evidence with Review evidence to produce
a new, supported interpretation:

    The output is behaving as intended.

A second test:

    "Does every meaningful claim have evidence in the Trade or
     Review data?"

If NO:

    Remove or revise the unsupported claim.

A third test:

    "Would a materially different trade produce materially
     different Intelligence?"

If NO:

    The analysis is too generic and must become more
    trade-specific.

============================================================
11. CORE PRODUCT PRINCIPLE
============================================================

Trade Review records what the trader said about the trade.

Trade Intelligence interprets what the trade + review reveal
when considered together.

Therefore:

    REVIEW
        =
    structured self-report


    INTELLIGENCE
        =
    evidence-based interpretation

The Intelligence feature should always preserve this distinction.

============================================================
END OF TRADE INTELLIGENCE SUMMARY MASTER NOTES
============================================================
```
