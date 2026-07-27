========================================================================================================================
ELITEX TRADING OS
MASTER DESIGN SPECIFICATION
EXPENSE REPORT PDF EXPORT SYSTEM
CANONICAL ARCHITECTURE
VERSION 1.0
========================================================================================================================

DOCUMENT PURPOSE
------------------------------------------------------------------------------------------------------------------------

This document is the single source of truth for the Expense Report PDF Export system inside EliteX Trading OS.

This replaces all previous handover notes.

Every future implementation decision should follow this document.

If implementation ever differs from these notes, these notes take precedence unless intentionally updated.

The goal is not simply to generate a PDF.

The goal is to build a professional accounting-grade reporting system capable of serving:

• Individual Tax Filing
• Sole Proprietorship
• Small Business
• Corporation
• Accountant Review
• External Audits
• CRA
• IRS
• HMRC
• Long-term Record Keeping

This architecture is also intended to become the foundation for every future report inside EliteX Trading OS.

Examples:

• Expense Reports
• Trade Reports
• Performance Reports
• Annual Reports
• Portfolio Reports
• Broker Reports
• Monthly Statements
• Tax Packages

Nothing in this document should be considered Expense-specific unless explicitly stated.

========================================================================================================================
PROJECT STATUS
------------------------------------------------------------------------------------------------------------------------

Expense Module V1 is considered feature complete.

Completed:

✓ Expenses Dashboard
✓ KPI Grid
✓ Expenses Overview
✓ Manual Expense Table
✓ Search
✓ Advanced Filters
✓ Pagination
✓ Add Expense
✓ Edit Expense
✓ Delete Expense
✓ Read Only Expense Details
✓ Receipt Upload
✓ Receipt Viewer
✓ Receipt Removal
✓ Reporting Currency
✓ Tax Information
✓ Recurring Expenses
✓ Supabase Persistence
✓ Professional UI Polish

Export UI is also COMPLETE.

Remaining work is the PDF generation pipeline.

========================================================================================================================
PROJECT PHILOSOPHY
------------------------------------------------------------------------------------------------------------------------

This is NOT a dashboard export.

This is NOT an analytics export.

This is NOT a screenshot of EliteX.

This is a professional Business Expense Report.

The report should be designed so that a user can immediately email the generated PDF to:

• Accountant
• Bookkeeper
• CRA
• IRS
• External Auditor

without needing to explain the report.

The report should feel like it came from professional accounting software.

Every design decision should ask one question:

"Can someone unfamiliar with EliteX understand this document immediately?"

If the answer is YES, the design is correct.

========================================================================================================================
GUIDING PRINCIPLE
------------------------------------------------------------------------------------------------------------------------

Every EliteX report must be capable of standing on its own as a professional business document.

If someone:

• prints page 6
• emails page 11
• stores the report for seven years
• submits it during an audit

that page alone should still identify:

• EliteX Trading OS
• Report Name
• Reporting Period
• Reporting Currency
• Page Number

No page should depend on another page to make sense.

========================================================================================================================
CURRENT EXPORT UI (COMPLETED)
------------------------------------------------------------------------------------------------------------------------

Export Drawer is complete.

Current sections:

✓ Reporting Period

✓ Report Content

    Expense Summary
    Expense Details
    Category Summary
    Report Information

✓ Report Preview

    Expense Count
    Category Count
    Date Range
    Reporting Currency

✓ Additional Columns

    Vendor
    Notes
    Business Use %
    Deductible %
    Tax Type
    Tax Amount
    Receipt Status
    Recurring

✓ Estimated Output

    Total Pages
    Total Columns
    Estimated PDF Size
    Generated On

✓ Fixed Header

✓ Scrollable Body

✓ Fixed Footer

Cancel

Export PDF

UI phase is complete.

No further UI redesign should occur unless functionality requires it.

========================================================================================================================
EXPORT PIPELINE
------------------------------------------------------------------------------------------------------------------------

Expenses

↓

Apply Reporting Currency

↓

Apply Reporting Period

↓

Apply Export Options

↓

Build Expense Report Data

↓

Generate PDF

↓

Download PDF

Every layer has exactly one responsibility.

========================================================================================================================
ARCHITECTURE PRINCIPLE
------------------------------------------------------------------------------------------------------------------------

Business logic and PDF rendering must NEVER be mixed.

Calculations belong in the data layer.

Rendering belongs in the PDF layer.

The PDF engine should never calculate anything.

========================================================================================================================
CURRENT PDF ARCHITECTURE
------------------------------------------------------------------------------------------------------------------------

lib/

pdf/

    expense/

        sections/

        buildExpenseReportData.ts

        generateExpensePdf.ts

    performance/

    shared/

        pdfTheme.ts

        formatters.ts

        utils.ts

        types.ts

This architecture should remain.

Future report types should follow the same pattern.

========================================================================================================================
RESPONSIBILITIES
------------------------------------------------------------------------------------------------------------------------

buildExpenseReportData.ts

Responsible for:

• filtering
• grouping
• totals
• summaries
• reporting currency conversion
• original currency totals
• validation
• printable rows

No PDF generation.

No page layout.

------------------------------------------------------------

generateExpensePdf.ts

Responsible for:

Receive prepared report data

↓

Generate PDF

↓

Return Blob

No calculations.

No grouping.

No business logic.

------------------------------------------------------------

shared/pdfTheme.ts

Single source of truth for:

Typography

Spacing

Margins

Brand colors

Table styles

Heading styles

Footer styles

Section spacing

Every future report should use this.

------------------------------------------------------------

shared/formatters.ts

Responsible for:

Currency formatting

Date formatting

Percentage formatting

Number formatting

No calculations.

------------------------------------------------------------

shared/utils.ts

Generic reusable helpers.

Examples:

Page numbering

Filename generation

Column widths

Common rendering helpers

Reusable table helpers

========================================================================================================================
REPORT BUILDING PHILOSOPHY
------------------------------------------------------------------------------------------------------------------------

Every report section should be independent.

Instead of one giant PDF function:

generateExpensePdf()

the report should be assembled from builders.

Cover

↓

Executive Summary

↓

Category Summary

↓

Detailed Expense Table

↓

Report Information

↓

Disclaimer

Each builder should be responsible for one section only.

========================================================================================================================
ACCOUNTING TRUTH
------------------------------------------------------------------------------------------------------------------------

EliteX distinguishes between:

Historical Truth

and

Presentation.

Historical Truth NEVER changes.

Presentation may change.

Historical Truth:

Original Date

Original Currency

Original Amount

Original Vendor

Original Tax

Presentation:

Reporting Currency

Reporting Amount

Reporting Totals

Presentation adapts.

Historical truth never changes.

========================================================================================================================
REPORTING CURRENCY RULE
------------------------------------------------------------------------------------------------------------------------

The PDF ALWAYS follows the Reporting Currency currently selected inside EliteX.

There is NO additional Reporting Currency selector inside Export.

Example:

Reporting Currency = CAD

↓

Every reporting total becomes CAD.

Original Amount remains untouched.

========================================================================================================================
ORIGINAL AMOUNT RULE
------------------------------------------------------------------------------------------------------------------------

Original Amount always represents historical truth.

Examples:

USD 25

will ALWAYS remain

USD 25

Reporting Amount changes depending on Reporting Currency.

Both values should always be visible.

========================================================================================================================
ORIGINAL CURRENCY TOTALS
------------------------------------------------------------------------------------------------------------------------

Different currencies must NEVER be combined.

Correct:

USD

CAD

EUR

each shown separately.

Incorrect:

USD + CAD combined together.

========================================================================================================================
DATA VALIDATION
------------------------------------------------------------------------------------------------------------------------

Before any PDF is generated:

Validate:

Reporting Currency exists

Date Range valid

Expenses exist

Totals reconcile

Categories generated

No invalid PDF should ever be produced.

========================================================================================================================
REPORT STRUCTURE
------------------------------------------------------------------------------------------------------------------------

Page 1

Cover Page

------------------------------------------------------------

Page 2

Executive Summary

------------------------------------------------------------

Page 3

Category Summary

------------------------------------------------------------

Remaining Pages

Detailed Expense Report

------------------------------------------------------------

Final Pages

Report Information

Disclaimer

========================================================================================================================
PAGE 1
------------------------------------------------------------------------------------------------------------------------

EliteX Trading OS

Business Expense Report

Business Name

Reporting Period

Reporting Currency

Generated Date

Prepared By

Footer

Confidential Business Expense Report

========================================================================================================================
EXECUTIVE SUMMARY
------------------------------------------------------------------------------------------------------------------------

Include:

Total Expense Records

Recurring Expenses

One-Time Expenses

Original Currency Totals

Reporting Currency Total

Tax Deductible Total

Non-Deductible Total

========================================================================================================================
CATEGORY SUMMARY
------------------------------------------------------------------------------------------------------------------------

Categories

Software

Market Data

Brokerage

Infrastructure

Education

Hardware

Other

Reporting Total

========================================================================================================================
DETAILED EXPENSE TABLE
------------------------------------------------------------------------------------------------------------------------

Columns

Date

Expense

Expense Type

Category

Vendor

Original Amount

Reporting Amount

Business %

Deductible %

Tax Type

Tax Amount

Receipt

Notes

========================================================================================================================
COLUMN RULES
------------------------------------------------------------------------------------------------------------------------

Include:

Date

Expense Name

Expense Type

Category

Vendor

Original Amount

Reporting Amount

Business %

Deductible %

Tax Type

Tax Amount

Receipt

Notes

Never include:

User ID

Database ID

Receipt URL

Storage URL

Supabase IDs

Created At

Updated At

Internal Flags

Hidden Metadata

========================================================================================================================
RECEIPTS
------------------------------------------------------------------------------------------------------------------------

Receipt images should NEVER be embedded.

Only display:

Receipt

Yes

No

Supporting documents remain inside EliteX.

========================================================================================================================
PAYMENT METHOD
------------------------------------------------------------------------------------------------------------------------

Payment Method will not be exported.

Reason:

Little accounting value.

========================================================================================================================
RECURRING
------------------------------------------------------------------------------------------------------------------------

Recurring Frequency is not exported.

Only recurring status/count belongs in summaries.

========================================================================================================================
NOTES
------------------------------------------------------------------------------------------------------------------------

Notes remain.

Long notes should be truncated.

Never allow a table row to become excessively tall.

========================================================================================================================
REPORT INFORMATION
------------------------------------------------------------------------------------------------------------------------

Final report section should contain:

Generated By

EliteX Trading OS

Generated On

Generated Time

EliteX Version

Reporting Currency

Reporting Period

Total Expense Records

Total Pages

Original Currency Totals

Reporting Total

========================================================================================================================
DISCLAIMER
------------------------------------------------------------------------------------------------------------------------

"This report was generated by EliteX Trading OS using manually recorded and/or imported business expense records.

Original amounts are displayed in their original transaction currency.

Reporting amounts are converted using the Reporting Currency selected within EliteX Trading OS at the time this report was generated.

Users remain responsible for verifying the accuracy and completeness of all records before submitting this report to an accountant or tax authority."

========================================================================================================================
FILE NAMING
------------------------------------------------------------------------------------------------------------------------

Automatically generate:

EliteX_Expense_Report_2026.pdf

or

EliteX_Expense_Report_2026-01-01_to_2026-12-31.pdf

========================================================================================================================
PDF DESIGN LANGUAGE
------------------------------------------------------------------------------------------------------------------------

Professional Accounting Report

White Background

Black Text

Gray Dividers

EliteX Blue Branding

Clean Tables

Readable Typography

Print Friendly

Black & White Printer Friendly

No Dashboard Styling

No Graphs

No KPI Cards

No Decorative Analytics

========================================================================================================================
LARGE DATASET SUPPORT
------------------------------------------------------------------------------------------------------------------------

The report should comfortably support:

Thousands of expenses

Multiple currencies

Multiple years

Automatic pagination

Repeated table headers

Repeated page footers

Rows should never split across pages.

Category sections should continue naturally across pages.

========================================================================================================================
DETERMINISTIC OUTPUT
------------------------------------------------------------------------------------------------------------------------

Generating the same report twice using identical data should produce identical content.

Ordering should always be deterministic.

Grouping should always be deterministic.

No random ordering.

No unpredictable layouts.

========================================================================================================================
AUDIT READINESS
------------------------------------------------------------------------------------------------------------------------

Every report should clearly answer:

Who generated it?

When was it generated?

What Reporting Period?

Which Reporting Currency?

Which EliteX version?

How many records?

What conversion methodology was used?

Were original currencies preserved?

Could this report be understood without opening EliteX?

If all answers are YES,

the report is audit-ready.

========================================================================================================================
PRINT-FIRST PHILOSOPHY
------------------------------------------------------------------------------------------------------------------------

The report should look professional:

On screen

As PDF

Printed

Photocopied

Scanned

Archived

No page should rely on color alone to communicate meaning.

========================================================================================================================
USER-CONTROLLED EXPORT
------------------------------------------------------------------------------------------------------------------------

The Export Drawer defines the report.

User selections determine:

Reporting Period

Report Sections

Additional Columns

Future Export Options

The PDF generation layer simply respects those selections.

========================================================================================================================
FUTURE ROADMAP
------------------------------------------------------------------------------------------------------------------------

PHASE A

✓ Export Drawer UI (Completed)

------------------------------------------------------------------------------------------------------------------------

PHASE B

Data Layer

• Build Expense Report Data
• Validation
• Aggregations
• Totals
• Currency Conversion

------------------------------------------------------------------------------------------------------------------------

PHASE C

PDF Infrastructure

• Theme
• Shared Components
• Fonts
• Layout Engine
• Pagination

------------------------------------------------------------------------------------------------------------------------

PHASE D

Report Sections

• Cover
• Executive Summary
• Category Summary
• Detailed Expense Table
• Report Information
• Disclaimer

------------------------------------------------------------------------------------------------------------------------

PHASE E

Production Polish

• Large Dataset Testing
• Performance Testing
• Print Validation
• Accountant Review
• CRA Readiness
• Final QA

========================================================================================================================
SUCCESS CRITERIA
------------------------------------------------------------------------------------------------------------------------

The Expense Report should feel like it was produced by professional accounting software.

It should be immediately understandable by accountants, bookkeepers, business owners, corporations, tax professionals, and audit authorities.

A user should be able to export the PDF, email it directly to their accountant, archive it for years, or provide it during an audit without needing to explain how EliteX works.

If the exported document can confidently stand on its own as a complete, professional business record, then the Expense Report Export System is considered complete.

========================================================================================================================
END OF MASTER SPECIFICATION
========================================================================================================================