# Dashboard V2 Layout Lessons (DO NOT REPEAT)

## Context

While building Dashboard V2 middle row:

* Equity Curve
* Performance Breakdown
* Account & Currency

we spent significant time trying to fix spacing using traditional padding/margin approaches.

Most of them did NOT work in our layout.

---

# What DID NOT Work

We tested:

```tsx
px-4
px-6
px-8
px-10
px-20
```

on:

```tsx
EquitySection.tsx
```

Result:

No visible change.

---

We tested:

```tsx
mx-4
mx-6
mx-8
mx-10
```

Result:

No visible change.

---

We tested parent wrappers around:

```tsx
<EquitySection />
```

inside:

```tsx
page.tsx
```

Result:

No meaningful change.

---

We tested:

```tsx
w-full
```

card layouts.

Result:

Cards stretched edge-to-edge.

No external gutter spacing.

---

# What Actually Worked

The only spacing solution that consistently worked:

```tsx
<div className="flex justify-center">
  <div className="w-[98%]">

    ...

  </div>
</div>
```

Applied at:

```tsx
components/dashboard-v2/EquitySection.tsx
```

This produced:

* Correct left spacing
* Correct right spacing
* Correct alignment with Account Overview
* Correct visual gutter

Important:

Do NOT immediately replace this with px/mx utilities.

Those were tested extensively and failed in this layout.

---

# Wrapper Cleanup

Old approach:

```tsx
<div className="flex justify-center">
  <div className="w-full">

    Card Content

  </div>
</div>
```

Problem:

Wrapper served no purpose.

Created confusion during sizing.

---

New approach:

Cards render directly:

```tsx
<div className="h-[500px] ...">
```

Result:

Cleaner hierarchy.

More predictable flex behavior.

Simpler height calculations.

---

# Equity Section Ratios

Approved:

```tsx
flex-[1.6]
flex-1
flex-1
```

Meaning:

* Equity Curve = wider
* Performance Breakdown = standard
* Account & Currency = standard

Matches target dashboard closely.

---

# Final Approved Heights

```tsx
EquityCurveCard
h-[500px]

PerformanceBreakdownCard
h-[500px]

AccountCurrencyCard
h-[360px]
```

Important discovery:

Originally different heights appeared necessary because wrapper structure distorted visual sizing.

After cleanup:

```tsx
500
500
360
```

produced correct alignment.

---

# Rule Going Forward

Before touching spacing again:

1. Keep:

```tsx
w-[98%]
```

inside:

```tsx
EquitySection.tsx
```

2. Do NOT add:

```tsx
px-*
mx-*
```

trying to solve the same issue.

3. If spacing breaks later:

Check whether:

```tsx
w-[98%]
```

was removed.

This was the proven fix.

---

# Current Approved State

Spacing:
✓ Approved

Widths:
✓ Approved

Heights:
✓ Approved

Card Alignment:
✓ Approved

Move on to content implementation.

Do NOT spend another session re-debugging spacing unless the layout fundamentally changes.
