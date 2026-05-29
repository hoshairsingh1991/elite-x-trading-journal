
---------------------------------------------------------------------
Project location

cd "/Volumes/Gallery/EliteX Trading Journal/elite-x-trading-journal"
npm run dev

----------------------------------------------------------------------

Run server.  by     npm run dev

---------------------------------------------------------------------

Delete temp data like trades history

inside browser - inspect - console - 

localStorage.clear()

location.reload()

------------------------------------------------------------------

Latest Stable Checkpoint:
git checkout -b checkpoint/manual-lifecycle-replacement-v11
------------------------------------------------------------------


Latest Stable Checkpoint with USER ID AUTH
git commit -m "checkpoint/account-overview-multi-currency-v2"
checkpoint/broker-execution-enrichment-v10
git checkout -b checkpoint/execution-ledger-architecture-v11

cp -R . checkpoints/checkpoint-execution-ledger-foundation-v2    -  IBKR Live SYnc work now at this checkpoint.

CHECKPOINT: checkpoint/broker-management-v10

git commit -m "checkpoint/sync-metadata-schema-v14"


Status:
PRODUCTION-STABLE HYBRID ARCHITECTURE

Includes:
- deterministic execution rebuild architecture
- FIFO quantity-aware reconciliation
- overlapping CSV duplicate protection
- stable open position handling
- stable manual trade support
- stable modal editing
- stable trade history
- stable calendar analytics
- stable localStorage architecture
- deterministic execution identity

Known limitation:
Imported open positions are currently immutable.
Synthetic reconciliation overrides are intentionally disabled after failed architecture experiments.


Very IMPORTANT 

# Calendar Notes — Cloud Architecture Notes

## WHY `hasNote` WAS TEMPORARILY DISABLED

Before cloud migration, calendar note detection used:

```ts
const hasNote =
  mounted &&
  !!getDailyNote(
    formattedDay
  );
```

This worked because:

```txt
localStorage is synchronous
```

Meaning:
- instant lookup
- no async timing
- no network requests
- safe inside render loop

Each calendar cell could instantly check:
- does this date have a note?

---

# WHY THIS BREAKS AFTER SUPABASE

After cloud migration:

```txt
Supabase queries are asynchronous
```

Meaning:

```ts
getDailyNoteFromSupabase()
```

returns:

```txt
Promise<string>
```

NOT:
```txt
immediate string
```

This means:

```ts
await getDailyNoteFromSupabase()
```

CANNOT safely run:
- inside render
- inside calendar cell mapping
- inside JSX loops

Otherwise:
- dozens of requests fire
- render thrashing occurs
- network spam happens
- performance collapses
- Supabase rate limits become possible

---

# TEMPORARY SOLUTION

Current temporary stabilization:

```ts
const hasNote = false;
```

This intentionally disables:
- note icon highlighting
- note existence detection

until proper async state architecture is built.

This is considered:

```txt
temporary render-safe stabilization
```

NOT final architecture.

---

# CORRECT FUTURE ARCHITECTURE

Future solution requires:

```txt
cached async note-state architecture
```

Instead of:
- querying note existence during render

We should:
- load ALL daily notes ONCE
- cache them in React state
- perform local in-memory checks

---

# CORRECT FUTURE IMPLEMENTATION

## STEP 1 — ADD STATE

```ts
const [
  dailyNotes,
  setDailyNotes
] = useState<DailyNote[]>([]);
```

---

## STEP 2 — LOAD NOTES ONCE

```ts
useEffect(() => {

  async function load() {

    const notes =
      await loadDailyNotesFromSupabase();

    setDailyNotes(notes);
  }

  load();

}, []);
```

---

## STEP 3 — LOCAL LOOKUPS

Calendar cells should use:

```ts
const hasNote =
  dailyNotes.some(
    note =>
      note.date === formattedDay
  );
```

This creates:
- instant local lookups
- zero render-time network calls
- scalable async architecture
- stable performance

---

# IMPORTANT ARCHITECTURAL PRINCIPLE

Cloud data should NEVER be queried:
- directly during rendering
- repeatedly inside mapped UI loops
- per-cell/per-row network calls

Instead:
- load once
- cache in state
- render from memory

This is a foundational distinction between:

```txt
local app engineering
```

and:

```txt
cloud application engineering
```

---

# CURRENT STATUS

Calendar Notes now successfully support:

✅ Supabase persistence  
✅ cross-device continuity  
✅ behavioral metadata isolation  
✅ rebuild-independent journaling  
✅ date-bound cloud persistence  

Remaining future refinement:
- cached note existence indicators
- debounced autosave
- async state optimization
- note preload architecture
- UI refinement
