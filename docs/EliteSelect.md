# EliteX UI Standard — EliteSelect (Universal Dropdown Component)

## Purpose

EliteSelect is the **official dropdown component** for the EliteX Trading OS.

From this point forward, **native HTML `<select>` elements are not permitted** anywhere in the application UI unless there is a compelling technical reason.

All dropdowns must use `components/ui/EliteSelect.tsx`.

---

# Why This Standard Exists

Native browser dropdowns render differently on every operating system.

Examples:

* Windows uses its own dropdown styling.
* macOS uses different controls and spacing.
* Linux varies by distribution and browser.

This creates an inconsistent experience and prevents EliteX from maintaining a premium, institutional interface.

EliteSelect guarantees a consistent appearance regardless of platform.

---

# Official Component Architecture

```
components/
└── ui/
    ├── EliteSelect.tsx
    └── CurrencyFlag.tsx
```

---

# Core Design Principles

EliteSelect must always provide:

* Premium institutional appearance
* Cross-platform consistency
* Keyboard accessibility
* Smooth animations
* Consistent spacing
* Reusable API
* No browser-native styling
* Full Tailwind customization

---

# Required Technology

EliteSelect is built using:

* Radix UI Select
* Tailwind CSS
* Lucide Icons
* CurrencyFlag component (when displaying currencies)

Native HTML `<select>` controls are not part of the EliteX design system.

---

# Currency Support Standard

Whenever a dropdown displays currencies:

DO NOT use:

* Emoji flags
* Unicode flags
* OS-rendered flag icons

Instead use:

```
<CurrencyFlag currency="USD" />
```

CurrencyFlag is the single source of truth for every flag used inside EliteX.

This ensures:

* Consistent rendering
* Cross-platform compatibility
* One centralized implementation
* Easy future replacement if another flag library is adopted

---

# EliteSelect Responsibilities

EliteSelect owns:

* Trigger
* Dropdown Portal
* Item rendering
* Keyboard navigation
* Hover states
* Selected states
* Animations
* Chevron icon
* Checkmark
* Alignment

Consumers should only provide:

* value
* options
* onChange
* optional width

Nothing else.

---

# Currency Option Standard

Currency options should contain only business data.

Correct:

```ts
[
  { value: "USD", label: "USD" },
  { value: "CAD", label: "CAD" },
  { value: "EUR", label: "EUR" }
]
```

Never store:

* emoji
* SVG
* image URLs
* icon strings

Visual rendering belongs inside EliteSelect.

---

# Cross-Platform Standard

EliteSelect must render identically on:

* macOS
* Windows
* Linux

No operating-system-specific styling should exist.

All visual behavior must come from EliteSelect.

---

# Layout Rules

Trigger:

* Vertically centered
* Consistent padding
* Chevron aligned
* Premium spacing

Dropdown:

* Portal rendered
* High z-index
* Rounded corners
* Institutional shadows
* Premium hover animation
* Centered items
* Consistent spacing

---

# Visual Standards

Every dropdown must include:

* Premium dark background
* Soft border
* Hover state
* Selected state
* Keyboard focus support
* Smooth transitions

No browser-native borders, arrows, or styling.

---

# Reusability Standard

EliteSelect must be reusable for:

* Accounts
* Brokers
* Reporting Currency
* Countries
* Timezones
* Languages
* Trading Sessions
* Exchanges
* Categories
* Expense Types
* Watchlists
* Future modules

No duplicate dropdown implementations should exist.

---

# CurrencyFlag Standard

CurrencyFlag is the only approved method for displaying currency flags.

Never render flags directly inside pages.

Never duplicate flag mappings.

Every page must use:

```
<CurrencyFlag currency={currency} />
```

Any future change to flag appearance should require modifying only CurrencyFlag.tsx.

---

# Future Customization

EliteSelect should remain easy to extend with optional props when needed, such as:

* width
* disabled
* placeholder
* search support
* grouped options
* icons
* multi-select (future)
* virtualization (future)

These enhancements should not require changes to consuming pages.

---

# Design Philosophy

EliteSelect is part of the EliteX Design System.

Pages describe **what** should be selected.

EliteSelect controls **how** selection is presented.

Presentation logic must remain centralized inside the reusable component.

---

# Official EliteX Rule

Every dropdown throughout EliteX Trading OS must use EliteSelect.

No page should implement its own dropdown UI.

No page should depend on browser-native select controls.

All dropdown behavior, styling, accessibility, animations, spacing, and cross-platform consistency are centralized within EliteSelect to ensure a single, maintainable, future-proof implementation across the entire application.

========================================================= ================================================================================================

# EliteX UI Standard — EliteSelect (V1 Updated)

## Status

EliteSelect V1 is now considered the official reusable dropdown component for EliteX Trading OS.

All future dropdowns should use EliteSelect instead of native HTML `<select>` elements unless a technical limitation requires otherwise.

---

## Supported Variants

### Compact Variant

Used for small selectors inside cards and toolbars.

Examples:

* Reporting Currency
* Account Selector
* Future Header Controls

Characteristics:

* Compact trigger
* Currency flags supported
* No selected checkmark inside dropdown
* Optimized for small widths
* Cross-platform consistent

Usage:

```tsx
<EliteSelect
  variant="compact"
  ...
/>
```

---

### Form Variant

Used for settings pages, drawers and forms.

Examples:

* Tax Settings Drawer
* Add Expense Drawer
* Future Settings Pages
* User Profile
* Broker Settings

Characteristics:

* Full-width trigger
* Premium institutional styling
* Selected item checkmark
* Consistent spacing
* Full keyboard support
* Cross-platform consistent

Usage:

```tsx
<EliteSelect
  variant="form"
  ...
/>
```

---

## Icon Behavior

EliteSelect does not automatically decide which icons to render.

Rules:

* Compact variant may display CurrencyFlag as a fallback.
* Form variant only displays icons explicitly provided by the caller.
* If no icon is supplied, no placeholder should be rendered.

This prevents empty placeholder boxes for non-currency dropdowns such as Province, Entity Type, Category, Vendor, etc.

---

## Current EliteX Usage

Compact

* Reporting Currency

Form

* Country
* Province / State
* Tax Entity Type
* Tax Year

---

## Future Standard

When converting Add Expense Drawer (and all future forms):

1. Replace every native `<select>` with EliteSelect.
2. Use `variant="form"` for all form fields.
3. Convert option lists into `EliteSelectOption[]`.
4. Keep business logic unchanged; only replace the UI control.

---

## Design Principle

EliteSelect is now the single source of truth for dropdowns throughout EliteX Trading OS.

Pages provide:

* value
* options
* onChange

EliteSelect owns:

* Styling
* Layout
* Animations
* Keyboard navigation
* Cross-platform consistency
* Icons
* Selected state
* Dropdown rendering

No page should implement its own dropdown styling going forward.


# EliteX UI Standard — EliteSelect (V1.1 Updated)

## Status

EliteSelect is the official reusable dropdown component for EliteX Trading OS.

All dropdowns throughout EliteX must use:

components/ui/EliteSelect.tsx

Native HTML:

<select>

elements are not allowed unless there is a strong technical requirement.

---

# Purpose

EliteSelect provides a single source of truth for dropdown behavior and appearance.

It solves:

- Cross-platform inconsistencies
- Windows native white dropdown issues
- Browser-specific rendering differences
- Duplicate dropdown styling
- Inconsistent spacing and alignment

EliteSelect controls:

- Trigger rendering
- Dropdown portal
- Keyboard navigation
- Hover states
- Selected states
- Chevron rendering
- Animations
- Layout consistency

Pages only provide:

- value
- options
- onChange
- optional sizing/alignment adjustments

---

# Official Component Location

components/

└── ui/

    ├── EliteSelect.tsx
    └── CurrencyFlag.tsx


---

# Technology

EliteSelect uses:

- Radix UI Select
- Tailwind CSS
- Lucide Icons
- CurrencyFlag component for currency rendering


---

# Supported Variants


## Compact Variant

Used for:

- Table filters
- Toolbar selectors
- Dashboard controls
- Reporting currency
- Small UI controls


Usage:

<EliteSelect
  variant="compact"
/>


Characteristics:

- Compact trigger
- Dense UI friendly
- Suitable for dashboards and tables
- Cross-platform consistent


---

## Form Variant

Used for:

- Settings pages
- Drawers
- Forms
- User profile
- Tax settings


Usage:

<EliteSelect
  variant="form"
/>


Characteristics:

- Larger interaction area
- Form-friendly spacing
- Selected item indicator
- Full-width layouts


---

# EliteSelect API

Current supported props:


value

Selected option value.


options

Array of business options.


onChange

Callback when selection changes.


width

Controls trigger width.


height

Controls trigger height.


variant

Available:

- compact
- form


align

Controls internal alignment mode.

Options:

- default
- center


Example:

<EliteSelect
  align="center"
/>


---

# Position Control System (V1.1)


EliteSelect now supports independent positioning controls.


## Selected Text Position


### Horizontal Position

Prop:

xOffset


Example:

xOffset="translate-x-4"


Moves selected text horizontally.


---

### Vertical Position

Prop:

yOffset


Example:

yOffset="translate-y-1"


Moves selected text vertically.


---

# Dropdown Arrow Position


The arrow/chevron can now be controlled independently.


## Horizontal Arrow Position

Prop:

iconOffset


Example:

iconOffset="-translate-x-2"


Moves arrow left/right.


---

## Vertical Arrow Position

Prop:

iconYOffset


Example:

iconYOffset="translate-y-1"


Moves arrow up/down.


---

# Example Full Control


<EliteSelect

  value={categoryFilter}

  variant="compact"

  align="center"

  xOffset="translate-x-4"

  yOffset="translate-y-0"

  iconOffset="-translate-x-2"

  iconYOffset="translate-y-1"

/>


Controls:

xOffset
→ selected text X position


yOffset
→ selected text Y position


iconOffset
→ dropdown arrow X position


iconYOffset
→ dropdown arrow Y position


---

# Expense Table Filter Standard

Expense table dropdowns use:

<EliteSelect

variant="compact"

align="center"

xOffset="translate-x-4"

iconOffset="-translate-x-2"

yOffset="translate-y-0"

>


Example:

<EliteSelect
  value={taxFilter}
  width="w-[70px]"
  height={filterHeight}
  variant="compact"
  align="center"
  xOffset="translate-x-4"
  iconOffset="-translate-x-2"
  iconYOffset="translate-y-0"
/>


Individual filters may override:

width

Example:

Tax filter:

width="w-[70px]"


while other filters can use the shared:

filterWidth


---

# Currency Dropdown Standard


Currency dropdowns must use:

<CurrencyFlag currency="USD" />


Never use:

- Emoji flags
- Unicode flags
- Manual SVG flags
- Image URLs


Currency options contain only business data.


Correct:

[
 {
   value: "USD",
   label: "USD"
 }
]


Incorrect:

[
 {
   value: "USD",
   label: "🇺🇸 USD"
 }
]


---

# Design Rules


Do not implement dropdown styling inside pages.


Incorrect:

<select className="...">


Correct:

<EliteSelect
 options={options}
/>


All visual behavior belongs inside:

components/ui/EliteSelect.tsx


---

# Current EliteX Usage


Compact:

- Reporting Currency
- Expense Table Filters
- Future toolbar selectors


Form:

- Country
- Province / State
- Tax Entity Type
- Tax Year
- Future settings forms


---

# Future EliteSelect Improvements (Not Required Now)

Possible future V2 improvements:

- Compact selected checkmark
- More compact dropdown item spacing
- Left aligned dropdown menu items
- Trigger width matching dropdown content
- Search support
- Grouped options
- Multi-select
- Virtualized large option lists


These are future enhancements only.


---

# Completed EliteSelect V1.1 Update


Added:

✅ align control

✅ xOffset control

✅ yOffset control

✅ iconOffset control

✅ iconYOffset control


Purpose:

Allow precise page-level alignment while keeping dropdown rendering centralized.

---

# EliteX Rule

EliteSelect is the single source of truth for dropdowns.

Pages define:

- What is selected
- Available options
- Business behavior


EliteSelect defines:

- How it looks
- How it opens
- How it behaves
- How it aligns
- How it renders across platforms


No page should create its own dropdown implementation.