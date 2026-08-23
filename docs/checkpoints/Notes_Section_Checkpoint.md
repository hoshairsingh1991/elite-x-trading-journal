===============================================================
ELITE X TRADING JOURNAL — NOTES V2
CHECKPOINT: NOTE ATTACHMENTS — UPLOAD / DELETE COMPLETE
===============================================================

STATUS
---------------------------------------------------------------
Build: PASS
Upload: PASS
Persistence: PASS
Refresh: PASS
Delete: PASS
Storage cleanup: PASS

---------------------------------------------------------------
ARCHITECTURAL RULE
---------------------------------------------------------------

Notes V2 remains strictly READ/WRITE only to the Notes system.

Trade data remains READ-ONLY.

Notes must NEVER modify:
- executions
- FIFO engine
- pairTrades
- reconstructed trades
- reconciliation
- P&L
- analytics
- canonical trading data

Trade information displayed inside Notes is only a reference.

---------------------------------------------------------------
NOTE ATTACHMENT ARCHITECTURE
---------------------------------------------------------------

Storage bucket:

note-attachments

Storage path:

{user_id}/{note_id}/{attachment_id}.{extension}

Example:

user-id/
  note-id/
    attachment-id.png

---------------------------------------------------------------
DATABASE
---------------------------------------------------------------

Table:

note_attachments

Current attachment fields:

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

The following fields already exist specifically for
future canvas positioning/resizing:

- position_x
- position_y
- width
- height

Current defaults:

position_x = 0
position_y = 0
width = 600
height = 400

---------------------------------------------------------------
UPLOAD FLOW
---------------------------------------------------------------

1. Get authenticated Supabase user.
2. Verify the note belongs to the authenticated user.
3. Generate attachment UUID.
4. Generate user/note scoped Storage path.
5. Upload image to note-attachments bucket.
6. Insert note_attachments database row.
7. If database insert fails:
   - remove uploaded Storage object
   - return null
8. Return mapped NoteAttachment domain object.
9. Update local React note state.

---------------------------------------------------------------
DELETE FLOW
---------------------------------------------------------------

1. User clicks delete on attachment.
2. NoteAttachmentCanvas calls onDelete().
3. NotesPage.handleDeleteAttachment() executes.
4. deleteNoteAttachment() verifies authenticated user.
5. Note ownership is verified.
6. Storage object is deleted.
7. Database note_attachments row is deleted.
8. Local React state removes the attachment.

Verified in production UI:

- Screenshot disappears immediately.
- Screenshot is removed from Supabase Storage.
- Screenshot does not return after refresh.

---------------------------------------------------------------
SECURITY
---------------------------------------------------------------

note_attachments RLS:

INSERT:
Authenticated users can create attachment rows only when
the referenced note belongs to auth.uid().

SELECT:
Authenticated users can view attachment rows only when
the referenced note belongs to auth.uid().

DELETE:
Authenticated users can delete attachment rows only when
the referenced note belongs to auth.uid().

Storage policies:

Bucket:
note-attachments

INSERT:
Authenticated user can upload only inside:

auth.uid()/{...}

SELECT:
Authenticated user can view only their own folder.

DELETE:
Authenticated user can delete only their own folder.

---------------------------------------------------------------
CURRENT FILES
---------------------------------------------------------------

Storage service:

lib/storage/noteAttachmentStorage.ts

UI canvas:

components/notes/NoteAttachmentCanvas.tsx

Notes page:

app/notes/page.tsx

---------------------------------------------------------------
CURRENT UI BEHAVIOR
---------------------------------------------------------------

Screenshot upload button exists in Notes V2.

Images are rendered using secure signed URLs.

Signed URL lifetime:

60 minutes.

Current screenshot rendering:

- width comes from attachment.width
- minHeight comes from attachment.height
- image uses width: 100%
- object-contain
- delete button appears on hover

Delete button:

Trash2

Delete behavior is fully working.

---------------------------------------------------------------
IMPORTANT CURRENT LIMITATION
---------------------------------------------------------------

Attachments are currently static.

They cannot yet be:

- dragged
- resized
- repositioned
- persisted after movement
- persisted after resizing

Database fields for this already exist:

position_x
position_y
width
height

---------------------------------------------------------------
NEXT MILESTONE
---------------------------------------------------------------

ATTACHMENT CANVAS INTERACTION

Goal:

Make screenshots:

1. Movable
2. Resizable
3. Persist their position
4. Persist their size
5. Restore the exact position/size after refresh

---------------------------------------------------------------
IMPLEMENTATION PRINCIPLE
---------------------------------------------------------------

DO NOT modify the canonical trading architecture.

DO NOT modify executions.

DO NOT modify trade reconstruction.

DO NOT modify pairTrades.

DO NOT modify analytics.

Attachment movement/resizing belongs entirely inside
the Notes attachment system.

---------------------------------------------------------------
NEXT IMPLEMENTATION ORDER
---------------------------------------------------------------

STEP 1
Design the attachment canvas coordinate system.

STEP 2
Make one attachment draggable locally.

STEP 3
Persist position_x / position_y.

STEP 4
Reload and verify position persistence.

STEP 5
Add resizing locally.

STEP 6
Persist width / height.

STEP 7
Reload and verify size persistence.

STEP 8
Add UX polish:
- selection state
- resize handles
- boundaries
- cursor states
- delete control
- smooth interaction

STEP 9
Test multiple attachments.

STEP 10
Test refresh and persistence.

---------------------------------------------------------------
CURRENT CHECKPOINT
---------------------------------------------------------------

UPLOAD + DELETE ATTACHMENTS = COMPLETE

DO NOT REWRITE THE WORKING UPLOAD/DELETE SYSTEM.

NEXT:
MOVABLE ATTACHMENTS
===============================================================
























ELITE X — NOTES V2 CHECKPOINT
Date: 2026-08-18
STATUS: Notes Workspace + Toolbar Functionalization

=================================================
NOTES SIDEBAR
=================================================

✅ TODAY / YESTERDAY / historical date grouping
✅ Future-proof date group spacing
✅ Real layout spacers used for group separation
✅ Date → card spacing controlled independently
✅ Vertical scrolling
✅ Horizontal scrollbar removed
✅ Selected note state
✅ Delete note
✅ Note timestamps
✅ Linked-trade indicator

Current grouping model:

groupIndex 0
→ TODAY
→ no preceding spacer

groupIndex > 0
→ real 10px spacer before group

Date label
→ real 6px spacer

Cards
→ normal flex flow

No:
- YESTERDAY-specific transform
- translateY for date-group positioning
- top-position hacks for group spacing

=================================================
NOTE EDITOR
=================================================

✅ Fixed note header
✅ Fixed toolbar
✅ Scrollable Note Body
✅ Dynamic note title width
✅ Link Trade
✅ Screenshot upload
✅ Saved status
✅ Trade picker
✅ Trade Snapshots
✅ Tiptap content
✅ Shared Note Body workspace

Target composition:

HEADER
  ↓
TOOLBAR
  ↓
SHARED NOTE BODY
  ├── Trade Snapshots
  ├── Tiptap content
  └── Attachments

=================================================
TRADE SNAPSHOT
=================================================

✅ Compact Trade Snapshot
✅ Responsive width
✅ Card spacing
✅ Entry Date
✅ Entry
✅ Exit Date
✅ Exit
✅ Entry Time
✅ Exit Time
✅ Holding
✅ P&L
✅ Remove action

Direction:

LONG  → green
SHORT → red
CALL  → green
PUT   → red

Trade data remains UI-only reference data.

=================================================
ATTACHMENT WORKSPACE
=================================================

✅ Existing upload architecture preserved
✅ Existing Supabase storage preserved
✅ Existing attachment persistence preserved
✅ Existing drag functionality preserved
✅ Existing resize functionality preserved
✅ Existing annotation layer preserved

IMPORTANT CHANGE
----------------

Removed the concept of a separate visible attachment canvas.

Attachments now exist as movable objects inside
the shared Note Body workspace.

Before:

Note Body
 ├── Trade Snapshot
 ├── Attachment Canvas
 └── Tiptap

Now:

Note Body / Shared Workspace
 ├── Trade Snapshot
 ├── Tiptap
 └── Attachment Layer

Attachment layer:
- transparent
- absolute
- shares Note Body coordinate space

=================================================
ATTACHMENT RESIZING
=================================================

✅ Screenshot preserves aspect ratio
✅ Width/height resize is proportional
✅ Delete control stays attached
✅ Resize handle stays attached
✅ No large empty attachment box after resize
✅ No detached controls after resize

Resize model:

aspectRatio =
  initialWidth / initialHeight

newWidth =
  max(MIN_WIDTH, initialWidth + deltaX)

newHeight =
  newWidth / aspectRatio

This is intentional.

Screenshots should not be freely distorted.

=================================================
PEN
=================================================

✅ Existing Pen architecture reused
✅ Existing activeAnnotationTool state reused
✅ No duplicate pen state
✅ No second canvas
✅ Toolbar Pen toggles:

select → pen
pen → select

Existing NoteAnnotationCanvas remains the rendering
and annotation engine.

=================================================
TIPTAP
=================================================

✅ Existing Tiptap editor preserved
✅ Same editor instance
✅ Existing content persistence preserved
✅ Existing StarterKit
✅ TextStyle
✅ Color
✅ Underline extension added
✅ Bold wired
✅ Italic wired
✅ Underline wired
✅ Strikethrough wired

Active formatting state reflected in toolbar.

=================================================
NOTE TOOLS BAR
=================================================

File:
components/notes/NoteToolsBar.tsx

VISUAL DESIGN LOCKED
--------------------

Premium Carded design.

Current structure:

[ Text Size ]
[ B I U S ]
[ Lists / Alignment ]
[ Text Color ]
[ Select | Pen | Line | Arrow | Zone | Highlight | Eraser ]
[ Stroke Width ]
[ Undo / Redo ]
[ More ]

✅ Large outer toolbar background removed
✅ Individual tool groups retained
✅ Compact 38px group height
✅ 8px radius
✅ Subtle borders
✅ Premium dark surfaces
✅ Active Select state
✅ Pen active state
✅ Toolbar positioning tuned
✅ Divider below toolbar

Current toolbar:

left-[-8px]
top-[6px]

Divider:

top-[5px]
mt-[3px]

Do not redesign the visual structure unless necessary.

=================================================
CURRENT FUNCTIONAL TOOLING
=================================================

WORKING:
- Bold
- Italic
- Underline
- Strikethrough
- Pen
- Select

VISUAL ONLY / NEXT:
- Custom text size
- Bullet list
- Numbered list
- Alignment
- Text color
- Line
- Arrow
- Zone
- Highlight
- Eraser
- Stroke width
- Undo
- Redo
- More menu

=================================================
NEXT SESSION
=================================================

1. Finish text commands:

- Bullet list
- Numbered list
- Alignment
- Text color
- Custom text size

2. Then drawing tools:

- Line
- Arrow
- Zone
- Highlight
- Eraser
- Stroke width

Reuse existing annotation architecture.

Do NOT:
- create a second canvas
- create duplicate annotation state
- create a second editor
- modify trading architecture

3. Wire Undo / Redo appropriately.

Important:
Determine whether these should control:
- Tiptap history
- annotation history
- or separate history stacks

Do not fake a unified history until the behavior is defined correctly.

4. Responsive toolbar behavior.

Evaluate:
- narrow editor width
- overflow
- secondary controls
- More menu

Do not arbitrarily shrink icons until they become unusable.

5. Final cleanup
- unused state
- obsolete props
- obsolete imports
- temporary comments
- test UI

6. Production verification:

npm run build

=================================================
ARCHITECTURAL RULES
=================================================

Notes remains READ-ONLY relative to the trading system.

Never modify:
- executions
- FIFO reconstruction
- pairTrades
- reconciliation
- P&L
- analytics
- canonical trading data

Trade information is a read-only reference/snapshot.

Executions remain canonical.
Trades remain derived.

=================================================
CHECKPOINT
=================================================

✅ Good stable checkpoint.

Next work starts at:

components/notes/NoteToolsBar.tsx

Primary next task:
Finish wiring the remaining text tools.














∫ELITE X — NOTES V2 CHECKPOINT
Date: 2026-08-18
STATUS: Notes V2 Workspace + Text Toolbar

=================================================
NOTES SIDEBAR
=================================================

✅ TODAY / YESTERDAY / historical date grouping
✅ Future-proof date grouping
✅ Real layout spacers for group separation
✅ Date → card spacing controlled independently
✅ Sidebar vertical scrolling
✅ Horizontal scrollbar removed
✅ Selected note styling
✅ Delete note action
✅ Note timestamps
✅ Linked-trade indicator

CURRENT DATE GROUP MODEL
------------------------

groupIndex === 0
→ first/current date group
→ no preceding spacer

groupIndex > 0
→ real 10px spacer before the group

Date label
→ real 6px spacer

Cards
→ normal flex flow

IMPORTANT
---------
Do NOT reintroduce:

- YESTERDAY-specific transform
- groupLabel-specific positioning
- translateY for date groups
- top-[...] hacks for date-group spacing

The current date-group structure is the stable solution.

=================================================
NOTE EDITOR
=================================================

✅ Fixed note header
✅ Fixed toolbar
✅ Shared Note Body workspace
✅ Scroll architecture improved
✅ Tiptap editor preserved
✅ Dynamic note title width
✅ Link Trade button
✅ Screenshot upload button
✅ Saved status + timestamp
✅ Trade picker
✅ Linked Trade Snapshot display

CURRENT WORKSPACE MODEL
-----------------------

HEADER
  ↓
TOOLBAR
  ↓
SHARED NOTE BODY
  ├── Trade Snapshots
  ├── Screenshot Attachments
  └── Tiptap Content

Notes is intentionally a single workspace.

=================================================
TRADE SNAPSHOT
=================================================

✅ Compact Trade Snapshot card
✅ Responsive card width
✅ Card spacing
✅ Internal spacing
✅ Header positioning
✅ X remove action
✅ Entry Date
✅ Entry
✅ Exit Date
✅ Exit
✅ Entry Time
✅ Exit Time
✅ Holding
✅ P&L

DIRECTION DISPLAY
-----------------

Stocks:
LONG  → green
SHORT → red

Options:
CALL  → green
PUT   → red

Trade information remains read-only reference data.

=================================================
ATTACHMENT WORKSPACE
=================================================

✅ Existing Supabase attachment storage preserved
✅ Existing attachment upload preserved
✅ Existing attachment delete preserved
✅ Existing drag behavior preserved
✅ Existing resize behavior preserved
✅ Existing annotation system preserved

ARCHITECTURAL CHANGE
--------------------

There is NO separate visible screenshot canvas anymore.

Previous model:

Note Body
 ├── Trade Snapshot
 ├── Attachment Canvas
 └── Tiptap

Current model:

Note Body / Shared Workspace
 ├── Trade Snapshot
 ├── Tiptap
 └── Attachment Layer

Attachment layer:
- transparent
- absolute
- shares Note Body coordinate space

Screenshot is now a movable object inside the
same Note Body workspace.

=================================================
ATTACHMENT RESIZING
=================================================

✅ Screenshot remains attached to its controls
✅ Delete action remains attached
✅ Resize handle remains attached
✅ Proportional resizing
✅ Screenshot aspect ratio preserved
✅ No detached controls after resizing
✅ No large empty screenshot boundary

Resize model:

aspectRatio =
  initialWidth / initialHeight

newWidth =
  max(MIN_WIDTH, initialWidth + deltaX)

newHeight =
  newWidth / aspectRatio

IMPORTANT
---------
Do not return to independent width/height resizing
unless there is a strong product reason.

Screenshots should preserve their aspect ratio by default.

=================================================
ANNOTATION
=================================================

✅ Existing NoteAnnotationCanvas preserved
✅ Existing annotation state preserved
✅ Existing annotation persistence preserved
✅ Pen works
✅ Select works
✅ Toolbar Pen control works
✅ No second drawing canvas
✅ No duplicate annotation state

CURRENT TOOL STATE

select
pen

Pen behavior:

select → click Pen → pen
pen → click Pen → select

=================================================
TIPTAP EDITOR
=================================================

File:
components/notes/TiptapEditor.tsx

✅ Existing editor architecture preserved
✅ Same Tiptap editor instance
✅ Existing content persistence preserved
✅ StarterKit
✅ Underline
✅ TextStyle
✅ Color
✅ Custom FontSizeExtension
✅ TextAlign

CURRENT EXTENSIONS
------------------

StarterKit
UnderlineExtension
TextStyle
FontSizeExtension
Color
TextAlign.configure({
  types: [
    "heading",
    "paragraph",
  ],
})

Tiptap package versions are aligned at:

@tiptap/core                    3.23.6
@tiptap/react                   3.23.6
@tiptap/starter-kit             3.23.6
@tiptap/extension-text-style    3.23.6
@tiptap/extension-text-align    3.23.6

IMPORTANT
---------
Do NOT install a different Tiptap version independently.

Keep the Tiptap package family aligned.

=================================================
NOTE TOOLS BAR
=================================================

File:
components/notes/NoteToolsBar.tsx

VISUAL DESIGN — LOCKED
----------------------

Premium Carded toolbar.

Current visual structure:

[ Text Size ]
[ B I U S ]
[ Bullet | Numbered | Alignment ]
[ Text Color ]
[ Select | Pen | Line | Arrow | Zone | Highlight | Eraser ]
[ Stroke ]
[ Undo | Redo ]
[ More ]

✅ Large outer toolbar background removed
✅ Individual tool groups retained
✅ 38px group height
✅ 8px radius
✅ Subtle borders
✅ Dark premium surfaces
✅ Active tool styling
✅ Toolbar X positioning
✅ Toolbar Y positioning
✅ Divider below toolbar

CURRENT POSITIONING

Toolbar:
left-[-8px]
top-[6px]

Divider:
top-[5px]
mt-[3px]

DO NOT redesign the toolbar unless necessary.

=================================================
WORKING TEXT TOOLS
=================================================

✅ Bold
✅ Italic
✅ Underline
✅ Strikethrough
✅ Custom Font Size
✅ Bullet List
✅ Numbered List
✅ Left Align
✅ Center Align
✅ Right Align
✅ Justify
✅ Pen

=================================================
FONT SIZE SYSTEM
=================================================

Custom FontSizeExtension is used because the installed
Tiptap version does not expose the expected setFontSize()
runtime command.

Font size is applied through:

textStyle
+
fontSize attribute

Typing preference is stored per note in localStorage:

elite-x-note-font-size-${noteId}

DEFAULT
-------
New note:
16px

PER-NOTE BEHAVIOR
-----------------

Note 1:
last preference = 32px
→ toolbar = 32
→ new typing = 32

Note 2:
last preference = 10px
→ toolbar = 10
→ new typing = 10

Preference persists across page refresh.

IMPORTANT
---------
Do NOT revert to global font-size state.

Do NOT make one note's font size affect another note.

The toolbar preference is intentionally note-specific.

=================================================
TEXT LIST RENDERING
=================================================

✅ Bullet list works
✅ Ordered list works
✅ Markers are visible
✅ Lists render correctly with Tiptap's
   list-item / paragraph structure
✅ List marker/text are on the same line
✅ List indentation is now visually aligned
   with the normal writing area

CURRENT LIST CSS MODEL
----------------------

ul:
list-disc
list-inside
ml-0

ol:
list-decimal
list-inside
ml-0

Tiptap list-item paragraphs:
inline

Current working classes include:

[&_ul]:list-disc
[&_ul]:list-inside
[&_ul]:ml-0
[&_ol]:list-decimal
[&_ol]:list-inside
[&_ol]:ml-0
[&_ol_li>p]:inline
[&_ul_li>p]:inline

IMPORTANT
---------
Do not replace this with arbitrary pl-* / ml-* tuning
unless the actual UI demonstrates a problem.

=================================================
TEXT ALIGNMENT
=================================================

Alignment uses the installed:

@tiptap/extension-text-align@3.23.6

Available controls:

Left
Center
Right
Justify

Current toolbar presentation is direct buttons,
not a dropdown.

Icons:
AlignLeft
AlignCenter
AlignRight
AlignJustify

Active alignment receives the blue active state.

=================================================
EDITOR HORIZONTAL SPACING
=================================================

✅ Left breathing room added
✅ Right breathing room tuned
✅ Editor width constrained
✅ Editor horizontal overflow removed
✅ Note Body remains the primary scroll workspace

CURRENT EDITOR CONTENT WIDTH

EditorContent currently uses:

w-[calc(100%-35px)]
min-w-0
ml-6

This produced the best visual balance during testing.

IMPORTANT
---------
Keep an eye on different viewport widths.

Do not blindly change the 35px value based on one screen.

Also:

The Tiptap editor should NOT become a second vertical
scroll container.

The Note Body should remain the primary scrolling workspace.

=================================================
CURRENT TOOLBAR FUNCTIONALITY
=================================================

WORKING
-------

Text:
✅ Font size
✅ Bold
✅ Italic
✅ Underline
✅ Strike
✅ Bullet list
✅ Ordered list
✅ Alignment

Drawing:
✅ Select
✅ Pen

VISUAL ONLY / NEXT
------------------

Drawing:
- Line
- Arrow
- Zone
- Highlight
- Eraser
- Stroke width
- Undo
- Redo
- More

Text:
- Text color dropdown

=================================================
NEXT SESSION
=================================================

1. Finish Text Color.

Recommended structure:

Text Color
→ compact dropdown

Elite X color palette should be deliberate,
not an arbitrary single hard-coded color.

2. Wire drawing tools.

Use the existing annotation architecture.

Implement:

- Line
- Arrow
- Zone
- Highlight
- Eraser
- Stroke width

Do NOT:
- create a second canvas
- create duplicate drawing state
- create another annotation engine

3. Decide Undo / Redo architecture.

Important:
There are potentially two histories:

Tiptap history
and
Annotation history

Do not pretend they are one unified history stack
until the behavior is explicitly designed.

4. Responsive toolbar.

Evaluate:

- narrow editor
- narrow viewport
- toolbar overflow
- compact controls
- More menu

Do not arbitrarily shrink controls to unusable sizes.

5. Screenshot placement polish.

6. Final cleanup:

- obsolete temporary comments
- unused imports
- unused state
- obsolete props
- temporary test code
- console logs from debugging
- formatting consistency

7. Final production build:

npm run build

=================================================
ARCHITECTURAL RULES
=================================================

NOTES IS READ-ONLY RELATIVE TO THE TRADING SYSTEM.

Notes must NEVER modify:

- executions
- FIFO engine
- reconstructed trades
- pairTrades
- reconciliation
- P&L engine
- analytics
- canonical trading data

Trade information shown in Notes is a
READ-ONLY reference/snapshot.

Executions remain canonical source of truth.
Trades remain derived state.

Do not change the trading architecture while
continuing Notes V2.

=================================================
CURRENT STABLE CHECKPOINT
=================================================

✅ Sidebar stable
✅ Shared workspace stable
✅ Attachments stable
✅ Proportional resizing stable
✅ Pen stable
✅ Text formatting stable
✅ Font-size preference stable
✅ Lists stable
✅ Alignment stable
✅ Build passing before final list-rendering adjustment

NEXT RESTART POINT:

components/notes/NoteToolsBar.tsx

Next task:
Text Color dropdown.















```text
# ============================================================
# ELITE X — NOTES V2 CHECKPOINT
# ============================================================
# DATE: 2026-08-21
# PROJECT: Elite X Trading Journal
# AREA: Notes V2 — Text Block Toolbar Integration
# ============================================================


# ============================================================
# 1. CURRENT BUILD STATUS
# ============================================================

# Production build PASSES.

npm run build

# Result:

✓ Compiled successfully
✓ TypeScript passes

# DO NOT REVERT THIS CHECKPOINT.


# ============================================================
# 2. GITHUB STATUS
# ============================================================

# Previous GitHub push:

main -> origin/main

# Last known push:

4f20860..eff01d8

# Treat the current local working state as the active
# development checkpoint unless another commit was created.


# ============================================================
# 3. NOTES V2 EDITOR ARCHITECTURE
# ============================================================

# Notes V2 has TWO independent Tiptap editing contexts.

#
# NORMAL NOTE EDITOR
#

TiptapEditor
    ↓
tiptapEditor


#
# TEXT BLOCK EDITOR
#

NoteBlockCanvas
    ↓
NoteBlockEditor
    ↓
activeBlockEditor


# The toolbar must support BOTH editors.


# ============================================================
# 4. REQUIRED TOOLBAR BEHAVIOR
# ============================================================

# The toolbar must always operate on the CURRENTLY ACTIVE
# editing context only.


# NORMAL EDITOR

User selects text in the normal editor
    ↓
Toolbar action
    ↓
NORMAL Tiptap editor only


# TEXT BLOCK

User selects text inside a Text Block
    ↓
Toolbar action
    ↓
THAT Text Block editor only


# Example:

Normal Editor:
    "Hello world"

Text Block:
    "TEST BLOCK"


# If TEST BLOCK is selected and Bold is clicked:

TEST BLOCK → BOLD
Hello world → UNCHANGED


# If Hello world is then selected and Bold is clicked:

Hello world → BOLD
TEST BLOCK → UNCHANGED


# ============================================================
# 5. NOTES PAGE STATE
# ============================================================

# File:

app/notes/page.tsx


# Existing normal editor state:

const [
  tiptapEditor,
  setTiptapEditor,
] = useState<Editor | null>(
  null
);


# Added Text Block editor state:

const [
  activeBlockEditor,
  setActiveBlockEditor,
] = useState<Editor | null>(
  null
);


# NoteBlockCanvas now receives:

onActiveBlockEditorChange={
  setActiveBlockEditor
}


# NoteToolsBar now receives:

activeBlockEditor={
  activeBlockEditor
}


# ============================================================
# 6. NOTE BLOCK CANVAS
# ============================================================

# File:

components/notes/NoteBlockCanvas.tsx


# Props currently include:

onActiveBlockEditorChange: (
  editor: Editor | null
) => void;


# Text Block editor exposes itself through:

onEditorReady={(
  editor
) => {

  onActiveBlockEditorChange(
    editor
  );

}}


# This successfully allows NotesPage to know which Text Block
# editor is active.


# ============================================================
# 7. NOTE TOOLBAR
# ============================================================

# File:

components/notes/NoteToolsBar.tsx


# Props now include:

activeBlockEditor: Editor | null;


# Current active editor logic:

const activeEditor =
  activeBlockEditor ?? editor;


# Toolbar actions should use:

activeEditor


# Example — Bold:

activeEditor
  .chain()
  .focus()
  .toggleBold()
  .run();


# This successfully made Bold work on Text Blocks.


# ============================================================
# 8. CURRENT BUG
# ============================================================

# The following logic is currently TOO SIMPLE:

const activeEditor =
  activeBlockEditor ?? editor;


# Why?

# Once a Text Block becomes active:

activeBlockEditor !== null


# Therefore the toolbar continues using that Text Block editor
# even after the user moves back to the normal editor.


# Current behavior:

Text Block selected
    ↓
Bold works on Text Block
    ↓
Leave Text Block
    ↓
Normal editor selected
    ↓
Toolbar may still target Text Block


# This is NOT a Bold-button problem.

# This is an ACTIVE EDITOR CONTEXT MANAGEMENT problem.


# ============================================================
# 9. IMPORTANT ARCHITECTURAL DECISION
# ============================================================

# DO NOT create separate logic for every toolbar button.

# BAD:

if text block:
    change color one way
else:
    change color another way

# Then repeat for:

Bold
Italic
Underline
Strike
Font Size
Color
Alignment
Lists
etc.


# GOOD:

Maintain ONE authoritative active editor:

activeEditor


# Then every toolbar operation uses:

activeEditor


# The system itself must correctly switch the active editor.


# ============================================================
# 10. REQUIRED EDITOR SWITCHING
# ============================================================

# NORMAL EDITOR FOCUS

Normal Tiptap editor receives focus
    ↓
setActiveBlockEditor(null)
    ↓
activeEditor becomes tiptapEditor


# TEXT BLOCK FOCUS

Text Block receives focus
    ↓
setActiveBlockEditor(blockEditor)
    ↓
activeEditor becomes that Text Block editor


# Desired state:

NORMAL EDITOR
    ↓
activeBlockEditor = null
    ↓
activeEditor = tiptapEditor


TEXT BLOCK
    ↓
activeBlockEditor = blockEditor
    ↓
activeEditor = blockEditor


# ============================================================
# 11. CURRENTLY VERIFIED
# ============================================================

# VERIFIED:

✓ Text Block creation works
✓ Text Block editing works
✓ Text Block positioning works
✓ Text Block resizing works
✓ Text Block deletion works
✓ Text Block persistence works
✓ Text Block editor uses Tiptap
✓ TextStyle installed at compatible version
✓ Color extension installed
✓ TextAlign extension installed
✓ Underline extension installed
✓ Text Block editor exposes Editor instance
✓ activeBlockEditor state exists
✓ NoteToolsBar receives activeBlockEditor
✓ Bold works on Text Block
✓ Production build passes


# ============================================================
# 12. NOT YET VERIFIED / NOT FINISHED
# ============================================================

# Toolbar functionality on Text Blocks is NOT finished.

# Still need to correctly support:

- Bold
- Italic
- Underline
- Strikethrough
- Font size
- Text color
- Alignment
- Bullet list
- Numbered list


# But DO NOT work on those yet.

# First fix active editor switching.


# ============================================================
# 13. NEXT STEP — STEP 5
# ============================================================

# STEP 5:
# FIX ACTIVE EDITOR CONTEXT SWITCHING


# First inspect:

components/notes/TiptapEditor.tsx


# Specifically inspect:

1. Props type
2. TiptapEditor function parameters
3. useEditor(...)
4. Existing onFocus handling


# We need to determine whether TiptapEditor already supports
# an onFocus callback.


# DO NOT assume it does.

# DO NOT modify it until inspected.


# ============================================================
# 14. RESUME PROCEDURE
# ============================================================

# When we resume:

STEP 5.1
--------
Inspect:

components/notes/TiptapEditor.tsx


STEP 5.2
--------
Check whether Props contains:

onFocus


STEP 5.3
--------
If it does not exist, add the smallest required change.


STEP 5.4
--------
Make normal editor focus clear:

setActiveBlockEditor(null)


STEP 5.5
--------
Build:

npm run build


STEP 5.6
--------
Test independently:

NORMAL EDITOR
    → select text
    → Bold
    → only normal editor changes


TEXT BLOCK
    → select text
    → Bold
    → only Text Block changes


STEP 5.7
--------
Only after both contexts work independently:

Proceed to Font Size.


# ============================================================
# 15. DO NOT CHANGE YET
# ============================================================

# Until active editor switching is fixed, DO NOT modify:

NoteBlock data model
Supabase persistence
Text Block positioning
Text Block resizing
Text Block creation
Text Block deletion
Color logic
Font-size logic
Alignment logic
activeBlockStyle
Notes canonical data
Normal editor architecture


# ============================================================
# 16. DEVELOPMENT RULE
# ============================================================

# ONE STEP AT A TIME.

# For every change:

1. Identify exact file path.
2. Identify exact section.
3. Tell exactly what to add/replace.
4. Make only that change.
5. Run npm run build.
6. Test.
7. Report result.
8. Move to next step.


# Do NOT rewrite entire files unless necessary.

# Do NOT introduce duplicate state-management mechanisms.

# Do NOT add toolbar-specific hacks for Text Blocks.

# Keep the editor architecture deterministic and scalable.


# ============================================================
# CURRENT RESUME POINT
# ============================================================

# STOPPED HERE:

Text Block Bold works.

Normal editor needs to regain control of the toolbar when
the user focuses/selects text outside the Text Block.

NEXT ACTION:

Inspect:

components/notes/TiptapEditor.tsx


# ============================================================
# END CHECKPOINT
# ============================================================
```












```text
# ============================================================
# ELITE X — NOTES V2 CHECKPOINT
# ============================================================
# DATE: 2026-08-23
# PROJECT: Elite X Trading Journal
# AREA: Notes V2 — Annotation Tools + Drawing History
# PURPOSE:
# Complete handover checkpoint containing the architecture,
# implementation details, fixes, current behavior, known
# intentional limitations, and exact resume point.
# ============================================================


# ============================================================
# 1. CURRENT GITHUB CHECKPOINT
# ============================================================

# IMPORTANT:
#
# The user requested a GitHub push immediately before creating
# this checkpoint.
#
# The final push output / commit hash has NOT been provided yet
# in the current conversation.
#
# Therefore:
#
# DO NOT INVENT THE COMMIT HASH.
#
# Before resuming future work, verify:
#
#     git status
#     git log -1 --oneline
#
# Confirm:
#
#     HEAD == origin/main
#
# and confirm the drawing Undo/Redo checkpoint is actually
# pushed.


# ============================================================
# 2. LAST KNOWN BUILD STATUS
# ============================================================

# Last verified state:

npm run build

# Result:

✓ Compiled successfully
✓ TypeScript passed
✓ Notes V2 annotation system compiles


# ============================================================
# 3. CORE NOTES ARCHITECTURE
# ============================================================

# Notes V2 remains strictly isolated from the trading system.
#
# Notes MUST NEVER modify:
#
# - executions
# - FIFO reconstruction
# - pairTrades
# - reconstructed trades
# - reconciliation
# - P&L
# - analytics
# - dashboard calculations
# - canonical trading data
#
# Trade information shown in Notes is READ-ONLY reference data.
#
# Canonical trading architecture remains:
#
# Broker
#   ↓
# Normalized Executions
#   ↓
# Supabase Execution Ledger
#   ↓
# Deterministic FIFO Reconstruction
#   ↓
# Canonical Trades
#   ↓
# Analytics / Dashboard
#
# Notes exists beside this architecture.


# ============================================================
# 4. NOTES WORKSPACE MODEL
# ============================================================

# Main Notes workspace:
#
# HEADER
#   ↓
# TOOLBAR
#   ↓
# SHARED NOTE BODY
#
# Shared Note Body contains:
#
# ├── Trade snapshots / linked trades
# ├── Main Tiptap editor
# ├── Text Blocks
# └── Screenshot Attachments
#
# Attachments and Text Blocks are movable objects inside
# the Note Body workspace.


# ============================================================
# 5. TWO INDEPENDENT TEXT EDITORS
# ============================================================

# NORMAL NOTE EDITOR
#
# components/notes/TiptapEditor.tsx
#       ↓
# tiptapEditor
#
#
# TEXT BLOCK EDITOR
#
# NoteBlockCanvas
#       ↓
# NoteBlockEditor
#       ↓
# activeBlockEditor
#
#
# Toolbar must operate on the editor that currently has focus.
#
# Current authoritative editor selection:
#
# const activeEditor =
#   activeBlockEditor ?? editor;
#
#
# IMPORTANT:
#
# Text Block editor ownership is FOCUS-BASED.
#
# onEditorReady means:
#
#     editor instance exists
#
# It does NOT mean:
#
#     editor is the active editing context.


# ============================================================
# 6. ACTIVE EDITOR FOCUS ARCHITECTURE
# ============================================================

# FILE:
#
# components/notes/TiptapEditor.tsx
#
# Props include:
#
# onFocus?: () => void;
#
# Editor configuration invokes:
#
# onFocus() {
#
#   onFocus?.();
#
# }
#
#
# This allows the main Note editor to notify NotesPage that
# the Text Block editor should no longer be considered active.
#
#
# FILE:
#
# components/notes/NoteBlockEditor.tsx
#
# Props include:
#
# onFocus: (
#   editor: Editor
# ) => void;
#
# onEditorReady: (
#   editor: Editor
# ) => void;
#
#
# Text Block focus calls:
#
# onFocus(
#   editor
# );
#
#
# FILE:
#
# components/notes/NoteBlockCanvas.tsx
#
# Focus handler:
#
# onFocus={(
#   editor
# ) => {
#
#   setSelectedBlockId(
#     block.id
#   );
#
#   onActiveBlockEditorChange(
#     editor,
#     block.id
#   );
#
# }}
#
#
# onEditorReady is NOT the active editor ownership mechanism.
#
# It currently remains because NoteBlockEditor still expects it.
#
# Safe current callback:
#
# onEditorReady={(
#   editor
# ) => {
#
#   void editor;
# }}
#
#
# DO NOT casually reintroduce onEditorReady as active-editor
# ownership.


# ============================================================
# 7. NOTES TOOLBAR
# ============================================================

# FILE:
#
# components/notes/NoteToolsBar.tsx
#
# Current toolbar drawing tools:
#
# ✓ Select
# ✓ Pen
# ✓ Line
# ✓ Arrow
# ✓ Zone
# ✓ Highlight
# ✓ Eraser
#
#
# Text controls include:
#
# ✓ Font Size
# ✓ Bold
# ✓ Italic
# ✓ Underline
# ✓ Strikethrough
# ✓ Bullet List
# ✓ Ordered List
# ✓ Left Align
# ✓ Center Align
# ✓ Right Align
# ✓ Justify
# ✓ Text Color
#
#
# History:
#
# ✓ Undo
# ✓ Redo
#
# Drawing-only history.
#
#
# REMOVED:
#
# Separate Stroke Width toolbar group was removed.
#
# Reason:
#
# Drawing Settings already contains:
#
# Color
# Width
#
# Therefore a second Stroke Width control was redundant.
#
# The old visual-only:
#
# [ line  2 ▼ ]
#
# control was removed from NoteToolsBar.tsx.
#
# Future toolbar space can be used for another genuinely useful
# feature later.


# ============================================================
# 8. MAIN DRAWING SETTINGS
# ============================================================

# Drawing settings are shared.
#
# State:
#
# penColor
# penWidth
#
# Parent:
#
# app/notes/page.tsx
#
# Default:
#
# penColor = "#ef4444"
# penWidth = 2
#
#
# Current Color options:
#
# #ef4444
# #f97316
# #facc15
# #4ade80
# #22d3ee
# #60a5fa
# #a78bfa
# #f472b6
# #f8fafc
# #000000
#
#
# Current Width options:
#
# 1
# 2
# 3
# 4
# 6
#
#
# Shared by:
#
# Pen
# Line
# Arrow
# Zone
# Highlight
#
#
# IMPORTANT:
#
# Do NOT create:
#
# lineColor
# arrowColor
# zoneColor
# highlightColor
# etc.
#
# Shared drawing settings are intentional.


# ============================================================
# 9. CURRENT DRAWING TOOL TYPE CHAIN
# ============================================================

# Drawing tool union is currently:
#
# "select"
# | "pen"
# | "line"
# | "arrow"
# | "zone"
# | "highlight"
# | "eraser"
#
#
# This union is intentionally passed through the complete chain:
#
# app/notes/page.tsx
#        ↓
# NoteToolsBar.tsx
#        ↓
# NoteAttachmentCanvas.tsx
#        ↓
# NoteAnnotationCanvas.tsx
#
#
# IMPORTANT:
#
# When another drawing tool is introduced,
# update the complete chain.


# ============================================================
# 10. ANNOTATION DOMAIN
# ============================================================

# FILE:
#
# types/note.ts
#
# Existing NoteAnnotation model includes:
#
# id
# attachmentId
# type
# positionX
# positionY
# width
# height
# rotation
# color
# strokeWidth
# points
# text
# fontSize
# fontWeight
# fontStyle
# textDecoration
# textAlign
# createdAt
# updatedAt
#
#
# Existing schema already supports generic annotation types.
#
# No database schema change was required for:
#
# Pen
# Line
# Arrow
# Zone
# Highlight
# Eraser
#
#
# Annotation geometry uses NORMALIZED coordinates:
#
# x: 0 → 1
# y: 0 → 1
#
# This is critical because screenshots can be resized.
#
# Never persist raw screen pixel coordinates as canonical
# annotation geometry.


# ============================================================
# 11. ANNOTATION STORAGE
# ============================================================

# FILE:
#
# lib/storage/noteAnnotationStorage.ts
#
# Existing APIs:
#
# createNoteAnnotation(...)
# updateNoteAnnotation(...)
# deleteNoteAnnotation(...)
#
#
# Existing ownership validation remains:
#
# attachment
#     ↓
# note
#     ↓
# user
#
# RLS / ownership architecture remains unchanged.
#
# No second annotation store was created.


# ============================================================
# 12. ANNOTATION CANVAS
# ============================================================

# FILE:
#
# components/notes/NoteAnnotationCanvas.tsx
#
# This remains the SINGLE annotation engine.
#
# All drawing tools operate through this component.
#
# DO NOT:
#
# - create another drawing canvas
# - create another annotation store
# - duplicate annotation persistence logic
#
#
# Current props include:
#
# attachmentId
# annotations
# width
# height
# activeTool
# penColor
# penWidth
# onAnnotationCreated
# onAnnotationDeleted
#
#
# The new onAnnotationDeleted callback was added so parent
# Note state is updated when Eraser removes an annotation.


# ============================================================
# 13. CANVAS LOCAL STATE
# ============================================================

# Current local canvas state includes:
#
# isDrawing
# currentPoints
# lineStartPoint
# highlightCursorPosition
# eraserHoveringAnnotation
# localAnnotations
#
#
# localAnnotations is used for immediate canvas rendering.
#
# IMPORTANT:
#
# Parent Notes state is now the effective source of truth.
#
# Current annotation synchronization is intentionally simple:
#
# useEffect(() => {
#
#   setLocalAnnotations(
#     annotations
#   );
#
# }, [
#   annotations,
# ]);
#
#
# This replaced the older merge logic that attempted to retain
# locally-created annotations.
#
# The older merge architecture caused an important bug:
#
# Undo parent state changed
#     ↓
# localAnnotations still held deleted annotation
#     ↓
# sync treated it as locally-created
#     ↓
# deleted annotation returned visually
#
# The simple parent → local sync fixed this.


# ============================================================
# 14. OLD DELETION SYNCHRONIZATION BUG
# ============================================================

# BEFORE:
#
# Eraser deleted annotation from database and localAnnotations.
#
# But parent annotations still contained the annotation.
#
# When tools changed / sync ran:
#
# parent annotations
#     +
# locally-created annotations
#     ↓
# deleted annotation returned
#
#
# FIX:
#
# Added:
#
# onAnnotationDeleted
#
# callback chain:
#
# NoteAnnotationCanvas
#     ↓
# NoteAttachmentCanvas
#     ↓
# NotesPage
#
#
# Parent Notes state now removes the annotation.
#
# Then annotation sync became:
#
# annotations
#     ↓
# localAnnotations
#
# only.


# ============================================================
# 15. PEN TOOL
# ============================================================

# FILE:
#
# components/notes/NoteAnnotationCanvas.tsx
#
# Interaction:
#
# click + hold
#     ↓
# freehand drawing
#     ↓
# release
#     ↓
# save
#
#
# Pen stores multiple normalized points.
#
# Rendering uses:
#
# context.moveTo()
# context.lineTo()
#
# with:
#
# lineCap = "round"
# lineJoin = "round"
#
#
# Pen is true freehand.
#
#
# IMPORTANT:
#
# A regression previously caused Pen to behave like a short
# straight line because the rendering logic had accidentally
# collapsed current freehand points to start/end behavior.
#
# The Pen renderer was corrected to iterate ALL current points:
#
# currentPoints.forEach(...)
#
# and line through all points.
#
# This restored:
#
# ✓ circles
# ✓ curves
# ✓ arbitrary freehand drawings
# ✓ large freehand strokes


# ============================================================
# 16. LINE TOOL
# ============================================================

# Interaction:
#
# click A
#     ↓
# move
#     ↓
# live straight preview
#     ↓
# click B
#     ↓
# save
#
#
# Line:
#
# type = "line"
#
# points:
#
# [
#   startPoint,
#   endPoint
# ]
#
#
# Cursor:
#
# crosshair
#
#
# Persistence:
#
# normalized coordinates
#
#
# Verified:
#
# ✓ line renders
# ✓ line persists
# ✓ line reloads
# ✓ shared color
# ✓ shared width


# ============================================================
# 17. ARROW TOOL
# ============================================================

# Interaction matches Line:
#
# click A
#     ↓
# move
#     ↓
# preview shaft + arrowhead
#     ↓
# click B
#     ↓
# save
#
#
# type:
#
# "arrow"
#
#
# points:
#
# [
#   startPoint,
#   endPoint
# ]
#
#
# Arrow rendering:
#
# angle =
#   Math.atan2(
#     endY - startY,
#     endX - startX
#   );
#
# arrowLength =
#   Math.max(
#     10,
#     strokeWidth * 4
#   );
#
# arrowAngle =
#   Math.PI / 7;
#
#
# Triangular arrowhead is drawn at endpoint.
#
# Shared:
#
# color
# width
#
#
# Verified:
#
# ✓ shaft
# ✓ arrowhead
# ✓ live preview
# ✓ persistence


# ============================================================
# 18. ZONE / RECTANGLE TOOL
# ============================================================

# Interaction:
#
# click A
#     ↓
# move
#     ↓
# preview rectangle
#     ↓
# click B
#     ↓
# save
#
#
# type:
#
# "zone"
#
#
# Uses:
#
# points:
#   [startPoint, endPoint]
#
#
# Rendering:
#
# context.strokeRect(
#   startX,
#   startY,
#   endX - startX,
#   endY - startY
# );
#
#
# Shared:
#
# color
# width
#
#
# IMPORTANT BUG FIX:
#
# Initial implementation accidentally rendered:
#
# line
# +
# rectangle
#
# resulting in a diagonal line through the rectangle.
#
# Cause:
#
# Zone was falling through the Line / Arrow rendering path.
#
# Fix:
#
# Zone has its own explicit rendering branch:
#
# if (
#   annotation.type === "zone"
# ) {
#
#   ...
#
#   context.strokeRect(...)
#
#   continue;
#
# }
#
#
# Current drawing preview also has an early Zone return after
# drawing strokeRect, preventing line preview from executing.
#
# Verified:
#
# ✓ rectangle only
# ✓ no diagonal line
# ✓ live rectangle preview
# ✓ persistence


# ============================================================
# 19. HIGHLIGHT TOOL
# ============================================================

# Highlight is FREEHAND, not rectangle-based.
#
# Interaction:
#
# click + hold
#     ↓
# freehand highlight stroke
#     ↓
# release
#     ↓
# save
#
#
# Rendering:
#
# globalAlpha = 0.35
#
# lineWidth =
#   Math.max(
#     strokeWidth * 4,
#     8
#   )
#
# lineCap = "round"
# lineJoin = "round"
#
#
# Stored type:
#
# "highlight"
#
#
# Highlight uses:
#
# penColor
# penWidth
#
#
# Single click is allowed.
#
# A single-click Highlight can produce a large dot when using
# maximum width.
#
# This is intentional behavior.


# ============================================================
# 20. HIGHLIGHT LIVE PREVIEW
# ============================================================

# Initial issue:
#
# Highlight only appeared after mouse release.
#
# Cause:
#
# Saved rendering existed,
# but current-drawing rendering did not include Highlight.
#
# Fix:
#
# Added CURRENT DRAWING → HIGHLIGHT PREVIEW.
#
# The live preview uses:
#
# globalAlpha = 0.35
# lineWidth =
#   Math.max(
#     penWidth * 4,
#     8
#   )
# color =
#   penColor
#
#
# Verified:
#
# ✓ highlight follows cursor while holding mouse
# ✓ smooth freehand preview
# ✓ same stroke appears after release
#
#
# Highlight persistence uses existing annotation storage.


# ============================================================
# 21. HIGHLIGHT CURSOR
# ============================================================

# Requirement:
#
# User did not like a generic pointer / plus cursor.
#
# Final design:
#
# Exact Lucide Highlighter icon:
#
# <Highlighter
#   size={14}
#   strokeWidth={1.8}
# />
#
#
# Native cursor is hidden:
#
# cursor:
#   activeTool === "highlight"
#     ? "none"
#     : ...
#
#
# A small color indicator line is rendered underneath it.
#
# Indicator:
#
# backgroundColor =
#   penColor
#
#
# Therefore:
#
# yellow selected → yellow line
# green selected  → green line
# red selected    → red line
# blue selected   → blue line
#
#
# This uses the existing penColor state.
#
# No additional color state was created.


# ============================================================
# 22. ERASER TOOL — OVERALL MODEL
# ============================================================

# Eraser does NOT erase pixels from the canvas.
#
# It deletes annotation objects.
#
# Flow:
#
# Eraser
#     ↓
# hover annotation
#     ↓
# hit-test
#     ↓
# click
#     ↓
# deleteNoteAnnotation()
#     ↓
# remove local annotation
#     ↓
# notify parent
#     ↓
# parent state updates
#
#
# This preserves annotation persistence and object semantics.


# ============================================================
# 23. ERASER HIT TESTING
# ============================================================

# Added:
#
# findAnnotationAtPoint(
#   pixelX,
#   pixelY
# )
#
#
# It converts the pointer to normalized coordinates.
#
# It checks annotations in reverse order:
#
# newest annotation first
#
# This approximates topmost-object behavior when annotations
# overlap.


# ============================================================
# 24. ERASER — PEN / HIGHLIGHT HIT TEST
# ============================================================

# For Pen / Highlight:
#
# test each segment between consecutive points.
#
# Calculate closest point on the segment.
#
# Compare distance to tolerance.
#
#
# Normalized tolerance is derived from:
#
# hitTolerance =
#   Math.max(
#     penWidth * 2,
#     8
#   );
#
#
# Special case was added for zero-length segments.


# ============================================================
# 25. ERASER — SINGLE CLICK HIGHLIGHT DOT FIX
# ============================================================

# Problem:
#
# User can:
#
# Highlight
#     ↓
# maximum width
#     ↓
# single click
#
# Result:
#
# large highlight dot.
#
#
# Original hit-test skipped zero-length segments:
#
# if (
#   lengthSquared ===
#   0
# ) {
#
#   continue;
# }
#
#
# Therefore Eraser could not detect the dot.
#
#
# Fix:
#
# Zero-length segment now performs point-distance hit testing.
#
# Point tolerance additionally accounts for:
#
# annotation.strokeWidth * 4
#
#
# Result:
#
# ✓ large Highlight dot can be detected
# ✓ cursor activates over dot
# ✓ Eraser deletes dot


# ============================================================
# 26. ERASER CURSOR
# ============================================================

# Eraser originally showed browser "+" / crosshair.
#
# Final behavior:
#
# Native cursor:
#
# cursor:
#   activeTool === "eraser"
#     ? "none"
#
#
# Custom overlay uses:
#
# <Eraser
#   size={14}
#   strokeWidth={1.8}
# />
#
#
# Cursor position is tracked using:
#
# highlightCursorPosition
#
# The same pointer-position state is reused intentionally.
#
#
# Eraser also has:
#
# eraserHoveringAnnotation
#
# state:
#
# const [
#   eraserHoveringAnnotation,
#   setEraserHoveringAnnotation,
# ] = useState<string | null>(null);
#
#
# This stores the annotation ID currently under the Eraser.


# ============================================================
# 27. ERASER HOVER FEEDBACK
# ============================================================

# UX requirement:
#
# User should know when the cursor is actually over something
# that can be erased.
#
#
# Empty area:
#
# normal Eraser icon
#
#
# Annotation underneath:
#
# red Eraser icon
# +
# red line underneath
#
#
# This is controlled by:
#
# eraserHoveringAnnotation
#
#
# Cursor class:
#
# eraserHoveringAnnotation
#   ? "text-red-400"
#   : "text-slate-300"
#
#
# Red indicator line appears only while:
#
# eraserHoveringAnnotation
#
# is truthy.


# ============================================================
# 28. ERASER TOOLBAR WIRING
# ============================================================

# FILE:
#
# components/notes/NoteToolsBar.tsx
#
# Eraser button:
#
# onClick={() => {
#
#   onAnnotationToolChange(
#     "eraser"
#   );
#
#   setIsDrawingSettingsOpen(
#     false
#   );
#
# }}
#
#
# Active state:
#
# activeAnnotationTool === "eraser"
#
# receives:
#
# bg-[#0b1730]
# text-blue-300
#
#
# Eraser uses the existing Lucide icon.


# ============================================================
# 29. ERASER DELETE PERSISTENCE
# ============================================================

# FILE:
#
# components/notes/NoteAnnotationCanvas.tsx
#
# Eraser flow:
#
# const annotation =
#   findAnnotationAtPoint(...)
#
# if none:
#
#   return
#
# delete:
#
# await deleteNoteAnnotation(
#   annotation
# )
#
#
# After successful deletion:
#
# setLocalAnnotations(
#   current =>
#     current.filter(
#       item =>
#         item.id !==
#         annotation.id
#     )
# )
#
#
# Then:
#
# onAnnotationDeleted(
#   attachmentId,
#   annotation
# )
#
#
# IMPORTANT:
#
# Eraser must remain object-based.
#
# Do NOT implement pixel erasing.


# ============================================================
# 30. PARENT ANNOTATION CALLBACK CHAIN
# ============================================================

# FILE:
#
# components/notes/NoteAttachmentCanvas.tsx
#
# Props now include:
#
# onAnnotationCreated
# onAnnotationDeleted
#
#
# It passes:
#
# onAnnotationDeleted={
#   onAnnotationDeleted
# }
#
# into NoteAnnotationCanvas.
#
#
# FILE:
#
# app/notes/page.tsx
#
# NoteAttachmentCanvas receives:
#
# onAnnotationDeleted={
#   handleAnnotationDeleted
# }
#
#
# This means parent Notes state is now updated for both:
#
# CREATE
# DELETE
#
#
# This was required to make Undo/Redo reliable.


# ============================================================
# 31. DRAWING HISTORY — PRODUCT DECISION
# ============================================================

# Undo/Redo applies ONLY to drawing annotations.
#
# It does NOT affect:
#
# - Main Note Tiptap editor
# - Text Blocks
# - note title
# - linked trades
# - screenshot attachment object itself
# - screenshot movement
# - screenshot resizing
# - trading data
#
#
# Drawing history v1 supports:
#
# ✓ Create annotation
# ✓ Delete annotation
#
#
# Not included:
#
# ✗ Move annotation
# ✗ Resize annotation
# ✗ Move screenshot
# ✗ Resize screenshot
# ✗ Text history
# ✗ Tiptap history


# ============================================================
# 32. DRAWING HISTORY DATA MODEL
# ============================================================

# FILE:
#
# app/notes/page.tsx
#
# Type:
#
# type AnnotationHistoryAction =
#   | {
#       type:
#         "create";
#
#       annotation:
#         NoteAnnotation;
#     }
#   | {
#       type:
#         "delete";
#
#       annotation:
#         NoteAnnotation;
#     };
#
#
# State:
#
# annotationHistory
#
# annotationRedoStack
#
#
# Initial:
#
# []
# []
#
#
# History stores complete annotation objects, not just IDs.
#
# This is important for exact geometry restoration.


# ============================================================
# 33. DRAWING HISTORY RECORDING
# ============================================================

# CREATE:
#
# handleAnnotationCreated(...)
#
# does:
#
# setNotes(...)
#
# then:
#
# setAnnotationHistory(
#   current => [
#     ...current,
#     {
#       type:
#         "create",
#
#       annotation:
#         annotation,
#     },
#   ]
# )
#
# and:
#
# setAnnotationRedoStack(
#   []
# )
#
#
# DELETE:
#
# handleAnnotationDeleted(...)
#
# does:
#
# setNotes(...)
#
# then:
#
# setAnnotationHistory(
#   current => [
#     ...current,
#     {
#       type:
#         "delete",
#
#       annotation:
#         annotation,
#     },
#   ]
# )
#
# and:
#
# setAnnotationRedoStack(
#   []
# )
#
#
# Important rule:
#
# Any new drawing action after Undo invalidates Redo.


# ============================================================
# 34. DRAWING UNDO
# ============================================================

# FILE:
#
# app/notes/page.tsx
#
# handleDrawingUndo()
#
#
# If history empty:
#
# return
#
#
# Last action:
#
# annotationHistory[
#   annotationHistory.length - 1
# ]
#
#
# CREATE → UNDO:
#
# deleteNoteAnnotation(
#   annotation
# )
#
# then remove it from:
#
# selectedNote.attachments
#
#
# DELETE → UNDO:
#
# createNoteAnnotation(
#   annotation
# )
#
# then append restored annotation to:
#
# selectedNote.attachments
#
#
# After Undo:
#
# last history action removed
# action moved to redo stack


# ============================================================
# 35. DRAWING REDO
# ============================================================

# FILE:
#
# app/notes/page.tsx
#
# handleDrawingRedo()
#
#
# If redo stack empty:
#
# return
#
#
# CREATE → REDO:
#
# createNoteAnnotation(
#   annotation
# )
#
# then append recreated annotation into selected attachment.
#
#
# DELETE → REDO:
#
# find current annotation
# deleteNoteAnnotation(...)
#
# then remove it from selected attachment.
#
#
# After Redo:
#
# redo action removed
# action moved back to history


# ============================================================
# 36. ANNOTATION ID LIFECYCLE — IMPORTANT
# ============================================================

# Supabase createNoteAnnotation()
# can return a NEW database ID.
#
# Therefore:
#
# CREATE
# → Undo
# → Redo
#
# creates a NEW annotation ID.
#
#
# Same:
#
# DELETE
# → Undo
#
# recreates annotation with a NEW ID.
#
#
# This was explicitly handled.
#
#
# Undo DELETE:
#
# restored =
#   await createNoteAnnotation(
#     annotation
#   );
#
# Then:
#
# actionForRedo =
# {
#   type:
#     "delete",
#
#   annotation:
#     restored,
# };
#
#
# Undo later moves:
#
# actionForRedo
#
# to Redo stack, not stale `lastAction`.
#
#
# Redo CREATE:
#
# recreated =
#   await createNoteAnnotation(
#     annotation
#   );
#
# Then:
#
# actionForHistory =
# {
#   type:
#     "create",
#
#   annotation:
#     recreated,
# };
#
#
# Redo later moves:
#
# actionForHistory
#
# back into history.
#
#
# This prevents stale annotation IDs from breaking future
# Undo/Redo operations after recreated database rows.


# ============================================================
# 37. NOTE ISOLATION FOR HISTORY
# ============================================================

# IMPORTANT:
#
# annotationHistory and annotationRedoStack are page-level
# state, not durable per-note history.
#
# Therefore we explicitly reset them when selectedNoteId changes.
#
# FILE:
#
# app/notes/page.tsx
#
# useEffect(() => {
#
#   setAnnotationHistory(
#     []
#   );
#
#   setAnnotationRedoStack(
#     []
#   );
#
# }, [
#   selectedNoteId,
# ]);
#
#
# This prevents:
#
# Note A history
#     ↓
# switch to Note B
#     ↓
# Undo accidentally affecting Note A
#
#
# Current product behavior:
#
# Switching Notes starts with clean drawing history.


# ============================================================
# 38. HISTORY PERSISTENCE DECISION
# ============================================================

# Drawing history is SESSION-ONLY.
#
# It is intentionally NOT persisted to Supabase.
#
#
# Therefore:
#
# Draw
#   ↓
# Undo
#   ↓
# Redo
#
# works during current page session.
#
#
# But:
#
# Draw
#   ↓
# Refresh
#   ↓
# Undo
#
# does NOT work.
#
#
# This is INTENTIONAL.
#
# Reason:
#
# Persisting Undo/Redo would require a durable history model,
# versioning, branching, retention, cleanup, and clear semantics
# across browser sessions.
#
# For current Notes V2:
#
# persisted annotations = durable state
#
# Undo/Redo = transient editing history
#
#
# Treat this as a deliberate v1 product decision, not a bug.


# ============================================================
# 39. TOOLBAR HISTORY WIRING
# ============================================================

# FILE:
#
# components/notes/NoteToolsBar.tsx
#
# Props now include:
#
# onDrawingUndo: () => void;
# onDrawingRedo: () => void;
#
#
# Component destructures:
#
# onDrawingUndo
# onDrawingRedo
#
#
# Undo button:
#
# onClick={
#   onDrawingUndo
# }
#
#
# Redo button:
#
# onClick={
#   onDrawingRedo
# }
#
#
# IMPORTANT:
#
# Redo was initially left visual-only during development.
#
# Later it was correctly wired.
#
# Final expected behavior:
#
# Undo button invokes parent handler.
# Redo button invokes parent handler.


# ============================================================
# 40. DRAWING HISTORY CALLBACK CHAIN
# ============================================================

# Current chain:
#
# NoteToolsBar
#     ↓
# onDrawingUndo
# onDrawingRedo
#     ↓
# app/notes/page.tsx
#     ↓
# handleDrawingUndo()
# handleDrawingRedo()
#     ↓
# Supabase annotation storage
#     +
# parent selectedNote state
#
#
# Tiptap Undo/Redo is NOT involved.


# ============================================================
# 41. IMPORTANT DEBUGGING EVENTS DURING IMPLEMENTATION
# ============================================================

# REDO initially appeared to do nothing.
#
# Root cause:
#
# The Redo toolbar button had never been wired.
#
# After wiring:
#
# DRAWING REDO CLICKED:
#
# showed:
#
# redoLength: 1
# actionType: "create"
# annotationId: existing annotation ID
# attachmentId: attachment ID
#
#
# Then:
#
# REDO CREATE:
#
# showed:
#
# originalId:
# old annotation ID
#
# recreatedId:
# new annotation ID
#
#
# This confirmed:
#
# ✓ Redo callback executed
# ✓ redo stack contained action
# ✓ createNoteAnnotation() succeeded
# ✓ Supabase generated new ID
#
#
# Redo was subsequently confirmed visually working.
#
#
# IMPORTANT:
#
# Temporary debug logs added during troubleshooting should be
# removed before the final production checkpoint if they have
# not already been removed.
#
# Known debug strings used:
#
# "DRAWING REDO CLICKED:"
#
# "REDO CREATE:"
#
# "REDO CREATE STATE UPDATE:"
#
#
# The third state-update diagnostic was NOT needed once Redo was
# confirmed working.
#
# Before pushing final production checkpoint, inspect and remove
# temporary console logs if still present.


# ============================================================
# 42. TESTING RESULTS / CURRENT VERIFIED BEHAVIOR
# ============================================================

# Verified:
#
# ✓ Pen works as freehand
# ✓ Line works
# ✓ Arrow works
# ✓ Zone works
# ✓ Highlight works
# ✓ Highlight live preview works
# ✓ Eraser works
# ✓ Eraser hover feedback works
# ✓ Eraser deletes persisted annotation
# ✓ Deleted annotations remain deleted
# ✓ Deleted annotations no longer resurrect on tool change
# ✓ Parent annotation synchronization works
# ✓ Drawing Undo works during session
# ✓ Drawing Redo works during session
# ✓ Recreated annotation IDs are tracked
# ✓ Build passes
#
#
# User's latest manual testing result:
#
# "looks like we are good"
#
# User requested to test the system over the next few days.


# ============================================================
# 43. KNOWN INTENTIONAL LIMITATION
# ============================================================

# AFTER PAGE REFRESH:
#
# Undo / Redo history is empty.
#
# Therefore:
#
# Draw → Refresh → Undo
#
# does nothing.
#
# This is expected and intentional for v1.
#
#
# The annotation itself remains persisted and visible after
# refresh.


# ============================================================
# 44. Tiptap WARNING OBSERVED
# ============================================================

# Browser console currently shows:
#
# [tiptap warn]:
# Duplicate extension names found:
# ['underline']
#
#
# This warning is separate from annotation functionality.
#
# It did NOT cause the drawing Undo/Redo bug.
#
# Do not mix this cleanup into the annotation checkpoint.
#
# Treat as a separate future Tiptap cleanup task.


# ============================================================
# 45. ATTACHMENT CANVAS ARCHITECTURE
# ============================================================

# FILE:
#
# components/notes/NoteAttachmentCanvas.tsx
#
# Parent responsibilities:
#
# ✓ render screenshot attachments
# ✓ drag screenshots
# ✓ resize screenshots
# ✓ persist attachment layout
# ✓ render NoteAnnotationCanvas
#
#
# Existing:
#
# localAttachments
#
# remains responsible for attachment drag/resize UI state.
#
#
# Annotation callbacks:
#
# onAnnotationCreated
# onAnnotationDeleted
#
# now pass annotation changes upward to NotesPage.


# ============================================================
# 46. ATTACHMENT LAYOUT ARCHITECTURE
# ============================================================

# Existing screenshot drag behavior:
#
# pointer down
#     ↓
# calculate delta
#     ↓
# update localAttachments
#     ↓
# pointer up
#     ↓
# onLayoutChange()
#     ↓
# updateNoteAttachmentLayout()
#
#
# Existing resize:
#
# pointer down
#     ↓
# aspect ratio preserved
#     ↓
# min width / height enforced
#     ↓
# localAttachments updated
#     ↓
# persistence on pointer up
#
#
# Undo/Redo currently does NOT include these layout operations.


# ============================================================
# 47. CURRENT IMPORTANT FILE MAP
# ============================================================

# Notes page:
#
# app/notes/page.tsx
#
# Main editor:
#
# components/notes/TiptapEditor.tsx
#
# Text block editor:
#
# components/notes/NoteBlockEditor.tsx
#
# Text block canvas:
#
# components/notes/NoteBlockCanvas.tsx
#
# Toolbar:
#
# components/notes/NoteToolsBar.tsx
#
# Screenshot / attachment canvas:
#
# components/notes/NoteAttachmentCanvas.tsx
#
# Drawing annotation engine:
#
# components/notes/NoteAnnotationCanvas.tsx
#
# Annotation storage:
#
# lib/storage/noteAnnotationStorage.ts
#
# Note storage:
#
# lib/storage/supabaseNoteStorage.ts
#
# Domain types:
#
# types/note.ts


# ============================================================
# 48. CURRENT ANNOTATION TOOL INTERACTION MODEL
# ============================================================

# SELECT
#
# normal attachment interaction
#
#
# PEN
#
# click + hold
# → freehand
# → release
#
#
# LINE
#
# click
# → move
# → click
#
#
# ARROW
#
# click
# → move
# → click
#
#
# ZONE
#
# click
# → move
# → click
#
#
# HIGHLIGHT
#
# click + hold
# → freehand highlight
# → release
#
#
# ERASER
#
# hover annotation
# → visual active feedback
# → click
# → delete annotation


# ============================================================
# 49. DRAWING PREVIEW ARCHITECTURE
# ============================================================

# Existing annotations:
#
# localAnnotations
#     ↓
# drawCanvas()
#
#
# Current drawing:
#
# currentPoints
#     ↓
# drawCanvas()
#
#
# Pen:
#
# all currentPoints rendered
#
#
# Highlight:
#
# all currentPoints rendered with:
#
# globalAlpha = 0.35
#
#
# Line / Arrow:
#
# start + end only
#
#
# Zone:
#
# start + end
#     ↓
# strokeRect
#
#
# Important:
#
# Zone preview returns after drawing the rectangle so it does
# not fall into Line/Arrow preview.


# ============================================================
# 50. NORMALIZED GEOMETRY RULE
# ============================================================

# Pointer coordinates:
#
# browser pixels
#     ↓
# pixelToNormalized()
#     ↓
# normalized geometry
#
#
# Render:
#
# normalized geometry
#     ↓
# normalizedToPixel()
#     ↓
# canvas pixels
#
#
# This ensures annotations scale with screenshots.


# ============================================================
# 51. DRAWING SETTINGS SHARED RULE
# ============================================================

# Current state:
#
# penColor
# penWidth
#
#
# Shared across:
#
# Pen
# Line
# Arrow
# Zone
# Highlight
#
#
# Eraser does not need its own color/width.
#
#
# Do not introduce separate state unless product requirements
# explicitly require per-tool preferences.


# ============================================================
# 52. DRAWING HISTORY RULES
# ============================================================

# New action:
#
# append to history
# clear redo
#
#
# Undo:
#
# pop history
# perform inverse operation
# push action onto redo
#
#
# Redo:
#
# pop redo
# perform original operation
# push updated action back to history
#
#
# Recreated annotations may receive new database IDs.
#
# Therefore history action must hold the CURRENT annotation
# object returned from Supabase after recreation.


# ============================================================
# 53. DO NOT MIX DRAWING HISTORY WITH TEXT HISTORY
# ============================================================

# Drawing history:
#
# annotationHistory
# annotationRedoStack
#
#
# Tiptap history:
#
# managed independently by Tiptap
#
#
# Do NOT create:
#
# one giant unified history stack.
#
#
# Reason:
#
# annotations are persisted objects,
# Tiptap uses document transactions.
#
# Their history semantics are fundamentally different.


# ============================================================
# 54. CURRENT PRODUCT DECISION — UNDO SCOPE
# ============================================================

# Undo/Redo is DRAWING-ONLY.
#
# If user is typing:
#
# Tiptap handles text history.
#
#
# If user is using drawing tools:
#
# drawing Undo/Redo handles annotation history.
#
#
# Current toolbar buttons are wired to drawing history
# callbacks from NotesPage.


# ============================================================
# 55. CURRENT PRODUCT DECISION — TOOLBAR CLEANUP
# ============================================================

# Removed redundant Stroke Width group.
#
# Reason:
#
# Drawing Settings already has Width.
#
#
# Future toolbar slot should only receive a genuinely useful
# feature.
#
# Do not add another duplicate width control.


# ============================================================
# 56. FUTURE TOOLS NOT IMPLEMENTED
# ============================================================

# Possible future annotation tools:
#
# - additional trading markup tools
# - opacity
# - other chart-specific drawing tools
#
#
# However:
#
# DO NOT add more tools immediately.
#
# Current priority:
#
# stabilize existing annotation system through real-world use.


# ============================================================
# 57. TESTING PERIOD
# ============================================================

# User will now test the annotation system over several days.
#
# Recommended real-world tests:
#
# 1. Pen circles / curves
# 2. Large Pen strokes
# 3. Multiple Lines
# 4. Arrow creation
# 5. Zone creation
# 6. Highlight short + long strokes
# 7. Highlight maximum width
# 8. Highlight single-click dot
# 9. Eraser over every annotation type
# 10. Eraser over empty space
# 11. Eraser hover activation
# 12. Undo create
# 13. Redo create
# 14. Undo delete
# 15. Redo delete
# 16. Multiple Undo
# 17. Multiple Redo
# 18. Undo → new drawing → Redo should be cleared
# 19. Switch Notes
# 20. Refresh persistence
# 21. Resize screenshot after annotations
# 22. Move screenshot after annotations
#
#
# Any unexpected behavior should be reported before changing
# architecture.


# ============================================================
# 58. IMPORTANT TESTING EXPECTATION
# ============================================================

# EXPECTED:
#
# Draw
# → Undo
# → Redo
#
# works during the current session.
#
#
# EXPECTED:
#
# Draw
# → Refresh
# → Undo
#
# does nothing.
#
#
# This is intentional because:
#
# annotation state = persisted
# history state = transient


# ============================================================
# 59. CURRENT STABLE ARCHITECTURE SUMMARY
# ============================================================

# DRAWING:
#
# Toolbar
#     ↓
# activeAnnotationTool
#     ↓
# NoteAttachmentCanvas
#     ↓
# NoteAnnotationCanvas
#     ↓
# NoteAnnotation
#     ↓
# Supabase annotation storage
#
#
# CREATE:
#
# NoteAnnotationCanvas
#     ↓
# createNoteAnnotation()
#     ↓
# localAnnotations
#     ↓
# onAnnotationCreated()
#     ↓
# NotesPage
#     ↓
# selectedNote.attachments
#
#
# DELETE:
#
# Eraser
#     ↓
# deleteNoteAnnotation()
#     ↓
# localAnnotations
#     ↓
# onAnnotationDeleted()
#     ↓
# NotesPage
#     ↓
# selectedNote.attachments
#
#
# UNDO / REDO:
#
# NotesPage
#     ↓
# annotationHistory
# annotationRedoStack
#     ↓
# create/delete exact annotation objects
#
#
# This is the current canonical Notes drawing architecture.


# ============================================================
# 60. KNOWN CODE QUALITY / FUTURE CLEANUP
# ============================================================

# Some Notes V2 code is intentionally verbose and heavily
# sectioned.
#
# Keep incremental changes.
#
# Do NOT rewrite whole files while debugging individual features.
#
#
# Temporary / transitional items that may be cleaned later:
#
# 1. NoteBlockEditor onEditorReady callback
#    - currently required by contract
#    - not used for active editor ownership
#
# 2. Any remaining deletedAnnotationIds state / tombstone logic
#    - may now be redundant after parent source-of-truth sync
#    - do not remove during the testing period unless necessary
#
# 3. Temporary console debug logs from Redo debugging
#    - remove before final production cleanup if still present
#
# 4. Duplicate Tiptap underline warning
#    - separate cleanup task
#
#
# DO NOT perform broad cleanup during this testing checkpoint.


# ============================================================
# 61. IMPORTANT — CURRENT BUGS / WARNINGS
# ============================================================

# Known console warning:
#
# [tiptap warn]:
# Duplicate extension names found:
# ['underline']
#
#
# Status:
#
# Existing warning.
# Not related to drawing tools.
#
#
# Drawing bugs discovered during development were fixed:
#
# ✓ Pen freehand regression
# ✓ Zone diagonal line
# ✓ Highlight delayed preview
# ✓ Highlight cursor
# ✓ Eraser plus cursor
# ✓ Eraser hover detection
# ✓ Eraser dot detection
# ✓ Eraser parent persistence
# ✓ Deleted annotation resurrection
# ✓ Undo parent/local synchronization
# ✓ Redo button not wired
# ✓ recreated annotation ID lifecycle
#
#
# Current user report:
#
# Drawing system appears good.
# User wants to test for several days.


# ============================================================
# 62. GIT / DEVELOPMENT RULE
# ============================================================

# Before continuing future work:
#
#     git status
#     git log -1 --oneline
#
#
# Verify clean / pushed state.
#
#
# Development workflow:
#
# 1. identify exact file
# 2. identify exact section
# 3. provide exact replacement
# 4. make ONE logical change
# 5. npm run build
# 6. manually test
# 7. checkpoint
# 8. push
#
#
# Avoid multiple unrelated modifications in one step.


# ============================================================
# 63. CURRENT RESUME POINT
# ============================================================

# DO NOT immediately add another drawing feature.
#
# User is entering a multi-day stability testing period.
#
# First action when resuming:
#
#     git status
#     git log -1 --oneline
#
# Confirm current GitHub checkpoint.
#
#
# Then review any user-reported drawing issues.
#
#
# If no bugs are reported:
#
# perform a cleanup pass for:
#
# - temporary debug logs
# - redundant deletedAnnotationIds state
# - Tiptap underline warning
#
# but do this in separate deliberate checkpoints.
#
#
# Do NOT introduce:
#
# - persisted history
# - more drawing tools
# - screenshot movement history
# - annotation resize history
#
# until current system has been proven stable.


# ============================================================
# 64. FINAL CURRENT FEATURE MATRIX
# ============================================================

# TEXT:
#
# ✓ Main Note editor
# ✓ Text Block editor
# ✓ Focus-based active editor
# ✓ Independent font size
# ✓ Independent text color
# ✓ Bold
# ✓ Italic
# ✓ Underline
# ✓ Strike
# ✓ Bullet list
# ✓ Ordered list
# ✓ Alignment
#
#
# SCREENSHOTS:
#
# ✓ Upload
# ✓ Delete
# ✓ Drag
# ✓ Resize
# ✓ Secure signed URLs
# ✓ Persistence
#
#
# DRAWING:
#
# ✓ Select
# ✓ Pen
# ✓ Line
# ✓ Arrow
# ✓ Zone
# ✓ Highlight
# ✓ Eraser
#
#
# DRAWING SETTINGS:
#
# ✓ Color
# ✓ Width
#
#
# DRAWING HISTORY:
#
# ✓ Undo
# ✓ Redo
# ✓ Session-only
#
#
# BUILD:
#
# ✓ Production build passes


# ============================================================
# 65. FINAL RESUME INSTRUCTIONS
# ============================================================

# When we resume:
#
# FIRST:
#
#     git status
#     git log -1 --oneline
#
#
# SECOND:
#
# Confirm whether the multi-day testing found:
#
# - drawing bugs
# - eraser bugs
# - Undo/Redo bugs
# - persistence bugs
# - UI bugs
#
#
# THIRD:
#
# Do NOT change anything merely for aesthetics while testing.
#
#
# FOURTH:
#
# If a bug is reported:
#
# 1. reproduce
# 2. identify exact layer
# 3. determine whether issue is:
#
#    UI
#    state
#    persistence
#    synchronization
#    geometry
#    history
#
# 4. make smallest correct change
# 5. build
# 6. retest
#
#
# ============================================================
# END OF CHECKPOINT
# ============================================================
```
