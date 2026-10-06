// =====================================================
// ELITE X — DAILY REVIEW TRADE NOTES MASTER NOTES
// =====================================================
//
// PURPOSE:
// Persistent notes that belong specifically to a trade
// inside the Daily Review Trade Drawer.
//
// CRITICAL ARCHITECTURE RULE:
// Daily Review Trade Notes are COMPLETELY SEPARATE
// from the existing Main Notes system.
//
// DO NOT MERGE THESE TWO SYSTEMS.
// =====================================================



// =====================================================
// 1. ARCHITECTURE
// =====================================================

Main Notes System
  ↓
notes
note_trades
note_blocks
note_attachments
  ↓
Main Notes page


Daily Review Trade Notes
  ↓
daily_review_trade_notes
  ↓
Daily Review Trade Drawer
  ↓
TradeNotesTab


// CRITICAL SEPARATION
//
// Daily Review Trade Notes:
// - Must NOT use the "notes" table
// - Must NOT use "note_trades"
// - Must NOT use "note_blocks"
// - Must NOT use "note_attachments"
// - Must NOT use supabaseNoteStorage.ts
// - Must NOT appear on the Main Notes page
// - Must NOT modify the Main Notes system
// - Must NOT affect executions
// - Must NOT affect FIFO
// - Must NOT affect P&L
// - Must NOT affect analytics
// - Must NOT affect canonical trade reconstruction
//
// The two systems are independent by design.



// =====================================================
// 2. DAILY REVIEW TRADE NOTE DATA MODEL
// =====================================================

Dedicated Supabase table:

public.daily_review_trade_notes


Columns:

id
  uuid
  primary key
  default gen_random_uuid()

user_id
  uuid
  not null
  references auth.users(id)
  on delete cascade

trade_id
  text
  not null

content
  text
  not null

created_at
  timestamptz
  not null
  default now()

updated_at
  timestamptz
  not null
  default now()


// IMPORTANT:
//
// trade_id is intentionally TEXT.
//
// It is NOT a foreign key to the canonical trades
// database structure.
//
// Reason:
// Elite X uses an execution-first architecture and
// Trade is a derived object. Daily Review notes should
// not introduce an unnecessary dependency into the
// trading ledger.



// =====================================================
// 3. ORIGINAL TABLE CREATION SQL
// =====================================================
//
// The table was initially created as "trade_notes"
// and was subsequently renamed to
// "daily_review_trade_notes".
// The final production name is:
// daily_review_trade_notes
// =====================================================

create table public.trade_notes (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  trade_id text not null,

  content text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index trade_notes_user_trade_created_idx
  on public.trade_notes (
    user_id,
    trade_id,
    created_at desc
  );

alter table public.trade_notes enable row level security;

create policy "Users can view their own trade notes"
  on public.trade_notes
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own trade notes"
  on public.trade_notes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trade notes"
  on public.trade_notes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own trade notes"
  on public.trade_notes
  for delete
  using (auth.uid() = user_id);


// =====================================================
// 4. FINAL TABLE NAME
// =====================================================
//
// The original table was created as:
//
// trade_notes
//
// It was then renamed:
//
// trade_notes
//     ↓
// daily_review_trade_notes
//
// Final table name:
//
// public.daily_review_trade_notes
// =====================================================

alter table public.trade_notes
rename to daily_review_trade_notes;


// =====================================================
// 5. TABLE PRIVILEGES
// =====================================================
//
// After the rename, the application initially returned:
//
// 42501
// permission denied for table daily_review_trade_notes
//
// Supabase indicated that the authenticated role
// needed table privileges.
//
// Final privilege grant:
//
// =====================================================

grant select, insert, update, delete
on public.daily_review_trade_notes
to authenticated;


// =====================================================
// 6. SECURITY MODEL
// =====================================================
//
// Table privileges allow the authenticated role to
// access the table.
//
// RLS determines which rows the authenticated user
// may access.
//
// Security model:
//
// authenticated
//      ↓
// table privileges
//      ↓
// Row Level Security
//      ↓
// only user's own notes
//
// Every storage operation also explicitly scopes by
// authenticated user_id where appropriate.
//
// DO NOT remove RLS.
// DO NOT make this table public.
// DO NOT use unrestricted queries.



// =====================================================
// 7. DOMAIN TYPE
// =====================================================
//
// File:
//
// types/dailyReviewTradeNote.ts
//
// Current type:
//
// =====================================================

export interface DailyReviewTradeNote {
  id: string;

  userId: string;

  tradeId: string;

  content: string;

  createdAt: string;

  updatedAt: string;
}


// =====================================================
// 8. DEDICATED STORAGE LAYER
// =====================================================
//
// File:
//
// lib/storage/supabaseDailyReviewTradeNoteStorage.ts
//
// This file is COMPLETELY SEPARATE from:
//
// lib/storage/supabaseNoteStorage.ts
//
// NEVER add Daily Review Trade Note functionality
// to supabaseNoteStorage.ts.
//
// =====================================================


Database row type:

type DailyReviewTradeNoteRow = {
  id: string;

  user_id: string;

  trade_id: string;

  content: string;

  created_at: string;

  updated_at: string;
};


Domain mapping:

database
  snake_case
      ↓
domain
  camelCase


Current storage functions:

loadDailyReviewTradeNotes(
  tradeId: string
)

createDailyReviewTradeNote(
  tradeId: string,
  content: string
)

updateDailyReviewTradeNote(
  noteId: string,
  content: string
)

deleteDailyReviewTradeNote(
  noteId: string
)


// =====================================================
// 9. LOAD FUNCTION
// =====================================================
//
// Loads notes specifically for the selected trade.
//
// Query behavior:
//
// - authenticated user required
// - user_id = authenticated user's ID
// - trade_id = selected trade ID
// - ordered by created_at descending
// - newest notes first
// =====================================================

.from("daily_review_trade_notes")
.select(`
  id,
  user_id,
  trade_id,
  content,
  created_at,
  updated_at
`)
.eq("user_id", user.id)
.eq("trade_id", tradeId)
.order("created_at", {
  ascending: false,
});


// Empty or invalid trade ID returns [].
//
// Failed load returns [] and logs:
//
// "FAILED TO LOAD DAILY REVIEW TRADE NOTES:"



 // ====================================================
 // 10. CREATE FUNCTION
 // ====================================================
 //
 // Creates a new note for the selected trade.
 //
 // Validation:
 //
 // - tradeId must exist
 // - content must not be empty
 // - authenticated user required
 //
 // Stores:
 //
 // user_id
 // trade_id
 // content
 //
 // Supabase generated:
 //
 // id
 // created_at
 // updated_at
 //
 // Returns the created DailyReviewTradeNote.
 // ====================================================



 // ====================================================
 // 11. UPDATE FUNCTION
 // ====================================================
 //
 // updateDailyReviewTradeNote()
 //
 // Updates:
 //
 // content
 // updated_at
 //
 // Query is scoped by:
 //
 // note id
 // authenticated user id
 //
 // This prevents updating another user's note.
 // ====================================================



 // ====================================================
 // 12. DELETE FUNCTION
 // ====================================================
 //
 // deleteDailyReviewTradeNote()
 //
 // Deletes by:
 //
 // note id
 // authenticated user id
 //
 // Returns:
 //
 // true  = successful delete
 // false = failed delete
 //
 // UI separately removes the deleted note from local
 // React state after successful database deletion.
 // ====================================================



// =====================================================
// 13. DAILY REVIEW COMPONENT
// =====================================================
//
// File:
//
// components/dashboard/daily-review/trade-review/TradeNotesTab.tsx
//
// The component is trade-aware.
//
// Props:
//
// interface TradeNotesTabProps {
//   trade: Trade;
// }
//
// Component:
//
// TradeNotesTab({
//   trade,
// })
//
// This gives the component access to:
//
// trade.id
//
// The trade ID identifies which Daily Review notes
// belong to the current trade.
// =====================================================


// =====================================================
// 14. DRAWER WIRING
// =====================================================
//
// File:
//
// components/dashboard/daily-review/DailyReviewTradeDrawer.tsx
//
// Notes tab now passes the current trade:
//
// <TradeNotesTab
//   trade={trade}
// />
//
// This is important because each Daily Review Notes
// instance is trade-specific.
//
// Existing drawer geometry remains unchanged.
//
// Current drawer width:
//
// w-[340px]
//
// Existing intentional gap between tabs and content:
//
// <div className="h-[10px] shrink-0" />
//
// Existing content scroll owner remains unchanged.
// =====================================================



// =====================================================
// 15. TRADE-SWITCH BEHAVIOR
// =====================================================
//
// When the selected trade changes:
//
// trade.id changes
//
// The useEffect in TradeNotesTab resets:
//
// setNote("")
// setSavedLocally(false)
//
// and reloads:
//
// loadDailyReviewTradeNotes(trade.id)
//
// Result:
//
// Trade A
//   ↓
// editor shows Trade A draft / empty state
//
// switch to Trade B
//   ↓
// editor resets
//   ↓
// Trade B notes load
//
// This prevents the previous trade's draft text from
// appearing inside the next trade.
// =====================================================



// =====================================================
// 16. SAVE BEHAVIOR
// =====================================================
//
// Save Note:
//
// handleSave()
//
// Flow:
//
// 1. Validate note is not empty.
// 2. Set isSaving(true).
// 3. Call createDailyReviewTradeNote().
// 4. If successful:
//      prepend created note to pastNotes.
// 5. Set Saved state.
// 6. Set isSaving(false).
//
// The new note immediately appears in Past Notes
// without requiring a page refresh.
//
// Supabase persistence was verified manually.
// =====================================================



// =====================================================
// 17. PAST NOTES UI
// =====================================================
//
// Past Notes is a compact historical list inside the
// Daily Review drawer.
//
// Header:
//
// Past Notes (N)
//
// N comes directly from:
//
// pastNotes.length
//
// "View All" was intentionally removed.
//
// Each note is displayed as a compact card.
//
// Current card height:
//
// h-[52px]
//
// This is intentional explicit geometry.
//
// Do not rely on pt-* / pb-* / mt-* to control card
// height during future UI tuning.
//
// Direct height should use:
//
// h-[52px]
//
// =====================================================


// =====================================================
// 18. PAST NOTES SCROLLING
// =====================================================
//
// The outer Past Notes content area owns the scrollbar.
//
// Current concept:
//
// scroll container
//      ↓
// full available width
//      ↓
// scrollbar remains in its dedicated position
//
// Inner note list controls the width and X position
// of the actual note cards.
//
// Current working structure:
//
// outer scroll container
//   w-full
//   overflow-y-auto
//
// inner note list
//   w-[calc(100%-14px)]
//   relative
//   left-[8px]
//
// This separation allows:
//
// - scrollbar position to remain independent
// - note cards to move left/right independently
//
// DO NOT resize the scroll container just to move the
// cards. Change the inner list instead.
// =====================================================


// =====================================================
// 19. CURRENT PAST NOTE POSITIONING CONTROLS
// =====================================================
//
// These direct positional controls are intentional.
//
// Scroll container:
//
// left-[-4px]
//
// Inner list / all cards horizontally:
//
// left-[8px]
//
// Individual card vertically:
//
// top-[10px]
//
// Individual card height:
//
// h-[52px]
//
// Note text block:
//
// left-[6px]
// top-[4px]
//
// Date/time:
//
// left-[-8px]
// top-[6px]
//
// These are direct X/Y controls used because normal
// Tailwind spacing utilities such as mt/pt/pb did not
// provide reliable visual positioning for this layout.
//
// Preserve this approach when tuning geometry.
// =====================================================


// =====================================================
// 20. NOTE CONTENT DISPLAY
// =====================================================
//
// Each saved note currently uses:
//
// first non-empty line
//      ↓
// title / heading
//
// remaining lines
//      ↓
// preview
//
// If the note contains only one line:
//
// title = first line
// preview = empty
//
// This avoids displaying the same text twice.
//
// Preview uses:
//
// line-clamp-2
//
// This keeps each note compact.
// =====================================================


// =====================================================
// 21. DATE / TIME DISPLAY
// =====================================================
//
// Each Past Note displays:
//
// formatted date
// formatted time
//
// Date uses:
//
// toLocaleDateString()
//
// Time uses:
//
// toLocaleTimeString()
//
// Current visual placement is independent from the note
// content using relative + left/top controls.
//
// =====================================================


// =====================================================
// 22. DELETE UX
// =====================================================
//
// Delete action is intentionally hidden until the user
// hovers over the specific Past Note card.
//
// Each card uses:
//
// group
//
// Delete icon:
//
// Trash2
//
// The delete button appears with:
//
// group-hover:flex
//
// Visual:
//
// red icon
//
// Location:
//
// right side of the individual note card,
// under the date/time area.
//
// Delete action is per-note and does not affect
// other notes.
// =====================================================


// =====================================================
// 23. DELETE CONFIRMATION
// =====================================================
//
// Delete does NOT happen immediately.
//
// handleDelete() first asks:
//
// window.confirm(
//   "Delete this trade note?\n\nThis action cannot be undone."
// )
//
// Cancel:
//
// no action
//
// Confirm:
//
// deleteDailyReviewTradeNote(noteId)
//
// then remove the note from local React state.
//
// Current behavior has been tested and confirmed.
// =====================================================


// =====================================================
// 24. EMPTY PAST NOTES STATE
// =====================================================
//
// When:
//
// pastNotes.length === 0
//
// the normal note-card list is not displayed.
//
// Instead, a dedicated empty-state card is shown.
//
// Current geometry was intentionally tuned to:
//
// left-[10px]
// top-[18px]
// h-[160px]
// w-[calc(100%-14px)]
//
// Text:
//
// "No saved notes yet"
//
// The empty state is ONLY for the zero-note condition.
//
// Saved note cards are not affected by this branch.
// =====================================================



// =====================================================
// 25. PRODUCTION TESTING COMPLETED
// =====================================================
//
// TEST 1 — Table creation
// PASS
//
// TEST 2 — Table rename
// PASS
//
// TEST 3 — RLS enabled
// PASS
//
// TEST 4 — Authenticated table privileges
// PASS
//
// TEST 5 — Initial read
// PASS after privilege grant
//
// TEST 6 — Save first note
// PASS
//
// TEST 7 — Save second note
// PASS
//
// TEST 8 — Refresh page
// PASS
//
// Saved notes were retrieved from Supabase after
// refresh, confirming persistence rather than only
// React local state.
//
// TEST 9 — Switch to another trade
// PASS
//
// Editor correctly resets for the new trade.
//
// TEST 10 — Delete note
// PASS
//
// TEST 11 — Delete confirmation
// PASS
//
// TEST 12 — Hover-only delete icon
// PASS
//
// TEST 13 — Main Notes system
// UNTOUCHED
//
// =====================================================



// =====================================================
// 26. ISSUES ENCOUNTERED DURING IMPLEMENTATION
// =====================================================
//
// ISSUE 1:
//
// Temporary experiment added
// loadTradeNotesFromSupabase()
// into the existing:
// supabaseNoteStorage.ts
//
// DECISION:
//
// ROLLED BACK.
//
// Do NOT reintroduce this architecture.
//
// Main Notes storage was restored to the clean state.
//
//
//
// ISSUE 2:
//
// Temporary TradeNotesTab wiring used the Main Notes
// storage layer.
//
// DECISION:
//
// ROLLED BACK.
//
// Dedicated storage created instead.
//
//
//
// ISSUE 3:
//
// Browser console initially displayed:
//
// FAILED TO LOAD DAILY REVIEW TRADE NOTES: {}
//
// Cause could not initially be seen because Next.js
// console rendering collapsed the Supabase error object.
//
// Diagnostic logging was temporarily expanded.
//
// Actual error:
//
// PGRST205
//
// Could not find table:
//
// public.daily_review_trade_notes
//
// Hint:
//
// public.trade_notes
//
// Cause:
//
// Table had not yet been renamed.
//
// Fix:
//
// rename table.
//
//
//
// ISSUE 4:
//
// After rename:
//
// 42501
// permission denied for table daily_review_trade_notes
//
// Fix:
//
// grant authenticated table privileges:
//
// grant select, insert, update, delete
// on public.daily_review_trade_notes
// to authenticated;
//
//
//
// ISSUE 5:
//
// Saved note remained inside editor after switching
// to another trade.
//
// Cause:
//
// React local "note" state was not reset when trade.id
// changed.
//
// Fix:
//
// inside the useEffect tied to [trade.id]:

setNote("");
setSavedLocally(false);
//
//
//
// ISSUE 6:
//
// Empty-state Past Notes card became too large.
//
// Cause:
//
// h-full caused it to fill the scroll container.
//
// Fix:
//
// dedicated explicit height:
//
// h-[160px]
//
// and direct positioning.
//
//
// =====================================================



// =====================================================
// 27. IMPORTANT STORAGE FILE RULE
// =====================================================
//
// EXISTING:
//
// lib/storage/supabaseNoteStorage.ts
//
// This file belongs ONLY to the Main Notes system.
//
// NEW:
//
// lib/storage/supabaseDailyReviewTradeNoteStorage.ts
//
// This file belongs ONLY to Daily Review Trade Notes.
//
// NEVER merge these files.
//
// NEVER put Daily Review Trade Note functions into
// supabaseNoteStorage.ts.
//
// NEVER use Main Notes domain types for these notes.
// =====================================================



// =====================================================
// 28. IMPORTANT TYPE FILE RULE
// =====================================================
//
// Existing:
//
// types/note.ts
//
// belongs to Main Notes.
//
// New:
//
// types/dailyReviewTradeNote.ts
//
// belongs to Daily Review Trade Notes.
//
// Daily Review notes should NOT be added to:
//
// types/note.ts
//
// and should NOT be added to:
//
// types/trade.ts
//
// unless a future architectural decision explicitly
// requires it.
// =====================================================



// =====================================================
// 29. CURRENT FILE STRUCTURE
// =====================================================

components/
  dashboard/
    daily-review/
      DailyReviewTradeDrawer.tsx
      trade-review/
        TradeNotesTab.tsx
        TradeReviewTab.tsx
        TradeIntelligenceTab.tsx


lib/
  storage/
    supabaseNoteStorage.ts
    supabaseDailyReviewTradeNoteStorage.ts


types/
  note.ts
  trade.ts
  dailyReviewTradeNote.ts


// =====================================================
// 30. CURRENT GIT CHECKPOINT
// =====================================================
//
// The Daily Review Trade Notes implementation was
// staged using:
//
// git add .
//
// Staged files at checkpoint:
//
// M  components/dashboard/daily-review/DailyReviewTradeDrawer.tsx
// M  components/dashboard/daily-review/trade-review/TradeNotesTab.tsx
// A  lib/storage/supabaseDailyReviewTradeNoteStorage.ts
// A  types/dailyReviewTradeNote.ts
//
// Intended commit:
//
// git commit -m "Add persistent daily review trade notes"
//
// Intended push:
//
// git push origin main
//
// Verify final Git status after push.
//
//
// IMPORTANT:
//
// Supabase SQL changes are external to Git unless the
// project has migrations tracking these changes.
//
// If Supabase migrations are added later, record the
// final SQL there as well.
// =====================================================



// =====================================================
// 31. CURRENT FUNCTIONAL CHECKPOINT
// =====================================================
//
// At this point:
//
// DAILY REVIEW TRADE NOTES
//
// ✅ Dedicated database table
// ✅ Dedicated RLS policies
// ✅ Authenticated table privileges
// ✅ Dedicated domain type
// ✅ Dedicated storage layer
// ✅ Trade-specific loading
// ✅ Persistent save
// ✅ Reload persistence
// ✅ Trade switching
// ✅ Editor reset on trade switch
// ✅ Past Notes history
// ✅ Per-note delete
// ✅ Delete confirmation
// ✅ Hover delete UI
// ✅ Empty-state UI
// ✅ Main Notes system isolated
//
// This is the checkpoint BEFORE rich-text/editor
// functionality is implemented.
// =====================================================



// =====================================================
// 32. NEXT PHASE — RICH TEXT / FORMATTING
// =====================================================
//
// CURRENT TOOLBAR IS VISUAL ONLY:
//
// Normal
// Bold
// Italic
// Underline
// Bulleted List
// Link
//
// Current editor is a textarea.
//
// These controls do NOT yet perform formatting.
//
//
//
// NEXT WORK:
//
// 1. Decide whether Daily Review Trade Notes should
//    remain plain text or move to rich text.
//
// 2. If rich text is required, define the stored content
//    format BEFORE implementing toolbar behavior.
//
// 3. Determine whether content should be stored as:
//
//    HTML
//    JSON
//    Tiptap JSON
//    another structured format
//
// 4. Update the database/content model only after the
//    storage format is intentionally chosen.
//
// 5. Then implement:
//
//    - font family / text style
//    - font size
//    - bold
//    - italic
//    - underline
//    - bullets
//    - links
//
// 6. Ensure formatting persists through:
//
//    Save
//      ↓
//    Supabase
//      ↓
//    refresh
//      ↓
//    reload
//
// 7. Verify the formatting system remains completely
//    isolated from the Main Notes editor/system.
//
//
//
// CRITICAL:
//
// DO NOT start modifying the existing Main Notes
// editor or Tiptap implementation for this feature.
//
// Daily Review Trade Notes must remain independent.
// =====================================================



// =====================================================
// 33. FINAL ARCHITECTURAL RULE
// =====================================================
//
// Daily Review Trade Notes are not "another view"
// of Main Notes.
//
// They are their own domain feature:
//
//     Daily Review
//          ↓
//     DailyReviewTradeNote
//          ↓
//     daily_review_trade_notes
//
// Main Notes remains:
//
//     Notes
//          ↓
//     Note
//          ↓
//     notes / note_trades / note_blocks / attachments
//
// These systems must remain isolated.
// =====================================================