Do nothing .

# ELITE X TRADING TOOLKIT
 
## Master Product, Architecture &amp; Implementation Plan
 
**Project:** Elite X Trading Journal
**Module:** Trading Toolkit
**Document Type:** Master Planning Specification
**Status:** Approved planning direction — implementation pending
**Platform:** Next.js, React, TypeScript, Tailwind CSS, Supabase, Vercel
**Primary Objective:** Build a professional, institutional-style trading decision-support workstation.
 
***
 
# 1. PRODUCT VISION
 
## 1.1 Purpose
 
Trading Toolkit will become a first-class module inside Elite X Trading Journal.
 
It is not intended to be a random collection of financial calculators. It should become a professional workstation that traders use before entering trades to quantify risk, examine possible price movements, evaluate trade characteristics, and understand established market measurements.
 
The product must help traders make more informed decisions without pretending to predict the future.
 
**Core principle: Quantify possible outcomes, explain the evidence, expose assumptions, and preserve the trader's responsibility for the decision.**
 
## 1.2 Elite X trading lifecycle
 
Elite X should eventually support the trader throughout the complete trading lifecycle.
 
**Before the trade — Trading Toolkit**
 
- Calculate potential price movements.
- Evaluate risk and reward.
- Calculate position size.
- Examine options breakeven and expected movement.
- Understand market volatility and drawdown scenarios.
- Prepare for different possible market outcomes.

 
**During the trade — Execution, Market Tools and Open Positions**
 
- Monitor relevant instruments and positions.
- Review exposure and risk.
- Access market information and watchlists.
- Eventually connect calculations with live market context where justified.

 
**After the trade — Trading Journal, Analytics and Reports**
 
- Record executed trades.
- Analyze performance.
- Review execution quality and trading behavior.
- Compare actual results with trading plans.
- Identify patterns and areas for improvement.

 
The Toolkit should complement the existing journal and analytics systems rather than duplicate or replace them.
 
## 1.3 Product positioning
 
Traditional trading journals primarily help answer:
 
"What happened?"
 
Elite X should also help answer:
 
"What could happen under different scenarios, what would that mean for my risk, and what should I evaluate before entering a trade?"
 
The Toolkit provides quantitative context and decision support. It does not guarantee profitable trades.
 
***
 
# 2. PRODUCT DESIGN PHILOSOPHY
 
The Toolkit should feel like a professional financial workstation inspired by the information hierarchy and density of institutional trading software.
 
Design references:
 
- Interactive Brokers
- Bloomberg Terminal
- TradingView
- Institutional risk-management systems

 
These are design references, not interfaces to copy.
 
## 2.1 Visual principles
 
- Professional and restrained.
- Information-dense without becoming cluttered.
- Typography-first hierarchy.
- Precise alignment and spacing.
- Fast interaction and immediate feedback.
- Neutral surfaces and limited accent colors.
- Strong distinction between inputs, results, assumptions and warnings.
- Clear numerical formatting and visible units.
- No unnecessary decorative elements.
- No consumer-fintech or generic dashboard-template appearance.

 
## 2.2 Color system
 
**Elite X Purple**
 
- Active navigation.
- Selected states.
- Focus states.
- Primary actions where necessary.

 
**Green**
 
- Positive results.
- Favorable movement.
- Positive performance.

 
**Red**
 
- Negative movement.
- Losses.
- Relevant warnings.

 
**Neutral greys**
 
- Standard content.
- Secondary information.
- Dividers and backgrounds.
- Explanatory text.

 
Color must never be the only way information is communicated.
 
## 2.3 Corner radius and component consistency
 
Follow Elite X's established visual conventions, including the preferred 8px corner radius where applicable.
 
Inputs, cards, buttons, popovers and modal interfaces must use consistent sizing, typography, borders, spacing and interaction states.
 
***
 
# 3. TOOLKIT PAGE ARCHITECTURE
 
## 3.1 Overall layout
 
The Toolkit will live inside the existing Elite X application.
 
The existing Elite X sidebar must remain unchanged.
 
The Toolkit page will use three logical columns:
 
**Column 1 — Existing Elite X Sidebar**
 
- Existing application navigation.
- No changes to its behavior or architecture as part of this feature.

 
**Column 2 — Toolkit Navigator**
 
- Toolkit title.
- Tool search.
- Favorites.
- Categories.
- Tool list.
- Future recently used section.
- Collapsible navigation.

 
**Column 3 — Workspace**
 
- Displays the selected tool.
- Contains the active calculator and its associated explanations.
- Replaces the previous tool's content without a full page reload.

 
## 3.2 Persistent navigation
 
The Toolkit Navigator should remain visible while the user switches between tools.
 
The navigator must support:
 
- Instant search filtering.
- Favorites.
- Category filtering.
- Active tool highlighting.
- Collapsing and expanding.
- A scalable tool registry.
- Future categories without redesigning the entire page.

 
The architecture should support 50 or more tools without hardcoded navigation logic for every individual calculator.
 
## 3.3 Toolkit landing page
 
Opening Trading Toolkit should initially display a professional overview rather than automatically opening a calculator.
 
The landing page should include:
 
- Toolkit title and concise description.
- Search.
- Tool categories.
- Professional tool cards.
- Favorites.
- Tool descriptions.
- Future recently used tools.
- Clear navigation into each workspace.

 
Each tool card should communicate the tool's purpose without excessive promotional text.
 
## 3.4 Workspace switching
 
Selecting a tool must update the workspace without a full page reload.
 
Requirements:
 
- Maintain a single active workspace.
- Keep the navigator available.
- Avoid unnecessary remounting of the entire Toolkit.
- Prevent one tool's inputs or results from leaking into another tool.
- Preserve state only where the product explicitly intends it.
- Support browser navigation and deep links where appropriate.
- Use accessible focus management and keyboard navigation.

 
The architecture must remain maintainable as new tools are added.
 
***
 
# 4. STANDARD TOOL INTERFACE
 
Every calculator should follow the same general information hierarchy, adapted where necessary to the tool's requirements.
 
1. Header.
2. Inputs.
3. Primary results.
4. Visualization, when useful.
5. Trading Insight.
6. Formula and calculation steps.
7. Quick Facts.
8. Practical Example.
9. Footer Actions.

 
This is a reusable design standard, not a requirement to display meaningless sections in every tool. If a section is irrelevant to a specific calculation, it should be omitted or adapted rather than filled with generic content.
 
## 4.1 Header
 
Display:
 
- Tool name.
- Concise purpose.
- Relevant market or calculation context.
- Information icon linking to the methodology guide.
- Favorite control.

 
## 4.2 Inputs
 
Input requirements:
 
- Only relevant inputs.
- Professional numeric controls.
- Visible units and currency.
- Clear decimal and percentage formatting.
- Appropriate input validation.
- Sensible defaults only where explicitly defined.
- Clear empty, invalid and incomplete states.
- Support for keyboard entry.
- No misleading values while required inputs are incomplete.

 
Examples:
 
- Stock Price: USD 308.00.
- Implied Volatility: 58.00%.
- Days to Expiration: 4 calendar days.
- Account Size: USD 25,000.
- Maximum Risk: USD 150.
- Entry Price: 100.00.
- Stop Price: 98.00.

 
## 4.3 Instant calculations
 
Calculations should update automatically as the user changes valid inputs.
 
No Calculate button should be required for ordinary deterministic calculators.
 
The interface must:
 
- Recalculate immediately.
- Validate input before presenting a result.
- Avoid stale results while values are changing.
- Avoid divide-by-zero and invalid mathematical operations.
- Handle zero, negative and fractional inputs according to each tool's rules.
- Display errors clearly.
- Prevent malformed or incomplete values from appearing as valid results.

 
A Reset action remains available.
 
## 4.4 Results
 
Primary results must have the strongest visual hierarchy.
 
Use:
 
- Large, readable numbers.
- Appropriate currency and percentage formatting.
- Clear units.
- Relevant secondary metrics.
- Consistent alignment.
- Distinct visual treatment for positive and negative values.

 
The result area should be more prominent than the input area when the tool's purpose supports that hierarchy.
 
## 4.5 Visualization
 
Provide visualizations when they materially improve understanding.
 
Examples:
 
- Expected-move ranges.
- Price scenario ladders.
- Risk/reward diagrams.
- Options payoff diagrams.
- Growth curves.
- Historical return distributions.
- Drawdown charts.

 
Visualizations must be mathematically consistent with the displayed results.
 
Do not display a probability distribution when the tool has no defensible probability model.
 
## 4.6 Trading Insight
 
Explain what the results mean in practical terms.
 
Examples:
 
- "A 10% decline from the reference price would place the instrument at this level."
- "The selected target lies outside the model's one-standard-deviation reference range."
- "Your potential loss at the selected stop exceeds your configured risk limit."

 
Trading Insights must be derived from actual inputs and validated calculations.
 
Future dynamic insights must not invent support, resistance, probabilities, market conditions or directional conclusions.
 
## 4.7 Formula and calculation transparency
 
Each relevant tool must explain:
 
- Formula.
- Variable definitions.
- Units.
- Step-by-step calculation.
- Final result.
- Assumptions.
- Known limitations.

 
Example:
 
Expected Move = Price × Implied Volatility × √(Days / 365)
 
The formula should be rendered clearly, with a worked calculation using the actual inputs.
 
## 4.8 Quick Facts
 
Where useful, display:
 
- Used By.
- Best For.
- Difficulty.
- Supported Markets.
- Time Horizon.
- Calculation Type.

 
Calculation Type should distinguish deterministic calculations, model-based estimates and empirical historical statistics.
 
## 4.9 Practical Example
 
Each tool should include at least one verified example.
 
The example must:
 
- Use internally consistent inputs.
- Produce mathematically correct results.
- Explain the result.
- Avoid implying that the example predicts future market behavior.

 
## 4.10 Footer Actions
 
Standard actions:
 
- Copy Results.
- Export PDF.
- Save to Favorites.
- Reset.

 
Only implement actions supported by the tool and current application capabilities.
 
Copy Results should copy a readable summary including inputs, outputs, units and important assumptions.
 
Export PDF should produce a properly formatted, readable report. If implemented, the exported document should identify the tool, calculation time where relevant, input values, results, formula and limitations.
 
Save to Favorites should persist the user's preference.
 
Reset should restore the tool's defined initial state without modifying unrelated tools or saved data.
 
***
 
# 5. TOOL NAVIGATOR
 
## 5.1 Search
 
Search must filter tools instantly.
 
Examples:
 
- "exp" → Expected Move.
- "risk" → Risk/Reward, Position Size, ATR Stop and relevant risk tools.
- "option" → Option Breakeven and future options tools.

 
Search should support tool names, descriptions, categories and relevant keywords.
 
The registry should support additional tools without requiring changes to the search implementation.
 
## 5.2 Favorites
 
Users can star tools.
 
Favorites should:
 
- Appear near the top of the navigator.
- Persist across sessions.
- Be user-specific.
- Update immediately.
- Support removal.
- Avoid duplicate entries.

 
## 5.3 Categories
 
Initial categories:
 
- Risk Management.
- Market Analysis.
- Options.
- Performance.
- Probability.

 
Future categories:
 
- Portfolio.
- Taxes.
- Utilities.
- Technical Analysis.
- Advanced.

 
Categories must be data-driven rather than hardcoded into individual page components.
 
## 5.4 Future recently used tools
 
Recently used tools may be added after the initial release.
 
This should not delay the first version.
 
***
 
# 6. CORE PRODUCT DISTINCTION: THREE TYPES OF MARKET INFORMATION
 
The Toolkit must distinguish three fundamentally different types of output.
 
## 6.1 Deterministic calculations
 
These produce exact results from supplied inputs, subject to arithmetic and model definitions.
 
Examples:
 
- Price after a 5% decline.
- Position size from a specified risk budget and stop distance.
- Risk/reward ratio.
- Expiration breakeven under a defined option payoff model.

 
These calculations do not require historical market data.
 
## 6.2 Model-based estimates
 
These use mathematical assumptions to estimate outcomes or reference ranges.
 
Examples:
 
- Implied-volatility expected moves.
- Standard-deviation reference bands.
- Model-based price distributions.

 
Their outputs depend on assumptions and inputs. They must not be presented as guarantees.
 
## 6.3 Empirical historical statistics
 
These measure outcomes observed in historical market data.
 
Examples:
 
- Frequency of drawdowns.
- Historical forward returns.
- Frequency of touching a threshold within a given horizon.
- Recovery durations.
- Historical volatility distributions.

 
They require a defined dataset, event methodology, sample size and appropriate statistical validation.
 
The interface must never confuse an arbitrary scenario with a historical probability.
 
***
 
# 7. MARKET CORRECTION CALCULATOR
 
## 7.1 Purpose
 
The Market Correction Calculator will be a core feature of the first Toolkit release.
 
It allows a user to enter a ticker and price, then examine hypothetical price levels corresponding to different percentage declines or advances.
 
The purpose is to quantify scenarios, not predict future prices.
 
## 7.2 Supported input methods
 
**Automatic price input**
 
- User enters a ticker such as AAPL, QQQ or GLD.
- The application retrieves a quote from a suitable licensed market-data provider when integration is available.
- The displayed quote must include its source and timestamp.
- Delayed or stale data must be clearly identified.

 
**Manual price input**
 
- User enters the current or reference price.
- The calculator works without a market-data subscription.
- Manual input remains available even if automatic quote retrieval fails.

 
The calculator must not silently substitute a stale quote or a guessed price.
 
## 7.3 Required inputs
 
- Ticker or instrument label.
- Current or reference price.
- Optional recent peak price.
- Scenario direction: decline or advance.
- Percentage or absolute price movement.
- Currency or price-unit context where relevant.

 
The first version does not require a historical dataset.
 
## 7.4 Default scenario levels
 
Declines:
 
- 2%.
- 3%.
- 5%.
- 8%.
- 10%.
- 15%.
- 20%.

 
The user should also be able to enter a custom percentage.
 
These are illustrative scenario levels, not claims that the market will visit them.
 
The UI may adapt the displayed levels to the instrument or user preference, but the underlying calculation must remain deterministic.
 
## 7.5 Outputs
 
- Resulting price at each scenario.
- Absolute price change.
- Percentage change.
- Current drawdown from the entered peak.
- Drawdown from the reference peak after a further hypothetical decline.
- Custom target price.
- Price distance to a manually entered support or resistance level.

 
Example:
 
Reference price: $250.00.
 
5% decline: $250 × (1 − 0.05) = $237.50.
 
10% decline: $250 × (1 − 0.10) = $225.00.
 
20% decline: $250 × (1 − 0.20) = $200.00.
 
These are exact scenario calculations, not forecasts.
 
## 7.6 Correction and bear-market conventions
 
The help content should explain the common convention of approximately:
 
- 10% decline from a recent peak: correction.
- 20% decline from a recent peak: bear market.

 
These are conventions, not universal definitions or reversal signals.
 
A decline of 10% does not imply that the market must recover. It can recover, consolidate or continue falling.
 
The calculator should present the percentages as scenario references and explain their limitations.
 
## 7.7 Visualization
 
Provide a price ladder or scenario chart displaying:
 
- Reference price.
- Hypothetical decline levels.
- Resulting prices.
- Optional manually entered support and resistance levels.
- Selected scenario.

 
The visualization must clearly distinguish actual inputs from hypothetical levels.
 
## 7.8 Scope limitation
 
The first version does not estimate the probability that a selected level will be reached.
 
That requires a separate, validated statistical model.
 
***
 
# 8. EXPECTED MOVE CALCULATOR
 
## 8.1 Purpose
 
Estimate a volatility-based reference range using the underlying price, annualized implied volatility and time horizon.
 
This is a priority V1 tool.
 
## 8.2 Inputs
 
- Underlying price.
- Annualized implied volatility.
- Days to expiration or selected calendar-day horizon.
- Optional manual input or future market-data integration.

 
## 8.3 Core approximation
 
Expected Move ≈ Price × Implied Volatility × √(Days / 365)
 
Variables:
 
- Price: current underlying price.
- Implied Volatility: annualized volatility expressed as a decimal.
- Days: calendar days in the selected horizon.

 
Example:
 
Price = 308.
 
IV = 58% = 0.58.
 
Days = 4.
 
Expected Move ≈ 308 × 0.58 × √(4 / 365).
 
Expected Move ≈ $18.60.
 
Approximate reference range:
 
- Lower: $289.40.
- Upper: $326.60.

 
The example must be verified against the actual implementation and rounding rules before publication.
 
## 8.4 Outputs
 
- Expected move in absolute price units.
- Expected move as a percentage.
- Lower reference level.
- Upper reference level.
- One-standard-deviation reference range.
- Optional two- and three-standard-deviation ranges.
- Visualization.
- Formula and worked calculation.
- Trading Insight explaining the assumptions.

 
## 8.5 Probability interpretation
 
Under a simplified normal-distribution model:
 
- Approximately 68% of outcomes fall within ±1 standard deviation.
- Approximately 95% fall within ±2 standard deviations.
- Approximately 99.7% fall within ±3 standard deviations.

 
These percentages are theoretical normal-distribution reference values, not guaranteed real-market probabilities.
 
The tool must distinguish:
 
- Probability of an outcome at the horizon.
- Probability of touching a level at any point during the horizon.
- The implied movement estimated from option-market volatility.

 
These are not interchangeable.
 
## 8.6 Limitations
 
- Implied volatility does not predict direction.
- Market returns do not always follow a normal distribution.
- Volatility can change.
- Option skew can affect the interpretation.
- Jumps and extreme events can produce movements outside reference ranges.
- A range is not a guaranteed trading boundary.

 
Historical price data is not strictly required when the user supplies implied volatility. Automatic implied-volatility retrieval requires a suitable options-data source and applicable licensing.
 
***
 
# 9. INITIAL TOOL CATALOG
 
The first release should focus on established, frequently useful calculations.
 
## 9.1 Position Size Calculator
 
Inputs:
 
- Account size.
- Maximum risk in currency or percentage.
- Entry price.
- Stop price.
- Instrument type where needed.

 
Outputs:
 
- Position size.
- Dollar risk.
- Position value.
- Actual risk as a percentage of account equity.
- Residual risk-budget information where relevant.

 
The calculation must account for the distinction between shares, futures contracts and other instruments.
 
For shares, basic risk-based sizing is:
 
Position Size = Maximum Risk / Absolute(Entry Price − Stop Price).
 
The executable quantity must be rounded down to a valid unit where appropriate.
 
Futures sizing must include contract point value and tick value.
 
Options sizing must use contract multipliers and the selected risk model.
 
The calculator must explain that stop execution can differ from the selected stop price due to slippage and gaps.
 
## 9.2 Risk/Reward Calculator
 
Inputs:
 
- Entry.
- Stop.
- Target.
- Direction or position type.

 
Outputs:
 
- Risk per unit.
- Potential reward per unit.
- Risk/reward ratio.
- Break-even win rate before costs.
- Optional position-level values.

 
For a simple single-target model:
 
Break-even Win Rate = Risk / (Risk + Reward).
 
This formula assumes binary outcomes with the specified average gain and loss and excludes transaction costs.
 
The tool must validate direction and ensure the stop and target are on the appropriate sides of the entry.
 
## 9.3 ATR Stop Calculator
 
Inputs:
 
- Entry price.
- ATR value.
- ATR multiplier.
- Position direction.

 
Outputs:
 
- ATR distance.
- Suggested stop level.
- Risk per unit.

 
ATR measures historical price movement; it does not predict direction or guarantee a suitable stop.
 
The ATR value may be entered manually in V1. Automatic ATR retrieval requires historical OHLC data and a defined calculation period.
 
## 9.4 Option Breakeven Calculator
 
Inputs:
 
- Call or put.
- Strike.
- Premium.
- Contract multiplier where configurable.

 
Outputs:
 
- Expiration breakeven.
- Maximum loss under the specified long-option payoff model.
- Payoff characteristics.
- Expiration payoff diagram where appropriate.

 
For a standard long call:
 
Breakeven = Strike + Premium.
 
For a standard long put:
 
Breakeven = Strike − Premium.
 
These formulas assume premium and strike are expressed in the same per-share units.
 
The tool must clearly distinguish expiration breakeven from the price at which an option could be sold profitably before expiration.
 
Short options and multi-leg strategies require separate payoff models.
 
## 9.5 IV Move Calculator
 
Purpose:
 
- Compare estimated price movement under different implied-volatility assumptions.

 
Inputs:
 
- Price.
- Time horizon.
- Baseline implied volatility.
- Alternative implied-volatility assumptions.

 
Outputs:
 
- Expected-move estimates.
- Resulting reference ranges.
- Difference between scenarios.

 
This tool should reuse the same validated expected-move calculation engine rather than duplicating formula logic.
 
## 9.6 R-Multiple Calculator
 
Inputs:
 
- Entry.
- Initial stop.
- Exit price.
- Position direction.

 
Outputs:
 
- Initial risk per unit.
- Profit or loss per unit.
- R-multiple.

 
For a valid long or short position:
 
R-Multiple = Realized Profit or Loss / Initial Monetary Risk.
 
The calculation must define whether commissions, fees and slippage are included.
 
## 9.7 Profit &amp; Loss Calculator
 
Inputs:
 
- Entry.
- Exit.
- Quantity.
- Position direction.
- Optional costs.

 
Outputs:
 
- Gross P&amp;L.
- Net P&amp;L when costs are supplied.
- Percentage return.
- Return on specified capital or margin, when defined.

 
The tool must distinguish return on notional exposure from return on allocated capital or margin.
 
## 9.8 Compound Growth Calculator
 
Inputs:
 
- Starting capital.
- Periodic return assumption.
- Number of periods.
- Optional recurring contributions.

 
Outputs:
 
- Projected equity.
- Total growth.
- Growth curve.
- CAGR where applicable.

 
All projections must be labeled as mathematical scenarios based on assumed returns, not forecasts.
 
## 9.9 Future tool candidates
 
Only add after the core framework and V1 tools are stable.
 
- Historical Probability Calculator.
- Monte Carlo Simulator.
- Kelly Criterion.
- Risk of Ruin.
- Portfolio Exposure.
- Correlation Matrix.
- Dollar Cost Averaging.
- Margin Calculator.
- Futures Tick Calculator.
- Pivot Points.
- Fibonacci Calculator.
- Options Strategy Builder.
- Tax Estimator.
- Portfolio Analytics.
- Sector Exposure.
- Volatility Comparison.
- Economic Event Impact.

 
Each future tool requires its own requirements, formulas, validation criteria and limitations.
 
***
 
# 10. MARKET DATA STRATEGY
 
## 10.1 Initial release
 
The first version must work without purchasing a large historical dataset.
 
Manual input will support:
 
- Current or reference price.
- Implied volatility.
- ATR value.
- Entry, stop and target.
- Account size and risk parameters.

 
This avoids unnecessary data costs while enabling useful calculations.
 
## 10.2 Automatic quote retrieval
 
Automatic quote retrieval may be introduced through a licensed provider.
 
Requirements:
 
- Provider selection.
- Supported symbol validation.
- Clear quote timestamps.
- Currency identification.
- Stale-data detection.
- Loading and error states.
- Rate-limit handling.
- Server-side API key management.
- Provider attribution and applicable licensing.
- A manual-input fallback.

 
Do not assume that a market-data subscription permits displaying its data or derived products to SaaS customers.
 
## 10.3 Historical probability analysis
 
A later research phase may use daily OHLCV data for QQQ and other supported instruments.
 
Candidate fields:
 
- Date.
- Open.
- High.
- Low.
- Close.
- Volume.
- Adjusted prices or distribution data where needed.
- Instrument and source metadata.

 
The dataset must be validated for:
 
- Missing dates.
- Duplicate records.
- Incorrect values.
- Corporate actions.
- Adjustments and distributions.
- Time-zone and session definitions.
- Data-source coverage.
- Historical consistency.

 
The research engine must document its source and data limitations.
 
## 10.4 Historical research questions
 
Potential analyses:
 
- Frequency of 5%, 10%, 15% and 20% drawdowns.
- Conditional frequency of reaching a deeper drawdown after an initial decline.
- Forward returns over defined trading horizons.
- Probability of touching a price versus closing beyond it.
- Drawdown duration.
- Recovery duration.
- Historical volatility regimes.
- Distribution of returns under comparable conditions.

 
Definitions must be established before results are calculated.
 
## 10.5 Statistical validation
 
Historical statistics must:
 
- Use explicitly defined event rules.
- Avoid treating heavily overlapping observations as independent events.
- Report sample sizes.
- Quantify uncertainty.
- Consider market-regime changes.
- Avoid look-ahead bias.
- Use out-of-sample or walk-forward evaluation.
- Compare conditional models against simple historical baselines.
- Be calibrated before presenting probability estimates as useful forecasts.

 
The engine must never invent probabilities or display unverified historical results.
 
***
 
# 11. HELP CENTER AND METHODOLOGY
 
A Help Center is part of the original product architecture, not an afterthought.
 
## 11.1 Help Center sections
 
**Getting Started**
 
- What Trading Toolkit does.
- How to use the workspace.
- How to interpret outputs.
- How to use calculations in a pre-trade routine.

 
**Tool Guides**
 
- Individual guides for every calculator.
- Required inputs.
- Worked examples.
- Interpretation.
- Limitations.

 
**Market Concepts**
 
- Implied volatility.
- Historical volatility.
- Standard deviations.
- Expected move.
- Drawdown.
- Correction and bear-market conventions.
- ATR.
- Risk/reward.
- Position sizing.
- Probability.

 
**Methodology &amp; Assumptions**
 
- Formulas.
- Definitions.
- Data sources.
- Units.
- Model assumptions.
- Calculation limitations.
- Statistical methodology.
- Version history.

 
**Risk &amp; Limitations**
 
- Uncertainty.
- Execution risk.
- Slippage.
- Market gaps.
- Model limitations.
- Difference between scenarios and predictions.

 
## 11.2 In-tool explanations
 
Every relevant calculator should provide:
 
- A quick explanation beside the title or metric.
- A link to the full methodology guide.
- Definitions of technical terms.
- Formula transparency.
- Relevant warnings and assumptions.

 
Users should not need to leave the calculator to understand the basic meaning of a result.
 
## 11.3 Single source of truth
 
Calculation logic and documentation must not independently define the same formulas in ways that can drift apart.
 
The architecture should centralize authoritative definitions for:
 
- Formula identifiers.
- Variable names and units.
- Assumptions.
- Output definitions.
- Limitations.
- Documentation references.
- Methodology version.

 
Tests must verify the calculation engine independently of the UI.
 
Documentation should be updated whenever a formula or assumption changes.
 
Previously saved results, where retained, should identify the relevant methodology version when that distinction affects interpretation.
 
***
 
# 12. TECHNICAL ARCHITECTURE
 
## 12.1 Technology stack
 
Use the existing Elite X stack:
 
- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- Supabase.
- Vercel.

 
Do not introduce unnecessary infrastructure or dependencies.
 
## 12.2 Suggested architecture boundaries
 
**Toolkit shell**
 
- Navigator.
- Landing page.
- Workspace selection.
- Shared layout.
- Favorites and search interfaces.

 
**Tool registry**
 
- Stable tool identifiers.
- Names.
- Descriptions.
- Categories.
- Search keywords.
- Routes or workspace identifiers.
- Methodology references.
- Favorite eligibility.

 
**Calculation engine**
 
- Pure TypeScript functions.
- Explicit input and output types.
- Input validation.
- Formula definitions.
- Numeric precision and rounding rules.
- Unit conversion.
- Error handling.

 
**Tool interfaces**
 
- Inputs.
- Results.
- Visualizations.
- Tool-specific insights.
- Methodology links.

 
**Persistence**
 
- Favorites.
- User preferences.
- Saved scenarios where appropriate.
- Future recently used tools.

 
**Market-data services**
 
- Quote retrieval.
- Historical-data ingestion.
- Normalization.
- Source metadata.
- Data validation.
- Caching and error handling.

 
**Research engine**
 
- Historical drawdowns.
- Forward-return calculations.
- Statistical analysis.
- Model validation.
- Probability calibration.

 
## 12.3 Canonical data integrity
 
The Toolkit must not modify or duplicate the canonical accounting and execution logic of Elite X.
 
It must remain isolated from:
 
- Canonical execution ledger.
- FIFO reconstruction.
- Trade reconstruction.
- Existing trade analytics.
- Reporting-currency calculations.
- Existing expense accounting.

 
Future integrations with the journal should be explicit and read-only by default unless a separate workflow is designed.
 
The Toolkit must not create fake trades or alter trade records merely to calculate a scenario.
 
## 12.4 Calculation purity
 
Pure calculation functions should accept explicit inputs and return deterministic outputs.
 
They must not depend on:
 
- React component state.
- Supabase queries.
- Browser storage.
- Implicit global state.
- Network responses.
- UI formatting.

 
This enables unit testing, reuse, reproducibility and reliable validation.
 
## 12.5 Performance
 
- Avoid full-page reloads during tool switching.
- Avoid unnecessary recalculation of unrelated tools.
- Use memoization only where justified.
- Avoid expensive synchronous calculations in the UI.
- Use server-side or background processing for substantial historical analyses.
- Cache market data appropriately while respecting provider rules.
- Keep basic deterministic calculators fast and responsive.

 
## 12.6 Security
 
- Never expose provider API secrets in client-side code.
- Validate and normalize user inputs.
- Validate external symbol and market-data responses.
- Apply authorization and row-level security to persisted user data.
- Avoid unsafe dynamic code execution.
- Keep market-data provider credentials and permissions isolated from user preferences.

 
***
 
# 13. SUPABASE AND USER PREFERENCES
 
Persisted functionality should be introduced only where necessary.
 
Potential user-specific records:
 
- Favorite tool identifiers.
- Display preferences.
- Recently used tools.
- Saved scenario definitions.
- Optional saved calculation summaries.

 
A saved scenario should preserve its inputs and identify its calculation or methodology version.
 
It must not be treated as a live quote or current market state after its original timestamp.
 
Do not create database tables merely to store transient calculator state when local component state is sufficient.
 
Database schemas, policies and migrations must follow the project's existing Supabase conventions.
 
***
 
# 14. QUALITY ASSURANCE AND TESTING
 
A calculator is not complete because its UI renders correctly.
 
## 14.1 Unit tests
 
Every calculation must have tests covering:
 
- Known correct examples.
- Boundary conditions.
- Zero values where valid.
- Invalid inputs.
- Fractional quantities.
- Rounding.
- Long and short direction.
- Currency and unit handling.
- Extreme but valid values.
- Undefined or non-finite outputs.

 
## 14.2 Integration tests
 
Verify:
 
- Input changes update results.
- Invalid inputs do not leave misleading results.
- Tool switching isolates state.
- Favorites persist correctly.
- Search and category filtering work.
- Reset affects only the selected tool.
- Exported reports match displayed results.
- Manual entry works without market-data connectivity.
- API failures are handled without breaking the calculator.

 
## 14.3 Statistical validation
 
For probability and historical tools:
 
- Validate event definitions.
- Test known historical cases.
- Verify the dataset.
- Check sample sizes.
- Detect overlapping observations.
- Evaluate out-of-sample performance.
- Test different market regimes.
- Measure calibration and uncertainty.

 
## 14.4 Build and release checks
 
Before committing:
 
- Run relevant tests.
- Run TypeScript checks.
- Run the production build.
- Review the changed files.
- Check for unintended modifications.
- Update the project's development checkpoint notes.
- Stage the intended changes, including checkpoint notes when updated.
- Use clear commit messages.

 
No feature should be marked production-ready solely because the development build succeeds.
 
***
 
# 15. IMPLEMENTATION ROADMAP
 
## Phase 1 — Requirements and architecture
 
- Review the current Elite X routing and sidebar.
- Identify the appropriate Toolkit route.
- Define the shared tool registry.
- Define workspace and navigator boundaries.
- Establish shared input and result conventions.
- Define methodology metadata.
- Confirm that the existing application remains unchanged outside the intended scope.

 
Deliverable: approved architecture and component plan.
 
## Phase 2 — Toolkit shell
 
- Create the Toolkit page.
- Add the landing page.
- Implement the persistent navigator.
- Implement search.
- Implement categories.
- Implement favorites.
- Add the collapsible navigator.
- Implement workspace switching.
- Establish responsive behavior.
- Implement loading, empty and error states where necessary.

 
Deliverable: functioning Toolkit shell with placeholder tool registrations.
 
## Phase 3 — Shared calculation framework
 
- Numeric input components.
- Unit and currency formatting.
- Input validation.
- Error presentation.
- Result layouts.
- Formula sections.
- Methodology links.
- Reset behavior.
- Copy Results.
- Export infrastructure.
- Favorite persistence.

 
Deliverable: reusable calculator framework.
 
## Phase 4 — Initial risk tools
 
Recommended first tools:
 
1. Position Size Calculator.
2. Risk/Reward Calculator.
3. Profit &amp; Loss Calculator.

 
These establish the core numeric input, validation, result and formula patterns.
 
Deliverable: validated calculators with tests.
 
## Phase 5 — Market Analysis tools
 
Implement:
 
1. Market Correction Calculator.
2. Expected Move Calculator.
3. ATR Stop Calculator.

 
Market Correction Calculator must work with manually entered prices.
 
Expected Move must work with manually entered implied volatility.
 
ATR Stop must work with manually entered ATR.
 
Deliverable: functional market-analysis tools without requiring a purchased historical dataset.
 
## Phase 6 — Options and performance tools
 
Implement:
 
- Option Breakeven.
- IV Move.
- R-Multiple.
- Compound Growth.

 
Deliverable: complete planned V1 calculator set.
 
## Phase 7 — Help Center
 
- Create the Help Center.
- Add tool-specific guides.
- Document formulas.
- Document assumptions.
- Add worked examples.
- Add risk and limitation explanations.
- Link methodology content from each calculator.
- Validate documentation against the calculation engine.

 
Deliverable: integrated educational and methodology experience.
 
## Phase 8 — Favorites, persistence and exports
 
Complete:
 
- Favorite persistence.
- Optional saved scenarios.
- Copy Results.
- PDF export.
- Saved calculation metadata.
- User preference handling.

 
Deliverable: consistent, persistent user experience.
 
## Phase 9 — Historical research
 
Only after the basic Toolkit is stable:
 
- Evaluate historical-data providers.
- Confirm commercial licensing.
- Ingest and validate a suitable dataset.
- Define historical event rules.
- Implement drawdown statistics.
- Implement forward-return analysis.
- Add confidence intervals and sample-size reporting.
- Conduct out-of-sample validation.

 
Deliverable: validated historical-analysis capability.
 
## Phase 10 — Advanced probability
 
Potential future additions:
 
- Monte Carlo.
- Conditional probability.
- Risk of Ruin.
- Kelly Criterion.
- Portfolio exposure.
- Correlation analysis.
- Volatility regime comparisons.

 
Deliverable: advanced analytical tools supported by defensible methodology.
 
***
 
# 16. V1 ACCEPTANCE CRITERIA
 
The initial release is acceptable when:
 
**Navigation**
 
- Toolkit opens within the existing application.
- Existing Elite X sidebar remains unchanged.
- Landing page is functional.
- Search and categories work.
- Navigator remains available while switching tools.
- Favorites work as specified.
- No full-page reload is required for ordinary workspace switching.

 
**Calculations**
 
- All implemented formulas are documented.
- Outputs match independently verified calculations.
- Invalid inputs are handled correctly.
- Currency and units are explicit.
- Results update automatically.
- No misleading stale values remain visible.
- Each tool has a defined reset behavior.

 
**Market Analysis**
 
- Market Correction Calculator works without historical data.
- Users can enter any supported manual instrument label and positive price.
- Percentage scenarios are calculated correctly.
- Expected Move uses validated inputs and explicit assumptions.
- ATR calculations use the specified ATR value and multiplier.
- No unsupported probability claims are displayed.

 
**Help and transparency**
 
- Each implemented tool has a clear explanation.
- Formulas and relevant assumptions are accessible.
- Worked examples are verified.
- Limitations are visible.
- Help content matches actual implementation.

 
**Engineering**
 
- Calculation functions are independently testable.
- Relevant unit and integration tests pass.
- Production build passes.
- API credentials are protected.
- Supabase access is appropriately secured.
- Existing accounting, execution and analytics logic remains unaffected.

 
***
 
# 17. PRODUCT RULES THAT MUST NOT BE VIOLATED
 
1. Never present a hypothetical scenario as a prediction.
2. Never invent a probability to make a tool appear more advanced.
3. Never present normal-distribution bands as guaranteed market boundaries.
4. Never imply that a 10% correction must reverse.
5. Never treat implied volatility as a directional signal.
6. Never confuse the probability of touching a price with the probability of closing beyond it.
7. Never display historical statistics without a defined methodology and verified dataset.
8. Never hide the assumptions that materially affect an output.
9. Never expose market-data credentials in client code.
10. Never mix Toolkit calculations into canonical trade-accounting logic.
11. Never duplicate formula implementations unnecessarily.
12. Never introduce a database dependency for a calculation that can remain deterministic and local.
13. Never add features merely to increase the tool count.
14. Never sacrifice calculation correctness for visual polish.

 
***
 
# 18. LONG-TERM VISION
 
Trading Toolkit should become a core part of Elite X's value proposition.
 
It should provide:
 
- Reliable calculators.
- Transparent formulas.
- Market scenario analysis.
- Risk-management support.
- Volatility context.
- Educational explanations.
- Validated historical research.
- Advanced statistical tools where justified.

 
Over time, a trader should be able to open Elite X before a trade, understand the relevant calculations, evaluate several scenarios, define risk, and then record and analyze the actual trade using the existing journal.
 
The platform should connect preparation, execution and review without making unsupported claims about future market behavior.
 
## Final product principle
 
**Elite X Trading Toolkit helps traders quantify what could happen, understand the assumptions behind the numbers, and prepare for uncertainty.**
 
It does not promise to predict the market.
 
***
 
# 19. NEXT ACTION
 
Before writing production code:
 
1. Review the existing Elite X project structure and routing.
2. Confirm the current sidebar integration point.
3. Inspect existing UI components and design conventions.
4. Finalize the Toolkit route and component boundaries.
5. Implement the Toolkit shell.
6. Build and test the shared calculation framework.
7. Implement the first deterministic calculators.
8. Add the Market Correction Calculator and Expected Move Calculator.
9. Add documentation and methodology.
10. Expand only after the foundations are verified.

 
All implementation decisions must preserve the existing application's architecture, data integrity, visual consistency and long-term maintainability.