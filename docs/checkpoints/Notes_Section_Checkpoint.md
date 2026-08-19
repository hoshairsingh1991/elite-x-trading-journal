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