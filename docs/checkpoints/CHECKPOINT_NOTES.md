checkpoints/checkpoint-execution-ledger-foundation-v2

# Execution Ledger Foundation v2

## Status

Elite X now has stable live IBKR execution sync operational.

## Completed

* Live IBKR Flex Web Service integration working
* Activity Flex execution extraction working
* Real execution ingestion operational
* parseIBKRCsv() integrated successfully
* pairTrades() reconstruction stable
* Supabase execution persistence working
* Replay-safe hydration architecture operational
* Incremental sync behavior stable
* No disappearing trades
* No duplicate trades after canonical hydration fix
* Calendar updates correctly
* P&L updates correctly
* Open/closed lifecycle reconstruction operational

## Major Architectural Discovery

Activity Flex CAN work safely IF:

* only execution-grade rows are ingested
* accounting-state rows are excluded
* immutable executions become canonical ledger source

Elite X architecture now follows:

IBKR
→ immutable executions
→ execution persistence
→ deterministic reconstruction
→ canonical hydration

NOT:
broker lifecycle state → direct UI rendering

## Current Known Areas To Stress Test

* partial fills
* scale-ins
* scale-outs
* overnight positions
* same-day reopen
* replay sync duplication
* options expiration
* multi-account isolation
* FX normalization edge cases

## Current State

Local-only validation phase before GitHub push.


checkpoint/broker-management-v10.  on may 29 2026

✓ Broker Sync page redesigned

✓ Connected Brokers table complete

✓ Even column spacing
✓ Centered headers
✓ Centered row alignment

✓ Flex Web Service Activation guide card

✓ Trade Confirmation Query Setup guide card

✓ Edit Broker modal implemented

✓ Broker field display
✓ Account Alias editable
✓ Query ID editable
✓ Flex Token editable

✓ Save Changes functionality complete

✓ Supabase UPDATE working
✓ Local state refresh working
✓ Modal closes after save

✓ account_alias column added to broker_connections

broker_connections schema:

id
user_id
broker
account_alias
flex_query_id
flex_token
is_active
created_at
updated_at

CHECKPOINT:
checkpoint/broker-management-v10

STATUS:

Broker management system is fully functional.

Users can:

- View broker connections
- Edit account alias
- Edit Flex Query ID
- Edit Flex Token
- Save changes to Supabase
- See updates immediately in UI

Database schema updated with:

account_alias TEXT

NEXT PHASE:

1. Add Broker Modal
2. Insert Broker Into Supabase
3. Multi-Broker Support
4. Delete Broker
5. Automatic Flex Sync Architecture

checkpoint/usermenu-v2-global-stats-sync-v10
git commit -m "UserMenuV2 global stats sync and profile settings integration"
✅ Premium UserMenuV2 redesign complete

✅ Dashboard avatar upgraded

✅ Profile page migrated to UserMenuV2

✅ Settings page migrated to UserMenuV2

✅ Elite Plan card redesigned

✅ Advanced Analytics card redesigned

✅ Menu stats card redesigned

✅ Stats persist across Dashboard/Profile/Settings

✅ Dashboard selected timeframe drives menu stats

✅ LocalStorage sync architecture implemented

✅ Build passing

✅ Vercel production verified


checkpoint/usermenu-v2-platform-rollout-v11

✅ UserMenuV2 visual redesign complete

✅ Dashboard integration

✅ Profile integration

✅ Settings integration

✅ Trades integration

✅ Notes integration

✅ Shared menu stats architecture

✅ localStorage sync system

✅ UserMenu stats follow dashboard timeframe

✅ Sidebar Settings navigation fixed

✅ Notes toolbar cleanup

✅ Notes delete action moved out of top bar

✅ Production build passing

✅ Vercel-ready

CHECKPOINT:
checkpoint/dashboard-metrics-foundation-v1

STATUS:

✅ Execution Ledger Stable
✅ Cloud Canonical Architecture Stable
✅ IBKR Manual Sync Working
✅ IBKR Auto Sync Working
✅ Duplicate Prevention Working
✅ Trade Reconstruction Stable
✅ Manual Trade Add/Edit/Delete Working
✅ Calendar Stable
✅ Currency Analytics Layer Exists
✅ PnL Analytics Engine Exists
✅ DashboardMetrics.ts Created

DISCOVERIES:

Analytics layer already contains:

- Daily P&L
- Weekly Aggregation
- Monthly Aggregation
- Cumulative P&L
- Best Day
- Worst Day
- Average Daily P&L
- Streak Engine
- Volatility Engine
- Currency P&L Analytics
- Currency Fee Analytics

NEXT PHASE:

Dashboard Metrics Foundation

Build canonical dashboard metrics service:

lib/dashboard/dashboardMetrics.ts

Goal:

Centralize all dashboard calculations into a single source of truth.

Target Metrics:

- Net P&L
- Total Trades
- Winning Trades
- Losing Trades
- Win Rate
- Average Win
- Average Loss
- Profit Factor
- Expectancy
- Best Day
- Worst Day
- Streak
- Volatility
- Most Traded Symbol
- Average Trade Duration

NO UI CHANGES

NO DASHBOARD V2 IMPLEMENTATION

NO FX CONVERSION

NO PAGE.TSX REFACTOR

Architecture first.


git checkout -b checkpoint/dashboard-v2-kpi-visualization-v11

git add .
git commit -m "Dashboard V2 KPI visualization overhaul

- Added KPI sparkline architecture
- Added unique gradient IDs for sparkline rendering
- Added Win Rate sparkline
- Added Profit Factor sparkline
- Added Expectancy sparkline
- Added Best Day sparkline
- Added Worst Day sparkline
- Added Max Drawdown sparkline (v1 synthetic)
- Added KPIHistogram component
- Added Avg Win / Avg Loss histogram visualization
- Added Trading Score circular gauge
- Added gradient ring for Trading Score
- Added /100 score display
- Added KPI card offset controls
- Added per-card positioning controls
- Improved KPI visual hierarchy
- Refined Dashboard V2 Account Overview layout"

















=======================================================================
ELITE X TRADING JOURNAL — NOTES V2
CHECKPOINT / HANDOVER
FEATURE: SCREENSHOT ATTACHMENTS + ANNOTATION FOUNDATION
DATE: 2026-08-16
=======================================================================


=======================================================================
1. CORE ARCHITECTURAL RULES
=======================================================================

Notes V2 is strictly isolated from the canonical trading system.

Notes may reference trading data, but must NEVER modify:

- executions
- execution ledger
- FIFO engine
- pairTrades
- reconstructed trades
- reconciliation
- P&L
- analytics
- dashboard calculations
- any other canonical trading data

Trade information displayed inside Notes is READ-ONLY.

Architecture remains:

Broker
  ↓
Executions
  ↓
Execution Ledger
  ↓
Deterministic FIFO Reconstruction
  ↓
Trades
  ↓
Analytics / Dashboard

Notes sits beside that architecture and only references Trade data.

=======================================================================
2. LONG-TERM SCALABILITY RULE
=======================================================================

Every feature must be designed as a true multi-user system.

We are designing Elite X so that a large increase in users does not
require rewriting the architecture.

The target principle is:

"100,000 users tomorrow should not require a fundamental rewrite."

The architecture should remain viable as the system grows toward
1,000,000 users.

This means:

- No hardcoded user assumptions.
- No shared mutable state between users.
- Strong tenant isolation.
- Supabase RLS is part of the security model.
- Authorization must not rely only on client-side filtering.
- Indexes must match real query patterns.
- Avoid unnecessary database writes.
- Do not write to the database on every pointer/mouse movement.
- Normalize data where long-term growth benefits from normalization.
- Avoid giant JSON documents that can grow without bounds.
- Avoid unnecessary indexes because indexes have storage/write costs.
- Do not prematurely introduce partitioning without measured need.
- Optimize based on actual workload patterns.
- Keep canonical trading data protected from Notes development.

=======================================================================
3. SCREENSHOT ATTACHMENT SYSTEM — COMPLETED
=======================================================================

The screenshot attachment foundation is COMPLETE.

Users can:

- upload screenshots
- see screenshots immediately
- refresh the page and keep screenshots
- navigate away and return
- delete screenshots
- move screenshots
- resize screenshots

Screenshot layout persists automatically.

No Save button is required.

The desired UX is:

Move / Resize
    ↓
Local interaction is immediate and smooth
    ↓
User releases mouse
    ↓
One persistence operation
    ↓
Supabase stores final layout
    ↓
Parent Notes state is updated
    ↓
Switching notes does not reset the screenshot
    ↓
Refresh preserves exact layout

=======================================================================
4. SCREENSHOT DATABASE
=======================================================================

Table:

public.note_attachments

Current columns:

- id
- note_id
- file_name
- storage_path
- mime_type
- file_size
- position_x
- position_y
- width
- height
- created_at

Current default layout for new screenshots:

position_x = 0
position_y = 0
width = 600
height = 400

=======================================================================
5. SCREENSHOT STORAGE
=======================================================================

Supabase Storage bucket:

note-attachments

Storage path:

{user_id}/{note_id}/{attachment_id}.{extension}

Example:

user-id/
  note-id/
    attachment-id.png

The original screenshot remains the original/source image.

We DO NOT modify the original image during annotation.

=======================================================================
6. SCREENSHOT SECURITY
=======================================================================

note_attachments uses RLS.

Current policies:

SELECT:
Users can view their own note attachments.

INSERT:
Users can create attachments only for notes they own.

UPDATE:
Users can update attachments only for notes they own.

DELETE:
Users can delete attachments only for notes they own.

Ownership chain:

authenticated user
    ↓
notes.user_id = auth.uid()
    ↓
note_attachments.note_id
    ↓
attachment belongs to user's note

This is database-level tenant isolation.

=======================================================================
7. STORAGE SECURITY
=======================================================================

Supabase Storage bucket:

note-attachments

Current ownership model:

Authenticated user can access only their own folder.

Storage path is intentionally scoped:

{user_id}/{note_id}/{attachment_id}

Current verified operations:

- upload
- select/view
- delete

=======================================================================
8. SCREENSHOT FILE
=======================================================================

Main storage file:

lib/storage/noteAttachmentStorage.ts

Current responsibilities:

- authenticate user
- verify note ownership
- upload screenshot
- generate storage path
- create note_attachments row
- clean up orphaned Storage file if DB insert fails
- delete Storage object
- delete database row
- verify layout update
- persist:
    position_x
    position_y
    width
    height

Important persistence function:

updateNoteAttachmentLayout()

The update was intentionally made to verify that a real database
row was actually updated.

Before this verification, Supabase could return no obvious error even
when an update affected zero rows.

We added:

.select(...)
.maybeSingle()

and explicit zero-row detection.

=======================================================================
9. SCREENSHOT CANVAS
=======================================================================

Main UI file:

components/notes/NoteAttachmentCanvas.tsx

Current responsibilities:

- load secure signed URLs
- render screenshots
- delete screenshots
- drag screenshots
- resize screenshots
- persist final layout
- maintain local attachment interaction state
- avoid unnecessary signed URL regeneration

Screenshot signed URLs are generated for:

60 minutes

Important optimization:

We introduced an attachment storage key so changes to:

- positionX
- positionY
- width
- height

do NOT cause the signed image URL effect to reload.

This eliminated the screen flashing problem.

The attachment URL effect should respond to actual attachment identity/storage
changes, not every layout change.

=======================================================================
10. MOVEMENT / RESIZE BEHAVIOR
=======================================================================

Screenshot interaction is local-first.

During drag:

Pointer movement
    ↓
local React state

During resize:

Pointer movement
    ↓
local React state

Database is updated only after the interaction completes.

This prevents:

- excessive Supabase writes
- unnecessary network traffic
- high write volume at scale
- poor interaction performance

Minimum screenshot size currently exists to prevent unusably small images.

Current minimums:

MIN_WIDTH = 250
MIN_HEIGHT = 180

=======================================================================
11. PARENT NOTES STATE
=======================================================================

Main page:

app/notes/page.tsx

NotesPage owns:

notes[]
selectedNote
availableTrades[]
attachment-related state

Attachment layout callback:

handleUpdateAttachmentLayout()

Responsibilities:

1. Receive final screenshot layout.
2. Persist layout.
3. Update parent Notes state.
4. Prevent screenshot snapping back when switching notes.

Current behavior:

Move / Resize
    ↓
NoteAttachmentCanvas
    ↓
onLayoutChange()
    ↓
NotesPage.handleUpdateAttachmentLayout()
    ↓
Supabase persistence
    ↓
setNotes()
    ↓
parent state now contains latest layout

No Save button is used.

=======================================================================
12. SCREENSHOT ATTACHMENT UX — VERIFIED
=======================================================================

Verified working:

- upload screenshot ✅
- refresh screenshot ✅
- delete screenshot ✅
- remove from Supabase Storage ✅
- move screenshot ✅
- resize screenshot ✅
- persist position ✅
- persist size ✅
- switch notes without resetting ✅
- refresh without resetting ✅
- no screen flashing during movement/resizing ✅
- production build passes ✅

=======================================================================
13. GIT CHECKPOINT
=======================================================================

A Git checkpoint was created after the screenshot attachment system.

Screenshot attachment feature was pushed to GitHub.

A future checkpoint should be created after the annotation foundation
is fully stable.

=======================================================================
14. WHY WE ARE ADDING ANNOTATIONS
=======================================================================

The screenshot feature alone stores and displays trading charts.

A professional trading journal should also allow the trader to explain
WHAT they saw and WHY they took the trade.

The intended workflow is:

Attach trade
    +
Attach screenshot
    +
Annotate screenshot
    ↓
Complete trade review / journal entry

The annotation system should therefore be purpose-built for trading,
not become a generic image editor or Photoshop replacement.

=======================================================================
15. ANNOTATION TOOLKIT — TARGET
=======================================================================

Core tools we agreed are useful:

- Select
- Pen
- Arrow
- Line
- Horizontal Level
- Rectangle / Zone
- Highlighter
- Text
- Eraser
- Undo
- Redo
- Quick Mark
- Style

We intentionally do NOT want unnecessary tools such as:

- blur
- filters
- cropping
- polygon
- arc
- stickers
- excessive font collections
- dozens of colors
- generic image-editor features with little trading value

The annotation system should remain focused and premium.

=======================================================================
16. TRADING-SPECIFIC QUICK MARK
=======================================================================

Quick Mark is a key Elite X-specific feature.

Potential presets:

- Entry
- Stop
- Target
- Support
- Resistance
- Breakout

These should create standardized trading annotations.

Examples:

ENTRY
→ green marker

STOP
→ red level

TARGET
→ green level

SUPPORT
→ support marker/level

RESISTANCE
→ resistance marker/level

BREAKOUT
→ breakout visual marker/zone

This differentiates Elite X Notes from a generic drawing tool.

=======================================================================
17. TEXT TOOL
=======================================================================

Text is a separate contextual formatting toolbar.

Text formatting should support:

- Font
- Font size
- Bold
- Italic
- Underline
- Text color
- Left alignment
- Center alignment
- Right alignment
- Rotation
- Optional background

Font selection should remain constrained.

Initial recommendation:

- Inter
- Monospace

No need for dozens of fonts.

Rotation is valuable for chart annotations because traders may want
labels aligned with trendlines or chart structure.

=======================================================================
18. TWO TOOLBAR ARCHITECTURE
=======================================================================

The system should use two contextual toolbars.

Toolbar #1:

Screenshot Annotation Toolbar

Suggested order:

Select
Pen
Arrow
Line
Level
Zone
Highlight
Text
Eraser
Undo
Redo
Quick Mark
Style

Toolbar #2:

Text Formatting Toolbar

Appears only when Text is active.

Suggested order:

Font
Size
Bold
Italic
Underline
Color
Alignment
Rotation
Background

These are TOOLBARS, not "tooltips".

A tooltip should only explain a control on hover.

=======================================================================
19. ANNOTATION ARCHITECTURE
=======================================================================

Annotations must NOT modify the original screenshot.

Correct architecture:

Original Screenshot
        +
Annotation Layer
        ↓
Rendered annotated screenshot

Original screenshot remains intact.

Annotations are separate structured data.

This allows:

- editing
- deleting individual annotations
- undo/redo
- moving annotations
- resizing screenshot without destroying annotations
- future export
- future improvements
- future analytics if ever needed

=======================================================================
20. ANNOTATION DATABASE
=======================================================================

New table:

public.note_annotations

Current schema:

- id
- attachment_id
- type
- position_x
- position_y
- width
- height
- rotation
- color
- stroke_width
- text
- font_size
- font_weight
- font_style
- text_decoration
- text_align
- created_at
- updated_at
- points

The table has:

attachment_id
    ↓
note_attachments.id

with:

ON DELETE CASCADE

Therefore:

Delete screenshot
    ↓
Screenshot DB row deleted
    ↓
Its annotations automatically delete

This prevents orphaned annotations.

=======================================================================
21. ANNOTATION RLS
=======================================================================

RLS is enabled on:

public.note_annotations

Current policies:

SELECT
Users can view their own note annotations.

INSERT
Users can create annotations only for their own screenshots.

UPDATE
Users can update only their own annotations.

DELETE
Users can delete only their own annotations.

Ownership chain:

auth.uid()
    ↓
notes.user_id
    ↓
note_attachments.note_id
    ↓
note_annotations.attachment_id

This gives annotation-level tenant isolation.

=======================================================================
22. ANNOTATION INDEXES
=======================================================================

Current relevant indexes:

notes:
    notes_user_updated_at_idx
    (user_id, updated_at DESC)

note_attachments:
    note_attachments_pkey
    idx_note_attachments_note_id
    (note_id)

note_annotations:
    note_annotations_pkey
    idx_note_annotations_attachment_id
    (attachment_id)

These indexes reflect actual query paths:

user
  ↓
notes

note
  ↓
attachments

attachment
  ↓
annotations

We are NOT adding indexes to every column.

Every index has storage and write overhead.

Indexes should exist because they serve actual access patterns.

=======================================================================
23. ANNOTATION POINTS MODEL
=======================================================================

Column:

points jsonb

Constraint:

points must be either:

NULL

or:

JSON array

This was chosen because:

A single freehand stroke can contain hundreds or thousands of points.

We DO NOT want:

annotation_points
    ↓
one database row per point

That would unnecessarily multiply:

- database rows
- writes
- indexes
- joins
- storage
- network traffic

Instead:

one annotation
    ↓
one row
    ↓
points JSONB array

=======================================================================
24. NORMALIZED COORDINATES
=======================================================================

For freehand and multi-point annotations, coordinates should be stored
relative to the screenshot, not raw browser pixels.

Recommended coordinate system:

x = 0
    left edge

x = 1
    right edge

y = 0
    top edge

y = 1
    bottom edge

Example:

{
  "x": 0.50,
  "y": 0.45
}

This makes annotations scale correctly when the screenshot changes size.

Example:

Screenshot width = 600px
x = 0.50
→ 300px

Screenshot width = 1200px
x = 0.50
→ 600px

Therefore screenshot resizing does not destroy annotation geometry.

=======================================================================
25. CURRENT TYPESCRIPT DOMAIN MODEL
=======================================================================

File:

types/note.ts

A new domain type has now been added:

NoteAnnotation

Current conceptual structure:

NoteAnnotation
├── id
├── attachmentId
├── type
├── positionX
├── positionY
├── width
├── height
├── rotation
├── color
├── strokeWidth
├── points[]
├── text
├── fontSize
├── fontWeight
├── fontStyle
├── textDecoration
├── textAlign
├── createdAt
└── updatedAt

NoteAttachment now contains:

annotations: NoteAnnotation[]

Relationship:

Note
 └── NoteAttachment
      └── NoteAnnotation[]

=======================================================================
26. CURRENT BUILD STATUS
=======================================================================

After introducing NoteAnnotation:

types/note.ts
    ✅ updated

lib/storage/noteAttachmentStorage.ts
    ✅ updated so newly uploaded attachments return:
       annotations: []

lib/storage/supabaseNoteStorage.ts
    ✅ temporarily updated so loaded attachments currently return:
       annotations: []

Build:
    ✅ PASS

Important:

The `annotations: []` in `supabaseNoteStorage.ts` is ONLY a temporary
compatibility step so TypeScript remains green.

It is NOT the final annotation loading implementation.

The final implementation will load actual annotations from:

public.note_annotations

and map them into:

NoteAttachment.annotations

=======================================================================
27. IMPORTANT CURRENT LIMITATION
=======================================================================

Annotations are NOT yet loaded from the database.

Current state:

Supabase note_attachments
        ↓
NoteAttachment
        ↓
annotations: []

This will later become:

note_attachments
        ↓
note_annotations
        ↓
group annotations by attachment
        ↓
NoteAttachment.annotations
        ↓
Notes UI

=======================================================================
28. WHAT WE MUST NOT DO NEXT
=======================================================================

Do NOT immediately build the toolbar.

Do NOT start drawing logic yet.

Do NOT add UI polish yet.

Do NOT change the screenshot storage model.

Do NOT alter canonical trade/execution architecture.

Do NOT put annotation JSON into note_attachments.

Do NOT create one row per freehand point.

Do NOT write to Supabase on every pointer movement.

Do NOT add unnecessary indexes.

Do NOT introduce a drag/drawing library without first evaluating whether
it is actually necessary.

=======================================================================
29. NEXT IMPLEMENTATION PLAN
=======================================================================

Phase 1 — Database foundation
    ✅ note_annotations table
    ✅ foreign key to note_attachments
    ✅ ON DELETE CASCADE
    ✅ RLS
    ✅ indexes
    ✅ points JSONB
    ✅ points array constraint

Phase 2 — Domain model
    ✅ NoteAnnotation type
    ✅ NoteAttachment.annotations

Phase 3 — Annotation loading
    NEXT

Build:

supabaseNoteStorage.ts

so that it loads:

note_annotations

and groups annotations by:

attachment_id

Then:

NoteAttachment.annotations
    = actual annotation array

Phase 4 — Annotation storage service

Create:

lib/storage/noteAnnotationStorage.ts

Responsibilities:

- create annotation
- update annotation
- delete annotation
- load annotation data when appropriate
- verify attachment ownership
- persist geometry
- persist style
- persist text properties

Phase 5 — Annotation canvas foundation

Create / extend:

components/notes/NoteAnnotationCanvas.tsx

Responsibilities:

- render annotation layer over screenshot
- translate normalized coordinates into pixel coordinates
- maintain local interaction state
- avoid unnecessary database writes

Phase 6 — Core annotation tools

Implement in order:

1. Pen
2. Arrow
3. Line
4. Rectangle / Zone
5. Horizontal Level
6. Highlighter

Phase 7 — Editing

Implement:

- Select
- Move annotation
- Eraser
- Undo
- Redo

Phase 8 — Text

Implement:

Text annotation

Then add second contextual toolbar:

- Font
- Size
- Bold
- Italic
- Underline
- Color
- Alignment
- Rotation
- Background

Phase 9 — Quick Mark

Implement:

- Entry
- Stop
- Target
- Support
- Resistance
- Breakout

Phase 10 — Persistence

All annotation interactions should follow:

local interaction
    ↓
pointer release / interaction complete
    ↓
one persistence operation

Never persist every pointer event.

Phase 11 — Multi-annotation testing

Test:

- multiple pen strokes
- multiple arrows
- multiple lines
- multiple zones
- multiple text annotations
- delete individual annotation
- move annotation
- resize screenshot
- annotations remain correctly aligned
- switch notes
- refresh
- navigate away
- return

Phase 12 — Security / scale hardening

Verify:

- RLS
- ownership
- indexes
- bounded queries
- bounded payloads
- no cross-user access
- no unnecessary writes
- no excessive client memory
- no large unbounded annotation payloads

Phase 13 — FINAL UI / UX POLISH

Only after functionality is stable.

Polish:

- toolbar design
- hover states
- active state
- animation
- resize handles
- selection visuals
- contextual toolbars
- iconography
- spacing
- dark premium styling
- keyboard shortcuts
- responsive behavior

=======================================================================
30. RECOMMENDED DEVELOPMENT ORDER — STRICT
=======================================================================

Always use:

ONE FILE / ONE CHANGE
    ↓
SAVE
    ↓
BUILD
    ↓
TEST
    ↓
ONLY THEN NEXT FILE

Do not simultaneously modify multiple files unless there is no
reasonable alternative.

This is specifically important for Notes V2 because the system has
several interconnected layers.

=======================================================================
31. CURRENT STOPPING POINT
=======================================================================

We are stopping after:

- annotation database created
- annotation RLS created
- annotation indexes created
- points JSONB created
- NoteAnnotation domain type created
- NoteAttachment extended with annotations[]
- upload mapping updated
- current load mapping temporarily returns annotations[]
- build passes

Current build:

PASS ✅

=======================================================================
32. NEXT SESSION — FIRST TASK
=======================================================================

Start with ONLY:

lib/storage/supabaseNoteStorage.ts

Goal:

Load public.note_annotations.

Expected process:

1. Load notes.
2. Load trade links.
3. Load note attachments.
4. Load annotations for attachment IDs.
5. Map DB rows → NoteAnnotation.
6. Group annotations by attachment_id.
7. Build NoteAttachment objects with:
   
   annotations: [...]

8. Build final Note objects.

Do NOT start annotation UI yet.

=======================================================================
33. FINAL ARCHITECTURAL TARGET
=======================================================================

Notes V2 should ultimately look like:

Notes
│
├── Note metadata
│
├── Rich text journal
│
├── Linked trade references
│
└── Screenshot attachments
      │
      ├── Original screenshot
      │
      ├── Position / Size
      │
      └── Annotation layer
            │
            ├── Pen
            ├── Arrow
            ├── Line
            ├── Horizontal Level
            ├── Rectangle / Zone
            ├── Highlight
            ├── Text
            ├── Quick Mark
            ├── Eraser
            └── Undo / Redo

All of this remains isolated from the canonical trading engine.

=======================================================================
CHECKPOINT COMPLETE
=======================================================================

Current status:

NOTES V2 SCREENSHOT SYSTEM
    ✅ COMPLETE

ANNOTATION DATABASE FOUNDATION
    ✅ COMPLETE

ANNOTATION DOMAIN MODEL
    ✅ COMPLETE

ANNOTATION DATA LOADING
    ⏳ NEXT

ANNOTATION STORAGE
    ⏳

ANNOTATION CANVAS
    ⏳

ANNOTATION TOOLS
    ⏳

TEXT TOOLBAR
    ⏳

QUICK MARK
    ⏳

FINAL UI POLISH
    ⏳

=======================================================================






















=======================================================================
ELITE X TRADING JOURNAL — NOTES V2
CHECKPOINT / HANDOVER
FEATURE: SCREENSHOT ANNOTATION ENGINE — PEN COMPLETE
DATE: 2026-08-16
=======================================================================


=======================================================================
1. CORE ARCHITECTURAL RULES
=======================================================================

Notes V2 remains strictly isolated from the canonical trading system.

Notes may reference trading data, but must NEVER modify:

- executions
- execution ledger
- FIFO engine
- pairTrades
- reconstructed trades
- reconciliation
- P&L
- analytics
- dashboard calculations
- any other canonical trading data

Trade references inside Notes are READ-ONLY.

The system remains execution-first:

Broker
  ↓
Normalized Executions
  ↓
Execution Ledger
  ↓
Deterministic FIFO Reconstruction
  ↓
Trades
  ↓
Analytics / Dashboard

Notes operates beside that architecture.


=======================================================================
2. SCALABILITY REQUIREMENT
=======================================================================

Every new Notes feature must be designed as a true multi-user system.

The architecture must remain viable if Elite X grows from:

1 user
→ 100 users
→ 100,000 users
→ 1,000,000 users

Design principles:

- Strong tenant isolation.
- Supabase RLS.
- Server/database authorization, not only client checks.
- User-scoped queries.
- Appropriate indexes.
- Batched reads.
- Avoid N+1 queries.
- Avoid unnecessary database writes.
- No database write on every pointer movement.
- Keep large/freehand geometry bounded.
- Keep canonical trading data untouched.
- Avoid unnecessary tables and duplicated models.


=======================================================================
3. SCREENSHOT ATTACHMENT SYSTEM
=======================================================================

SCREENSHOT ATTACHMENTS ARE COMPLETE.

Users can:

- upload screenshots
- delete screenshots
- move screenshots
- resize screenshots
- refresh and retain position
- refresh and retain size
- switch notes and retain position
- switch notes and retain size
- navigate away and return
- interact without screen flashing

Screenshot storage:

Supabase Storage bucket:

note-attachments

Path:

{user_id}/{note_id}/{attachment_id}.{extension}


=======================================================================
4. NOTE ATTACHMENTS DATABASE
=======================================================================

Table:

public.note_attachments

Columns:

- id
- note_id
- file_name
- storage_path
- mime_type
- file_size
- position_x
- position_y
- width
- height
- created_at

Indexes:

- note_attachments_pkey
- idx_note_attachments_note_id


=======================================================================
5. SCREENSHOT OWNERSHIP / SECURITY
=======================================================================

note_attachments uses tenant-aware RLS.

Ownership chain:

auth.uid()
    ↓
notes.user_id
    ↓
note_attachments.note_id

Verified operations:

- SELECT
- INSERT
- UPDATE
- DELETE

Storage is also user-scoped by path.


=======================================================================
6. SCREENSHOT MOVEMENT / RESIZE ARCHITECTURE
=======================================================================

Screenshot interactions are local-first.

During pointer movement:

pointer event
    ↓
local React state

On pointer release:

final geometry
    ↓
one Supabase persistence operation

This prevents excessive database writes and keeps interaction smooth.

Minimum screenshot size:

MIN_WIDTH = 250
MIN_HEIGHT = 180


=======================================================================
7. SCREENSHOT FILES
=======================================================================

Main files:

lib/storage/noteAttachmentStorage.ts

components/notes/NoteAttachmentCanvas.tsx

app/notes/page.tsx

Responsibilities:

noteAttachmentStorage.ts
    → upload
    → delete
    → layout persistence

NoteAttachmentCanvas.tsx
    → secure image URLs
    → render screenshot
    → drag
    → resize
    → delete
    → annotation canvas integration

NotesPage
    → authoritative React note state
    → selected note
    → attachment state
    → persistence callbacks


=======================================================================
8. ANNOTATION DATABASE
=======================================================================

New table:

public.note_annotations

Schema:

- id
- attachment_id
- type
- position_x
- position_y
- width
- height
- rotation
- color
- stroke_width
- text
- font_size
- font_weight
- font_style
- text_decoration
- text_align
- created_at
- updated_at
- points

points:

JSONB

Current database constraint:

points is either NULL or a JSON array.

This allows freehand strokes to store many points inside one annotation
row rather than creating one database row per point.


=======================================================================
9. ANNOTATION FOREIGN KEY
=======================================================================

Relationship:

note_annotations.attachment_id
        ↓
note_attachments.id

Deletion behavior:

Delete attachment
    ↓
annotation rows automatically deleted

This prevents orphaned annotations.


=======================================================================
10. ANNOTATION INDEXES
=======================================================================

Current indexes:

note_annotations_pkey

idx_note_annotations_attachment_id
    ON note_annotations(attachment_id)

This matches the primary read path:

attachment
    ↓
annotations


=======================================================================
11. ANNOTATION RLS
=======================================================================

note_annotations has RLS policies for:

- SELECT
- INSERT
- UPDATE
- DELETE

Ownership is resolved through:

note_annotations
    ↓
note_attachments
    ↓
notes
    ↓
auth.uid()

Current database privileges for authenticated include:

SELECT
INSERT
UPDATE
DELETE

Verified and working.


=======================================================================
12. ANNOTATION DOMAIN MODEL
=======================================================================

File:

types/note.ts

New type:

NoteAnnotation

Fields:

- id
- attachmentId
- type
- positionX
- positionY
- width
- height
- rotation
- color
- strokeWidth
- points
- text
- fontSize
- fontWeight
- fontStyle
- textDecoration
- textAlign
- createdAt
- updatedAt

NoteAttachment now contains:

annotations: NoteAnnotation[]


=======================================================================
13. COORDINATE SYSTEM
=======================================================================

Annotation geometry uses normalized coordinates.

x:

0 = left edge
1 = right edge

y:

0 = top edge
1 = bottom edge

Example:

x = 0.50

means:

50% of screenshot width.

This allows annotations to scale correctly when screenshots are resized.

Freehand points use:

{
  x: number,
  y: number
}

with values normalized between 0 and 1.


=======================================================================
14. ANNOTATION LOADING
=======================================================================

File:

lib/storage/supabaseNoteStorage.ts

Loading path:

notes
    ↓
attachments
    ↓
collect attachment IDs
    ↓
ONE batched note_annotations query
    ↓
group by attachment_id
    ↓
NoteAttachment.annotations[]
    ↓
Notes

Important:

We deliberately use one batched query.

We do NOT do:

attachment 1 → annotation query
attachment 2 → annotation query
attachment 3 → annotation query

This avoids an N+1 query pattern.


=======================================================================
15. ANNOTATION STORAGE SERVICE
=======================================================================

File:

lib/storage/noteAnnotationStorage.ts

Responsibilities:

- create annotation
- update annotation
- delete annotation
- verify attachment ownership
- map database row → domain object
- persist geometry
- persist styling
- persist text properties

Ownership verification:

auth.uid()
    ↓
note_attachments
    ↓
notes

Update operations verify:

annotation.id
+
annotation.attachmentId


=======================================================================
16. ANNOTATION CANVAS
=======================================================================

File:

components/notes/NoteAnnotationCanvas.tsx

Current responsibilities:

- render annotation layer
- translate normalized coordinates to pixels
- maintain local annotation state
- receive active tool state
- capture pen pointer events
- convert pointer coordinates to normalized coordinates
- create pen annotations
- persist pen annotations
- notify parent Notes state
- render persisted annotations


=======================================================================
17. ANNOTATION LAYERING
=======================================================================

Screenshot structure:

Screenshot
    ↓
Annotation canvas
    ↓
Screenshot controls

Annotation canvas is positioned as an overlay.

When no annotation tool is active:

annotation layer:
    pointer-events = none

Therefore screenshot movement/resizing remains available.


=======================================================================
18. TOOL STATE OWNERSHIP
=======================================================================

Tool state is owned by:

app/notes/page.tsx

Current state:

activeAnnotationTool

Current supported states:

- select
- pen

Flow:

NotesPage
    ↓
activeAnnotationTool
    ↓
NoteAttachmentCanvas
    ↓
NoteAnnotationCanvas
    ↓
activeTool


=======================================================================
19. IMPORTANT INTERACTION MODEL
=======================================================================

SELECT MODE:

active tool = select

Expected behavior:

- screenshot can move
- screenshot can resize
- screenshot can delete
- annotation canvas does not capture pointer input


PEN MODE:

active tool = pen

Expected behavior:

- screenshot should remain stationary
- annotation canvas captures drawing
- pointer down begins stroke
- pointer move collects points
- pointer up finishes stroke
- screenshot drag handler must not interfere


=======================================================================
20. PEN TOOL — COMPLETE
=======================================================================

The Pen tool is now the first complete annotation tool.

Pen workflow:

User selects Pen
    ↓
pointer down
    ↓
collect pixel points
    ↓
pointer move
    ↓
continue local stroke
    ↓
pointer up
    ↓
convert to normalized points
    ↓
calculate bounds
    ↓
create NoteAnnotation object
    ↓
createNoteAnnotation()
    ↓
Supabase insert
    ↓
return created annotation
    ↓
local annotation state updated
    ↓
parent Notes state updated


=======================================================================
21. PEN DATABASE OBJECT
=======================================================================

Pen annotation uses:

type:

"pen"

Default color:

#ef4444

Default stroke width:

2

points:

normalized point array

positionX:

minimum normalized X

positionY:

minimum normalized Y

width:

normalized bounding width

height:

normalized bounding height

rotation:

0

Text fields:

null


=======================================================================
22. PEN PERSISTENCE
=======================================================================

Persistence happens ONCE at pointer release.

We do NOT insert rows on every pointer movement.

During drawing:

local canvas state

At pointer release:

one createNoteAnnotation() call

This is critical for scalability.


=======================================================================
23. PEN LOCAL STATE
=======================================================================

The canvas maintains:

localAnnotations

This exists separately from the parent:

annotations

Why:

The new annotation can appear immediately while the parent is still
one render behind.

Local-first interaction:

pointer release
    ↓
save
    ↓
createdAnnotation
    ↓
localAnnotations updated
    ↓
canvas redraw
    ↓
stroke remains visible


=======================================================================
24. PEN → PARENT STATE SYNCHRONIZATION
=======================================================================

A callback was added:

onAnnotationCreated()

Flow:

NoteAnnotationCanvas
    ↓
onAnnotationCreated()
    ↓
NoteAttachmentCanvas
    ↓
NotesPage
    ↓
setNotes()
    ↓
selected NoteAttachment.annotations[]
    ↓
parent state contains new annotation


=======================================================================
25. NOTE SWITCHING ISSUE — FIXED
=======================================================================

Initial problem:

Draw annotation
    ↓
Supabase saves
    ↓
annotation visible
    ↓
switch note
    ↓
return
    ↓
annotation disappeared
    ↓
refresh
    ↓
annotation returned

Root cause:

Parent Notes state did not know about the newly-created annotation.

Fix:

NoteAnnotationCanvas notifies parent with:

onAnnotationCreated(
    attachmentId,
    annotation
)

NotesPage updates:

NoteAttachment.annotations[]


=======================================================================
26. PEN RENDERING ISSUE — FIXED
=======================================================================

Initial problem:

After pointer release:

temporary stroke disappeared.

Cause:

currentPoints was cleared before the persisted annotation was available.

Fix:

persist first
    ↓
add created annotation
    ↓
clear temporary drawing

This eliminated the visible gap between local drawing and persisted
annotation.


=======================================================================
27. ANNOTATION REDRAW ISSUE — FIXED
=======================================================================

Initial issue:

localAnnotations changed but canvas did not immediately redraw.

Cause:

draw effect depended on:

annotations

instead of:

localAnnotations

Fix:

canvas redraw now responds to:

localAnnotations
width
height
currentPoints


=======================================================================
28. SCREEN FLASHING ISSUE — PROTECTED
=======================================================================

Screenshot signed URLs are keyed using:

attachment.id
+
attachment.storagePath

Layout changes do NOT unnecessarily recreate signed URLs.

This prevents:

- image reload
- screen flashing
- unnecessary Storage requests

when moving/resizing screenshots.


=======================================================================
29. CURRENT TEMPORARY UI
=======================================================================

There is currently a temporary test control in:

app/notes/page.tsx

States:

Pen OFF

Pen ON

This is NOT production UI.

It exists only to verify tool-state behavior.

It will be removed when the real annotation toolbar is implemented.


=======================================================================
30. CURRENT BUILD STATUS
=======================================================================

Production build:

PASS ✅

Current system compiles successfully after:

- annotation model
- annotation loading
- annotation storage
- annotation canvas
- pen tool
- parent state synchronization


=======================================================================
31. CURRENT VERIFIED BEHAVIOR
=======================================================================

Screenshot:

✅ upload
✅ delete
✅ move
✅ resize
✅ persistent layout
✅ no screen flashing

Annotations:

✅ database insert
✅ RLS
✅ batched load
✅ normalized coordinates
✅ render
✅ Pen drawing
✅ immediate rendering
✅ persistence
✅ note switching persistence
✅ refresh persistence
✅ parent React state synchronization


=======================================================================
32. WHAT IS NOT DONE YET
=======================================================================

Annotation tools remaining:

- Select
- Arrow
- Line
- Horizontal Level
- Rectangle / Zone
- Highlight
- Text
- Eraser
- Undo
- Redo
- Quick Mark

Text formatting:

- font
- font size
- bold
- italic
- underline
- alignment
- rotation
- text color
- background

Production toolbar UI:

NOT IMPLEMENTED

Temporary Pen test button:

STILL PRESENT


=======================================================================
33. IMPORTANT ARCHITECTURAL DECISION
=======================================================================

We will NOT create separate tables for:

- pen_annotations
- arrow_annotations
- line_annotations
- text_annotations
- level_annotations
- zone_annotations

All annotation types use:

public.note_annotations

and differentiate by:

type

This keeps the system normalized and extensible.


=======================================================================
34. WHAT IS REUSABLE
=======================================================================

The following foundation is built ONCE:

- database table
- RLS
- indexes
- domain model
- batched loading
- storage service
- attachment ownership
- annotation canvas
- normalized coordinates
- local annotation state
- parent synchronization
- persistence boundary
- rendering architecture
- tool-state architecture

Future tools should plug into this engine.

We should NOT repeat the entire Pen architecture for every tool.


=======================================================================
35. FUTURE TOOL IMPLEMENTATION MODEL
=======================================================================

Pen:

points[]

Arrow:

start + end geometry

Line:

start + end geometry

Horizontal Level:

constant Y + horizontal bounds

Rectangle:

position + width + height

Highlight:

rectangle/geometry + translucent fill

Text:

text + typography fields

Eraser:

delete existing annotation

Quick Mark:

predefined annotation objects


All use:

NoteAnnotation
    ↓
note_annotations
    ↓
same persistence layer


=======================================================================
36. NEXT DEVELOPMENT PHASE
=======================================================================

We should NOT immediately add Arrow.

First build:

REAL ANNOTATION TOOLBAR

Initial toolbar only needs:

Select
Pen

The toolbar should control:

activeAnnotationTool

Interaction behavior:

SELECT
    ↓
screenshot movable/resizable

PEN
    ↓
screenshot fixed
    ↓
drawing active


=======================================================================
37. TOOLBAR ARCHITECTURE TARGET
=======================================================================

Final toolbar:

Select
Pen
Arrow
Line
Level
Zone
Highlight
Text
Eraser
Undo
Redo
Quick Mark
Style


Text toolbar:

Font
Font Size
Bold
Italic
Underline
Color
Alignment
Rotation
Background


=======================================================================
38. TOOLBAR DESIGN PRINCIPLE
=======================================================================

Do not build all toolbar buttons at once.

Recommended implementation:

Phase 1:
Select + Pen

Phase 2:
Arrow + Line

Phase 3:
Level + Zone + Highlight

Phase 4:
Text

Phase 5:
Eraser

Phase 6:
Undo / Redo

Phase 7:
Quick Mark

Phase 8:
Final UI polish


=======================================================================
39. IMPORTANT DEVELOPMENT RULE
=======================================================================

Continue using:

ONE FILE AT A TIME

Process:

Edit one file
    ↓
Save
    ↓
npm run build
    ↓
Test
    ↓
Only then move to next file


Do NOT change multiple files simultaneously unless required by an
interface boundary.


=======================================================================
40. NEXT SESSION — FIRST TASK
=======================================================================

Start by replacing the temporary Pen ON/OFF button with:

components/notes/NoteAnnotationToolbar.tsx

But first create ONLY the toolbar foundation.

Initial toolbar:

- Select
- Pen

It should receive the current tool and emit tool changes.

Do NOT implement:

- Arrow
- Line
- Text
- Quick Mark
- UI polish

until the two-tool toolbar works correctly.


=======================================================================
41. FINAL CURRENT ARCHITECTURE
=======================================================================

Notes
│
├── Rich Text
│
├── Linked Trades
│
└── Screenshot Attachments
      │
      ├── Original Screenshot
      │
      ├── Position
      ├── Size
      │
      └── Annotation Layer
            │
            ├── Select
            ├── Pen ✅
            ├── Arrow ⏳
            ├── Line ⏳
            ├── Level ⏳
            ├── Zone ⏳
            ├── Highlight ⏳
            ├── Text ⏳
            ├── Eraser ⏳
            ├── Undo ⏳
            ├── Redo ⏳
            └── Quick Mark ⏳


=======================================================================
42. CHECKPOINT COMPLETE
=======================================================================

SCREENSHOT SYSTEM
    ✅ COMPLETE

ANNOTATION DATABASE
    ✅ COMPLETE

ANNOTATION DATA LOADING
    ✅ COMPLETE

ANNOTATION STORAGE
    ✅ COMPLETE

ANNOTATION CANVAS FOUNDATION
    ✅ COMPLETE

PEN TOOL
    ✅ COMPLETE

PARENT STATE SYNCHRONIZATION
    ✅ COMPLETE

PRODUCTION TOOLBAR
    ⏳ NEXT

ADDITIONAL TOOLS
    ⏳

FINAL UI POLISH
    ⏳


=======================================================================