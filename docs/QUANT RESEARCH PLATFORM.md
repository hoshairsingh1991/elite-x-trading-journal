# QUANT RESEARCH PLATFORM — FOUNDATION MASTER NOTES
## Architecture, Quantitative Research, Market Data, Backtesting, Live Signals, Risk, Security & Scalability
### Permanent Foundation Reference — 2026

---

# 1. PURPOSE OF THIS DOCUMENT

This document defines the permanent technical and architectural foundation of the Quant Research Platform.

The platform will be a private quantitative research and trading decision-support system designed to:

- Research systematic trading strategies.
- Analyze GLD (SPDR Gold Shares) and XAU/USD.
- Develop and evaluate algorithmic trading strategies.
- Perform rigorous historical backtesting.
- Generate live market signals from the initial architecture.
- Record and evaluate prospective signals as they occur.
- Compare historical expectations against observed live-market behavior.
- Evaluate strategies using realistic transaction costs and execution assumptions.
- Measure risk, drawdowns, statistical robustness and strategy deterioration.
- Improve strategies through controlled, reproducible experiments.
- Support future instruments, data providers and research methods.
- Eventually integrate with Elite X Trading Journal through a controlled interface.
- Preserve the ability to replace individual technologies without rebuilding the entire platform.

This document is the project's architectural reference.

Future implementation decisions should be consistent with these principles unless a deliberate, documented decision changes them.

IMPORTANT:

This document defines the intended architecture and engineering standards. It does not mean every component has already been implemented, tested or verified.

Implementation status must be tracked separately.

The project must never confuse:

- A planned capability with a completed capability.
- A successful build with a validated trading strategy.
- A profitable historical backtest with a proven live trading edge.
- Live signal generation with successful live execution.
- Institutional-quality engineering practices with guaranteed profitability.

---

# 2. PROJECT VISION

The long-term objective is to build a serious private quantitative research laboratory.

The system should be capable of investigating market behavior, testing hypotheses, evaluating strategies, generating trading candidates and determining whether a proposed strategy demonstrates credible evidence of an advantage.

The goal is not simply to build a collection of technical indicators.

The goal is to build a reusable research platform that can systematically answer questions such as:

- Does a particular trading hypothesis have measurable predictive value?
- Does that value remain after spreads, slippage, commissions and other applicable costs?
- Does the strategy perform on data that was not used to develop it?
- Is performance concentrated in one unusual market period?
- Is the strategy sensitive to small parameter changes?
- Does incorporating information from another market improve decisions?
- How does the strategy behave during different volatility and trend regimes?
- Does live performance remain consistent with historical expectations?
- When should a strategy be suspended, reviewed or retired?
- Is the evidence strong enough to justify further testing?

The system must be designed to discover whether an edge exists, rather than manufacture evidence that an edge exists.

---

# 3. PRIMARY OBJECTIVE

The primary objective is:

BUILD A RELIABLE, REPRODUCIBLE, EXTENSIBLE AND RISK-AWARE QUANTITATIVE RESEARCH PLATFORM THAT CAN GENERATE AND EVALUATE EVIDENCE-BASED TRADING SIGNALS.

The platform should prioritize:

1. Data correctness.
2. Research integrity.
3. Realistic backtesting.
4. Prospective live-signal evaluation.
5. Risk management.
6. Reproducibility.
7. Maintainability.
8. Security.
9. Controlled experimentation.
10. Extensibility.
11. Operational reliability.
12. Evidence-based improvement.

Profitability is an important target, but it must be measured rather than assumed.

A strategy that fails rigorous testing must be rejected or revised, even if its historical chart looks attractive.

A strategy that produces no credible edge is not a platform failure. Discovering that a hypothesis does not work is a legitimate research result.

---

# 4. NON-GOALS AND INITIAL RESTRICTIONS

The initial project will NOT:

- Guarantee profitable trades.
- Assume any particular strategy has a genuine edge.
- Execute real-money trades automatically.
- Treat TradingView Premium as unrestricted programmatic market-data access.
- Use unauthorized market-data scraping.
- Treat historical chart prices as guaranteed executable prices.
- Promote a strategy solely because its backtest is profitable.
- Use machine learning merely because it is available.
- Optimize parameters indefinitely until historical performance looks attractive.
- Mix actual Elite X trading records with simulated research trades.
- Require paid cloud infrastructure before a demonstrated need exists.
- Introduce microservices, Kubernetes or distributed infrastructure prematurely.
- Depend on one market-data vendor throughout the project's lifetime.
- Place the quantitative engine inside UI components.
- Run long-running research jobs inside ordinary web request handlers.
- Assume that live signal generation requires immediate live-money execution.

These restrictions may be reconsidered only through explicit architectural review.

---

# 5. PROJECT OWNERSHIP AND WORKFLOW

The project will be developed independently from Elite X Trading Journal.

The owner will use the existing development workflow wherever practical.

Primary tools:

- Visual Studio Code.
- Git.
- A separate private GitHub repository.
- Python for the quantitative engine.
- TypeScript and Next.js for a future web interface.
- Vercel where appropriate for dashboard hosting.
- Supabase where justified for cloud application services.
- Automated tests and documented acceptance criteria.

The intended initial development environment is the existing local development machine, expected to be the same Mac mini used for Elite X if confirmed.

The repository must be separate from the Elite X repository.

The project must not require modifications to Elite X in order to run its research engine.

The two projects may share architectural principles, documentation conventions and future integration interfaces, but they must retain separate codebases and deployment responsibilities.

---

# 6. TECHNOLOGY FOUNDATION

## 6.1 Python

Python is the primary language for quantitative research and market-data processing.

Responsibilities include:

- Market-data ingestion.
- Data validation and normalization.
- Feature calculation.
- Strategy logic.
- Historical backtesting.
- Execution simulation.
- Risk calculations.
- Performance analytics.
- Experiment orchestration.
- Live signal generation.
- Signal persistence and audit records.
- Research and operational testing.

Python was selected because of its mature numerical computing, statistics, data-processing and quantitative research ecosystem.

The strategy engine must remain independent of the dashboard framework.

## 6.2 TypeScript

TypeScript will be used for the application and dashboard layer if a web interface is implemented.

Responsibilities include:

- Dashboard UI.
- Forms and user interactions.
- Research views.
- Strategy configuration interfaces.
- Signal displays.
- Experiment comparison.
- Authenticated application APIs.
- Application-level validation and presentation logic.

TypeScript is not the primary quantitative computing language for the initial project.

The dashboard must consume explicit, versioned interfaces rather than importing Python implementation details into the UI.

## 6.3 React and Next.js

React and Next.js are the preferred technologies for a future research dashboard because they are already part of the Elite X development workflow.

Potential dashboard capabilities include:

- Instrument overview.
- Market status.
- Live signal monitor.
- Strategy registry.
- Backtest results.
- Equity curves.
- Drawdown analysis.
- Risk metrics.
- Experiment comparisons.
- Signal history.
- Data-quality status.
- Paper-trading observations.
- System health and error reporting.

The dashboard is a presentation and application layer.

It is not the canonical source of research results or trading decisions.

## 6.4 Git and GitHub

Git provides source control.

GitHub provides the remote repository, history, collaboration capabilities and optional CI/CD.

The repository must initially be private.

All important architecture, strategy and data-processing changes must be version-controlled.

Git history is not a substitute for experiment tracking or a complete record of market data.

## 6.5 DuckDB and Parquet

DuckDB and Parquet are the preferred initial local research-storage technologies.

Parquet is suitable for structured historical datasets and analytical workloads.

DuckDB supports efficient analytical queries over local datasets.

These tools allow us to begin without immediately operating a hosted analytical database.

The system must not assume that DuckDB is the authoritative database for all application metadata or user identity.

Its initial responsibility is analytical research storage and querying.

## 6.6 Pandas and NumPy

Pandas and NumPy will support data manipulation and numerical operations.

Additional scientific or statistical libraries may be introduced when a specific requirement justifies them.

Dependencies must be pinned or constrained deliberately and upgraded through testing.

## 6.7 Testing and Code Quality

Initial tools:

- pytest for Python tests.
- Ruff for Python linting and formatting.
- Python type checking using an appropriate tool selected during setup.
- Automated build and test commands.
- Optional GitHub Actions for continuous integration.

Tool selection must remain proportionate to project needs.

## 6.8 Vercel

Vercel may host the Next.js dashboard and suitable lightweight application endpoints.

Vercel must not be assumed to be the execution environment for:

- A continuously running market-data worker.
- A persistent WebSocket connection.
- Large or long-running backtests.
- Unbounded historical data processing.
- A continuously running strategy evaluation process.

Those workloads require a suitable persistent worker or job-execution environment.

Initially, that environment can be local.

## 6.9 Supabase and PostgreSQL

Supabase and PostgreSQL are optional initial components.

They may be introduced for:

- Authentication.
- Dashboard access control.
- Experiment metadata.
- Strategy registry records.
- User settings.
- Signal metadata.
- Cloud synchronization.
- Controlled future integration with Elite X.

They are not mandatory prerequisites for local quantitative research.

We must not place bulk historical tick data in PostgreSQL merely because PostgreSQL is already used by Elite X.

The data format and storage engine must match the workload.

## 6.10 Technology selection principle

Use the simplest mature architecture that satisfies the current requirements.

Do not add infrastructure because it sounds sophisticated.

Every new dependency must have:

- A defined responsibility.
- A reason for inclusion.
- A documented configuration.
- Appropriate tests.
- A clear replacement path where practical.

---

# 7. INFRASTRUCTURE RESPONSIBILITIES

The initial conceptual infrastructure model is:

GitHub
    =
Source code and version history

Python runtime
    =
Quantitative engine and live signal processing

Parquet + DuckDB
    =
Local analytical research data

Optional SQLite or PostgreSQL
    =
Application metadata and experiment registry

Next.js
    =
Research dashboard

Vercel
    =
Dashboard hosting and suitable web endpoints

Supabase
    =
Optional authentication, cloud metadata and application services

Licensed market-data provider
    =
Historical and/or live market observations

These responsibilities must remain distinct.

No single provider should become an unavoidable dependency of the strategy engine.

---

# 8. CANONICAL ARCHITECTURE

The architecture will follow these layers:

MARKET DATA PROVIDERS
    ↓
DATA SOURCE ADAPTERS
    ↓
RAW DATA PRESERVATION
    ↓
VALIDATION AND NORMALIZATION
    ↓
CANONICAL RESEARCH DATA
    ↓
FEATURE AND MARKET-STATE ENGINE
    ↓
STRATEGY ENGINE
    ↓
BACKTESTING / LIVE SIGNAL PROCESSING
    ↓
RISK CONTROLS AND EVALUATION
    ↓
RESEARCH RECORDS AND SIGNAL HISTORY
    ↓
DASHBOARD / REPORTS / FUTURE INTEGRATIONS

The system must separate:

- Data acquisition.
- Data validation.
- Research data storage.
- Feature calculations.
- Strategy rules.
- Execution simulation.
- Risk management.
- Signal publication.
- Application presentation.
- External integration.

Do not combine all these responsibilities into one large Python module or dashboard component.

The architecture should begin as a modular monolith.

A modular monolith provides clear internal boundaries without requiring the operational complexity of a distributed system.

Separate processes may be used where workloads require them, especially for live data and long-running research jobs.

---

# 9. INITIAL INSTRUMENT SCOPE

The initial instruments are:

1. GLD — SPDR Gold Shares.
2. XAU/USD — spot gold quoted in US dollars.

Both must be supported by the initial domain model.

They must not be treated as identical instruments.

## 9.1 GLD

GLD is a US-listed gold-backed exchange-traded fund.

The system must account for:

- Its own traded market price.
- US equity-market sessions.
- Applicable extended-hours sessions when relevant.
- Bid/ask spread.
- Trading volume.
- Market holidays.
- Corporate actions and distributions where relevant to the data and strategy.
- Applicable commissions and trading costs.
- Execution constraints.
- ETF-specific data and adjustment conventions.

GLD's market price must not be assumed to be a perfect real-time substitute for spot gold.

## 9.2 XAU/USD

XAU/USD represents spot gold quoted against the US dollar.

The system must account for:

- The exact data provider.
- Provider-specific quote conventions.
- Timestamp and timezone conventions.
- Bid and ask prices when available.
- Spread.
- Session and holiday behavior.
- Data gaps.
- Provider-specific market availability.
- Financing or overnight costs where relevant to the intended execution model.

XAU/USD is not a single centralized exchange order book.

A spot feed from one provider may differ from another provider's feed.

## 9.3 Cross-market research

The platform must allow us to test whether information from XAU/USD improves GLD decisions.

Potential research questions include:

- Does spot-gold momentum help predict GLD returns?
- Does one market react faster to particular information?
- Does cross-market confirmation reduce false signals?
- Does combining the instruments improve risk-adjusted performance?
- Does the relationship change across market sessions or volatility regimes?

These are research hypotheses, not established facts.

The system must test them without assuming that one market consistently leads the other.

## 9.4 Future instruments

The architecture should eventually support:

- COMEX gold futures.
- GLD options if suitable data and requirements justify them.
- QQQ.
- MNQ futures.
- Other equity ETFs.
- Individual stocks.
- Other supported instruments selected later.

Adding an instrument should generally require a new instrument definition and data adapter, plus any instrument-specific accounting and execution rules.

It should not require rewriting the entire strategy engine.

---

# 10. INSTRUMENT AND MARKET MODEL

The domain model must explicitly represent instrument-specific characteristics.

Potential fields include:

- Canonical instrument identifier.
- Display symbol.
- Instrument type.
- Base and quote currencies where applicable.
- Trading venue or market.
- Data-provider symbol mapping.
- Timezone.
- Trading calendar.
- Session definitions.
- Tick size and price precision.
- Contract multiplier where applicable.
- Quantity precision.
- Currency conversion requirements.
- Corporate-action handling.
- Expiry and roll rules where applicable.
- Supported order and execution assumptions.

Instrument specifications must be versioned where changes could affect calculations.

The system must not hardcode assumptions about every instrument into a single strategy.

Strategies should consume normalized observations and explicit instrument metadata.

Instrument-specific rules belong in the appropriate domain or adapter layer.

---

# 11. MARKET-DATA FOUNDATION

Data quality is a core system requirement.

A sophisticated algorithm cannot compensate reliably for corrupted, inconsistent or incorrectly timestamped data.

The system must distinguish:

1. Raw provider observations.
2. Validated observations.
3. Normalized research datasets.
4. Derived features.
5. Strategy decisions.
6. Simulated or observed outcomes.

Each transformation must be traceable.

## 11.1 Data provenance

For each dataset, preserve appropriate metadata:

- Provider.
- Provider symbol.
- Canonical instrument.
- Dataset identifier.
- Retrieval or ingestion timestamp.
- Market event timestamp where available.
- Timezone convention.
- Data frequency.
- Price and volume units.
- Adjustment policy.
- Data licence or usage constraints.
- Validation status.
- Known limitations.
- Source version or snapshot identifier where possible.

## 11.2 Data validation

The pipeline should check for:

- Missing observations.
- Duplicate records.
- Invalid timestamps.
- Out-of-order events.
- Invalid or non-finite numerical values.
- Negative prices where invalid for the instrument.
- Impossible high/low relationships.
- Inconsistent bid/ask relationships.
- Unexpected price jumps.
- Incorrect session assignment.
- Stale market data.
- Inconsistent units.
- Timezone errors.
- Gaps caused by market closures.
- Unexpected changes in provider behavior.

A suspicious observation must not be silently corrected without a documented rule.

The pipeline should flag, quarantine or reject invalid data according to explicit policies.

## 11.3 Raw-data preservation

Where permitted by the data licence and storage constraints, preserve original observations separately from normalized datasets.

Normalized data must be reproducible from the raw observations and the transformation version.

Do not overwrite historical records silently when a vendor corrects data.

Record corrections or dataset-version changes where practical.

If licensing prevents retaining or redistributing raw data, the system must respect those restrictions and document the permitted retention model.

## 11.4 Historical and live data consistency

Historical and live observations must use consistent:

- Instrument definitions.
- Price conventions.
- Timezones.
- Bar-construction rules.
- Session definitions.
- Adjustment policies.
- Feature calculations.

Where historical and live feeds differ, the difference must be documented and tested.

Do not assume two feeds are interchangeable simply because they display the same ticker.

## 11.5 Data licensing

Market-data access must be lawful and consistent with the intended research and operational use.

TradingView Premium provides useful charting and analysis capabilities, but it must not be assumed to grant unrestricted programmatic extraction or algorithmic-use rights.

Before using any source for automated processing, verify:

- Whether programmatic access is permitted.
- Whether algorithmic decision-making is permitted.
- Historical-data availability.
- Live-data availability.
- Rate limits.
- Retention restrictions.
- Redistribution restrictions.
- Applicable exchange agreements.
- Commercial-use restrictions if relevant.

Do not build unauthorized scraping into the platform.

Free data sources may be sufficient for initial experiments but may lack the granularity, history, spread information or reliability required for rigorous execution research.

Data-provider selection must be based on documented requirements, not merely price.

---

# 12. LIVE SIGNAL GENERATION FROM THE INITIAL ARCHITECTURE

Live signal generation is part of the initial system design.

It is not a feature to be added only after historical backtesting is complete.

The system must be capable of evaluating current market data and producing timestamped signals from the earliest practical implementation stage.

However, the system must not execute real-money trades automatically during the initial project phase.

The initial operating mode is:

LIVE MARKET DATA
    ↓
VALIDATION
    ↓
FEATURE CALCULATION
    ↓
STRATEGY EVALUATION
    ↓
RISK AND DATA-QUALITY CHECKS
    ↓
SIGNAL GENERATION
    ↓
PERSISTENCE AND MONITORING
    ↓
DASHBOARD

## 12.1 Live signal requirements

The system should record:

- Signal identifier.
- Instrument.
- Strategy identifier.
- Strategy version.
- Configuration version.
- Decision timestamp.
- Market-data timestamps used.
- Data-provider identifier.
- Signal direction.
- Signal state.
- Triggering conditions.
- Relevant feature values.
- Proposed entry methodology.
- Invalidation conditions.
- Exit methodology.
- Risk estimate.
- Estimated transaction costs where calculable.
- Validation status.
- Data-quality status.
- Explanation of the decision.
- Subsequent outcome and evaluation status.

## 12.2 Signal states

The platform should distinguish states such as:

- No signal.
- Candidate signal.
- Signal accepted by risk checks.
- Signal rejected by risk checks.
- Signal invalidated.
- Signal expired.
- Signal under evaluation.
- Signal outcome recorded.

Exact states and transitions must be specified during implementation.

A signal should not be marked successful merely because the price later moved in the predicted direction.

The outcome must follow a defined evaluation methodology.

## 12.3 Signal idempotency

Repeated processing of the same input must not create duplicate signals unintentionally.

The system must define signal identity and deduplication rules.

Repeated delivery of the same market event should be handled safely.

## 12.4 Live-data health

A live signal must not be presented as current when its underlying data is stale, incomplete or invalid.

The system should detect:

- Feed disconnections.
- Stale observations.
- Missing updates.
- Timestamp anomalies.
- Failed subscriptions.
- Invalid bars.
- Processing delays.
- Reconnection events.

If critical data-quality checks fail, the affected strategy should be prevented from generating actionable candidate signals until the required conditions recover.

The dashboard must distinguish a genuine no-trade decision from a system that is not receiving reliable data.

---

# 13. TRADINGVIEW ROLE

TradingView Premium is part of the owner's existing toolset.

It may be used for permitted activities such as:

- Visual chart inspection.
- Market-context analysis.
- Reviewing price behavior.
- Comparing charts against research results.
- Developing or inspecting Pine Script experiments within applicable terms.
- Reviewing alerts where their use is permitted.

It must not be assumed to provide a licensed programmatic feed for the Python engine.

The system must not rely on unauthorized browser automation, scraping or alert extraction.

If a TradingView data-access feature is considered, its current terms and the relevant data provider's licence must be checked first.

The Python platform should use an independently approved market-data adapter for automated research and live signals.

TradingView remains a complementary analysis tool, not the assumed canonical data source for the quantitative engine.

---

# 14. STRATEGY ENGINE

The strategy engine must be independent of the dashboard, data provider and deployment platform.

A strategy should receive validated market observations, features, instrument metadata and permitted historical context.

It should produce an explicit decision object.

Conceptually:

Validated Market State
    +
Strategy Configuration
    +
Available Historical Context
    ↓
Strategy Evaluation
    ↓
Candidate Decision
    ↓
Risk Validation
    ↓
Accepted Signal / Rejected Signal / No Trade

A strategy must not directly modify canonical raw market data.

A strategy must not bypass centralized risk controls.

A strategy must not depend on hidden global state or uncontrolled external side effects.

## 14.1 Initial research approach

Start with understandable rules and statistical methods.

Potential initial hypotheses include:

- Trend following.
- Momentum.
- Breakout behavior.
- Mean reversion.
- Volatility-conditioned strategies.
- Session-conditioned behavior.
- Cross-market confirmation between XAU/USD and GLD.

These are candidate research directions, not approved strategies.

We must first establish reliable data and backtesting.

## 14.2 Baselines

Every more complicated strategy should be compared with appropriate simple baselines.

Examples include:

- Buy-and-hold where relevant.
- A simple trend-following rule.
- A no-trade baseline.
- A simple momentum model.
- A risk-matched benchmark.

The correct baseline depends on the instrument, holding period and strategy objective.

A complex strategy must demonstrate incremental value over a reasonable alternative.

## 14.3 Machine learning

Machine learning may be introduced if evidence demonstrates that it is appropriate.

It is not mandatory for the first version.

Any machine-learning model must address:

- Feature leakage.
- Chronological data splitting.
- Model versioning.
- Training and inference reproducibility.
- Hyperparameter search bias.
- Model drift.
- Calibration.
- Out-of-sample evaluation.
- Explainability appropriate to its use.
- Monitoring and retraining policy.

A more complicated model is not automatically a better model.

---

# 15. FEATURE AND MARKET-STATE ENGINE

Feature calculation must be deterministic and separately testable.

Potential features include:

- Returns and log returns.
- Momentum.
- Trend measures.
- Realized volatility.
- Range and breakout measures.
- Volume-derived features where meaningful.
- Session information.
- Cross-market returns.
- Cross-market momentum.
- Relative movement between GLD and XAU/USD.
- Volatility regime.
- Trend regime.
- Time-of-day characteristics.
- Other features justified by a specific hypothesis.

Each feature must document:

- Definition.
- Input data.
- Lookback period.
- Required history.
- Output units.
- Missing-value behavior.
- Timestamp alignment.
- Whether it uses completed bars or partial bars.
- Availability time.
- Calculation version.

The feature engine must not use future observations.

Any feature that uses the current incomplete candle must explicitly identify itself as provisional and account for that behavior in backtesting and live evaluation.

---

# 16. BACKTESTING ENGINE

The backtesting engine is a core domain component.

Its purpose is to estimate how a defined strategy would have behaved under explicit historical data and execution assumptions.

It must not be designed to produce attractive results at the expense of realism.

## 16.1 Required capabilities

The engine should support:

- Historical replay.
- Chronological event processing.
- Strategy evaluation.
- Signal generation.
- Order and fill simulation.
- Position accounting.
- Cash and equity tracking.
- Transaction costs.
- Position sizing.
- Stop and exit rules.
- Multiple concurrent positions where appropriate.
- Instrument-specific constraints.
- Equity curves.
- Drawdown calculations.
- Trade-level analysis.
- Periodic performance summaries.
- Reproducible experiments.

## 16.2 Look-ahead bias

A strategy must only use information available at its decision timestamp.

Examples of prohibited behavior include:

- Entering at a price known only after the decision.
- Using a candle's final high, low or close before the candle has completed.
- Using future corporate-action information that was unavailable at the time.
- Aligning cross-market data using future observations.
- Using a revised dataset without recording the implications for historical availability.

Look-ahead prevention must be part of the design and test suite.

## 16.3 Execution timing

The backtester must explicitly define:

- When a signal is evaluated.
- When an order could be submitted.
- When an order becomes eligible for execution.
- Which market observations are available at each step.
- Which price convention is used for fills.
- How gaps and unavailable prices are handled.
- How stop and limit orders are simulated.
- How ambiguous intrabar ordering is resolved.

A backtest must not assume an order fills at an ideal price simply because that price appears on a chart.

## 16.4 Transaction costs

The engine must support applicable costs, including:

- Bid/ask spread.
- Slippage.
- Commissions.
- Exchange or regulatory fees where applicable.
- Financing or overnight costs where relevant.
- Other instrument- or broker-specific costs.

When exact costs are unavailable, use documented assumptions and sensitivity analysis.

Do not report gross returns as if they were net returns.

## 16.5 GLD execution assumptions

GLD simulations must account for its trading sessions, price conventions, available liquidity information and applicable costs.

Extended-hours trading must not be assumed equivalent to regular-session execution.

Corporate actions and adjusted data must be handled consistently with the strategy's intended execution and accounting model.

## 16.6 XAU/USD execution assumptions

XAU/USD simulations must use the selected provider's price conventions and realistic spread assumptions.

When bid and ask data are available, use them where appropriate.

If only mid-price candles are available, explicitly document that limitation and use conservative cost assumptions where justified.

Do not represent a mid-price fill as a guaranteed executable bid or ask.

## 16.7 Futures support

Future futures support must account for:

- Contract expiry.
- Tick size.
- Tick value.
- Contract multiplier.
- Margin assumptions.
- Contract rolls.
- Continuous-series construction.
- Actual executable contract prices.

A continuous futures series must not be treated as if it were a single directly executable contract.

## 16.8 Backtest reproducibility

Every experiment must be reproducible from:

- Strategy identifier.
- Strategy version or code commit.
- Configuration.
- Dataset version.
- Instrument metadata version.
- Feature definitions.
- Execution-model version.
- Cost assumptions.
- Validation method.
- Software environment where practical.
- Random seeds for stochastic processes where applicable.

If a critical input changes, the resulting experiment must be distinguishable from its predecessor.

---

# 17. CANONICAL RESEARCH RECORDS

The platform needs explicit sources of truth.

The following record categories should remain distinct.

## 17.1 Raw market observations

Original provider observations preserved where permitted.

They represent the market data received by the system, not the strategy's interpretation of that data.

## 17.2 Normalized market data

Validated observations converted into canonical internal representations.

Normalized data must retain provenance and a relationship to its source dataset.

## 17.3 Derived features

Calculated values produced by a defined feature implementation.

Features must be reproducible from their inputs and calculation version.

## 17.4 Experiment records

An experiment must identify the strategy, configuration, dataset, assumptions and validation procedure used.

The experiment record must not be silently overwritten when a new experiment is run.

## 17.5 Signal records

Signal records represent what the strategy actually emitted at a specific time.

They must be preserved independently from subsequent outcome calculations.

A later correction to a strategy must not rewrite what the earlier version actually signaled.

## 17.6 Simulated orders and fills

Simulated orders and fills are derived from a documented execution model.

They must be distinguishable from actual broker executions.

## 17.7 Outcomes and analytics

Performance metrics are derived from underlying observations, signals, fills and accounting rules.

Analytics must retain enough provenance to explain how they were calculated.

The same inputs and versioned rules should produce the same deterministic results.

---

# 18. EXPERIMENT REGISTRY

The experiment registry is a core platform capability.

It should preserve the history of research, including unsuccessful experiments.

Potential fields include:

- Experiment identifier.
- Strategy identifier.
- Strategy version.
- Code commit.
- Configuration.
- Instrument.
- Dataset identifier.
- Date range.
- Feature version.
- Execution model.
- Transaction-cost assumptions.
- Validation methodology.
- Start and completion timestamps.
- Software environment.
- Performance metrics.
- Warnings.
- Errors.
- Research conclusion.
- Status.
- Parent experiment or comparison group.

Potential statuses include:

- Planned.
- Running.
- Completed.
- Failed.
- Invalidated.
- Superseded.

An unsuccessful result must not disappear simply because a later version performs better.

The registry must make it possible to compare competing strategies without losing the context in which they were tested.

---

# 19. VALIDATION AND STATISTICAL INTEGRITY

Validation is mandatory before a strategy can be considered a credible candidate.

Historical profitability alone is insufficient.

## 19.1 Chronological separation

The validation framework should distinguish:

- Development data.
- Validation data.
- Final holdout data.
- Prospective live observations.

The final holdout must not be repeatedly used to guide parameter changes.

The exact split depends on data availability, strategy horizon and the risk of leakage.

## 19.2 Walk-forward validation

Where appropriate, use walk-forward procedures:

Historical training window
    ↓
Parameter or model selection
    ↓
Forward evaluation window
    ↓
Advance the evaluation period
    ↓
Repeat
    ↓
Aggregate out-of-sample results

All procedures must respect chronological ordering.

## 19.3 Overfitting prevention

The system must address:

- Excessive parameter optimization.
- Repeated testing of similar hypotheses.
- Selection bias.
- Data leakage.
- Survivorship bias where relevant.
- Multiple-comparison problems.
- Unusually favorable market periods.
- Sensitivity to small parameter changes.
- Unrealistic transaction costs.
- Inappropriate benchmark selection.

Record the number and context of research experiments when practical.

Do not select a strategy solely because it is the best result among a large number of unsuccessful experiments.

## 19.4 Robustness analysis

Potential tests include:

- Alternative chronological periods.
- Different volatility regimes.
- Different market sessions.
- Small parameter perturbations.
- Higher-cost assumptions.
- Delayed execution.
- Reduced fill quality.
- Different but defensible data sources.
- Sensitivity to missing or noisy observations.

A strategy whose profitability disappears under minor realistic changes requires additional scrutiny.

## 19.5 Baseline comparison

Compare strategies with appropriate benchmarks.

Metrics must be interpreted in context.

A high win rate does not prove profitability.

A high Sharpe ratio does not prove the strategy is statistically reliable.

A low drawdown over a short period does not prove future risk is low.

The evaluation should consider net returns, risk, sample size, uncertainty, trade frequency and exposure.

---

# 20. PERFORMANCE AND RISK ANALYTICS

The platform should calculate a consistent set of performance metrics.

Potential metrics include:

- Net return.
- Gross return.
- Maximum drawdown.
- Drawdown duration.
- Volatility.
- Sharpe ratio.
- Sortino ratio.
- Profit factor.
- Win rate.
- Average win.
- Average loss.
- Expectancy per trade.
- Trade count.
- Turnover.
- Exposure.
- Average holding period.
- Tail-loss measures where appropriate.
- Consecutive losses.
- Performance by instrument.
- Performance by session.
- Performance by market regime.
- Performance by strategy version.
- Estimated transaction costs.

Metric definitions must be documented.

For example, annualization assumptions and risk-free-rate assumptions must be explicit when used.

Comparisons must use compatible time periods, currencies, accounting conventions and cost assumptions.

Performance analytics must not compare incompatible datasets or silently mix gross and net figures.

---

# 21. RISK MANAGEMENT

Risk management must be a distinct domain component.

It must not be scattered across individual strategy implementations.

Potential responsibilities include:

- Maximum permitted position size.
- Per-trade risk limits.
- Exposure limits.
- Maximum concurrent positions.
- Drawdown thresholds.
- Loss thresholds.
- Data-quality rejection.
- Strategy suspension.
- Market-session restrictions.
- Stale-signal rejection.
- Invalid-price rejection.
- Instrument-specific trading restrictions.
- Paper-trading controls.
- Future execution permissions.

Exact limits must be explicitly configured and tested.

They must not be invented during a live decision.

The risk engine must be able to reject a candidate signal even when the strategy itself produces a positive decision.

Risk checks should fail safely when required inputs are missing or invalid.

---

# 22. LIVE SIGNAL EVALUATION

Live signal generation must begin early, but trust must be earned over time.

The initial system will generate signals without submitting real-money orders.

## 22.1 Shadow mode

In shadow mode, the system evaluates live market data and records decisions without placing orders.

It should capture:

- The signal as generated.
- The timestamp at which it became available.
- The data used at that time.
- The strategy version.
- The proposed entry and exit methodology.
- The risk assumptions.
- The subsequent market path.
- The outcome under a predefined evaluation rule.

## 22.2 Prospective testing

Signals must be recorded before their outcomes are known.

This prevents hindsight from influencing the evaluation.

The system must retain:

- Winning signals.
- Losing signals.
- Expired signals.
- Invalidated signals.
- Rejected signals.
- No-trade decisions.
- System failures and missed evaluations.

The platform must not selectively report only successful signals.

## 22.3 Live and backtest comparison

The system should compare prospective performance against historical expectations.

Investigate differences caused by:

- Data-provider differences.
- Signal timing.
- Spread assumptions.
- Slippage.
- Missing observations.
- Execution assumptions.
- Market-regime changes.
- Software defects.
- Strategy drift.

A difference between live and historical performance is a reason to investigate, not a reason to adjust the backtest retrospectively.

## 22.4 Strategy promotion

A strategy must not automatically become approved for live-money use because a backtest passes.

Promotion should require documented review of:

- Data quality.
- Out-of-sample performance.
- Statistical uncertainty.
- Transaction costs.
- Risk.
- Prospective live behavior.
- Paper-trading results.
- Operational reliability.
- Failure modes.

Even a strategy that passes these gates may lose money in the future.

---

# 23. LIVE WORKER AND JOB PROCESSING

The live engine should be designed as a persistent processing component.

It must not depend on a user keeping the dashboard open.

Responsibilities include:

- Maintaining or reconnecting data subscriptions.
- Processing new observations.
- Updating market state.
- Evaluating eligible strategies.
- Applying data-quality and risk checks.
- Recording signals.
- Reporting health status.
- Recovering safely after interruptions.

The worker must define:

- Startup behavior.
- Shutdown behavior.
- Reconnection policy.
- Retry policy.
- Idempotency.
- Error handling.
- State recovery.
- Health checks.
- Logging.
- Failure alerts.

Long-running backtests should use a job-execution mechanism rather than ordinary web requests.

Initially, workers and research jobs may run locally.

Remote execution can be introduced when availability, resource or operational requirements justify it.

---

# 24. DASHBOARD REQUIREMENTS

The future dashboard should make research evidence understandable without hiding technical detail.

Potential pages include:

- Overview.
- Market data status.
- GLD research.
- XAU/USD research.
- Live signal monitor.
- Strategy registry.
- Backtest laboratory.
- Experiment comparison.
- Risk analysis.
- Signal history.
- Paper-trading evaluation.
- Data quality.
- System health.
- Configuration.
- Audit history.

The dashboard must distinguish:

- Live market observations.
- Delayed observations.
- Historical research.
- Simulated results.
- Prospective shadow-mode results.
- Paper-trading results.
- Actual broker executions if added in the future.

The UI must not present simulated performance as actual account performance.

It must not imply a signal is current when the data feed is stale.

Important metrics should be accompanied by definitions, date ranges and relevant assumptions.

---

# 25. FUTURE ELITE X INTEGRATION

The Quant Research Platform will remain a separate project.

Future integration may provide a Quant Lab area within Elite X Trading Journal.

Potential capabilities include:

- Displaying research summaries.
- Displaying approved strategy information.
- Showing candidate signals.
- Reviewing strategy performance.
- Linking research observations to manually recorded trades.
- Providing a controlled interface for experiment results.

Integration must use an explicit, authenticated and versioned API or job interface.

The Python engine must not become tightly coupled to Elite X's UI implementation.

Elite X must not need to run the quantitative engine inside Next.js request handlers.

The integration must preserve separation between:

- Actual broker executions.
- Actual journal trades.
- Simulated orders.
- Backtested trades.
- Live research signals.
- Paper-trading outcomes.

The Elite X execution ledger remains the canonical source for actual executions in Elite X.

Quant Research records remain the canonical source for its research experiments and signals.

Research data must never be inserted into the actual execution ledger as if it were a broker execution.

Any future synchronization must preserve provenance and explicit record types.

---

# 26. SECURITY FOUNDATION

The initial repository must be private.

The platform must protect:

- Market-data credentials.
- API keys.
- Broker credentials if introduced later.
- Database credentials.
- Authentication secrets.
- Private datasets.
- Research artifacts.
- User information if multi-user functionality is added.

Rules:

- Never commit secrets to GitHub.
- Never place privileged server credentials in browser code.
- Use environment variables or an appropriate secret-management system.
- Keep local environment files out of version control.
- Use least-privilege access.
- Validate external inputs.
- Avoid exposing private research endpoints publicly.
- Protect dashboard and API access.
- Record important operational errors without logging credentials.
- Review dependencies for known vulnerabilities.
- Restrict access to sensitive data.
- Use authenticated interfaces for future integrations.

If Supabase is introduced, database authorization must be enforced server-side and through appropriate database policies.

Frontend filtering is not an authorization mechanism.

A service-role credential must never be exposed to the browser.

---

# 27. DATA AND ARTIFACT SECURITY

Market-data licensing and security are separate requirements.

A dataset may be technically accessible but not permitted for the intended use.

Before retaining, uploading, sharing or publishing datasets, verify the applicable terms.

The project must distinguish:

- Publicly redistributable datasets.
- Data licensed for private research.
- Data licensed for live analysis.
- Data restricted to display.
- Data subject to retention limitations.
- Derived artifacts that may themselves have restrictions.

Private market data and broker credentials must not be placed in a public repository.

Large datasets should not be committed to Git unless there is an explicit, justified reason.

Use appropriate local storage and documented backup procedures.

---

# 28. TESTING STANDARD

Testing is a core requirement, not an optional cleanup step.

## 28.1 Unit tests

Test individual components such as:

- Instrument metadata.
- Price and quantity calculations.
- Feature calculations.
- Strategy rules.
- Risk checks.
- Signal state transitions.
- Cost calculations.
- Performance metrics.
- Timestamp alignment.

## 28.2 Integration tests

Test interactions between:

- Data adapters and normalization.
- Storage and dataset retrieval.
- Features and strategy evaluation.
- Strategy and risk engine.
- Backtester and execution simulation.
- Live worker and signal persistence.
- API and authorization.
- Dashboard and backend interfaces.

## 28.3 Data-quality tests

Test:

- Duplicate observations.
- Missing intervals.
- Out-of-order events.
- Invalid values.
- Timezone conversion.
- Session boundaries.
- Stale data.
- Provider disconnections.
- Historical/live consistency.

## 28.4 Backtesting correctness tests

Test:

- No look-ahead.
- Correct execution timing.
- Correct cost application.
- Correct position accounting.
- Correct handling of gaps.
- Correct signal-to-trade mapping.
- Correct drawdown calculations.
- Reproducibility under fixed inputs.

## 28.5 Live-system tests

Test:

- Duplicate-event handling.
- Feed disconnection and recovery.
- Stale-data rejection.
- Restart behavior.
- Signal persistence.
- Failure handling.
- Clock and timestamp assumptions.
- No unintended order submission.

## 28.6 Security tests

Where applicable, test:

- Unauthorized access.
- Secret leakage.
- API input validation.
- Authentication.
- Authorization.
- Data ownership.
- Dependency vulnerabilities.
- Exposure of private research artifacts.

A successful build is necessary but not sufficient.

The relevant automated tests must pass before important changes are considered complete.

---

# 29. REPRODUCIBILITY AND AUDITABILITY

Every meaningful research result must be traceable.

The platform should be able to answer:

- Which code generated this result?
- Which strategy version was used?
- Which data was used?
- Which parameters were applied?
- Which transaction costs were assumed?
- Which execution model was used?
- Which validation method was followed?
- Was the result historical, prospective or simulated?
- Can the result be reproduced?
- What changed between this result and the previous one?

Strategy changes must be version-controlled.

Experiments must not silently overwrite prior results.

Live signal records must preserve what the system actually decided at the time.

Corrected datasets or revised logic may produce new results, but they must not erase the historical context of previous experiments.

---

# 30. OBSERVABILITY AND FAILURE RECOVERY

The system must be designed to detect and investigate failures.

Potential monitoring areas include:

- Market-data freshness.
- Feed connection state.
- Processing latency.
- Data-quality failures.
- Signal-generation failures.
- Worker health.
- Storage errors.
- Job failures.
- API errors.
- Resource usage.
- Unexpected changes in signal frequency.
- Strategy performance deterioration.

The platform should distinguish a market condition that produces no signals from a technical failure that prevents signals from being generated.

Recovery procedures must account for:

- Process restarts.
- Missed data.
- Partial writes.
- Duplicate events.
- Incomplete jobs.
- Corrupted datasets.
- Failed migrations.
- Provider outages.

A restart must not silently duplicate signals or rewrite completed experiments.

---

# 31. BACKUP AND RECOVERY

Source-code backup and research-data backup are different responsibilities.

GitHub
    =
Source code and history

Local or approved object storage
    =
Historical research datasets and artifacts

Research registry
    =
Experiment metadata and reproducibility records

Optional PostgreSQL/Supabase
    =
Cloud application metadata and related records

The backup strategy must specify what can be reconstructed and what cannot.

Before relying on any backup, test restoration.

Important records include:

- Source code.
- Configuration.
- Experiment metadata.
- Strategy versions.
- Approved datasets or dataset references.
- Signal history.
- Research reports.
- Required environment and dependency information.

Market-data licensing must be respected in all backup and restoration procedures.

A backup that has never been restored successfully must not be treated as verified disaster recovery.

---

# 32. FREE-FIRST COST STRATEGY

The initial objective is to minimize additional recurring costs.

Prefer free and open-source tools for:

- Development.
- Version control.
- Numerical computing.
- Testing.
- Local analytical storage.
- Initial dashboard development.
- Local backtesting.

Potential paid costs may eventually arise from:

- Licensed historical market data.
- Real-time market-data feeds.
- Exchange fees.
- Persistent remote workers.
- Cloud hosting.
- Storage and backups.
- Authentication or application services.
- Monitoring services.

No paid service should be introduced without a documented need.

The free-first approach does not override data licensing or research-quality requirements.

A free dataset may be insufficient for reliable evaluation of a strategy that depends on granular bid/ask history, intrabar execution or order-book information.

The platform must document data limitations rather than pretending they do not exist.

The initial goal is $0 in additional recurring infrastructure costs where practical, not an unconditional guarantee that every future data requirement can be satisfied for free.

---

# 33. DEVELOPMENT PHASES

Implementation will proceed through controlled phases.

## Phase 1 — Foundation and architecture

- Create a separate private repository.
- Write the foundation document.
- Define the initial package structure.
- Establish Python environment and dependency management.
- Configure Git and `.gitignore`.
- Configure automated tests and code quality.
- Define instrument and data contracts.
- Define experiment and signal records.
- Document architectural decisions.

Acceptance criteria:

- The project environment is reproducible.
- Basic tests run successfully.
- Secrets and local datasets are excluded appropriately from Git.
- Core domain boundaries are documented.
- No unnecessary cloud dependency is required.

## Phase 2 — Data pipeline

- Select permitted historical data sources.
- Investigate permitted live data sources.
- Implement source adapters.
- Define canonical market observations.
- Implement data-quality validation.
- Store appropriate research datasets locally.
- Record provenance and data limitations.
- Validate GLD and XAU/USD independently.

Acceptance criteria:

- Datasets have documented sources and conventions.
- Timestamp handling is tested.
- Data-quality failures are visible.
- Historical observations can be retrieved reproducibly.
- Automated use complies with applicable licensing.

## Phase 3 — Feature and strategy foundation

- Implement deterministic feature calculations.
- Define strategy interfaces.
- Establish a strategy registry.
- Create simple baseline hypotheses.
- Test feature timing and missing-data behavior.
- Establish signal decision records.

Acceptance criteria:

- Features are reproducible.
- Strategies cannot access future information through the supported interfaces.
- Strategies can be tested independently of the UI.
- No strategy is represented as profitable without evidence.

## Phase 4 — Backtesting engine

- Implement chronological replay.
- Define signal and execution timing.
- Implement position and cash accounting.
- Model applicable costs.
- Produce trade-level and portfolio-level metrics.
- Add correctness and regression tests.
- Record experiment configurations and results.

Acceptance criteria:

- Backtests are reproducible.
- Execution assumptions are explicit.
- Cost assumptions are visible.
- No-look-ahead tests pass.
- Results can be traced to code, data and configuration.

## Phase 5 — Live signal engine

- Implement the persistent worker.
- Connect an approved live-data source.
- Validate freshness and connection state.
- Reuse the strategy and feature logic.
- Generate live signals without submitting real-money orders.
- Persist signals and system-health events.
- Test reconnects and duplicate-event handling.

Acceptance criteria:

- Signals are timestamped and reproducible from recorded inputs where feasible.
- Stale or invalid data cannot silently produce trusted signals.
- Failures are observable.
- The system does not place real-money orders.
- Live signals can be evaluated prospectively.

## Phase 6 — Validation and risk

- Implement chronological validation.
- Add walk-forward procedures where appropriate.
- Compare with baselines.
- Measure uncertainty and robustness.
- Evaluate transaction-cost sensitivity.
- Establish documented strategy review criteria.
- Compare historical expectations with prospective results.

Acceptance criteria:

- Failed experiments remain recorded.
- Holdout data is not repeatedly optimized against.
- Metrics are defined and consistent.
- Strategy promotion requires documented review.

## Phase 7 — Research dashboard

- Build market and data-health views.
- Add live signal monitoring.
- Add experiment history.
- Add backtest comparison.
- Add risk and performance analytics.
- Add strategy configuration and status.
- Connect the UI through explicit interfaces.

Acceptance criteria:

- Historical and live results are clearly distinguished.
- Stale data is visible.
- Results have traceable provenance.
- The UI does not become the source of truth for research calculations.

## Phase 8 — Paper trading and operational evaluation

- Define paper-trading execution rules.
- Simulate realistic order behavior.
- Monitor prospective outcomes.
- Compare observed and expected behavior.
- Review operational failures.
- Document strategy limitations.

Acceptance criteria:

- Paper trades are distinct from actual executions.
- Costs and execution assumptions are recorded.
- Results are evaluated without hindsight.
- No automatic promotion to live-money execution occurs.

## Phase 9 — Multi-asset expansion

- Add new instrument adapters.
- Extend instrument metadata.
- Implement instrument-specific accounting.
- Validate each new asset class.
- Compare performance using appropriate baselines.
- Preserve the shared research architecture.

Acceptance criteria:

- Existing instruments remain regression-tested.
- New instrument behavior is documented.
- Instrument-specific differences are not hidden behind incorrect shared assumptions.

## Phase 10 — Elite X integration

- Define a versioned integration contract.
- Establish authentication and authorization.
- Expose selected research information.
- Preserve separation between actual and simulated trades.
- Test data ownership and failure behavior.
- Review operational and security requirements.

Acceptance criteria:

- The quantitative engine remains independently deployable.
- Elite X remains the canonical application for its actual trading records.
- Research records do not contaminate the execution ledger.
- Integration can be disabled without breaking the research engine.

---

# 34. INITIAL REPOSITORY STRUCTURE

The initial repository should remain small and understandable.

A proposed structure is:

quant-research-platform/
    docs/
        QUANT_PLATFORM_FOUNDATION.md
        decisions/
        research/
    configs/
    data/
        README.md
    scripts/
    src/
        quant_platform/
            instruments/
            data/
            features/
            strategies/
            backtesting/
            execution/
            risk/
            analytics/
            experiments/
            live/
            interfaces/
    tests/
    apps/
        dashboard/
    pyproject.toml
    .gitignore
    README.md

The dashboard directory may be introduced when UI work begins.

The exact package layout may evolve as requirements become clearer.

Do not create empty modules merely to make the repository look comprehensive.

Each module must have a defined responsibility.

The `data/` directory must not accidentally become a repository for large, restricted or private market datasets.

Actual local dataset storage should follow the documented data policy and Git exclusions.

---

# 35. ARCHITECTURAL DECISION RECORDS

Significant decisions must be documented.

Examples include:

- Why Python was selected for the research engine.
- Why Parquet and DuckDB were selected for initial research storage.
- Why the platform is separate from Elite X.
- Why the live engine is a persistent worker.
- Why a particular market-data provider was selected.
- Why a specific execution model is appropriate.
- Why a strategy validation method was chosen.
- Why a new dependency or hosted service is required.

Each decision should record:

- Context.
- Decision.
- Alternatives considered.
- Rationale.
- Consequences.
- Known limitations.
- Date.
- Status.

An accepted architectural decision must not be changed casually.

If new evidence invalidates a decision, document the replacement and migration plan.

---

# 36. SCALABILITY PHILOSOPHY

The project should scale progressively.

Initial stage:

Local development
    ↓
Local data storage
    ↓
Local research jobs
    ↓
Local live shadow-mode processing

Next stage:

Private dashboard
    ↓
Controlled API
    ↓
Persistent remote worker where justified
    ↓
Cloud metadata and storage where required

Later stage:

More instruments
    ↓
More strategies and experiments
    ↓
Larger datasets
    ↓
More compute
    ↓
Dedicated job execution and monitoring
    ↓
Additional storage or services where justified

Do not introduce distributed infrastructure before the workload requires it.

Potential future components include:

- Persistent worker services.
- Background job queues.
- Object storage.
- Managed analytical databases.
- Dedicated compute.
- Caching.
- Experiment orchestration.
- Advanced monitoring.
- Separate execution services if ever authorized.

Each addition must solve an identified bottleneck or operational requirement.

---

# 37. FUTURE-PROOFING PRINCIPLE

Future-proofing does not mean that the exact same libraries or infrastructure will remain appropriate forever.

It means the architecture can evolve without losing its essential data, research history and domain logic.

The platform should protect:

- Research provenance.
- Dataset identity.
- Strategy definitions.
- Experiment history.
- Signal records.
- Risk rules.
- Accounting logic.
- Validation methodology.
- Domain interfaces.
- Security controls.

The following are replaceable implementation choices:

- Market-data vendor.
- Web framework.
- Hosting provider.
- Storage engine.
- Database provider.
- UI component library.
- Individual numerical libraries.
- Job execution technology.

Replacement should be possible through explicit interfaces and controlled migrations, not by assuming that all components can be swapped without work.

The principle is:

BUILD FOR CHANGE, NOT FOR PERMANENCE.

---

# 38. COMMERCIAL AND OPERATIONAL READINESS

Before any future public or commercial launch, conduct an appropriate review of:

1. Market-data licensing.
2. Application security.
3. Authentication and authorization.
4. Secrets management.
5. API access controls.
6. Dataset privacy and retention.
7. Dependency vulnerabilities.
8. Backup and restoration.
9. Failure recovery.
10. Monitoring and alerting.
11. Performance under realistic workloads.
12. Cost and quota limits.
13. Data-provider continuity.
14. Research-result reproducibility.
15. Strategy validation and disclosure.
16. User permissions.
17. Applicable legal and regulatory obligations.

If the platform is eventually used to provide signals to other people or commercial services, additional legal, data-licensing and regulatory analysis may be necessary.

Technical readiness does not automatically establish legal permission to distribute data or trading recommendations.

---

# 39. LIVE-MONEY EXECUTION POLICY

Automatic real-money execution is outside the initial scope.

Any future consideration of automated execution must require a separate explicit architecture and risk review.

That review must address:

- Broker integration.
- Authentication and credential security.
- Order-state management.
- Duplicate-order prevention.
- Position reconciliation.
- Fill reconciliation.
- Partial fills.
- Rejections.
- Market closures.
- Disconnections.
- Kill switches.
- Exposure limits.
- Risk limits.
- Operational monitoring.
- Recovery procedures.
- Independent paper-trading evidence.
- Authorization and regulatory requirements where applicable.

The existence of a live signal engine does not authorize order execution.

The existence of a profitable backtest does not authorize order execution.

The existence of successful paper trading does not guarantee profitable live execution.

Any transition must be a deliberate, separately approved project milestone.

---

# 40. DEFINITION OF SUCCESS

Success must be evaluated across several independent dimensions.

## Technical success

- The architecture is modular and maintainable.
- The data pipeline is reliable.
- Experiments are reproducible.
- Backtests follow explicit execution rules.
- Live signals are generated and recorded correctly.
- Failures are visible.
- Security boundaries are enforced.

## Research success

- Strategies are evaluated against appropriate baselines.
- Historical testing avoids known forms of leakage and bias.
- Out-of-sample results are preserved.
- Statistical uncertainty is considered.
- Weak strategies can be rejected without compromising the research record.

## Operational success

- Live data is monitored.
- Signals are recorded before their outcomes are known.
- Historical expectations can be compared with prospective observations.
- System interruptions do not silently corrupt results.
- Strategy changes are traceable.

## Trading success

A strategy may be considered a promising candidate only when sufficient evidence supports its net performance, risk characteristics, robustness and practical execution assumptions.

A strategy may still fail in future market conditions.

Profitability is not guaranteed by the architecture.

The platform is successful when it can reliably evaluate trading hypotheses and produce honest, reproducible evidence about their strengths and limitations.

A credible negative result is preferable to a false positive.

---

# 41. WHAT WE MUST NEVER DO

Do NOT:

- Treat TradingView Premium as unrestricted automated data access.
- Scrape market data without authorization.
- Assume free data is adequate for every strategy.
- Assume GLD and XAU/USD are interchangeable.
- Mix simulated trades with actual broker executions.
- Use future information in a strategy decision.
- Ignore spreads, slippage or applicable costs.
- Optimize repeatedly against the final holdout.
- Delete failed experiments to improve reported results.
- Promote a strategy because of one profitable backtest.
- Allow a stale feed to appear healthy.
- Let individual strategies bypass central risk controls.
- Store credentials in GitHub.
- Expose privileged secrets in browser code.
- Place persistent market-data workers inside ordinary web requests.
- Introduce infrastructure without a demonstrated need.
- Rewrite the platform solely because a new framework becomes popular.
- Change important architecture without documenting the reason.
- Claim institutional profitability without supporting evidence.
- Automatically execute real-money trades during the initial development phase.

---

# 42. CURRENT FOUNDATION STATUS

The following are design decisions or intentions, not claims of completed implementation.

Project:

Private Quant Research Platform

Primary instruments:

GLD and XAU/USD

Primary quantitative language:

Python

Dashboard language:

TypeScript, if and when the dashboard is implemented

Preferred dashboard framework:

React and Next.js

Source control:

Git and private GitHub repository

Initial analytical storage:

Parquet and DuckDB

Application database:

Optional initially; SQLite or PostgreSQL depending on requirements

Hosting:

Local first; Vercel for suitable dashboard workloads later

Authentication:

Optional for local-only use; required appropriately for protected remote access

Live signal generation:

Included in the initial architecture

Initial live operating mode:

Shadow mode; no real-money order submission

Backtesting:

Core requirement

Validation:

Mandatory

Risk controls:

Core domain component

Experiment registry:

Core requirement

Market-data access:

Must be licensed for the intended use

Initial infrastructure budget:

Target $0 in additional recurring costs where practical

Future integration:

Separate, controlled integration with Elite X

Architecture style:

Modular monolith with clear internal boundaries

Primary engineering principle:

Reproducibility, data integrity and separation of responsibilities

Primary research principle:

Evidence before confidence

---

# 43. ONE-PAGE FOUNDATION SUMMARY

PROJECT:

Quant Research Platform

MISSION:

Build a private quantitative research and decision-support system that investigates trading strategies, performs realistic backtests, generates live signals and evaluates whether a durable trading edge exists.

INITIAL INSTRUMENTS:

GLD
XAU/USD

QUANTITATIVE ENGINE:

Python

DASHBOARD:

React + Next.js + TypeScript when required

SOURCE CONTROL:

GitHub

INITIAL RESEARCH STORAGE:

Parquet + DuckDB

OPTIONAL APPLICATION SERVICES:

Supabase + PostgreSQL where justified

HOSTING:

Local first; Vercel for suitable web workloads

LIVE SIGNALS:

Designed in from the beginning

INITIAL EXECUTION POLICY:

No automatic real-money execution

CANONICAL DATA:

Raw market observations, versioned normalized datasets, reproducible experiment records and immutable historical signal decisions, subject to applicable data-retention and licensing restrictions

BACKTESTING:

Chronological, cost-aware and reproducible

VALIDATION:

Out-of-sample testing, walk-forward analysis where appropriate, robustness checks and baseline comparisons

RISK:

Centralized, explicit and testable

EXPERIMENTS:

Versioned, traceable and retained, including unsuccessful results

SECURITY:

Private repository, protected credentials, explicit authorization and controlled interfaces

SCALABILITY:

Progressive, evidence-driven infrastructure growth

ELITE X INTEGRATION:

Future authenticated interface; no contamination of actual execution records

COST STRATEGY:

Free-first, with paid services introduced only when justified

PROFITABILITY:

A research objective, never an assumed result

---

# 44. FINAL ARCHITECTURAL PRINCIPLE

The platform must be built to discover the truth about a trading strategy, even when that truth is unfavorable.

Its purpose is not to prove that an algorithm works.

Its purpose is to determine whether an algorithm works, under what conditions it works, how it fails, what risks it introduces and whether the evidence justifies further use.

The engineering foundation must preserve the integrity of that investigation.

The system must remain:

- Reproducible.
- Auditable.
- Testable.
- Modular.
- Secure.
- Data-driven.
- Risk-aware.
- Extensible.
- Honest about uncertainty.

Technology will change.

Data providers may change.

Strategies will change.

Market behavior will change.

The platform should be able to evolve while preserving the research records, domain rules and evidence that make its decisions understandable.

FINAL POSITION:

BUILD A QUANTITATIVE RESEARCH PLATFORM THAT CAN GENERATE LIVE SIGNALS FROM THE BEGINNING, TEST STRATEGIES RIGOROUSLY, MEASURE THEIR REALISTIC PERFORMANCE, REJECT WEAK HYPOTHESES AND SUPPORT FUTURE GROWTH WITHOUT COMPROMISING DATA INTEGRITY OR RISK CONTROL.

THE GOAL IS A CREDIBLE, REUSABLE RESEARCH PROCESS THAT MAY DISCOVER PROFITABLE STRATEGIES.

PROFITABILITY MUST BE DEMONSTRATED THROUGH EVIDENCE. IT MUST NEVER BE ASSUMED BY DESIGN.
