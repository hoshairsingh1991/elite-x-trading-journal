ELITE X TRADING OS
TAX DEDUCTIBLE SUMMARY CARD
MASTER ARCHITECTURE DOCUMENT

STATUS: V1 COMPLETE

==================================================
PURPOSE
=======

The Tax Deductible Summary card exists to answer one question:

"Based on my deductible expenses and tax profile, how much tax benefit could I potentially receive?"

This card is informational only.

It does NOT:

* File taxes
* Calculate exact tax liability
* Replace an accountant
* Produce CRA/IRS compliant tax filings

It provides estimated tax savings based on deductible expenses and user-configured tax assumptions.

==================================================
DATA SOURCES
============

The card pulls data from two systems:

1. Expenses System
2. User Tax Profile System

==================================================
EXPENSES TABLE
==============

Source:

expenses

Important fields:

is_tax_deductible
deductible_percent
original_amount
billed_currency

Logic:

Only expenses marked as tax deductible participate in calculations.

Example:

TradingView Subscription
Amount: $100
Tax Deductible: TRUE
Deductible Percent: 100

Contribution:

$100 deductible

Example:

Home Internet
Amount: $100
Tax Deductible: TRUE
Deductible Percent: 50

Contribution:

$50 deductible

Formula:

# Deductible Amount

original_amount
×
(deductible_percent / 100)

==================================================
USER TAX PROFILE TABLE
======================

Table:

user_tax_profiles

Purpose:

Stores user tax assumptions used by Tax Deductible Summary calculations.

Columns:

id
user_id
country
country_code
province
entity_type
tax_rate
tax_year
created_at
updated_at

==================================================
USER TAX PROFILE RULE
=====================

# One User

One Tax Profile

Database Constraint:

UNIQUE(user_id)

Storage Layer:

lib/storage/supabaseTaxProfileStorage.ts

Functions:

loadTaxProfile()
saveTaxProfile()

Upsert Rule:

onConflict: "user_id"

Prevents duplicate tax profiles.

==================================================
SUPPORTED COUNTRIES
===================

Canada
United States
Other

Stored Fields:

country
country_code

Examples:

Canada
CA

United States
US

Other
OTHER

==================================================
SUPPORTED ENTITY TYPES
======================

Stored Values:

Individual
Sole Proprietorship
Corporation
Partnership
Trust
Other

Display Values:

Individual

Sole Proprietorship
→ Sole Prop.

Corporation
→ Corp.

Partnership
→ Partner.

Trust

Other

Display formatting exists only for UI.

Database stores full values.

==================================================
TAX RATE
========

Field:

tax_rate

Type:

Number

Example:

30

Meaning:

30%

Used for estimated tax savings calculations.

Formula:

# Estimated Tax Benefit

Tax Deductible Total
×
(Tax Rate / 100)

Example:

# Tax Deductible Total

$155

# Tax Rate

30%

# Tax Benefit

$46.50

==================================================
TAX YEAR
========

Field:

tax_year

Purpose:

Stores the year tax assumptions apply to.

Current Implementation:

Dynamic Year Generation

Current Year ± 5 Years

Example:

2021
2022
2023
2024
2025
2026
2027
2028
2029
2030
2031

==================================================
CARD SECTIONS
=============

SECTION 1

Tax Deductible Total

Purpose:

Shows total deductible expense value.

Formula:

SUM(
deductible amount
for all deductible expenses
)

Example:

TradingView
$100

Bookmap
$55

Result:

$155

==================================================
SECTION 2

Estimated Tax Benefit

Purpose:

Shows estimated tax savings.

Formula:

Tax Deductible Total
×
(Tax Rate / 100)

Example:

$155
×
30%

=

$46.50

==================================================
SECTION 3

Deductible Percentage Ring

Purpose:

Shows what percentage of all expenses are deductible.

Formula:

Tax Deductible Total
÷
Total Expenses
×
100

Example:

# Deductible

$155

# Total Expenses

$400

Result:

38.75%

Display:

39%

==================================================
SECTION 4

Tax Profile Summary Row

Displays:

Tax Rate
Province
Entity Type
Tax Year

Examples:

30%
Ontario
Individual
2026

Purpose:

Provides visible audit trail of assumptions used in calculations.

==================================================
SECTION 5

Calculation Basis

Purpose:

Explains calculation to user.

Display:

$155
×
30%
===

$46.50

Values:

Deductible Expenses
Tax Rate
Estimated Tax Benefit

==================================================
SECTION 6

Disclaimer

Current Text:

Estimates are based on your configured tax profile and deductible expenses.

Actual tax treatment may vary by country, province/state, and guidance from your tax professional.

Purpose:

Legal protection and expectation management.

==================================================
PROFILE STATUS BADGE
====================

Previous:

High Confidence

Removed because confidence was never calculated.

Current:

Profile Configured

Meaning:

User has configured a tax profile.

This is a state badge.

Not a confidence score.

==================================================
TAX SETTINGS DRAWER INTEGRATION
===============================

Edit Button:

Opens TaxSettingsDrawer

Drawer Updates:

country
province
entity_type
tax_rate
tax_year

Save Flow:

Save Changes
→ saveTaxProfile()
→ Supabase Upsert
→ Reload Tax Profile
→ Refresh Tax Deductible Summary

==================================================
CURRENT V1 CAPABILITIES
=======================

✓ Tax profile persistence
✓ Country support
✓ Province support
✓ Entity type support
✓ Dynamic tax years
✓ Tax rate presets
✓ Estimated tax savings
✓ Deductible percentage calculations
✓ Supabase integration
✓ One profile per user enforcement
✓ Profile summary display
✓ Calculation transparency

==================================================
OUT OF SCOPE FOR V1
===================

✗ CRA integration
✗ IRS integration
✗ Actual tax return calculations
✗ Tax bracket engine
✗ Multi-country tax rules
✗ Automatic tax optimization
✗ Accountant integrations
✗ Tax filing exports

==================================================
V1 STATUS
=========

Production Ready

Tax Deductible Summary Card Architecture Complete.
