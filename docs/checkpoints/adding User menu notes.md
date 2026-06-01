# ELITE X - UserMenuV2 Integration Standard

## Purpose

UserMenuV2 is now the platform-wide account menu.

It provides:

* User Avatar
* Online Status
* Elite Plan Card
* Analytics Card
* Profile Navigation
* Settings Navigation
* Sign Out
* Shared Dashboard Stats

---

# RULE #1

Never build a new avatar/menu.

Always use:

```tsx
import UserMenuV2
from "@/components/layout/UserMenuV2";
```

and:

```tsx
<UserMenuV2
  totalTrades={0}
  totalPnL={0}
  tradingDays={0}
/>
```

The props are placeholders only.

UserMenuV2 now reads its stats from:

```text
localStorage
elite-x-menu-stats
```

---

# RULE #2

Never place UserMenuV2 inside content cards.

Wrong:

```text
Trade Table
Analytics Card
Calendar Widget
Notes Card
```

Correct:

```text
Page Header
Top Right Corner
```

Examples:

Dashboard
Trades
Notes
Profile
Settings

---

# RULE #3

Standard Header Pattern

Use:

```tsx
<div className="flex items-center gap-4">

  <UserMenuV2
    totalTrades={0}
    totalPnL={0}
    tradingDays={0}
  />

</div>
```

or:

```tsx
<div className="flex items-center gap-4">

  <ActionButton />

  <UserMenuV2
    totalTrades={0}
    totalPnL={0}
    tradingDays={0}
  />

</div>
```

Examples:

```text
[ Add Trade ] [ Avatar ]
[ Delete ]    [ Avatar ]
[ Export ]    [ Avatar ]
```

Avatar always sits far right.

---

# RULE #4

Dashboard is Source of Truth

Dashboard writes:

```text
elite-x-menu-stats
```

to localStorage.

UserMenuV2 reads:

```text
elite-x-menu-stats
```

when opened.

Never duplicate analytics calculations inside:

```text
Profile
Settings
Notes
Trades
Analytics
```

---

# RULE #5

If UserMenu Numbers Don't Update

Check:

Dashboard writes:

```tsx
localStorage.setItem(
  "elite-x-menu-stats",
  ...
)
```

UserMenu reads:

```tsx
localStorage.getItem(
  "elite-x-menu-stats"
)
```

when menu opens.

If Dashboard stats change but menu does not:

Check UserMenuV2 open handler.

---

# RULE #6

Do Not Put UserMenu In Sidebar

Rejected Architecture:

```text
Sidebar
  Overview
  Trades
  Notes
  User Menu
```

Approved Architecture:

```text
Top Right Corner
```

Reasons:

* Premium appearance
* Matches TradingView
* Matches Notion
* Matches modern SaaS apps
* Cleaner navigation hierarchy

---

# RULE #7

Adding UserMenuV2 To New Pages

Checklist:

1. Import UserMenuV2

```tsx
import UserMenuV2
from "@/components/layout/UserMenuV2";
```

2. Locate page header.

3. Add:

```tsx
<UserMenuV2
  totalTrades={0}
  totalPnL={0}
  tradingDays={0}
/>
```

4. Build:

```bash
npm run build
```

5. Verify:

* Avatar visible
* Dropdown opens
* Stats visible
* Stats match Dashboard

Done.

Typical integration time:

1–2 minutes.

```
```

# ELITE X - UserMenuV2 Code Template

## Standard Import

```tsx
import UserMenuV2
from "@/components/layout/UserMenuV2";
```

---

## Standard Placement

```tsx
<div className="flex items-center gap-4">

  <UserMenuV2
    totalTrades={0}
    totalPnL={0}
    tradingDays={0}
  />

</div>
```

---

## Standard Header Placement

Page Header:

```tsx
<div className="flex items-center justify-between">

  <div>
    Page Content
  </div>

  <div className="flex items-center gap-4">

    <ActionButton />

    <UserMenuV2
      totalTrades={0}
      totalPnL={0}
      tradingDays={0}
    />

  </div>

</div>
```

Examples:

```tsx
[ Add Trade ] [ UserMenuV2 ]
```

```tsx
[ Export ] [ UserMenuV2 ]
```

```tsx
[ Delete ] [ UserMenuV2 ]
```

---

## NEVER USE

Do NOT do:

```tsx
<UserMenuV2 />
```

because UserMenuV2 currently expects props.

Do NOT calculate:

```tsx
totalTrades
totalPnL
tradingDays
```

inside new pages.

Do NOT duplicate Dashboard analytics.

Do NOT build a second avatar component.

Do NOT place UserMenuV2 inside:

* Tables
* Cards
* Sidebar
* Modals

---

## Current Elite X Standard

Always use:

```tsx
<UserMenuV2
  totalTrades={0}
  totalPnL={0}
  tradingDays={0}
/>
```

UserMenuV2 reads actual values from:

```text
localStorage
elite-x-menu-stats
```

when opened.

The props are placeholders only.

---

## Build Verification

After adding UserMenuV2:

```bash
npm run build
```

Verify:

✅ Avatar visible

✅ Dropdown opens

✅ Stats visible

✅ Stats match Dashboard

✅ No hydration errors

Done.

```
```

