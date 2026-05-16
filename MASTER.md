# Elite X Trading Journal

## Vision

Professional institutional-grade trading analytics and journaling platform focused on:
- discretionary futures/options trading
- execution analytics
- performance review
- behavioral journaling
- business tracking
- professional workflow optimization

The platform should feel:
- clean
- premium
- fast
- minimal
- institutional
- execution-focused

---

# Core Principles

- Stability first
- Modular architecture
- Incremental feature building
- Local-first development
- Git-safe workflow
- Minimal rewrites
- Clean UI/UX
- Beginner-safe development process
- Typography-first design
- Spacing over clutter
- Surgical edits over full rewrites

---

# Tech Stack

- Next.js
- TypeScript
- TailwindCSS
- Local JSON storage (V1)
- Supabase (future)
- Vercel deployment (future)

---

# Design Language

## UI Direction

The UI should feel:
- institutional
- modern
- minimal
- analytics-focused
- typography-driven

Inspired by:
- Tradelizer
- Linear
- Notion
- Bloomberg terminals
- modern SaaS dashboards

---

# UI Philosophy

Elite X UI should prioritize:

- clarity over decoration
- readability over density
- spacing over borders
- typography over containers
- workflow speed over visual gimmicks

The platform should feel:
- professional
- calm
- analytical
- focused
- premium

Avoid:
- flashy retail trading aesthetics
- neon overload
- crowded dashboards
- excessive gradients
- unnecessary widgets

---

# UI Rules

## DO

- Use spacing for hierarchy
- Keep modules breathable
- Use large typography
- Preserve optical alignment
- Use incremental changes
- Prefer clean layouts over flashy UI

## DO NOT

- Overuse nested cards
- Add unnecessary borders
- Rewrite stable layouts casually
- Compress modules tightly
- Break spacing systems
- Remove optical offsets without testing

---

# Current UI Checkpoint

## Stable Layout

Current stable dashboard includes:

- Sidebar
- Header actions
- Account Overview
- Trading Performance
- P&L Analytics placeholder
- Full-width Trading Calendar

This layout is currently considered STABLE.

---

# Critical UI Notes

## Calendar System

TradingCalendar.tsx is highly sensitive.

DO NOT casually modify:
- width calculations
- flex wrappers
- parent containers
- relative offsets
- alignment logic

The calendar currently uses:
- manual optical balancing
- relative positioning fixes
- controlled spacing offsets

These are intentional.

---

## Optical Alignment System

The project uses:

```tsx
relative left-2
relative left-4
relative left-8
relative right-*
top-*