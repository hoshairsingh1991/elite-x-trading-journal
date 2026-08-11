================================================================================
ELITEX TRADING OS
MASTER DESIGN SPECIFICATION

Expense Report PDF Export System
Version 2.0
(Canonical Architecture)

Part 1
================================================================================


===============================================================================
1. PURPOSE
===============================================================================

The Expense Report PDF Export System exists to generate professional,
accountant-friendly expense reports from EliteX Trading OS.

Unlike the Dashboard, which is optimized for interactive analysis,
the PDF Export System is optimized for:

• Printing
• Record keeping
• Accountant review
• Tax preparation
• Business documentation
• Long-term archival

The PDF should feel like an institutional financial report rather than
a screenshot of the application.

Every report should remain clean, deterministic, consistent, and suitable
for professional use.



===============================================================================
2. DESIGN PHILOSOPHY
===============================================================================

The PDF system follows several core architectural principles.

1. Separation of responsibilities

Business logic and rendering must never be mixed.

The report builder performs calculations.

The PDF renderer only displays data.

2. Deterministic output

The same report generated twice from identical data must always produce
the same document.

3. Canonical data contract

The renderer receives a single immutable ExpenseReportData object.

The renderer never accesses database models directly.

The renderer never performs calculations.

4. Accountant-first design

The report should prioritize readability over visual effects.

No dashboards.

No charts.

No unnecessary decoration.

5. Institutional appearance

Large margins

Consistent spacing

Professional typography

Simple tables

Minimal colors

Maximum clarity

6. Shared reporting infrastructure

Every future report should reuse the same reporting framework.

Expense Reports

Trade Reports

Performance Reports

Tax Reports

Year End Reports

Broker Reports

All should eventually share the same reporting infrastructure.



===============================================================================
3. HIGH LEVEL ARCHITECTURE
===============================================================================

The Expense Report export pipeline follows a strict layered architecture.

User Interface

↓

Export Drawer

↓

Export Service

↓

Report Builder

↓

ExpenseReportData

↓

PDF Renderer

↓

React PDF

↓

Blob

↓

Download


Each layer has one responsibility.

No layer may violate another layer's responsibilities.



===============================================================================
4. EXPORT PIPELINE
===============================================================================

The complete export pipeline is:

ExportExpenseDrawer

↓

User selects:

• Reporting period

• Optional ledger columns

• Report options

↓

ExportExpenseReport()

↓

buildExpenseReportData()

↓

ExpenseReportData

↓

generateExpensePdf()

↓

ExpenseReportDocument

↓

React PDF

↓

Blob

↓

Browser download



===============================================================================
5. RESPONSIBILITY OF EACH LAYER
===============================================================================


------------------------------------------------------------------------------
Export Drawer
------------------------------------------------------------------------------

Responsibilities

• Collect export settings

• Allow reporting period selection

• Allow optional ledger columns

• Display estimated pages

• Display estimated PDF size

• Display generated timestamp

• Build ExpenseReportOptions

• Trigger export

Must NOT

• Perform calculations

• Build report rows

• Generate PDF layout



------------------------------------------------------------------------------
buildExpenseReportData()
------------------------------------------------------------------------------

Responsibilities

• Validate inputs

• Build metadata

• Calculate summaries

• Build category totals

• Build vendor totals

• Build financial summaries

• Apply reporting currency

• Produce ledger rows

• Produce immutable ExpenseReportData

Must NOT

• Render PDF

• Create React components

• Generate blobs



------------------------------------------------------------------------------
ExpenseReportData
------------------------------------------------------------------------------

Responsibilities

Acts as the canonical data contract.

Contains every piece of information required to render the report.

The renderer depends exclusively on this object.



------------------------------------------------------------------------------
ExpenseReportDocument
------------------------------------------------------------------------------

Responsibilities

Assemble report pages.

No calculations.

No formatting decisions.

No business rules.

Simply compose pages.



------------------------------------------------------------------------------
Individual Pages
------------------------------------------------------------------------------

Responsibilities

Render information.

Never calculate information.

Never mutate report data.

Never access storage.

Never perform filtering.



===============================================================================
6. DIRECTORY STRUCTURE
===============================================================================

The reporting module is organized by responsibility.

lib/

reporting/

    expense/

        buildExpenseReportData.ts

        generateExpensePdf.ts

        exportExpenseReport.ts

        ExpenseReportDocument.tsx

        ExpenseCoverPage.tsx

        ExpenseSummaryPage.tsx

        ExpenseLedgerPages.tsx

        FinancialSummaryPage.tsx

        types.ts

    components/

        Document.tsx

        Page.tsx

        SummaryTable.tsx

        ReportSection.tsx

    shared/

        formatters.ts

        paginateRows.ts

        types.ts

    theme/

        colors.ts

        spacing.ts

        typography.ts

        reportLayout.ts



===============================================================================
7. PDF THEME SYSTEM
===============================================================================

The PDF has its own design system completely separate from the web UI.

Shared theme files exist for:

colors.ts

Defines:

• text colors

• borders

• backgrounds

• neutral palette

spacing.ts

Defines:

• page padding

• section spacing

• paragraph spacing

• table spacing

• line spacing

typography.ts

Defines:

• Heading 1

• Heading 2

• Heading 3

• Labels

• Body

• Caption

No component should hardcode font sizes.

reportLayout.ts

Contains layout constants.

Example:

LEDGER_ROWS_PER_PAGE

Future layout constants will also live here.



===============================================================================
8. SHARED REPORT COMPONENTS
===============================================================================


------------------------------------------------------------------------------
Document
------------------------------------------------------------------------------

Acts as the root React PDF document.

Responsibilities

• Create PDF document

• Hold pages

Nothing else.



------------------------------------------------------------------------------
Page
------------------------------------------------------------------------------

Acts as the standard page wrapper.

Responsibilities

• Standard page size

• Shared margins

• Shared background

Every report page uses the same Page component.

No page should create its own margins.



------------------------------------------------------------------------------
SummaryTable
------------------------------------------------------------------------------

Reusable summary table component.

Responsibilities

• Render rows

• Render totals

• Currency formatting

• Table styling

Never performs calculations.



------------------------------------------------------------------------------
ReportSection
------------------------------------------------------------------------------

Shared wrapper intended for future section-level pagination.

Current purpose:

Keep logical report sections grouped.

Although additional pagination work remains, this component establishes
the shared abstraction for section-based rendering and will be reused as
the reporting engine evolves.



===============================================================================
9. REPORT DATA CONTRACT
===============================================================================

ExpenseReportData is the canonical model for the renderer.

It contains:

Metadata

↓

Export Options

↓

Executive Summary

↓

Category Summary

↓

Vendor Summary

↓

Financial Summary

↓

Ledger Rows

↓

Report Information

↓

Disclaimer

The renderer should never require anything outside this object.



===============================================================================
10. REPORT METADATA
===============================================================================

Metadata includes:

Report Name

Generated Date

Report Owner

Reporting Currency

Reporting Period

This information is used by the cover page and report information page.

Metadata should remain immutable once built.



===============================================================================
11. EXPORT OPTIONS
===============================================================================

ExpenseReportOptions defines how the report is rendered.

It contains:

includeSummary

includeCategorySummary

includeExpenseDetails

includeVendor

includeNotes

includeBusinessUse

includeDeductible

includeTaxInformation

includeReceiptStatus

includeRecurringStatus

includeExpenseType

includeTaxType

includeTaxAmount

The builder interprets these options.

The renderer only consumes them.



===============================================================================
12. REPORT PAGES
===============================================================================

The Expense Report currently consists of four logical sections.

Page 1

Cover Page

Page 2

Expense Summary

Page 3+

Detailed Expense Ledger

Final Page

Financial Summary

The ledger may expand to multiple pages depending on the number of
expenses.

The Financial Summary is always rendered after the ledger.

The report structure intentionally separates executive information,
transaction detail, and accounting summaries into distinct logical
sections.


===============================================================================
13. EXPORT DRAWER ARCHITECTURE
===============================================================================

The Export Expense Drawer serves as the single user interface for configuring
the Expense Report before generation.

The drawer is intentionally designed to behave like a report builder rather
than a simple "Export PDF" dialog.

Its responsibilities are strictly limited to collecting user preferences and
building the input required for the reporting engine.

The drawer performs no business calculations and contains no PDF rendering
logic.

Its purpose is to collect configuration only.



===============================================================================
14. EXPORT DRAWER RESPONSIBILITIES
===============================================================================

The Export Drawer is responsible for:

• Reporting Period selection

• Report Content preview

• Optional ledger column selection

• Live report preview

• Estimated page count

• Estimated PDF size

• Generated timestamp

• Building ExpenseReportOptions

• Calling exportExpenseReport()

The drawer must never:

• Calculate totals

• Build report summaries

• Create ledger rows

• Format currencies

• Generate PDF pages

• Render React PDF components



===============================================================================
15. REPORTING PERIOD
===============================================================================

The reporting period is selected independently from the Expenses page.

This was an intentional architectural decision.

Reason:

Users should be able to generate reports without affecting the active filters
used elsewhere inside the application.

The Export Drawer therefore owns its own reporting period state.

It is completely isolated from the Expenses page.


Current implementation:

selectedPreset

↓

startDate

↓

endDate

↓

reportingPeriod string

↓

Report Builder


The reporting period is converted into a printable string before entering the
report builder.

Example:

Jan 01, 2026 – Dec 31, 2026

This value becomes part of the report metadata.



===============================================================================
16. REPORTING PERIOD PERSISTENCE
===============================================================================

The drawer remembers the user's previous reporting period.

LocalStorage stores:

selectedPreset

startDate

endDate

This persistence is independent of every other page.

Closing the drawer does not reset the reporting period.

Reopening the drawer restores the previous selection.



===============================================================================
17. REPORT CONTENT PREVIEW
===============================================================================

The drawer displays every major report section before export.

Current report content includes:

Expense Summary

Detailed Expense Ledger

Category Summary

Report Information

This section exists only as a visual preview.

It is not responsible for enabling or disabling report sections.

Future versions may expose optional report sections while preserving the
same architecture.



===============================================================================
18. ALWAYS INCLUDED LEDGER COLUMNS
===============================================================================

Certain ledger columns are considered canonical accounting information.

These columns are always exported.

Current mandatory columns:

Date

Expense Name

Category

Vendor

Original Amount

Reporting Amount

Receipt Status

These columns cannot be disabled.

They define the minimum accounting record required for an exported expense.



===============================================================================
19. OPTIONAL LEDGER COLUMNS
===============================================================================

Business and tax related fields are optional.

The user may choose whether these columns appear inside the ledger.

Current optional columns:

Expense Type

Business Use %

Deductible %

Tax Type

Tax Amount

These selections are converted directly into ExpenseReportOptions.

No PDF logic exists inside the drawer.

The drawer simply captures the user's preferences.



===============================================================================
20. EXPENSEREPORTOPTIONS
===============================================================================

ExpenseReportOptions acts as the communication contract between the Export
Drawer and the Report Builder.

The UI produces this object.

The Report Builder consumes it.

The renderer never modifies it.

This architecture prevents presentation logic from leaking into business
logic.



===============================================================================
21. LIVE REPORT PREVIEW
===============================================================================

The Export Drawer provides a live preview of the report before export.

The preview includes:

Estimated Pages

Estimated PDF Size

Generated On

The preview updates automatically whenever:

Reporting period changes

Optional columns change

Expenses change

Reporting currency changes

No manual refresh is required.



===============================================================================
22. ESTIMATED PAGE COUNT
===============================================================================

The page count shown inside the drawer is generated from the actual PDF.

It is not an approximation based on row counts.

Process:

Generate PDF

↓

Read generated Blob

↓

Load using pdf-lib

↓

Count pages

↓

Display total pages

This ensures the displayed page count always matches the actual exported PDF.

Advantages:

No duplicate page calculations.

No manual estimation formulas.

No synchronization issues.

The PDF itself becomes the source of truth.



===============================================================================
23. ESTIMATED PDF SIZE
===============================================================================

The displayed PDF size is also generated from the real exported PDF.

Process:

Generate PDF

↓

Blob

↓

blob.size

↓

Convert bytes to KB

↓

Display

Although labelled as an estimate, the value represents the actual generated
file size at the time of calculation.

The "Estimate" label remains appropriate because any subsequent change to the
report configuration may produce a different file.



===============================================================================
24. LIVE PREVIEW UPDATE CYCLE
===============================================================================

Whenever export settings change:

Reporting Period

↓

Optional Columns

↓

Expense List

↓

Reporting Currency

↓

generateExpensePdf()

↓

Blob

↓

Estimated Pages

Estimated PDF Size

This creates a continuously synchronized preview without requiring the user
to manually regenerate anything.



===============================================================================
25. REPORT GENERATION PIPELINE
===============================================================================

The export pipeline intentionally separates report construction from PDF
rendering.

Pipeline:

Export Drawer

↓

exportExpenseReport()

↓

buildExpenseReportData()

↓

ExpenseReportData

↓

generateExpensePdf()

↓

ExpenseReportDocument

↓

Blob

↓

Download

Every layer owns exactly one responsibility.



===============================================================================
26. BUILDEXPENSEREPORTDATA()
===============================================================================

The builder represents the intelligence of the reporting system.

Responsibilities include:

Metadata construction

Executive Summary

Category Summary

Vendor Summary

Financial Summary

Ledger rows

Reporting currency conversion

Validation

Data normalization

Nothing outside this function should calculate report values.

Every PDF page trusts the builder completely.



===============================================================================
27. EXPENSEREPORTDATA
===============================================================================

ExpenseReportData is the canonical report contract.

It contains everything required to render the document.

Major sections include:

Metadata

Options

Summary

Category Summary

Vendor Summary

Financial Summary

Rows

Report Information

Disclaimer

This object is immutable after creation.

The renderer never modifies report data.



===============================================================================
28. EXPENSE REPORT ROW
===============================================================================

Each printable ledger row is represented by ExpenseReportRow.

Current fields include:

ID

Date

Expense Name

Expense Type

Category

Vendor

Original Currency

Original Amount

Reporting Currency

Reporting Amount

Business Use %

Deductible %

Tax Type

Tax Amount

Receipt Status

Recurring Status

Notes

This model exists specifically for reporting.

It intentionally separates printable data from database entities.



===============================================================================
29. FINANCIAL SUMMARY MODEL
===============================================================================

The Financial Summary consists of four logical accounting summaries.

Monthly Expense Summary

Original Currency Summary

Expense Type Summary

Tax Summary

Each summary is produced entirely inside the Report Builder.

The PDF renderer performs no calculations.

The Financial Summary page simply renders the provided structures.



===============================================================================
30. SUMMARY TABLE COMPONENT
===============================================================================

SummaryTable is the shared component used across every financial summary.

Responsibilities:

Render header

Render rows

Render optional total row

Currency formatting

Consistent styling

The component intentionally performs no calculations.

Totals are calculated before reaching the renderer.

This keeps rendering deterministic and reusable.



===============================================================================
31. DOCUMENT COMPOSITION
===============================================================================

ExpenseReportDocument assembles the report using high-level report sections.

Current logical composition:

Document

↓

Cover Page

↓

Expense Summary

↓

Expense Ledger

↓

Financial Summary

The document does not calculate data.

It simply assembles completed report sections.



===============================================================================
32. DETERMINISTIC LEDGER PAGINATION
===============================================================================

Originally, React PDF determined where ledger rows would break.

This resulted in:

Inconsistent page breaks

Variable row counts

Unpredictable layouts

Difficult future maintenance

The architecture was redesigned so EliteX owns ledger pagination.

The report now determines page boundaries before rendering.

React PDF simply renders those pages.

This change established deterministic ledger pagination throughout the
Expense Report system.



===============================================================================
33. PAGINATEROWS()
===============================================================================

paginateRows() is the shared pagination utility responsible for dividing
ledger rows into printable pages.

Current behavior:

Input:

Rows

Maximum rows per page

Output:

Array of pages

Each page contains a fixed number of ledger rows.

The Expense Report currently uses:

REPORT_LAYOUT

↓

LEDGER_ROWS_PER_PAGE

↓

14 rows

This value exists as a shared layout constant rather than a hardcoded number.



===============================================================================
34. LEDGER PAGE GENERATION
===============================================================================

ExpenseReportDocument no longer renders one large ledger.

Instead:

Rows

↓

paginateRows()

↓

Ledger Page 1

Ledger Page 2

Ledger Page 3

...

Each ledger page renders independently.

The table header repeats naturally because every page renders its own ledger
component.

This architecture greatly simplifies future pagination improvements.



===============================================================================
35. EXPENSE LEDGER COMPONENT
===============================================================================

ExpenseLedgerPages renders exactly one ledger page.

Responsibilities:

Render heading

Render table header

Render printable rows

Respect optional columns

Perform no calculations

Every page is rendered using the rows already assigned by paginateRows().

The component never decides where pages begin or end.

Pagination has already been completed before rendering begins.



===============================================================================
36. OPTIONAL COLUMN RENDERING
===============================================================================

Ledger columns are filtered before rendering.

The renderer checks ExpenseReportOptions.

Example:

Business Use

↓

Enabled?

↓

Render

Otherwise

↓

Skip column

This keeps rendering logic simple while maintaining deterministic layouts.

The renderer never modifies report data.

It only decides whether individual columns are visible.

===============================================================================
37. FINANCIAL SUMMARY ARCHITECTURE
===============================================================================

The Financial Summary represents the final accounting section of the Expense
Report.

Unlike the Detailed Expense Ledger, which renders individual expense records,
the Financial Summary presents aggregated accounting information intended for
management review, tax preparation, and financial reconciliation.

Current sections include:

• Monthly Expense Summary

• Original Currency Totals

• Expense Type Summary

• Tax Summary

Each section is independent and is generated entirely inside the Report
Builder.

The renderer simply displays these summaries.



===============================================================================
38. MONTHLY EXPENSE SUMMARY
===============================================================================

Purpose:

Provide a month-by-month breakdown of business expenses.

Each row contains:

Month

↓

Reporting Currency Total

A final total row summarizes all monthly expenses.

The builder performs all calculations.

SummaryTable renders the finished result.



===============================================================================
39. ORIGINAL CURRENCY TOTALS
===============================================================================

Purpose:

Display totals grouped by original transaction currency.

Example:

CAD

↓

Original CAD Total

USD

↓

Original USD Total

EUR

↓

Original EUR Total

No conversion occurs inside this section.

This summary exists solely to preserve visibility into the original currencies
used throughout the reporting period.

The report builder is responsible for constructing this dataset.



===============================================================================
40. EXPENSE TYPE SUMMARY
===============================================================================

Purpose:

Summarize expenses by expense type.

Example:

Subscription

↓

Reporting Total

Software

↓

Reporting Total

Hosting

↓

Reporting Total

Education

↓

Reporting Total

This section provides accountants and business owners with a quick view of
where money is being spent.

All grouping occurs before rendering.



===============================================================================
41. TAX SUMMARY
===============================================================================

Purpose:

Summarize tax collected across all expenses.

Example:

GST/HST

↓

Reporting Total

VAT

↓

Reporting Total

Sales Tax

↓

Reporting Total

The Tax Summary does not calculate tax.

It simply displays the totals supplied by the Report Builder.



===============================================================================
42. CURRENT FINANCIAL SUMMARY LIMITATION
===============================================================================

The current implementation relies on React PDF to determine how summary
sections flow across pages.

For typical datasets this produces acceptable results.

However, larger datasets may eventually cause:

• Sections beginning at the bottom of a page

• Awkward page breaks

• Headings separated from their tables

• Tables continuing unexpectedly

Although the current implementation is fully functional, deterministic
pagination for Financial Summary remains the final architectural improvement
planned for the Expense Report.



===============================================================================
43. LEDGER PAGINATION VS SUMMARY PAGINATION
===============================================================================

These two problems are intentionally treated differently.

Ledger pagination

↓

EliteX controls page boundaries.

Financial Summary

↓

React PDF currently controls page flow.

The ledger required deterministic pagination because every expense record is
independent.

The Financial Summary consists of grouped accounting sections, making its
pagination requirements fundamentally different.

The final solution will preserve logical sections rather than fixed row counts.



===============================================================================
44. REPORTSECTION COMPONENT
===============================================================================

ReportSection was introduced to establish a shared abstraction for grouping
logical report sections.

Current responsibilities:

Group related report content.

Provide a reusable wrapper for future pagination improvements.

Serve as the foundation for section-based rendering.

Although current pagination work remains incomplete, this component represents
the intended direction for future report architecture.



===============================================================================
45. PAGINATION PHILOSOPHY
===============================================================================

EliteX intentionally favors deterministic document generation over allowing
React PDF to make layout decisions.

Guiding principle:

EliteX should decide what belongs on each page.

React PDF should only render those decisions.

Whenever deterministic behavior can replace automatic behavior, deterministic
behavior is preferred.

This philosophy already governs ledger pagination and will eventually govern
Financial Summary pagination as well.



===============================================================================
46. EXPERIMENTS COMPLETED
===============================================================================

Multiple pagination approaches were evaluated during implementation.

These experiments were valuable because they eliminated several potential
architectural directions.



Experiment 1

React PDF Automatic Pagination

Result

Rejected

Reason

Inconsistent page breaks.

EliteX had no control over page layout.



Experiment 2

React PDF break Property

Result

Rejected

Reason

Did not consistently move sections onto new pages.

Behavior remained dependent upon React PDF's internal layout engine.



Experiment 3

Reserved Bottom Page Padding

Result

Rejected

Reason

Affected every report page.

Introduced regressions into the ledger layout.

Global layout changes were considered too invasive.



Experiment 4

Footer Reservation

Result

Rejected

Reason

Did not reliably reserve printable space.

Produced inconsistent results across pages.



Experiment 5

Footer Spacer

Result

Rejected

Reason

Only inserted blank space after content.

Did not influence page-breaking decisions.



Experiment 6

Automatic Footer Area

Result

Rejected

Reason

React PDF continued determining page layout.

Did not produce deterministic pagination.



These experiments confirmed that Financial Summary pagination should eventually
be solved through explicit document structure rather than layout tricks.



===============================================================================
47. DESIGN PRINCIPLES
===============================================================================

The Expense Report follows several permanent design principles.

Business logic belongs in builders.

Rendering belongs in components.

Pages should remain visually simple.

Whitespace is preferred over clutter.

Consistency is more important than maximizing page utilization.

Print quality is more important than matching the web interface.

Institutional appearance is preferred over decorative styling.

Professional accounting reports should remain predictable and easy to audit.



===============================================================================
48. ACCOUNTING PRINCIPLES
===============================================================================

Expense Reports should always preserve accounting integrity.

Reporting Currency totals represent converted reporting values.

Original Currency totals preserve original transaction amounts.

No mixed-currency totals are displayed.

Every printed value originates from canonical report data.

No calculations occur during rendering.

All financial values originate from the Report Builder.



===============================================================================
49. EXTENSIBILITY
===============================================================================

The reporting infrastructure has been intentionally designed to support future
report types.

Examples include:

Trading Performance Reports

Tax Reports

Broker Activity Reports

Year End Reports

Monthly Business Reports

Profit and Loss Statements

The shared reporting infrastructure should continue to expand without requiring
individual reports to duplicate components or theme definitions.

Shared utilities should remain report-agnostic whenever practical.



===============================================================================
50. IMPLEMENTATION STATUS
===============================================================================

Completed

✓ Canonical reporting architecture

✓ Export pipeline

✓ Shared reporting theme

✓ Shared reporting components

✓ Report builder

✓ ExpenseReportData contract

✓ Cover Page

✓ Executive Summary

✓ Financial Summary

✓ Detailed Expense Ledger

✓ Optional ledger columns

✓ Reporting Period selection

✓ Independent Export Drawer state

✓ LocalStorage persistence

✓ Estimated Pages

✓ Estimated PDF Size

✓ Report metadata

✓ Deterministic ledger pagination

✓ Shared paginateRows()

✓ REPORT_LAYOUT constants

✓ SummaryTable component

✓ ReportSection abstraction

✓ Professional PDF styling

✓ Separation of business logic and rendering



===============================================================================
51. REMAINING WORK
===============================================================================

One architectural task remains.

Financial Summary Pagination.

Target behavior:

Each logical accounting section should remain together whenever practical.

If a section cannot reasonably fit within the remaining printable area of the
current page, EliteX should begin a new page before rendering that section.

The long-term objective is to make Financial Summary pagination deterministic
while preserving the simplicity of the overall reporting architecture.

This work will remain isolated to the Financial Summary and will not affect:

Cover Page

Executive Summary

Ledger

Report Builder

Shared theme

Shared data contracts



===============================================================================
52. LOCKED ARCHITECTURAL DECISIONS
===============================================================================

The following decisions are considered canonical.

Business logic never belongs inside PDF components.

ExpenseReportData is the only input accepted by the renderer.

Report Builder owns every calculation.

Rendering components remain calculation-free.

Shared reporting theme files are mandatory.

Ledger pagination is deterministic.

Ledger row count is controlled through REPORT_LAYOUT.

PDF page count is derived from the generated PDF using pdf-lib.

Estimated PDF size is derived from the generated Blob.

The Export Drawer owns report configuration.

Reporting Period is isolated from the Expenses page.

Report components should remain reusable across future report types.

Future reporting features should extend the existing reporting framework rather
than introducing parallel implementations.



===============================================================================
53. FINAL ARCHITECTURAL VISION
===============================================================================

The Expense Report PDF Export System establishes the foundation for every
future printable report within EliteX Trading OS.

The long-term vision is a unified reporting framework where:

Every report shares a common design system.

Every report shares common layout primitives.

Every report uses canonical data contracts.

Every report separates calculation from rendering.

Every report produces deterministic, professional, accountant-ready output.

The Expense Report serves as the reference implementation for this framework.

Future report types should follow the same architectural principles, extending
the shared reporting infrastructure rather than reinventing it.

By maintaining a strict separation between report construction, data contracts,
and presentation, the reporting system remains scalable, maintainable, and
consistent as EliteX Trading OS continues to evolve.

================================================================================
END OF MASTER DESIGN SPECIFICATION
Expense Report PDF Export System
Version 2.0
================================================================================

===============================================================================
CANONICAL FILE RESPONSIBILITIES
===============================================================================

Expense Export

ExportExpenseDrawer.tsx

Responsibilities

• Collect export configuration
• Reporting period selection
• Optional ledger columns
• Live preview
• Build ExpenseReportOptions
• Trigger export

Must NOT

• Build report data
• Calculate summaries
• Generate PDF


------------------------------------------------------------------------------

exportExpenseReport.ts

Responsibilities

• Entry point for Expense Report export
• Coordinate report building
• Coordinate PDF generation
• Trigger download

Must NOT

• Calculate report data
• Render PDF


------------------------------------------------------------------------------

buildExpenseReportData.ts

Responsibilities

• Validate inputs
• Build ExpenseReportData
• Calculate summaries
• Build metadata
• Build ledger rows
• Apply reporting currency

Must NOT

• Render PDF


------------------------------------------------------------------------------

generateExpensePdf.ts

Responsibilities

• Render React PDF
• Generate Blob
• Return PDF blob

Must NOT

• Perform calculations


------------------------------------------------------------------------------

ExpenseReportDocument.tsx

Responsibilities

• Assemble report pages
• Compose document structure

Must NOT

• Calculate report data


------------------------------------------------------------------------------

ExpenseCoverPage.tsx

Responsibilities

• Render report cover


------------------------------------------------------------------------------

ExpenseSummaryPage.tsx

Responsibilities

• Render executive summary


------------------------------------------------------------------------------

ExpenseLedgerPages.tsx

Responsibilities

• Render one ledger page
• Render table header
• Render assigned rows

Must NOT

• Paginate rows


------------------------------------------------------------------------------

FinancialSummaryPage.tsx

Responsibilities

• Render accounting summaries

Must NOT

• Calculate summaries


------------------------------------------------------------------------------

SummaryTable.tsx

Responsibilities

• Shared summary renderer


------------------------------------------------------------------------------

Page.tsx

Responsibilities

• Shared PDF page


------------------------------------------------------------------------------

Document.tsx

Responsibilities

• Shared PDF document


------------------------------------------------------------------------------

ReportSection.tsx

Responsibilities

• Shared logical section wrapper


------------------------------------------------------------------------------

paginateRows.ts

Responsibilities

• Deterministic ledger pagination


------------------------------------------------------------------------------

reportLayout.ts

Responsibilities

• Shared layout constants


------------------------------------------------------------------------------

colors.ts

Responsibilities

• Shared PDF colors


------------------------------------------------------------------------------

spacing.ts

Responsibilities

• Shared PDF spacing


------------------------------------------------------------------------------

typography.ts

Responsibilities

• Shared PDF typography


------------------------------------------------------------------------------

types.ts

Responsibilities

• Canonical report contracts

===============================================================================
CURRENT IMPLEMENTATION STATUS
===============================================================================

Expense Report Export

███████████████████████░░ 95%

Completed

✓ Export Drawer
✓ Report Builder
✓ PDF Generator
✓ Theme System
✓ Shared Components
✓ Live Preview
✓ Page Count
✓ PDF Size
✓ Ledger Pagination
✓ Report Data Contracts
✓ Financial Summary
✓ Metadata
✓ Export Options

Remaining

□ Deterministic Financial Summary pagination

===============================================================================
54. CANONICAL FILE RESPONSIBILITIES
===============================================================================

This section defines the ownership boundaries of every major file involved in
the Expense Report PDF Export System.

Each file owns one responsibility.

Business logic, rendering, calculations, and orchestration should never become
mixed across these boundaries.

Future development should respect these ownership rules.


-------------------------------------------------------------------------------
ExportExpenseDrawer.tsx
-------------------------------------------------------------------------------

Purpose

Primary user interface for configuring the Expense Report.

Responsibilities

• Reporting period selection

• Report content preview

• Optional ledger column selection

• Live report preview

• Estimated page count

• Estimated PDF size

• Generated timestamp

• Build ExpenseReportOptions

• Trigger exportExpenseReport()

Must NOT

• Calculate report summaries

• Build ExpenseReportData

• Generate PDF layout

• Perform financial calculations



-------------------------------------------------------------------------------
exportExpenseReport.ts
-------------------------------------------------------------------------------

Purpose

Entry point for the Expense Report export process.

Responsibilities

• Coordinate report generation

• Call buildExpenseReportData()

• Call generateExpensePdf()

• Trigger browser download

Must NOT

• Calculate report values

• Render PDF

• Build React components



-------------------------------------------------------------------------------
buildExpenseReportData.ts
-------------------------------------------------------------------------------

Purpose

Canonical report builder.

Responsibilities

• Validate input

• Build ExpenseReportData

• Build metadata

• Build executive summary

• Build category summary

• Build vendor summary

• Build financial summary

• Build printable ledger rows

• Apply reporting currency

• Normalize report data

Must NOT

• Render PDF

• Create React components

• Generate blobs



-------------------------------------------------------------------------------
types.ts
-------------------------------------------------------------------------------

Purpose

Canonical reporting data contracts.

Responsibilities

• ExpenseReportData

• ExpenseReportOptions

• ExpenseReportMetadata

• ExpenseReportSummary

• ExpenseCategorySummary

• ExpenseVendorSummary

• ExpenseFinancialSummary

• ExpenseReportRow

• ExpenseReportInformation

Every reporting component depends upon these shared contracts.



-------------------------------------------------------------------------------
generateExpensePdf.ts
-------------------------------------------------------------------------------

Purpose

Generate the final PDF.

Responsibilities

• Render React PDF

• Generate Blob

• Return Blob

Must NOT

• Calculate report values

• Build summaries

• Modify report data



-------------------------------------------------------------------------------
ExpenseReportDocument.tsx
-------------------------------------------------------------------------------

Purpose

Root document composition.

Responsibilities

• Assemble report pages

• Compose document structure

• Render ledger pages

• Render financial summary

Must NOT

• Perform calculations

• Build report data



-------------------------------------------------------------------------------
ExpenseCoverPage.tsx
-------------------------------------------------------------------------------

Purpose

Render the report cover.

Responsibilities

• Report title

• Metadata

• Reporting period

• Owner

• Generated date

• Professional cover layout



-------------------------------------------------------------------------------
ExpenseSummaryPage.tsx
-------------------------------------------------------------------------------

Purpose

Render the executive summary.

Responsibilities

• Summary cards

• Category summary

• Vendor summary

• Report overview

Must NOT

• Calculate summary values



-------------------------------------------------------------------------------
ExpenseLedgerPages.tsx
-------------------------------------------------------------------------------

Purpose

Render one printable ledger page.

Responsibilities

• Ledger heading

• Table header

• Assigned ledger rows

• Optional column rendering

Must NOT

• Paginate rows

• Calculate totals

• Determine page breaks



-------------------------------------------------------------------------------
FinancialSummaryPage.tsx
-------------------------------------------------------------------------------

Purpose

Render accounting summaries.

Responsibilities

• Monthly Expense Summary

• Original Currency Totals

• Expense Type Summary

• Tax Summary

Must NOT

• Calculate summaries

• Build financial data

• Determine ledger pagination



-------------------------------------------------------------------------------
Document.tsx
-------------------------------------------------------------------------------

Purpose

Shared React PDF document wrapper.

Responsibilities

• Root document

• Shared document configuration



-------------------------------------------------------------------------------
Page.tsx
-------------------------------------------------------------------------------

Purpose

Shared printable page wrapper.

Responsibilities

• Standard page size

• Standard page margins

• Shared background

Every report page should use this component.



-------------------------------------------------------------------------------
SummaryTable.tsx
-------------------------------------------------------------------------------

Purpose

Shared financial summary table.

Responsibilities

• Render rows

• Render totals

• Currency formatting

• Shared table styling

Must NOT

• Calculate totals



-------------------------------------------------------------------------------
ReportSection.tsx
-------------------------------------------------------------------------------

Purpose

Shared logical section wrapper.

Responsibilities

• Group report sections

• Support future section-based pagination

• Improve report structure consistency



-------------------------------------------------------------------------------
paginateRows.ts
-------------------------------------------------------------------------------

Purpose

Canonical deterministic pagination utility.

Responsibilities

• Split ledger rows into printable pages

• Produce predictable page boundaries

• Support reusable pagination across future reports

Must NOT

• Render components

• Perform business calculations



-------------------------------------------------------------------------------
formatters.ts
-------------------------------------------------------------------------------

Purpose

Shared PDF formatting helpers.

Responsibilities

• Currency formatting

• Date formatting

• Shared printable formatting rules



-------------------------------------------------------------------------------
colors.ts
-------------------------------------------------------------------------------

Purpose

Shared PDF color palette.

Responsibilities

• Text colors

• Borders

• Background colors

• Shared reporting palette



-------------------------------------------------------------------------------
spacing.ts
-------------------------------------------------------------------------------

Purpose

Shared spacing system.

Responsibilities

• Page padding

• Section spacing

• Table spacing

• Paragraph spacing

No report should hardcode spacing values.



-------------------------------------------------------------------------------
typography.ts
-------------------------------------------------------------------------------

Purpose

Shared typography system.

Responsibilities

• Heading styles

• Body styles

• Labels

• Captions

No report should hardcode font sizes.



-------------------------------------------------------------------------------
reportLayout.ts
-------------------------------------------------------------------------------

Purpose

Shared reporting layout constants.

Responsibilities

• LEDGER_ROWS_PER_PAGE

• Future report layout constants

Every report should consume layout constants from this file instead of
hardcoding values.



===============================================================================
55. FINAL IMPLEMENTATION STATUS
===============================================================================

Expense Report PDF Export System

Overall Completion

█████████████████████████████░ 98%

Completed

✓ Canonical reporting architecture

✓ Export Drawer

✓ Report Builder

✓ Shared reporting infrastructure

✓ Shared PDF theme

✓ Shared PDF components

✓ Canonical report contracts

✓ Cover Page

✓ Executive Summary

✓ Detailed Expense Ledger

✓ Financial Summary

✓ Optional ledger columns

✓ Reporting Period selection

✓ LocalStorage persistence

✓ Estimated page count

✓ Estimated PDF size

✓ Live report preview

✓ Deterministic ledger pagination

✓ Shared paginateRows()

✓ Shared SummaryTable

✓ Shared ReportSection abstraction

✓ Professional institutional PDF styling

✓ Separation of business logic and rendering

Remaining

□ Deterministic Financial Summary pagination

This is the final remaining architectural enhancement planned for the Expense
Report PDF Export System.

Once implemented, the Expense Report architecture should be considered
production complete and will serve as the reference implementation for all
future reporting modules inside EliteX Trading OS.

================================================================================
END OF MASTER DESIGN SPECIFICATION
Expense Report PDF Export System
Version 2.0
================================================================================