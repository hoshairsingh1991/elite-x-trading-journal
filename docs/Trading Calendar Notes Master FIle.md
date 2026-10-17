# ============================================================
# ELITE X TRADING JOURNAL
# TRADING CALENDAR NOTES — MASTER DEVELOPMENT HANDOVER
# ============================================================
#
# LAST UPDATED:
# October 17, 2026
#
# PROJECT:
# Elite X Trading Journal / Trading OS
#
# FEATURE:
# Trading Calendar Session Notes / Daily Notes
#
# STATUS:
# Multi-note-per-date architecture implemented and manually
# tested. Recent UI refinements completed.
#
# NEXT ACTION:
# Verify the latest working tree, rerun the production build,
# and push the confirmed changes to GitHub before starting the
# next UI change.
#
# IMPORTANT:
# The current source code and actual Supabase schema are the
# final authority. If this document differs from the repository,
# inspect the current implementation and update these notes.
#
# Do not assume a change has been committed or pushed unless
# the Git output confirms it.
# ============================================================


# ============================================================
# 1. PURPOSE AND HOW TO USE THIS HANDOVER
# ============================================================

# This document is the ongoing engineering reference for the
# Trading Calendar Notes feature.
#
# Use it when resuming development in a new ChatGPT conversation
# or development session.
#
# It records:
#
# - Feature architecture and boundaries
# - Current Supabase table structure
# - SQL migration history
# - Storage helper contract
# - Multi-note-per-date behavior
# - Note creation and save/update flow
# - Note title persistence
# - Past Notes sidebar and search
# - Delete confirmation and animation
# - Rich-text editor and toolbar behavior
# - Calendar note-indicator styling
# - Recent UI positioning adjustments
# - Manually tested behavior
# - Build and GitHub verification requirements
# - Rules for future development
#
# The purpose is to prevent previously solved problems from
# being reintroduced and to preserve the working UI.
#
# Before changing anything, inspect the relevant current source.
# Do not blindly copy old code snippets into the repository.


# ============================================================
# 2. FEATURE PURPOSE AND ARCHITECTURE BOUNDARY
# ============================================================

# Trading Calendar Notes lets a signed-in user:
#
# - Create journal notes associated with calendar dates
# - Create multiple independent notes on the same date
# - Give each note its own title
# - Edit and save rich-text content
# - Browse previous notes
# - Search notes by date, title, and content
# - Select a specific saved note
# - Delete an individual note
# - See a note indicator on calendar dates with saved notes
#
# Notes are behavioral/journaling metadata.
#
# They are NOT canonical trading records.
#
# They must remain isolated from the execution-first
# accounting system.
#
#
# CANONICAL TRADING ARCHITECTURE:
#
# Broker / Manual Entry
#         ↓
# Normalized Executions
#         ↓
# Supabase Execution Ledger
#         ↓
# Deterministic FIFO Reconstruction
#         ↓
# Reconstructed Trades
#         ↓
# Analytics / P&L / Dashboard
#
#
# TRADING CALENDAR NOTES EXIST BESIDE THIS PIPELINE.
#
# Trading Calendar Notes MUST NOT:
#
# - Modify executions
# - Modify FIFO reconstruction
# - Modify reconstructed trades
# - Modify reconciliation
# - Modify realized or unrealized P&L
# - Modify analytics calculations
# - Modify account balances
# - Modify broker data
# - Become a second source of canonical trading data
#
# Keep the Notes feature independent of the canonical trading
# accounting architecture.


# ============================================================
# 3. SOURCE FILES AND RESPONSIBILITIES
# ============================================================

# ------------------------------------------------------------
# 3.1 MAIN MODAL AND NOTE WORKFLOW
# ------------------------------------------------------------

# File:
#
# components/dashboard/TradingCalendarNotes.tsx
#
# Responsibilities:
#
# - Session Notes modal and header
# - Active calendar date
# - Active note ID
# - Note title state and input
# - Tiptap editor integration
# - Rich-text toolbar wiring
# - New Note draft creation
# - Save, Cancel, and Close actions
# - Past Notes sidebar
# - Past Notes search
# - Note selection
# - Saved/unsaved status
# - Updated-time display
# - Delete confirmation modal
# - Delete exit animation
# - Calendar note-indicator refresh behavior
# - Empty-state card and positioning
#
# Preserve the current layout and behavior unless the user
# requests a specific change.


# ------------------------------------------------------------
# 3.2 SUPABASE STORAGE HELPER
# ------------------------------------------------------------

# File:
#
# lib/storage/supabaseDailyNotesStorage.ts
#
# Responsibilities:
#
# - Load the user's notes
# - Create a new note
# - Update an existing note by ID
# - Delete an existing note by ID
# - Scope operations to the authenticated user
#
# Keep Supabase query logic in this storage helper instead of
# duplicating it in the UI component.
#
# Inspect its current implementation and all relevant callers
# before making storage changes.


# ------------------------------------------------------------
# 3.3 RICH-TEXT EDITOR
# ------------------------------------------------------------

# File:
#
# components/dashboard/daily-review/trade-review/
# DailyReviewTradeNotesEditor.tsx
#
# This existing component provides the Tiptap editor used by
# Trading Calendar Notes.
#
# Preserve the editor and its integration unless a specific
# requirement or verified bug requires a change.


# ------------------------------------------------------------
# 3.4 CALENDAR AND NOTE INDICATOR
# ------------------------------------------------------------

# File:
#
# components/dashboard/TradingCalendar.tsx
#
# Responsibilities relevant to this feature:
#
# - Display the trading calendar
# - Indicate dates with at least one saved note
#
# Avoid changing this file unless the calendar indicator or
# related date behavior is the specific task being addressed.


# ------------------------------------------------------------
# 3.5 DOCUMENTATION
# ------------------------------------------------------------

# This document is the current Trading Calendar Notes master
# handover.
#
# If the repository also contains docs/notes.md or another
# feature handover, inspect its current content before editing.
#
# Do not assume that repository documentation is synchronized
# with this master document.


# ============================================================
# 4. CURRENT SUPABASE DATA MODEL
# ============================================================

# ------------------------------------------------------------
# 4.1 TABLE
# ------------------------------------------------------------

# Supabase table:
#
# public.daily_notes
#
#
# CURRENT KNOWN COLUMNS:
#
# id
#   Type: uuid
#   NOT NULL
#   DEFAULT gen_random_uuid()
#   Primary key
#   Unique identity for one individual note
#
# user_id
#   Type: uuid
#   NOT NULL
#   Identifies the note owner
#
# date
#   Type: text
#   NOT NULL
#   Calendar date associated with the note
#   Stored in the application's date-string format
#
# title
#   Type: text
#   NOT NULL
#   DEFAULT ''
#   Persisted note title
#   Empty string remains valid for legacy/untitled notes
#
# note
#   Type: text
#   NOT NULL
#   Rich-text body content, normally serialized HTML
#
# updated_at
#   Type: timestamptz
#   NOT NULL
#   DEFAULT now()
#   Timestamp used by the Past Notes sidebar
#
#
# INDEX:
#
# daily_notes_user_date_idx
#
# Columns:
#   user_id
#   date
#
# SQL:
#
# CREATE INDEX IF NOT EXISTS daily_notes_user_date_idx
# ON public.daily_notes (user_id, date);
#
#
# IMPORTANT:
#
# The primary key is now id.
#
# The old primary key was:
#
# PRIMARY KEY (user_id, date)
#
# The old primary key limited each user to one note per date.
#
# The current primary key is:
#
# PRIMARY KEY (id)
#
# Multiple rows can now share the same user_id and date, while
# each saved note has its own distinct ID.
#
# Do not reintroduce date as the unique identity for a note.


# ------------------------------------------------------------
# 4.2 MULTI-NOTE SCHEMA MIGRATION
# ------------------------------------------------------------

# ORIGINAL TABLE SHAPE:
#
# date     text NOT NULL
# note     text NOT NULL
# user_id  uuid NOT NULL
#
# PRIMARY KEY (user_id, date)
#
#
# The following migration was run successfully in Supabase:
#
# BEGIN;
#
# ALTER TABLE public.daily_notes
# ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
#
# ALTER TABLE public.daily_notes
# ADD COLUMN title text NOT NULL DEFAULT '';
#
# ALTER TABLE public.daily_notes
# DROP CONSTRAINT daily_notes_pkey;
#
# ALTER TABLE public.daily_notes
# ADD CONSTRAINT daily_notes_pkey PRIMARY KEY (id);
#
# CREATE INDEX IF NOT EXISTS daily_notes_user_date_idx
# ON public.daily_notes (user_id, date);
#
# COMMIT;
#
#
# REPORTED RESULT:
#
# Success. No rows returned.
#
#
# DATA-PRESERVATION NOTES:
#
# - Existing rows were preserved.
# - Existing note content was preserved.
# - Existing dates were preserved.
# - Existing user associations were preserved.
# - Existing rows received unique IDs.
# - Existing rows received an empty default title.
# - The table was not intentionally recreated.
# - Existing saved notes were not intentionally deleted.
#
# The migration changed note identity from a user/date key
# to a unique ID so multiple notes could exist on one date.


# ------------------------------------------------------------
# 4.3 UPDATED_AT COLUMN AND TRIGGER MIGRATION
# ------------------------------------------------------------

# The following migration was also run successfully:
#
# BEGIN;
#
# ALTER TABLE public.daily_notes
# ADD COLUMN IF NOT EXISTS updated_at
# timestamptz NOT NULL DEFAULT now();
#
# CREATE OR REPLACE FUNCTION public.set_daily_notes_updated_at()
# RETURNS trigger
# LANGUAGE plpgsql
# AS $$
# BEGIN
#   NEW.updated_at = now();
#   RETURN NEW;
# END;
# $$;
#
# DROP TRIGGER IF EXISTS set_daily_notes_updated_at
# ON public.daily_notes;
#
# CREATE TRIGGER set_daily_notes_updated_at
# BEFORE UPDATE ON public.daily_notes
# FOR EACH ROW
# EXECUTE FUNCTION public.set_daily_notes_updated_at();
#
# COMMIT;
#
#
# REPORTED RESULT:
#
# Success. No rows returned.
#
#
# EXPECTED BEHAVIOR:
#
# - New rows receive updated_at from the column default.
# - Updating a row refreshes updated_at through the trigger.
# - The trigger runs before every SQL UPDATE on a row.
#
#
# HISTORICAL TIMESTAMP LIMITATION:
#
# Before this migration, historical updated_at values were not
# stored in this table.
#
# Existing rows were assigned their initial updated_at value
# when the column was added.
#
# Therefore, the original updated_at value on a legacy row
# must NOT be interpreted as its actual historical edit time.


# ------------------------------------------------------------
# 4.4 USER OWNERSHIP AND RLS
# ------------------------------------------------------------

# The storage helper gets the current authenticated user using:
#
# supabase.auth.getUser()
#
# The helper scopes note queries using:
#
# .eq("user_id", userId)
#
# This is an application-level ownership filter.
#
# IMPORTANT:
#
# The exact current Supabase Row Level Security (RLS) settings
# and policy definitions have not been fully recorded here.
#
# Before any future database/security change:
#
# 1. Inspect the actual production RLS setting.
# 2. Inspect the policies on public.daily_notes.
# 3. Verify who can SELECT, INSERT, UPDATE, and DELETE.
# 4. Preserve the existing ownership boundary.
#
# Do not claim RLS has been audited merely because the helper
# filters requests by user_id.
#
# Never remove user ownership checks to make a UI operation work.


# ============================================================
# 5. STORAGE HELPER CONTRACT
# ============================================================

# File:
#
# lib/storage/supabaseDailyNotesStorage.ts
#
#
# CURRENT NOTE INTERFACE:
#
# export interface DailyNote {
#   id: string;
#   date: string;
#   title: string;
#   note: string;
#   updated_at: string;
# }
#
#
# The helper has been updated from a date-only upsert approach
# to a note-ID CRUD approach.
#
#
# CURRENT OPERATIONS USED BY THE COMPONENT:
#
# loadDailyNotesFromSupabase
#   Loads the user's notes, including multiple notes on a date.
#
# createDailyNoteInSupabase
#   Creates a new note record and obtains its unique ID.
#
# updateDailyNoteInSupabase
#   Updates a specific saved note by ID.
#
# deleteDailyNoteFromSupabase
#   Deletes a specific saved note by ID.
#
#
# CURRENT SELECT FIELDS FOR LOAD / CREATE / UPDATE:
#
# id, date, title, note, updated_at
#
# The delete operation selects/returns the deleted note ID.
#
# The helper scopes reads and mutations to the authenticated
# user's user_id.
#
#
# OBSOLETE DATE-ONLY CONTRACT:
#
# Older notes described:
#
# getDailyNoteFromSupabase(date)
# upsertDailyNoteInSupabase(date, content)
#
# That one-note-per-date contract is obsolete for the current
# Trading Calendar Notes implementation.
#
# Do not reintroduce date-only identity.
#
# When modifying the storage helper:
#
# - Inspect its current implementation.
# - Inspect all callers.
# - Keep create and update operations distinct.
# - Create a new row for a new draft.
# - Update the selected saved row by ID.
# - Delete only the selected row by ID.
# - Preserve authenticated-user ownership filtering.


# ============================================================
# 6. MULTI-NOTE COMPONENT BEHAVIOR
# ============================================================

# ------------------------------------------------------------
# 6.1 ACTIVE NOTE ID VS ACTIVE DATE
# ------------------------------------------------------------

# The component tracks the active date separately from the
# active note ID.
#
# ACTIVE DATE:
#
# The calendar date currently being viewed or edited.
#
# ACTIVE NOTE ID:
#
# The exact saved note currently selected, or null when the
# user is working on a new unsaved draft.
#
#
# CONCEPTUAL MODEL:
#
# Active Date = date
#
# Active Note ID = id | null
#
#
# These values are not interchangeable.
#
# Multiple notes can share the same date but have different IDs.
#
# A note must be identified by its ID for editing, selection,
# and deletion.
#
# A new draft must not be mistaken for an already-saved note
# simply because it uses the same date.


# ------------------------------------------------------------
# 6.2 NEW NOTE
# ------------------------------------------------------------

# handleNewNote starts a new blank draft.
#
# The new-draft flow clears the active note identity and resets
# the title/content editor state as implemented in the component.
#
# The user has manually tested creating separate notes, such
# as notes A and B, on the same date.
#
# Each note appears separately and can be selected independently.
#
#
# IMPORTANT RULES:
#
# - New Note must not overwrite an existing note.
# - Multiple notes must be possible on the same date.
# - A saved note must retain its unique ID.
# - A new unsaved draft has no saved note ID yet.
# - Repeated New Note actions must not be blocked simply because
#   today's date is already selected.
#
# Do not restore an early return that blocks New Note when
# today's date is already selected.
#
# Do not solve multi-note behavior merely by changing UI state
# while still saving records by date.


# ------------------------------------------------------------
# 6.3 SAVE AND UPDATE
# ------------------------------------------------------------

# The save flow distinguishes between:
#
# NEW DRAFT:
#   No saved note ID.
#   Save must create a new record.
#
# EXISTING SAVED NOTE:
#   Has a specific note ID.
#   Save must update only that record.
#
#
# The title, content, date, and note identity are associated
# with the correct saved note.
#
# Saving a note must not overwrite a different note merely
# because both records have the same date.
#
# After saving, the list and saved status must reflect the
# persisted state.
#
#
# CURRENT SAVED-STATUS TEXT:
#
# Saving changes…
#
# Unsaved changes
#
# No saved notes for this date
#
# 1 note saved for this date
#
# 2 notes saved for this date
#
# The count is based on how many notes exist for the active date.


# ------------------------------------------------------------
# 6.4 PAST NOTES SELECTION AND DELETION
# ------------------------------------------------------------

# Past Notes cards use item.id as their key and identity.
#
# Selecting a card must load the corresponding note's exact:
#
# - Title
# - Rich-text content
# - Date
# - Saved note identity
#
# Deleting a card must target that individual note ID.
#
# It must not delete all notes sharing that date.
#
#
# COMPLETED DELETE EXPERIENCE:
#
# - Trash icon revealed on hover
# - Trash control positioned within the note card
# - Red hover background/border/icon styling
# - Custom delete confirmation modal
# - Cancel action
# - Delete note action
# - Red exit transition
# - Note slides right
# - Note shrinks
# - Note fades out
# - Sidebar removes the note after the animation
# - Calendar indicator refreshes after deletion
#
# This delete experience was reported as working.
#
# Preserve the existing styling, confirmation flow, and exit
# animation unless the user requests a specific change.
#
#
# CALENDAR INDICATOR RULE:
#
# The calendar indicator should reflect whether at least one
# saved note remains for that date.
#
# Deleting one note must not clear the indicator when another
# saved note still exists on that date.
#
# Deleting the final note may clear the indicator.


# ------------------------------------------------------------
# 6.5 SEARCH AND LEGACY TITLE FALLBACK
# ------------------------------------------------------------

# The Past Notes search filters across:
#
# - Raw date string
# - Formatted date text
# - Saved note title: item.title
# - Display/fallback card title
# - Plain-text note body
#
#
# CARD TITLE BEHAVIOR:
#
# If a saved note has a title, display that title.
#
# If the saved title is empty, use the helper-generated fallback
# title for legacy or untitled notes.
#
#
# PREVIEW BEHAVIOR:
#
# If a saved title exists:
#
# - Use the plain-text note body as the preview.
# - If the body has no visible text, display "No text preview".
#
# If the saved title is empty:
#
# - Use the legacy computed card preview.
#
# Do not remove this fallback unless legacy/untitled notes have
# been deliberately migrated and the new behavior is tested.


# ------------------------------------------------------------
# 6.6 UPDATED TIME DISPLAY
# ------------------------------------------------------------

# The component includes:
#
# formatNoteTime(updated_at)
#
# The function formats the timestamp with:
#
# toLocaleTimeString("en-US", {
#   hour: "numeric",
#   minute: "2-digit"
# })
#
#
# The timestamp is independently positioned near the upper-right
# of each Past Notes card.
#
# Recorded approximate positioning:
#
# right-[8px]
# top-[6px]
#
# Check the actual current source before changing this position.
#
# Keep the timestamp from colliding with:
#
# - Card title
# - Preview text
# - Delete control
#
# Remember that the trigger refreshes the timestamp on UPDATE.
#
# Initial timestamps assigned to legacy rows reflect the column
# migration time, not necessarily their historical edit time.


# ============================================================
# 7. RICH-TEXT EDITOR AND TOOLBAR REGRESSION FIX
# ============================================================

# FILE:
#
# components/dashboard/TradingCalendarNotes.tsx
#
# EDITOR:
#
# DailyReviewTradeNotesEditor
#
#
# PREVIOUS BUG:
#
# The formatting toolbar became disabled/greyed out.
#
# ROOT CAUSE IDENTIFIED:
#
# An effect associated with selected-date changes cleared the
# editor reference by calling:
#
# setEditor(null);
#
#
# FIX THAT WORKED:
#
# The user removed only the setEditor(null); line from the
# useEffect([selectedDate]) effect.
#
# The toolbar then became functional.
#
#
# MANUAL TEST RESULTS:
#
# - Bold worked.
# - Italic worked.
# - New Note continued to work.
#
#
# CRITICAL REGRESSION RULE:
#
# Do NOT reinsert setEditor(null) into the selected-date effect
# without reproducing and understanding the toolbar bug.
#
# Other occurrences of setEditor(null) were intentionally left
# unchanged in:
#
# - handleNewNote
# - switchDate
# - closeModal
#
# Do not change those other occurrences as part of this toolbar
# fix unless a separate, verified requirement calls for it.
#
# Preserve the custom toolbar/editor integration.
#
# Do not replace it with generic styling or refactor editor
# lifecycle state without a specific reason and focused testing.


# ============================================================
# 8. UI AND STYLING DECISIONS TO PRESERVE
# ============================================================

# The Session Notes modal has a deliberate dark, premium design
# with carefully adjusted sizing and positioning.
#
# Keep the existing visual design unless the user requests a
# specific change.
#
#
# GENERAL DESIGN CONSTRAINTS:
#
# - Dark premium palette
# - Consistent 8px corner language
# - Some small controls intentionally use rounded-[7px]
# - Separate editor and Past Notes panels
# - Independent header divider
# - Custom title input
# - Custom rich-text toolbar
# - Header New Note button with violet-to-blue gradient
# - Violet border and hover illumination
# - Plus icon rotates 90 degrees on hover
# - Plus icon transitions from violet to white
# - Plus icon transition duration is 200ms
# - Preserve Past Notes delete control and exit animation
#
#
# POSITIONING RULE:
#
# The user prefers direct positional tuning for UI adjustments.
#
# When moving a control, prefer explicit utilities such as:
#
# relative
# left-[...]
# right-[...]
# top-[...]
# bottom-[...]
#
# Do not rely on generic Tailwind spacing utilities as the sole
# means of moving an element when the user is asking for a
# precise position adjustment.
#
# Make one small change at a time.
#
# Give exact find/replace instructions when guiding the user
# through manual edits in VS Code.


# ------------------------------------------------------------
# 8.1 PAST NOTES CARD STYLING
# ------------------------------------------------------------

# The selected Past Notes card uses a stronger blue/violet
# gradient and a subtle inset left accent.
#
# The styling includes:
#
# - Blue-tinted border
# - Blue/violet gradient
# - Subtle glow
# - Inset left accent
# - Active/inactive visual contrast
#
# Preserve:
#
# - Readability
# - Note ID selection behavior
# - Selected-card contrast
# - Title and preview layout
# - Timestamp positioning
# - Delete control positioning
#
# The timestamp is absolutely positioned toward the upper-right.
#
# The delete button's vertical position was adjusted using a
# small top offset.
#
# When adjusting title or preview spacing, ensure that the
# timestamp and delete control do not overlap the text.


# ------------------------------------------------------------
# 8.2 PAST NOTES EMPTY-STATE CARD
# ------------------------------------------------------------

# The empty-state card appears inside the scrollable Past Notes
# list container.
#
# Recorded structure:
#
# Outer card:
#
# - relative positioning
# - top-[8px] vertical offset at the last recorded checkpoint
# - mx-auto
# - w-[92%]
# - min-h-[140px]
# - centered content
# - dashed, low-opacity border
# - small corner radius
#
# Inner wrapper:
#
# flex w-full flex-col items-center justify-center
#
# Empty-state FileText icon:
#
# relative top-[-4px]
#
#
# PURPOSE OF THESE CHANGES:
#
# - Make the empty card narrower than the list container
# - Center the card horizontally
# - Tune its vertical position
# - Keep the empty-state content centered
# - Move the icon slightly upward
#
#
# X/Y POSITIONING:
#
# The user requested explicit X and Y controls.
#
# Add or adjust left-[...] on the outer card to control
# horizontal position.
#
# Adjust top-[...] on the same outer card to control
# vertical position.
#
# Approximate direction:
#
# Positive left value  = move right
# Negative left value  = move left
# Positive top value   = move down
# Negative top value   = move up
#
# The final horizontal value was not confirmed in this handover.
#
# Always inspect the current working code before assuming the
# final X offset was applied.


# ============================================================
# 9. CALENDAR NOTE INDICATOR REFINEMENT
# ============================================================

# FILE:
#
# components/dashboard/TradingCalendar.tsx
#
#
# ORIGINAL ISSUE:
#
# The tiny FileText note indicator on a calendar date had a
# visible filled square/rectangle background.
#
# USER REQUIREMENT:
#
# Remove the unwanted rectangle while keeping the icon blue
# and retaining a visible blue glow when a note exists.
#
#
# CONFIRMED DESIRED STRUCTURE — APPROXIMATE REFERENCE:
#
# className={`absolute right-0 top-0 flex h-[20px] w-[20px]
# items-center justify-center rounded-[7px] transition-all ${
#   hasNote
#     ? "text-blue-400"
#     : "text-slate-600 hover:text-slate-400"
# }`}
# >
#   <FileText
#     size={12}
#     className={
#       hasNote
#         ? "drop-shadow-[0_0_5px_rgba(59,130,246,0.85)]"
#         : ""
#     }
#   />
# </div>
#
#
# IMPORTANT:
#
# This is a style reference, not a blind copy command.
#
# Inspect the current source before editing.
#
# The confirmed visual result:
#
# - No unwanted square background
# - No visible filled rectangle around the icon
# - Blue icon when a note exists
# - Blue glow remains on the icon
#
# The user explicitly confirmed that this result was perfect.
#
# Do not reintroduce a container background, border, or shadow
# that recreates the unwanted rectangle.


# ============================================================
# 10. POTENTIALLY UNUSED CODE — DO NOT CLEAN UP PREMATURELY
# ============================================================

# A previous source review noticed potentially unused leftovers
# in TradingCalendarNotes.tsx.
#
# The items included:
#
# - An older deleteNote handler
# - A requestId ref that appeared to be incremented but not read
# - loadingNote state/setter that appeared unused
#
#
# PREVIOUS GUIDANCE:
#
# Leave these alone for now.
#
# Do not bundle unrelated cleanup with a focused UI change.
#
# Revisit only during a dedicated cleanup after:
#
# 1. Inspecting the latest source.
# 2. Confirming whether each item is truly unused.
# 3. Running type checks and the production build.
# 4. Testing the complete note lifecycle.
#
# Avoid unrelated changes to the editor, calendar, or storage
# helper while finishing a small visual adjustment.


# ============================================================
# 11. COMPLETED AND MANUALLY TESTED BEHAVIOR
# ============================================================

# The user reported successful checks for the following:
#
# MULTI-NOTE BEHAVIOR:
#
# - Multiple notes can exist on the same date.
# - Notes A and B were used to test independent note behavior.
# - Past Notes cards can be selected independently.
# - The title and rich-text content of a selected note persist.
# - Reopening a note restores its title and content.
# - One note's save does not overwrite a separate note on the
#   same date in the tested workflow.
#
#
# EDITOR:
#
# - Bold works.
# - Italic works.
# - Toolbar behavior recovered after removing setEditor(null)
#   from the selected-date effect.
# - New Note continued to work after the toolbar correction.
#
#
# PAST NOTES:
#
# - Preview text corresponds to the saved note body.
# - Saved-title behavior is in place.
# - Note cards show updated-time text.
# - Delete confirmation had been tested as working.
# - Delete exit animation had been tested as working.
#
#
# CALENDAR ICON:
#
# - Unwanted rectangle/background removed.
# - Blue icon color/glow preserved.
# - User confirmed the result was correct.
#
#
# EMPTY STATE:
#
# - Card width adjusted to 92%.
# - Card centered with mx-auto.
# - Icon moved slightly upward.
# - X/Y control discussed; check current final values.
#
#
# BUILD STATUS:
#
# npm run build has passed in recent development sessions.
#
# IMPORTANT:
#
# The latest small positional/icon changes still need a fresh
# production build before the current checkpoint is committed.
#
# No recorded command output in this handover proves that the
# latest changes have already been committed or pushed.


# ============================================================
# 12. VERIFICATION CHECKLIST BEFORE GITHUB PUSH
# ============================================================

# Run these commands in the project's actual VS Code terminal.
#
# Do not assume the current branch or pending changes.
#
#
# STEP 1 — CHECK GIT STATUS
#
# git status -sb
#
#
# STEP 2 — CHECK WHITESPACE AND PATCH ERRORS
#
# git diff --check
#
#
# STEP 3 — REVIEW THE RELEVANT DIFF
#
# git diff -- \
#   components/dashboard/TradingCalendarNotes.tsx \
#   components/dashboard/TradingCalendar.tsx \
#   lib/storage/supabaseDailyNotesStorage.ts
#
#
# STEP 4 — RUN THE PRODUCTION BUILD
#
# npm run build
#
#
# STEP 5 — REVIEW ALL CHANGES
#
# Confirm that:
#
# - Only intended changes are present.
# - No unrelated files are included accidentally.
# - No secrets are staged.
# - .env.local is not committed.
# - Service-role keys are not committed.
# - Any migration or documentation changes are intentional.
#
#
# STEP 6 — STAGE INTENDED FILES EXPLICITLY
#
# Example command shape:
#
# git add components/dashboard/TradingCalendarNotes.tsx \
#   components/dashboard/TradingCalendar.tsx \
#   lib/storage/supabaseDailyNotesStorage.ts
#
# Do not assume this is the exact file list.
#
# Adapt the staged list to the actual git status and diff.
#
#
# STEP 7 — INSPECT THE STAGED CHANGES
#
# git diff --cached --check
#
# git diff --cached
#
# git status -sb
#
#
# Include docs/notes.md or other files only if the actual diff
# confirms those files contain intended changes.
#
#
# STEP 8 — VERIFY BRANCH AND UPSTREAM
#
# git branch -vv
#
# Older instructions referred to the main branch, but confirm
# the actual current branch and upstream before pushing.
#
#
# STEP 9 — COMMIT AND PUSH
#
# Use a commit message that accurately describes the staged
# changes.
#
# Push to the verified upstream branch.
#
# Do not assume the commit or push succeeded until the terminal
# output confirms it.
#
#
# STEP 10 — VERIFY THE RESULT
#
# git status -sb
#
# git log -1 --oneline
#
# git branch -vv
#
#
# Desired result:
#
# - Working tree clean, unless intentionally retaining changes
# - Latest expected commit shown
# - Upstream branch confirmed
# - Push confirmed by the terminal output
#
# Capture the terminal output before declaring the push complete.


# ============================================================
# 13. SAFE NEXT STEPS
# ============================================================

# Current requested order:
#
# STEP 1:
# Update and save this master handover.
#
# STEP 2:
# Verify the actual Git state in VS Code.
#
# STEP 3:
# Review the actual pending diff.
#
# STEP 4:
# Run npm run build.
#
# STEP 5:
# Stage only the intended files.
#
# STEP 6:
# Commit and push the verified changes to GitHub.
#
# STEP 7:
# Verify the result using git status, git log, and git branch.
#
# STEP 8:
# Only after the push, proceed to the user's next small UI
# change.
#
#
# For the GitHub step, request the user's terminal output.
#
# Do not claim to see or modify the user's local repository
# unless direct repository access has actually been provided.
#
# Do not begin the next UI change before the user confirms the
# intended Git checkpoint has been handled.


# ============================================================
# 14. DEVELOPMENT RULES FOR ALL FUTURE WORK
# ============================================================

# 1. Proceed one small step at a time.
#
# 2. Give exact find/replace instructions when guiding manual
#    source edits in VS Code.
#
# 3. Never claim code was edited, built, committed, or pushed
#    without direct evidence for that exact action.
#
# 4. Inspect the current source before relying on remembered
#    snippets or older pasted files.
#
# 5. Keep saved note IDs distinct from calendar dates.
#
# 6. Never reintroduce date-based identity for note CRUD.
#
# 7. Preserve existing notes during schema changes.
#
# 8. Preserve authenticated-user ownership filtering.
#
# 9. Verify Supabase constraints, RLS, and policies before
#    future schema/security changes.
#
# 10. Preserve the completed UI:
#     - Modal layout
#     - New Note button styling
#     - Custom editor toolbar
#     - Delete confirmation and exit animation
#     - Selected-card design
#     - Timestamp positioning
#     - Calendar icon glow without the rectangle
#     - Empty-state card layout
#
# 11. Do not bundle unrelated cleanup with a focused visual
#     adjustment.
#
# 12. Run npm run build after meaningful source changes.
#
# 13. Test the note lifecycle after changes:
#     - Create
#     - Load
#     - Update
#     - Delete
#     - Multiple notes on one date
#     - Title persistence
#     - Rich-text formatting
#     - Calendar indicator refresh
#
# 14. Keep Trading Calendar Notes isolated from executions,
#     FIFO reconstruction, canonical trades, P&L, and analytics.
#
# 15. Update this handover when important implementation,
#     schema, testing, or Git checkpoint details change.


# ============================================================
# CURRENT RESUME POINT
# ============================================================

# The multi-note implementation and latest visual refinements
# are considered working by the user.
#
# Immediate next task:
#
# 1. Run git status -sb.
# 2. Run git diff --check.
# 3. Review the actual diff.
# 4. Run npm run build.
# 5. Stage only intended changes.
# 6. Review the staged diff.
# 7. Commit and push to the verified upstream branch.
# 8. Confirm the push with terminal output.
#
# After the GitHub checkpoint is confirmed, continue with the
# user's next small UI change.
#
# ============================================================
# END OF TRADING CALENDAR NOTES MASTER HANDOVER
# ============================================================