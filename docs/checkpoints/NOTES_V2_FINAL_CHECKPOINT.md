================================================================================
ELITE X TRADING JOURNAL
NOTES V2 — FINAL CHECKPOINT / HANDOVER
DATE: 2026-08-25
STATUS: NOTES V2 FUNCTIONALLY COMPLETE
================================================================================


================================================================================
1. NOTES V2 — CORE ARCHITECTURAL RULE
================================================================================

Notes V2 is an isolated journaling workspace.

Notes may read trading data for reference/context.

Notes must NOT modify canonical trading architecture.

DO NOT modify:

- executions
- FIFO engine
- pairTrades
- reconstructed trades
- reconciliation
- canonical P&L calculations
- analytics
- dashboard trading calculations
- broker synchronization
- any canonical trading source-of-truth data

Trade information shown inside Notes is READ-ONLY reference/snapshot data.

Notes persistence belongs to the Notes domain.

Architectural model:

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
Analytics

Notes
    ↓
READ-ONLY reference to Trades
    ↓
Notes-specific state only


================================================================================
2. NOTES V2 PRIMARY FILES
================================================================================

Main Notes page:

app/notes/page.tsx

Toolbar:

components/notes/NoteToolsBar.tsx

Normal Tiptap editor:

components/notes/TiptapEditor.tsx

Text block canvas:

components/notes/NoteBlockCanvas.tsx

Text block editor:

components/notes/NoteBlockEditor.tsx

Linked trade canvas:

components/notes/NoteLinkedTrades.tsx

Screenshot attachment canvas:

components/notes/NoteAttachmentCanvas.tsx

Annotation canvas:

components/notes/NoteAnnotationCanvas.tsx

Attachment storage:

lib/storage/noteAttachmentStorage.ts

Note annotation storage:

lib/storage/noteAnnotationStorage.ts

Note persistence:

lib/storage/supabaseNoteStorage.ts

Note types:

types/note.ts


================================================================================
3. NOTES PAGE STRUCTURE
================================================================================

Overall application layout:

Sidebar
    ↓
Notes Sidebar
    ↓
Notes Workspace
    ↓
Note Header
    ↓
Note Toolbar
    ↓
Shared Note Body


Target composition:

HEADER
    ↓
TOOLBAR
    ↓
SHARED NOTE BODY
    ├── Linked Trade Cards
    ├── Screenshot Attachments
    ├── Text Blocks
    └── Normal Tiptap Editor


IMPORTANT:

The normal editor and canvas-based objects are all part of the same
Note Body workspace.

Do not create a separate Notes workspace architecture unless there is
a clear future requirement.


================================================================================
4. NOTES SIDEBAR
================================================================================

Sidebar functionality currently implemented:

- Today grouping
- Yesterday grouping
- Historical date grouping
- Note cards
- Active note state
- Note deletion
- Note timestamp
- Search
- Search clear X
- Linked trade indicators
- Multiple linked trades
- Trade P&L coloring
- Hidden linked trade count
- +N overflow indicator
- Click +N to reveal hidden linked trades
- Click anywhere outside the expanded +N box to close it


================================================================================
5. NOTES SIDEBAR SEARCH
================================================================================

Search is implemented in the Notes sidebar.

Search searches the entire note content available to the sidebar search model.

It can search:

- note title
- editor content
- content that is not currently visually visible in the sidebar preview

Search behavior:

User enters search
    ↓
Filtered sidebar notes
    ↓
Only matching notes remain

Clear behavior:

User clicks X
    ↓
Search query becomes empty
    ↓
All notes return immediately


IMPORTANT:

Do NOT add a separate filter system unless there is an actual product requirement.

The previous extra filter button beside search was not required and should remain
removed/not implemented.


================================================================================
6. NOTE SIDEBAR TRADE DISPLAY
================================================================================

A note can contain multiple linked trades.

If linkedTrades.length > 0:

Display:

Trade linked
    QQQ
    AAPL
    HIMS
    +3


Trade pills are individually colored according to P&L:

trade.pnl > 0
    ↓
green background/text

trade.pnl < 0
    ↓
red background/text

trade.pnl === 0
    ↓
neutral background/text


The entire Note card does NOT become green or red.

Only the individual linked trade pill changes color.


================================================================================
7. LINKED TRADE +N SYSTEM
================================================================================

Visible trade pills are limited to the first three trades.

Example:

QQQ
AAPL
HIMS
+3


+N calculation:

hiddenTradeCount =
    linkedTrades.length - visibleTradeCount


The +N button is clickable.

Clicking +N:

expandedLinkedTradesNoteId
    ↓
note.id

The expanded box displays:

linkedTrades.slice(3)


The expanded box is aligned below/near the +N area.

Current visual layout intentionally includes:

- small top gap
- small gap between trade cards
- small bottom gap
- fixed width
- centered trade labels


Clicking anywhere outside the expanded trade box closes it.

Implementation uses outside pointer handling through:

expandedTradesRef

Do not change this unless a real interaction problem appears.


================================================================================
8. NOTE SIDEBAR TITLE INPUT
================================================================================

The note title input width is dynamically measured.

Important final adjustment:

The input received additional clickable width after the final character.

Current concept:

width:
    Math.max(
        noteTitleWidth + 24,
        80
    )


Reason:

Without the extra width, clicking immediately after the final title character
could fail because the input hit area ended too close to the text.

The additional width allows:

Click after final character
    ↓
Cursor activates correctly


Do NOT unnecessarily redesign the title/header layout.


================================================================================
9. NOTE SIDEBAR TIMESTAMP
================================================================================

Final timestamp style:

text-[10px]
text-slate-400


The timestamp is intentionally tertiary metadata.

Hierarchy:

1. Note title
2. Linked trade / preview
3. Timestamp


Do not make the timestamp bright white.

The final selected visual value is:

text-slate-400


================================================================================
10. NOTE EDITOR — BODY SCROLLING
================================================================================

Important behavior:

The Note Body uses:

overflow-y-auto


This is intentional.

The previous artificial large canvas height caused a scrollbar even when the
note was empty.

The Text Block canvas previously had:

min-h-[1600px]

This was removed/replaced with a page-relative minimum:

min-h-full


Result:

EMPTY NOTE
    ↓
NO unnecessary scrollbar


Content extends beyond visible page
    ↓
Scrollbar appears


Content returns inside visible page
    ↓
Scrollbar disappears


This behavior is now correct.


================================================================================
11. NOTE WORKSPACE SCROLLING PRINCIPLE
================================================================================

Desired behavior:

The workspace should behave like a one-page canvas until content actually
extends beyond the visible page.

Objects that may extend workspace height:

- screenshots
- linked trades
- text blocks
- normal editor content


Expected:

Object fits inside page
    ↓
No scrollbar


Object exceeds page
    ↓
Scrollbar appears


IMPORTANT:

Do not replace overflow-y-auto with overflow-hidden.

That would hide valid content instead of allowing the workspace to grow.


================================================================================
12. LINKED TRADE CARD INITIAL PLACEMENT
================================================================================

Previous implementation:

tradeCardIndex * 150


This was wrong for a movable canvas.

Example:

Trade 5 and Trade 6 were moved to the right.

Trade 7 was still placed underneath their old historical positions because its
position was based on index rather than actual current card positions.


================================================================================
13. FINAL LINKED TRADE PLACEMENT SYSTEM
================================================================================

A helper was added:

getNextTradeCardPosition(
    tradeLinks
)


The helper checks actual occupied card positions.

It considers:

CARD_WIDTH
CARD_HEIGHT
GAP
START_X
START_Y
COLUMN_GAP


Placement is evaluated as a grid.

Concept:

slot 1    slot 2
slot 3    slot 4
slot 5    slot 6
slot 7    slot 8


For each candidate slot:

Check actual existing trade card geometry.

If candidate slot overlaps an existing trade card:

    reject slot

If candidate slot does not overlap:

    use slot


IMPORTANT:

The algorithm uses persisted:

positionX
positionY
width
height


It does NOT use trade index as the primary positioning source.


================================================================================
14. LINKED TRADE PLACEMENT RESULT
================================================================================

New trade behavior is now:

New trade
    ↓
Find first available slot
    ↓
Place there


This allows natural layouts such as:

Trade 1    Trade 2
Trade 3    Trade 4
Trade 5    Trade 6


If Trade 5 and Trade 6 are moved elsewhere:

Trade 7 fills the first genuinely free position.


IMPORTANT:

Manually moved cards remain in their manually moved positions.

Future cards use the actual current layout rather than historical trade order.


================================================================================
15. LINKED TRADE CARD DRAGGING
================================================================================

File:

components/notes/NoteLinkedTrades.tsx


Trade cards are draggable.

Current drag state tracks:

tradeLinkId
offsetX
offsetY
currentX
currentY


Movement updates local UI state while dragging.

Final position is persisted through:

onTradeLinkPositionChange()


Parent Notes page updates:

positionX
positionY


Trade card cursor:

cursor-move


NOT:

cursor-grab
cursor-grabbing


Reason:

Elite X uses a standard four-way move cursor for draggable canvas objects.


================================================================================
16. SCREENSHOT ATTACHMENTS
================================================================================

File:

components/notes/NoteAttachmentCanvas.tsx


Screenshot functionality includes:

- signed URL loading
- secure image rendering
- dragging
- resizing
- persistent position
- persistent size
- delete
- annotation layer
- cursor behavior


Storage bucket:

note-attachments


Storage path:

{user_id}/{note_id}/{attachment_id}.{extension}


Security model remains scoped to authenticated user.


================================================================================
17. SCREENSHOT INITIAL POSITION
================================================================================

New screenshot default position was adjusted.

Final preferred defaults:

position_x:
    10

position_y:
    20


Final default size:

width:
    600

height:
    400


Reason:

New screenshots should begin inside the Note Body workspace with a small
left/top margin.

The canvas itself was NOT globally shifted.

Existing screenshot positions remain untouched.

Only new screenshot defaults use the new position.


================================================================================
18. SCREENSHOT DRAG CURSOR
================================================================================

File:

components/notes/NoteAttachmentCanvas.tsx


Final cursor:

cursor-move


Dragging and normal hovering both use the four-way move cursor.

Resize handles retain their own resize cursors:

width handle:
    cursor-ew-resize

height handle:
    cursor-ns-resize

corner handle:
    cursor-nwse-resize


Do not replace resize cursor styles.


================================================================================
19. SCREENSHOT Z-INDEX / LAYERING
================================================================================

Screenshots are part of the attachment canvas layer.

Text blocks were discovered to render underneath linked trade cards.

This was corrected by raising the Text Block canvas stacking level.


================================================================================
20. TEXT BLOCK CANVAS Z-INDEX
================================================================================

File:

components/notes/NoteBlockCanvas.tsx


Main Text Block canvas:

z-[2000]


Purpose:

Text blocks should render above linked trade cards.


Text blocks already have internal zIndex management:

1000 + block.zIndex


Do not remove the internal block zIndex system.


================================================================================
21. TEXT BLOCK DRAGGING
================================================================================

Text blocks have a dedicated drag handle.

File:

components/notes/NoteBlockCanvas.tsx


Final drag cursor:

cursor-move


Previous:

cursor-grab
active:cursor-grabbing


Those were replaced.


================================================================================
22. TEXT BLOCK EDITOR
================================================================================

File:

components/notes/NoteBlockEditor.tsx


Each text block has its own Tiptap editor.

Architecture:

NoteBlockCanvas
    ↓
NoteBlockEditor
    ↓
useEditor()
    ↓
Tiptap Editor


Text block editor supports:

- rich text
- text size
- text color
- bold
- italic
- underline
- strikethrough
- alignment
- bullet lists
- numbered lists
- editing


Text block content is persisted through the Notes persistence system.


================================================================================
23. TEXT BLOCK STACKING
================================================================================

Expected stacking:

Text Block
    ↓
above
Linked Trade


Screenshot layering remains functional.

The current goal is:

Text blocks should not disappear underneath linked trade cards.


================================================================================
24. NORMAL Tiptap EDITOR
================================================================================

The normal Notes editor remains separate from Text Block editors.

Toolbar determines active editor through:

activeBlockEditor ?? editor


Normal editor and Text Block editor must remain independent.


IMPORTANT:

Do not collapse:

activeBlockEditor

and:

activeBlockStyle


They represent different concepts.


================================================================================
25. NOTE TOOLBAR
================================================================================

File:

components/notes/NoteToolsBar.tsx


Toolbar groups currently include:

1. Text Size
2. Text Formatting
3. Lists + Alignment
4. Text Color
5. Annotation Tools
6. Undo / Redo
7. Add Text Block


================================================================================
26. TEXT SIZE
================================================================================

Current text-size control displays:

12
14
16
18
20
24
28
32


Text size is stored using localStorage for UI preference/remembered size.

Storage keys use:

elite-x-note-font-size-${noteId}

and for blocks:

elite-x-note-font-size-${noteId}-block-${activeBlockId}


Text size is also applied to Tiptap textStyle.

List items also receive font-size updates.


IMPORTANT:

Do not blindly redesign the font-size implementation.

The list marker sizing problem was previously complex and should be handled
as a separate architectural task if it returns.


================================================================================
27. TEXT COLOR
================================================================================

Toolbar has:

White
Slate
Blue
Cyan
Green
Yellow
Orange
Red
Purple
Pink


Current text color state is tracked by:

selectedTextColor


Text color applies through:

textStyle
color


================================================================================
28. FORMATTING TOOLS
================================================================================

Current tools:

Bold
Italic
Underline
Strikethrough


Buttons use activeEditor.


Do NOT revert formatting actions to directly use:

editor

when:

activeBlockEditor

is active.


The active editor abstraction should remain:

const activeEditor =
    activeBlockEditor ?? editor;


================================================================================
29. LISTS
================================================================================

Current tools:

Bullet list
Numbered list


Buttons use activeEditor.


================================================================================
30. ALIGNMENT
================================================================================

Current alignment controls:

Align Left
Align Center
Align Right
Justify


Buttons use activeEditor.


================================================================================
31. ANNOTATION TOOLS
================================================================================

Current activeAnnotationTool union:

"select"
"pen"
"line"
"arrow"
"zone"
"highlight"
"eraser"


Full chain:

NotesPage
    ↓
NoteToolsBar
    ↓
NoteAttachmentCanvas
    ↓
NoteAnnotationCanvas


IMPORTANT:

When adding a future drawing tool, update the complete chain.


================================================================================
32. DRAWING SETTINGS
================================================================================

Shared drawing state:

penColor
penWidth


Current color options:

#ef4444
#f97316
#facc15
#4ade80
#22d3ee
#60a5fa
#a78bfa
#f472b6
#f8fafc
#000000


Current width options:

1
2
3
4
6


Do not create separate independent color systems unless there is a real
product requirement.

Shared drawing settings are intentional.


================================================================================
33. ANNOTATION ARCHITECTURE
================================================================================

File:

components/notes/NoteAnnotationCanvas.tsx


This is the SINGLE annotation engine.


Supported concepts:

Pen
Line
Arrow
Zone
Highlight
Eraser


Annotations use normalized geometry.

x:
    0 → 1

y:
    0 → 1


This is important because screenshots can be resized.


NEVER persist raw screen pixel coordinates as canonical annotation geometry.


================================================================================
34. ANNOTATION STORAGE
================================================================================

File:

lib/storage/noteAnnotationStorage.ts


Existing APIs:

createNoteAnnotation(...)
updateNoteAnnotation(...)
deleteNoteAnnotation(...)


Ownership:

attachment
    ↓
note
    ↓
user


RLS / ownership architecture must remain unchanged.


================================================================================
35. ANNOTATION UNDO / REDO
================================================================================

NotesPage tracks:

annotationHistory

annotationRedoStack


Actions include:

create
delete


Undo and redo operate through Notes annotation state and persistence.


Do not create a second annotation history system unless the existing
architecture is intentionally replaced.


================================================================================
36. TOOLBAR UNDO / REDO UI
================================================================================

History group contains:

Undo
divider
Redo


Current divider:

<div className="h-4 w-px bg-white/[0.08]" />


Visual:

Undo
  │
Redo


The separator is intentionally subtle.


================================================================================
37. TOOLBAR LABEL POLISH
================================================================================

SELECT label:

The icon position remains unchanged.

The word:

Select

was moved slightly left using:

relative left-[-3px]


Current concept:

<span className="relative left-[-3px] max-[1535px]:hidden">
  Select
</span>


Do not move the entire Select button.


================================================================================
38. ADD TEXT BLOCK LABEL POLISH
================================================================================

Text Block label was also moved slightly left.

Current concept:

<span className="relative left-[-3px] text-[10px] font-medium">
  Text Block
</span>


The Type icon remains unchanged.


================================================================================
39. TOOLBAR TOOLTIPS
================================================================================

IMPORTANT FINAL DECISION:

Do NOT create a custom tooltip system.

The native browser tooltip system is intentionally being retained.


Current approach:

title="Pen"
title="Line"
title="Arrow"
title="Zone"
title="Highlight"
title="Eraser"
title="Undo"
title="Redo"
etc.


The native tooltip delay is browser/OS controlled.

There is no reliable global CSS fix for native title tooltip timing.

Do NOT attempt:

[title] {
    ...
}

to modify native tooltip timing.


If a future custom tooltip system is introduced, it should be a deliberate UX
project rather than a quick patch.


================================================================================
40. TEXT SIZE TOOLTIP
================================================================================

The Text Size button previously had no title.

A title was added:

title="Text size"


Keep this.


================================================================================
41. TOOLBAR CURRENT CURSOR / TOOL INTERACTION
================================================================================

Normal draggable objects:

cursor-move


Resize handles:

cursor-ew-resize
cursor-ns-resize
cursor-nwse-resize


Drawing mode:

Drawing interaction should continue to use the existing annotation tool
interaction/cursor architecture.

Do not globally set every object to crosshair.


================================================================================
42. NOTE ATTACHMENT DATA MODEL
================================================================================

Supabase table:

note_attachments


Relevant fields:

id
note_id
file_name
storage_path
mime_type
file_size
position_x
position_y
width
height
created_at


The following are already available for canvas movement/resizing:

position_x
position_y
width
height


No schema change was required for the current Notes V2 functionality.


================================================================================
43. ATTACHMENT UPLOAD FLOW
================================================================================

1. Authenticate user.
2. Verify note ownership.
3. Generate attachment UUID.
4. Generate scoped storage path.
5. Upload file.
6. Insert database row.
7. If DB insert fails:
       delete orphaned storage object.
8. Return mapped NoteAttachment.
9. Update local Notes state.


================================================================================
44. ATTACHMENT DELETE FLOW
================================================================================

1. User clicks delete.
2. NoteAttachmentCanvas calls onDelete().
3. NotesPage.handleDeleteAttachment() runs.
4. Ownership is verified.
5. Storage object is deleted.
6. Database row is deleted.
7. Local Notes state removes attachment.


Verified behavior:

Screenshot disappears immediately.

Screenshot is removed from Storage.

Screenshot does not return after refresh.


================================================================================
45. ATTACHMENT LAYOUT PERSISTENCE
================================================================================

Dragging/resizing calls:

updateNoteAttachmentLayout()


Persisted values:

positionX
positionY
width
height


Parent Notes state is updated after persistence.


================================================================================
46. TRADE LINK PERSISTENCE
================================================================================

Trade card movement calls:

updateNoteTradeLinkPositionInSupabase()


Persisted:

positionX
positionY


Trade links remain Notes-only references.

They do not modify canonical trade data.


================================================================================
47. NOTES PAGE TRADE ADD FLOW
================================================================================

When adding a trade:

handleAddTrade()


Current placement flow:

selectedNote.tradeLinks
    ↓
getNextTradeCardPosition(...)
    ↓
find free grid slot
    ↓
tradeCardLayout
    ↓
addTradeToNoteInSupabase(...)
    ↓
update local selected note


The previous index-based vertical-only positioning is no longer used.


================================================================================
48. NOTES Z-INDEX MODEL
================================================================================

Current important layering:

Text Block Canvas:
    z-[2000]

Linked Trade cards:
    1000 + tradeLink.zIndex

Text Blocks:
    1000 + block.zIndex


The exact final stacking behavior must be preserved.

Goal:

Text block should not be visually buried underneath a linked trade card.


================================================================================
49. SHARED NOTE BODY
================================================================================

The Note Body is intentionally the shared canvas/workspace for:

- normal editor
- linked trades
- screenshots
- text blocks


This allows the user to position visual objects relative to the same workspace.


================================================================================
50. NEW SCREENSHOT DEFAULT POSITION
================================================================================

Final chosen upload defaults:

position_x:
    10

position_y:
    20

width:
    600

height:
    400


Do not change this without a visual reason.


================================================================================
51. NOTES SEARCH UI
================================================================================

Search UI includes:

Search icon
Search input
X clear control when a query exists


The X is the preferred clearing interaction.

No separate "Clear" button is required.


================================================================================
52. NOTES SIDEBAR DATE GROUPING
================================================================================

Groups:

TODAY
YESTERDAY
Historical dates


The implementation intentionally uses real spacers rather than
YESTERDAY-specific transform hacks.

Do not reintroduce:

translateY()
top-position hacks
special YESTERDAY offsets


================================================================================
53. NOTE TITLE / HEADER
================================================================================

The note header is fixed.

Title is editable.

Timestamp is displayed on the right.

Dynamic title width is intentional.


Header should remain visually independent from:

toolbar
workspace
canvas objects


================================================================================
54. NOTE TOOLBAR POSITION
================================================================================

Toolbar currently uses positioning similar to:

relative
left-[-8px]
top-[6px]


Do not adjust global toolbar positioning simply to solve an individual icon
or label alignment issue.

Use local relative positioning for tiny label adjustments.


================================================================================
55. SCREENSHOT / TOOLBAR OVERLAP FIX
================================================================================

The problem:

New screenshot could visually begin too close to the toolbar.

Wrong approach:

Move entire attachment canvas downward.

Reason:

That would alter the coordinate system and could affect existing persisted
screenshots.

Correct approach:

Change the initial uploaded screenshot position only.

Final defaults:

x = 10
y = 20


================================================================================
56. CONTENT-AWARE SCROLLING FINAL RESULT
================================================================================

The previous artificial:

min-h-[1600px]

was removed from the text block canvas.

Current canvas minimum:

min-h-full


Expected result:

Empty note:
    no scrollbar


Content fits:
    no scrollbar


Content exceeds page:
    scrollbar appears


This was confirmed visually during testing.


================================================================================
57. KNOWN ACCEPTED LIMITATION — NATIVE TOOLTIP DELAY
================================================================================

Native browser title tooltips may take a noticeable amount of time to appear.

This is accepted.

Reason:

Native tooltip timing is controlled by browser/OS UI.

No reliable CSS/global stylesheet setting can control it.


Do NOT repeatedly attempt to solve this with:

Tailwind
global CSS
title selectors
hover CSS


If this ever becomes important, create a deliberate custom tooltip component
and migrate tooltips systematically.


================================================================================
58. CURRENT NOTES V2 STATUS
================================================================================

FUNCTIONALLY COMPLETE.

Current confidence:

HIGH


Notes V2 is considered:

99.99% complete / production-ready for current scope.


Remaining issues at this checkpoint:

No known functional blocker.

Native tooltip delay remains accepted.

Any future issues should be treated as targeted bug fixes, not reasons to
rewrite the Notes architecture.


================================================================================
59. DO NOT REFACTOR WITHOUT A REAL REASON
================================================================================

Do not:

- rewrite the Note workspace
- rewrite attachment storage
- rewrite trade references
- rewrite annotation architecture
- rewrite scrolling
- rewrite z-index logic
- rewrite sidebar search
- rewrite toolbar state
- change canonical trading systems


unless a concrete production bug or architectural requirement justifies it.


================================================================================
60. NOTES V2 TEST CHECKLIST
================================================================================

SIDEBAR:

[ ] Search note title
[ ] Search full note content
[ ] Search hidden content
[ ] Clear search with X
[ ] Multiple linked trades visible
[ ] +N appears correctly
[ ] +N opens expanded trade list
[ ] Clicking outside closes +N box
[ ] Green P&L pill
[ ] Red P&L pill
[ ] Neutral P&L pill
[ ] Timestamp visible


EDITOR:

[ ] Create note
[ ] Rename note
[ ] Click after final title character
[ ] Normal editor typing
[ ] Text block creation
[ ] Text block editing
[ ] Text block dragging
[ ] Text block resizing
[ ] Linked trade creation
[ ] Linked trade dragging
[ ] Linked trade deletion
[ ] Screenshot upload
[ ] Screenshot dragging
[ ] Screenshot resizing
[ ] Screenshot deletion
[ ] Annotation drawing
[ ] Annotation deletion
[ ] Annotation undo
[ ] Annotation redo


LAYOUT:

[ ] Empty note has no unnecessary scrollbar
[ ] Multiple trades fit without scrollbar
[ ] Moving object below page shows scrollbar
[ ] Moving object back inside removes scrollbar
[ ] Screenshot below page expands workspace
[ ] Text block below page expands workspace
[ ] New trade fills available grid slot
[ ] Moved trades retain position
[ ] Text block stays above linked trade


TOOLBAR:

[ ] Text size
[ ] Text color
[ ] Bold
[ ] Italic
[ ] Underline
[ ] Strikethrough
[ ] Bullet list
[ ] Numbered list
[ ] Align left
[ ] Align center
[ ] Align right
[ ] Justify
[ ] Select
[ ] Pen
[ ] Line
[ ] Arrow
[ ] Zone
[ ] Highlight
[ ] Eraser
[ ] Undo
[ ] Redo
[ ] Add Text Block


PERSISTENCE:

[ ] Refresh note
[ ] Refresh after moving trade
[ ] Refresh after moving screenshot
[ ] Refresh after resizing screenshot
[ ] Refresh after editing text block
[ ] Refresh after deleting attachment
[ ] Verify no trading canonical data changed


================================================================================
61. CURRENT GIT CHECKPOINT
================================================================================

Before moving to another major area:

Run:

git status

Then:

git diff

Then:

git add .

Commit:

git commit -m "Finalize Notes V2 workspace"

Push:

git push origin main


After push:

git status


Expected:

working tree clean


IMPORTANT:

If toolbar micro-adjustments were made after the last Git push, make sure
those changes are included in the final Notes commit.


================================================================================
62. NEXT DEVELOPMENT RULE
================================================================================

Notes V2 should now be considered FROZEN.

Future work should be:

BUG FIX
    ↓
reproduce
    ↓
identify exact component
    ↓
make smallest safe change
    ↓
build
    ↓
test
    ↓
commit


Do not continue polishing Notes indefinitely without a concrete reason.


================================================================================
63. FINAL NOTES V2 ARCHITECTURE SUMMARY
================================================================================

Notes V2 is a visual journaling workspace built around independent objects.

Object types:

1. Normal Tiptap editor
2. Text blocks
3. Linked trade cards
4. Screenshot attachments
5. Drawing/annotation layer


Each object owns its Notes-specific state.

Trading data remains canonical outside Notes.

The Notes workspace acts as a visual context layer around trading information.

Final conceptual architecture:

NOTE
 |
 +-- Sidebar metadata/search
 |
 +-- Header
 |
 +-- Toolbar
 |
 +-- Shared Workspace
      |
      +-- Tiptap Editor
      |
      +-- Text Blocks
      |
      +-- Linked Trades
      |
      +-- Screenshot Attachments
      |
      +-- Annotation Layer


================================================================================
64. FINAL HANDOVER STATEMENT
================================================================================

NOTES V2 CURRENTLY COMPLETE FOR THIS DEVELOPMENT PHASE.

Major completed areas:

- Sidebar
- Search
- Search clear
- Trade references
- Multi-trade display
- Trade P&L coloring
- +N linked trades
- Outside-click behavior
- Editable note titles
- Timestamp hierarchy
- Rich text editor
- Text blocks
- Text block drag
- Text block resize
- Linked trade cards
- Linked trade drag
- Smart trade placement
- Screenshot upload
- Screenshot delete
- Screenshot drag
- Screenshot resize
- Screenshot persistence
- Screenshot default positioning
- Drawing tools
- Annotation persistence
- Annotation undo/redo
- Content-aware scrolling
- Z-index corrections
- Four-way move cursor
- Toolbar polish
- Undo/Redo divider
- Select label positioning
- Text Block label positioning
- Native tooltip coverage

No known Notes V2 architectural blocker remains.

NEXT SESSION:

Start from this checkpoint.

Do not re-audit the entire Notes architecture unless a new bug requires it.

================================================================================
END OF NOTES V2 FINAL CHECKPOINT
================================================================================