# Elite X Trading Journal

## Vision

Professional trading analytics and journaling platform focused on options trading, performance analytics, and business tracking.

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

---

# Tech Stack

- Next.js
- TypeScript
- TailwindCSS
- Local JSON storage (V1)
- Supabase (future)
- Vercel deployment (future)

---

# Current V1 Scope

## Dashboard
- Total PnL
- Win rate
- Profit factor
- Recent trades
- Performance overview

## Trade Management
- IBKR CSV upload
- Manual trade entry
- Trade history table

## Expenses
- Daily expenses
- Monthly subscriptions
- Platform fees

## Analytics
- PnL tracking
- Win/loss tracking
- Calendar analytics
- Performance metrics

---

# Architecture Rules

- Do not rewrite unrelated files
- Keep components modular
- Separate UI from business logic
- Preserve architecture consistency
- Prefer small scoped updates
- Use full file rewrites for simplicity

---

# Folder Structure

/app
/components
/lib
/types
/data

---

# Storage Strategy

V1:
- Local JSON storage

Future:
- Supabase backend

---

# Development Workflow

1. Build locally first
2. Test incrementally
3. Commit stable checkpoints
4. Avoid unnecessary refactors
5. Feature-by-feature development

---

# Current Status

## Completed
- Next.js foundation setup
- Tailwind setup
- Initial architecture structure

## Next Steps
- Build professional dashboard shell
- Create layout system
- Add navigation/sidebar
- Create dark theme foundation