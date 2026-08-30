// ============================================================================
// ELITE X TRADING JOURNAL
// NOTES V2 — MASTER ARCHITECTURE / CURRENT PRODUCTION CHECKPOINT
// DATE: 2026-08-23
// ============================================================================
//
// PURPOSE
// ============================================================================
//
// Notes V2 is Elite X's behavioral journaling and trade-review workspace.
//
// It is intentionally isolated from the canonical trading/accounting system.
//
// Notes may reference canonical trading information.
//
// Notes must NEVER become the source of truth for trading.
//
// ============================================================================
// 1. CANONICAL TRADING ARCHITECTURE
// ============================================================================
//
// Elite X trading architecture:
//
//     Broker
//        ↓
//     Normalized Executions
//        ↓
//     Supabase Execution Ledger
//        ↓
//     Deterministic FIFO Reconstruction
//        ↓
//     Canonical Trades
//        ↓
//     Analytics / Dashboard / Reporting
//
// Canonical source of truth:
//
//     executions
//
// Derived state:
//
//     Trades
//     Analytics
//     Dashboard calculations
//
// Notes exists beside this architecture.
//
// Canonical Trading Layer
//        ↓
//      Trades
//        ↓
//   ┌───────────────────┐
//   │    Notes V2       │
//   │ Behavioral Layer  │
//   └───────────────────┘
//
// The dependency direction is ONE-WAY:
//
//     Trading → Notes
//
// NOT:
//
//     Notes → Trading
//
//
// A Trade exists independently of Notes.
//
// A Note may reference a Trade.
//
// A Trade must never depend on a Note.
//
// ============================================================================
// 2. HARD NOTES ISOLATION RULE
// ============================================================================
//
// Notes V2 is strictly isolated from canonical trading state.
//
// Notes MUST NEVER modify:
//
//     executions
//     FIFO reconstruction
//     pairTrades
//     reconstructed trades
//     reconciliation
//     P&L
//     commissions
//     account balances
//     broker data
//     execution quantities
//     execution prices
//     analytics
//     dashboard calculations
//     canonical trading data
//
// Notes may DISPLAY:
//
//     ticker
//     trade
//     entry
//     exit
//     P&L
//     holding time
//     account context
//     execution-derived context
//
// But these are:
//
//     READ-ONLY REFERENCES
//     READ-ONLY SNAPSHOTS
//     CONTEXTUAL INFORMATION
//
// NEVER modify the executions table as part of Notes development.
//
// NEVER calculate accounting truth from Note HTML.
//
// NEVER write Note data into canonical execution records.
//
// ============================================================================
// 3. NOTES V2 PRODUCT PURPOSE
// ============================================================================
//
// Notes V2 is a visual trading-journal workspace.
//
// It combines:
//
//     rich text
//     independent text blocks
//     screenshots
//     screenshot annotations
//     drawing tools
//     trade snapshots
//     formatting
//     behavioral observations
//
// Intended use:
//
//     document trade ideas
//     review executed trades
//     annotate charts
//     explain decisions
//     record mistakes
//     capture behavioral patterns
//     compare execution context
//
// Notes are behavioral metadata.
//
// They are NOT accounting records.
//
// ============================================================================
// 4. MAIN ROUTE / ORCHESTRATION
// ============================================================================
//
// Route:
//
//     /notes
//
// Main page:
//
//     app/notes/page.tsx
//
// NotesPage is the orchestration layer.
//
// It currently coordinates:
//
//     Notes state
//     selected Note
//     available Trades
//     Tiptap editor
//     Text Block editor state
//     screenshot attachments
//     annotations
//     drawing history
//     trade links
//     linked Trade Snapshots
//
// NotesPage should NOT become the permanent home for:
//
//     raw Supabase query implementation
//     editor internals
//     annotation rendering internals
//     trade reconstruction
//     attachment storage implementation
//
// Those responsibilities remain separated into components/services.
//
// ============================================================================
// 5. CURRENT NOTES WORKSPACE
// ============================================================================
//
// Current workspace:
//
//     HEADER
//        ↓
//     TOOLBAR
//        ↓
//     SHARED NOTE BODY
//
// Shared Note Body contains:
//
//     ├── Linked Trade Snapshots
//     ├── Screenshot Attachments
//     ├── Text Blocks
//     └── Main Tiptap Editor
//
// Important:
//
//     Notes is ONE shared workspace.
//
// There is no separate visible screenshot-only workspace anymore.
//
// Screenshot attachments, Trade Snapshots, Text Blocks, and
// the main editor share the same Note Body coordinate space.
//
// ============================================================================
// 6. CURRENT NOTES SIDEBAR
// ============================================================================
//
// Notes sidebar currently supports:
//
//     TODAY grouping
//     YESTERDAY grouping
//     historical date grouping
//     selected Note state
//     Note deletion
//     Note timestamps
//     linked-trade indicator
//     vertical scrolling
//     no horizontal scrollbar
//
// Date grouping model:
//
//     groupIndex === 0
//         ↓
//     first/current group
//         ↓
//     no preceding spacer
//
//     groupIndex > 0
//         ↓
//     real 10px spacer
//
//     date label
//         ↓
//     real 6px spacer
//
//     cards
//         ↓
//     normal flex flow
//
// DO NOT reintroduce:
//
//     YESTERDAY-specific transforms
//     groupLabel-specific positioning
//     translateY date-group hacks
//     top-[...] date-group hacks
//
// The current date-group layout is the stable structure.
//
// ============================================================================
// 7. NOTE DOMAIN MODEL
// ============================================================================
//
// File:
//
//     types/note.ts
//
// Current domain objects:
//
//     Note
//     NoteTradeLink
//     NoteAttachment
//     NoteAnnotation
//     NoteBlock
//
// ============================================================================
// 8. NOTE
// ============================================================================
//
// Current Note structure:
//
//     id
//     title
//     isTitleCustom
//     content
//     createdAt
//     updatedAt
//     tradeLinks[]
//     blocks[]
//     attachments[]
//
// Important:
//
//     isTitleCustom
//
// controls automatic trade-based title generation.
//
// Automatic title behavior:
//
//     no trades
//         → "Trading Note"
//
//     one unique ticker
//         → "Trade Review - QQQ"
//
//     2–3 unique tickers
//         → "Trade Review - QQQ, AAPL"
//
//     >3 unique tickers
//         → first three + remaining count
//
// Once the user manually edits the title:
//
//     isTitleCustom = true
//
// Automatic title generation stops controlling the title.
//
// ============================================================================
// 9. NOTE CONTENT
// ============================================================================
//
// Note.content is serialized Tiptap HTML.
//
// Flow:
//
//     Tiptap
//        ↓
//     HTML
//        ↓
//     Note.content
//        ↓
//     Supabase notes.content
//
// The Notes list preview derives readable text from the HTML.
//
// Future improvement:
//
//     dedicated plain-text/content-summary extraction
//
// For now:
//
//     basic HTML tag stripping
//
// HTML must remain controlled/sanitized whenever rendered outside
// the editor where appropriate.
//
// ============================================================================
// 10. NOTE TRADE LINK DOMAIN
// ============================================================================
//
// NoteTradeLink represents a relationship between:
//
//     Note
//
// and:
//
//     canonical Trade
//
// Current structure:
//
//     id
//     noteId
//     tradeId
//     positionX
//     positionY
//     width
//     height
//     zIndex
//     createdAt
//
// IMPORTANT:
//
// NoteTradeLink does NOT duplicate the Trade object.
//
// It stores:
//
//     relationship
//     workspace layout
//
// It does NOT become accounting truth.
//
// ============================================================================
// 11. NOTE TRADE LINK DATABASE MODEL
// ============================================================================
//
// Table:
//
//     note_trades
//
// Current fields:
//
//     note_id
//     trade_id
//     position_x
//     position_y
//     width
//     height
//     z_index
//     created_at
//
// Layout fields were added because Trade Snapshots are now
// free-position workspace objects.
//
// The database row therefore stores BOTH:
//
//     relationship metadata
//
// and:
//
//     workspace layout metadata
//
// Recommended integrity constraint:
//
//     UNIQUE(note_id, trade_id)
//
// This protects against duplicate Note/Trade relationships.
//
// ============================================================================
// 12. TRADE LINK FLOW
// ============================================================================
//
// ADD TRADE:
//
//     User
//        ↓
//     NoteTradeSelector
//        ↓
//     onAddTrade(tradeId)
//        ↓
//     NotesPage
//        ↓
//     addTradeToNoteInSupabase()
//        ↓
//     note_trades
//        ↓
//     NoteTradeLink
//        ↓
//     local Note state
//
// REMOVE TRADE:
//
//     User
//        ↓
//     delete action
//        ↓
//     onRemoveTrade(tradeId)
//        ↓
//     NotesPage
//        ↓
//     removeTradeFromNoteInSupabase()
//        ↓
//     note_trades row removed
//        ↓
//     local Note state updated
//
// ============================================================================
// 13. TRADE DATA SOURCE
// ============================================================================
//
// Notes loads Trades from the canonical execution architecture.
//
// Current flow:
//
//     loadExecutionsFromSupabase()
//                ↓
//           executions
//                ↓
//           pairTrades()
//                ↓
//          availableTrades
//
// Notes does NOT create its own trading truth.
//
// Trade references are resolved against the current canonical
// reconstructed Trade objects.
//
// ============================================================================
// 14. TRADE IDENTITY
// ============================================================================
//
// Trade IDs are cross-system identifiers.
//
// Notes depend on Trade.id.
//
// Therefore Trade identity is a cross-system contract.
//
// DO NOT casually change Trade ID generation.
//
// Before changing Trade.id generation:
//
//     search all consumers of Trade.id
//
// including:
//
//     Notes
//     Calendar
//     Analytics
//     Trade History
//     Reports
//     URLs
//     bookmarks
//     future AI systems
//
// If canonical Trade reconstruction changes Trade identity,
// NoteTradeLink relationships may become orphaned.
//
// ============================================================================
// 15. LINKED TRADE SNAPSHOT
// ============================================================================
//
// File:
//
//     components/notes/NoteLinkedTrades.tsx
//
// Trade Snapshot is a visual read-only reference card.
//
// It displays:
//
//     Trade Snapshot
//     ticker
//     direction
//     Entry Date
//     Entry
//     Exit Date
//     Exit
//     Entry Time
//     Exit Time
//     Holding
//     P&L
//
// Direction display:
//
//     LONG  → green
//     SHORT → red
//     CALL  → green
//     PUT   → red
//
// For options:
//
//     contractKey ending in "_C" → CALL
//     contractKey ending in "_P" → PUT
//
// Trade values remain read-only.
//
// ============================================================================
// 16. TRADE SNAPSHOT DIMENSIONS
// ============================================================================
//
// Current default Trade Snapshot layout:
//
//     width  = 320
//     height = 130
//     zIndex = 1000+
//
// Width remains responsive at the UI level.
//
// Existing cards store their own:
//
//     width
//     height
//
// in note_trades.
//
// IMPORTANT:
//
// A date wrapping issue previously made the card appear too short.
//
// Root cause:
//
//     "Aug 20,"
//     "2026"
//
// The actual problem was text wrapping, NOT card height.
//
// Fix:
//
//     whitespace-nowrap
//
// applied to BOTH:
//
//     Entry Date
//     Exit Date
//
// Therefore:
//
//     Aug 20, 2026
//
// remains on one line.
//
// Do NOT change the card height merely to solve date wrapping.
//
// ============================================================================
// 17. TRADE SNAPSHOT DRAGGING
// ============================================================================
//
// Trade Snapshots are FREE-POSITION WORKSPACE OBJECTS.
//
// User interaction:
//
//     hover
//        ↓
//     grab cursor
//
//     drag
//        ↓
//     grabbing cursor
//
//     release
//        ↓
//     final position persisted
//
// Card cursor states:
//
//     cursor-grab
//     active:cursor-grabbing
//
// ============================================================================
// 18. IMPORTANT TRADE DRAG ARCHITECTURE
// ============================================================================
//
// NEVER write to Supabase on every pointermove.
//
// That approach caused:
//
//     pointermove
//         ↓
//     Supabase UPDATE
//         ↓
//     parent state update
//         ↓
//     rerender
//         ↓
//     drag instability / lag / snap-back
//
// The incorrect approach was rejected.
//
// CURRENT CORRECT MODEL:
//
//     pointer down
//          ↓
//     capture starting offset
//          ↓
//     update local React position during drag
//          ↓
//     pointer up
//          ↓
//     persist FINAL position once
//
// Therefore:
//
//     UI motion = local state
//
//     persistence = final pointer-up state
//
// This is the correct production interaction model.
//
// ============================================================================
// 19. TRADE SNAPSHOT LOCAL STATE
// ============================================================================
//
// File:
//
//     components/notes/NoteLinkedTrades.tsx
//
// Local state:
//
//     localTradeLinks
//
// Purpose:
//
//     immediate smooth drag rendering
//
// Parent:
//
//     tradeLinks
//
// Local:
//
//     localTradeLinks
//
// Parent state remains authoritative outside the drag operation.
//
// The local state is synchronized from incoming tradeLinks.
//
// During drag:
//
//     localTradeLinks
//
// is updated on every pointer movement.
//
// Supabase is NOT called on every pointer movement.
//
// ============================================================================
// 20. TRADE SNAPSHOT PERSISTENCE
// ============================================================================
//
// File:
//
//     lib/storage/supabaseNoteStorage.ts
//
// Function:
//
//     updateNoteTradeLinkPositionInSupabase()
//
// Current contract:
//
//     updateNoteTradeLinkPositionInSupabase(
//         link,
//         positionX,
//         positionY
//     )
//
// Flow:
//
//     pointer move
//         ↓
//     localTradeLinks only
//
//     pointer up
//         ↓
//     updateNoteTradeLinkPositionInSupabase()
//         ↓
//     note_trades.position_x
//     note_trades.position_y
//
// Only the final position is persisted.
//
// ============================================================================
// 21. TRADE SNAPSHOT SUPABASE AUTHORIZATION
// ============================================================================
//
// A real production issue was discovered during Trade Snapshot
// persistence.
//
// RLS UPDATE policy existed:
//
//     Users can update own note trade links
//
// But Postgres table privileges were missing.
//
// Error:
//
//     42501
//
//     permission denied for table note_trades
//
// Supabase explicitly returned:
//
//     GRANT UPDATE ON public.note_trades TO authenticated;
//
// The required grant was therefore applied:
//
//     GRANT UPDATE
//     ON TABLE public.note_trades
//     TO authenticated;
//
// IMPORTANT:
//
// RLS policy
//
// AND
//
// table privilege
//
// are both required.
//
// RLS alone does not replace the underlying Postgres privilege.
//
// ============================================================================
// 22. TRADE SNAPSHOT RLS
// ============================================================================
//
// note_trades policies verified:
//
// SELECT:
//
//     user can view own Note Trade links
//
// INSERT:
//
//     user can insert relationship rows only when
//     the referenced Note belongs to auth.uid()
//
// UPDATE:
//
//     user can update relationship rows only when
//     referenced Note belongs to auth.uid()
//
// DELETE:
//
//     user can delete relationship rows only when
//     referenced Note belongs to auth.uid()
//
// The database is the final security boundary.
//
// ============================================================================
// 23. TRADE SNAPSHOT DELETE UI
// ============================================================================
//
// Current UX matches other movable Notes objects.
//
// Normal:
//
//     delete icon hidden
//
// Hover:
//
//     delete icon appears
//
// Delete icon:
//
//     Trash2
//
// Behavior:
//
//     hover Trade Snapshot
//         ↓
//     Trash icon appears
//         ↓
//     click
//         ↓
//     trade link is removed
//
// The delete button explicitly stops pointer propagation so
// clicking the delete button does not start dragging.
//
// ============================================================================
// 24. TRADE SNAPSHOT DELETE
// ============================================================================
//
// The linked Trade itself is NEVER deleted.
//
// Only the relationship is removed:
//
//     note_trades row
//
// This is critical.
//
// DELETE TRADE FROM NOTE means:
//
//     remove Note → Trade relationship
//
// It does NOT mean:
//
//     delete canonical Trade
//
// ============================================================================
// 25. MAIN TIPTAP EDITOR
// ============================================================================
//
// File:
//
//     components/notes/TiptapEditor.tsx
//
// Main editor state:
//
//     tiptapEditor
//
// The editor remains isolated from NotesPage internals.
//
// Tiptap handles:
//
//     rendering
//     editing
//     selection
//     formatting
//     editor events
//
// NotesPage owns:
//
//     Note content
//     persistence
//     active editing context
//
// ============================================================================
// 26. Tiptap EXTENSIONS
// ============================================================================
//
// Current Tiptap family is aligned.
//
// Known versions:
//
//     @tiptap/core                    3.23.6
//     @tiptap/react                   3.23.6
//     @tiptap/starter-kit             3.23.6
//     @tiptap/extension-text-style    3.23.6
//     @tiptap/extension-text-align    3.23.6
//
// Current editor architecture uses:
//
//     StarterKit
//     Underline
//     TextStyle
//     Color
//     Custom FontSizeExtension
//     TextAlign
//
// Do NOT independently install a mismatched Tiptap version.
//
// ============================================================================
// 27. KNOWN Tiptap WARNING
// ============================================================================
//
// Browser console has shown:
//
//     [tiptap warn]:
//     Duplicate extension names found:
//     ['underline']
//
// IMPORTANT:
//
// This warning is SEPARATE from Annotation Undo/Redo.
//
// It did NOT cause the drawing history issue.
//
// Treat this as a separate future cleanup task.
//
// Do not mix that cleanup into unrelated Notes functionality.
//
// ============================================================================
// 28. TEXT BLOCK ARCHITECTURE
// ============================================================================
//
// Text Blocks are independent editable objects.
//
// File chain:
//
//     NoteBlockCanvas
//          ↓
//     NoteBlockEditor
//          ↓
//     Tiptap editor instance
//
// Each Text Block has its own independent Tiptap editor.
//
// A Note may contain multiple Text Blocks.
//
// Therefore architecture must NEVER assume:
//
//     "the one Text Block editor"
//
// Instead:
//
//     activeBlockEditor
//
// means:
//
//     "the currently focused Text Block editor"
//
// ============================================================================
// 29. NOTE BLOCK DOMAIN
// ============================================================================
//
// File:
//
//     types/note.ts
//
// Current NoteBlock structure:
//
//     id
//     noteId
//     type
//     positionX
//     positionY
//     width
//     height
//     zIndex
//     content
//     fontSize
//     color
//     fontWeight
//     fontStyle
//     textDecoration
//     textAlign
//     createdAt
//     updatedAt
//
// Text Blocks support independent formatting.
//
// ============================================================================
// 30. TEXT BLOCK PERSISTENCE
// ============================================================================
//
// File:
//
//     lib/storage/supabaseNoteStorage.ts
//
// Current functions include:
//
//     createNoteBlockInSupabase()
//     updateNoteBlockInSupabase()
//     deleteNoteBlockFromSupabase()
//
// Ownership is verified through:
//
//     block.noteId
//         ↓
//     notes.id
//         ↓
//     notes.user_id
//         ↓
//     authenticated user
//
// Block persistence includes:
//
//     position
//     size
//     zIndex
//     content
//     font size
//     color
//     weight
//     style
//     decoration
//     alignment
//
// ============================================================================
// 31. TEXT BLOCK INTERACTION
// ============================================================================
//
// Text Blocks currently support:
//
//     create
//     edit
//     drag
//     resize
//     delete
//     persistence
//
// Drag model:
//
//     pointer down
//         ↓
//     calculate offset
//         ↓
//     update local block position
//         ↓
//     schedule persisted update
//
// Resize model:
//
//     pointer down
//         ↓
//     track starting geometry
//         ↓
//     enforce minimum width/height
//         ↓
//     update local block state
//         ↓
//     schedule persistence
//
// Selected block receives:
//
//     visual border
//     visual ring
//     resize handle
//     hover delete control
//
// ============================================================================
// 32. TEXT BLOCK TOOLBAR CONTEXT
// ============================================================================
//
// There are TWO independent editor contexts:
//
//     NORMAL EDITOR
//         ↓
//     tiptapEditor
//
//     TEXT BLOCK EDITOR
//         ↓
//     activeBlockEditor
//
// Toolbar concept:
//
//     activeEditor =
//         activeBlockEditor ?? tiptapEditor
//
// BUT:
//
//     activeBlockEditor
//
// is focus-based.
//
// onEditorReady only means:
//
//     editor instance exists
//
// It does NOT mean:
//
//     editor is the current active editing context.
//
// ============================================================================
// 33. ACTIVE EDITOR FOCUS MODEL
// ============================================================================
//
// Normal editor focus:
//
//     TiptapEditor onFocus
//         ↓
//     setActiveBlockEditor(null)
//         ↓
//     activeEditor = tiptapEditor
//
// Text Block focus:
//
//     NoteBlockEditor onFocus(editor)
//         ↓
//     NoteBlockCanvas
//         ↓
//     onActiveBlockEditorChange(editor, blockId)
//         ↓
//     activeBlockEditor = block editor
//
// Therefore:
//
//     NORMAL
//         ↓
//     activeBlockEditor = null
//         ↓
//     activeEditor = tiptapEditor
//
//     TEXT BLOCK
//         ↓
//     activeBlockEditor = blockEditor
//         ↓
//     activeEditor = blockEditor
//
// This prevents toolbar commands from accidentally applying
// to the wrong editor.
//
// ============================================================================
// 34. TEXT TOOLBAR
// ============================================================================
//
// File:
//
//     components/notes/NoteToolsBar.tsx
//
// Toolbar visual design is considered LOCKED.
//
// General appearance:
//
//     premium dark Elite X UI
//     compact grouped controls
//     subtle borders
//     8px radius
//     38px group height
//
// Current general structure:
//
//     [ Text Size ]
//     [ B I U S ]
//     [ Bullet | Numbered | Alignment ]
//     [ Text Color ]
//     [ Select | Pen | Line | Arrow | Zone | Highlight | Eraser ]
//     [ Undo | Redo ]
//     [ More ]
//
// Important:
//
// Do not redesign the toolbar visual structure casually.
//
// ============================================================================
// 35. WORKING TEXT TOOLS
// ============================================================================
//
// Current working text features:
//
//     Font Size
//     Bold
//     Italic
//     Underline
//     Strikethrough
//     Bullet List
//     Numbered List
//     Left Align
//     Center Align
//     Right Align
//     Justify
//
// Text formatting must always operate on the ACTIVE editor.
//
// NEVER apply formatting globally to all Text Blocks.
//
// ============================================================================
// 36. FONT SIZE ARCHITECTURE
// ============================================================================
//
// Custom FontSizeExtension is used.
//
// Reason:
//
// Installed Tiptap version does not expose the expected
// setFontSize() runtime command in the needed form.
//
// Current formatting model:
//
//     textStyle
//          +
//     fontSize attribute
//
// Typing preference is stored PER NOTE.
//
// LocalStorage key:
//
//     elite-x-note-font-size-${noteId}
//
// Default new-note preference:
//
//     16px
//
// Example:
//
//     Note A last preference = 32px
//     Note B last preference = 10px
//
// Each Note maintains its own preference.
//
// NEVER revert to a single global font-size state.
//
// ============================================================================
// 37. LIST RENDERING
// ============================================================================
//
// Bullet lists and ordered lists are working.
//
// Current CSS direction:
//
//     ul → list-disc
//     ul → list-inside
//     ul → ml-0
//
//     ol → list-decimal
//     ol → list-inside
//     ol → ml-0
//
// Tiptap list-item paragraphs are kept inline:
//
//     [&_ol_li>p]:inline
//     [&_ul_li>p]:inline
//
// This keeps marker and text on the same line.
//
// Do not randomly add arbitrary padding/margin values unless
// the actual UI demonstrates a problem.
//
// ============================================================================
// 38. EDITOR CONTENT WIDTH
// ============================================================================
//
// Current working content width:
//
//     w-[calc(100%-35px)]
//     min-w-0
//     ml-6
//
// This produced the best current visual balance.
//
// IMPORTANT:
//
// Keep watching behavior at different viewport widths.
//
// Do not tune the 35px value solely for one screen.
//
// The main Note Body should remain the primary vertical scroll
// workspace.
//
// Tiptap should NOT become an unintended second vertical scroll
// container.
//
// ============================================================================
// 39. ANNOTATION TOOL SYSTEM
// ============================================================================
//
// Files:
//
//     components/notes/NoteAttachmentCanvas.tsx
//     components/notes/NoteAnnotationCanvas.tsx
//
// Drawing tool union:
//
//     "select"
//     "pen"
//     "line"
//     "arrow"
//     "zone"
//     "highlight"
//     "eraser"
//
// Current toolbar tools are wired through the full chain:
//
//     app/notes/page.tsx
//         ↓
//     NoteToolsBar.tsx
//         ↓
//     NoteAttachmentCanvas.tsx
//         ↓
//     NoteAnnotationCanvas.tsx
//
// When adding another drawing tool:
//
//     update the COMPLETE chain.
//
// ============================================================================
// 40. SHARED DRAWING SETTINGS
// ============================================================================
//
// Parent state:
//
//     app/notes/page.tsx
//
// Current state:
//
//     activeAnnotationTool
//     penColor
//     penWidth
//
// Defaults:
//
//     penColor = "#ef4444"
//     penWidth = 2
//
// Shared color options:
//
//     #ef4444
//     #f97316
//     #facc15
//     #4ade80
//     #22d3ee
//     #60a5fa
//     #a78bfa
//     #f472b6
//     #f8fafc
//     #000000
//
// Width options:
//
//     1
//     2
//     3
//     4
//     6
//
// Shared by:
//
//     Pen
//     Line
//     Arrow
//     Zone
//     Highlight
//
// DO NOT create separate:
//
//     lineColor
//     arrowColor
//     zoneColor
//     highlightColor
//
// Shared drawing settings are intentional.
//
// ============================================================================
// 41. DRAWING SETTINGS UI
// ============================================================================
//
// Pen / Drawing settings panel provides:
//
//     color
//     width
//
// It closes on outside pointerdown.
//
// The toolbar previously had a separate Stroke Width group:
//
//     [ line 2 ▼ ]
//
// This was removed because Width already exists in the
// Drawing Settings panel.
//
// Do not reintroduce redundant controls without a product reason.
//
// ============================================================================
// 42. ANNOTATION DOMAIN
// ============================================================================
//
// File:
//
//     types/note.ts
//
// Current NoteAnnotation structure:
//
//     id
//     attachmentId
//     type
//     positionX
//     positionY
//     width
//     height
//     rotation
//     color
//     strokeWidth
//     points
//     text
//     fontSize
//     fontWeight
//     fontStyle
//     textDecoration
//     textAlign
//     createdAt
//     updatedAt
//
// Generic annotation model supports:
//
//     pen
//     line
//     arrow
//     zone
//     highlight
//     eraser workflow
//     future text/markup types
//
// ============================================================================
// 43. ANNOTATION COORDINATES
// ============================================================================
//
// Annotation geometry uses NORMALIZED coordinates.
//
//     x: 0 → 1
//     y: 0 → 1
//
// This is critical because screenshots can be resized.
//
// Therefore:
//
// NEVER persist raw screen-pixel coordinates as canonical
// annotation geometry.
//
// Screenshot resize must not corrupt annotation placement.
//
// ============================================================================
// 44. ANNOTATION STORAGE
// ============================================================================
//
// File:
//
//     lib/storage/noteAnnotationStorage.ts
//
// Current APIs:
//
//     createNoteAnnotation()
//     updateNoteAnnotation()
//     deleteNoteAnnotation()
//
// Ownership path:
//
//     annotation
//         ↓
//     attachment
//         ↓
//     Note
//         ↓
//     user
//
// RLS / ownership validation remains part of the system.
//
// No second annotation store exists.
//
// ============================================================================
// 45. ANNOTATION ENGINE
// ============================================================================
//
// File:
//
//     components/notes/NoteAnnotationCanvas.tsx
//
// This is the SINGLE annotation engine.
//
// All drawing tools operate through this component.
//
// DO NOT:
//
//     create another drawing canvas
//     create another annotation store
//     duplicate persistence logic
//
// Current responsibilities:
//
//     render annotations
//     render live previews
//     create annotations
//     erase annotations
//     report annotation creation
//     report annotation deletion
//
// ============================================================================
// 46. ANNOTATION CANVAS LOCAL STATE
// ============================================================================
//
// Local drawing state includes concepts such as:
//
//     isDrawing
//     currentPoints
//     lineStartPoint
//     highlightCursorPosition
//     eraserHoveringAnnotation
//     localAnnotations
//
// Parent Notes state is the effective source of truth.
//
// Current synchronization model:
//
//     annotations
//         ↓
//     localAnnotations
//
// Simple parent → local synchronization was intentionally adopted.
//
// Previous merge/tombstone behavior caused deleted annotations
// to visually resurrect after parent state changes.
//
// That old behavior was removed.
//
// Do not reintroduce the old local-created merge logic unless
// there is a demonstrated need.
//
// ============================================================================
// 47. ANNOTATION CREATE FLOW
// ============================================================================
//
// DRAW:
//
//     NoteAnnotationCanvas
//         ↓
//     createNoteAnnotation()
//         ↓
//     local annotation rendering
//         ↓
//     onAnnotationCreated()
//         ↓
//     NoteAttachmentCanvas
//         ↓
//     NotesPage
//         ↓
//     selectedNote.attachments
//
// Parent Notes state is updated after creation.
//
// New annotation actions are added to:
//
//     annotationHistory
//
// and:
//
//     annotationRedoStack
//
// is cleared.
//
// ============================================================================
// 48. ANNOTATION DELETE FLOW
// ============================================================================
//
// ERASER:
//
//     hover annotation
//         ↓
//     visual active feedback
//         ↓
//     click
//         ↓
//     deleteNoteAnnotation()
//         ↓
//     local annotation removal
//         ↓
//     onAnnotationDeleted()
//         ↓
//     NoteAttachmentCanvas
//         ↓
//     NotesPage
//         ↓
//     selectedNote.attachments updated
//
// The deleted annotation must not return when the tool changes.
//
// ============================================================================
// 49. PEN TOOL
// ============================================================================
//
// Interaction:
//
//     click + hold
//         ↓
//     freehand drawing
//         ↓
//     release
//         ↓
//     save
//
// Pen stores multiple normalized points.
//
// Rendering uses all current points:
//
//     currentPoints.forEach(...)
//
// and line-through-point behavior.
//
// Rendering:
//
//     lineCap = round
//     lineJoin = round
//
// IMPORTANT:
//
// An earlier regression collapsed Pen into short
// straight-line behavior.
//
// The renderer was corrected to iterate through ALL points.
//
// Current Pen supports:
//
//     circles
//     curves
//     arbitrary freehand shapes
//     large strokes
//
// ============================================================================
// 50. LINE TOOL
// ============================================================================
//
// Interaction:
//
//     click A
//         ↓
//     move
//         ↓
//     live preview
//         ↓
//     click B
//         ↓
//     save
//
// Type:
//
//     "line"
//
// Points:
//
//     [startPoint, endPoint]
//
// Cursor:
//
//     crosshair
//
// Coordinates:
//
//     normalized
//
// Verified:
//
//     render
//     persistence
//     reload
//     shared color
//     shared width
//
// ============================================================================
// 51. ARROW TOOL
// ============================================================================
//
// Interaction:
//
//     click A
//         ↓
//     move
//         ↓
//     shaft + arrowhead preview
//         ↓
//     click B
//         ↓
//     save
//
// Type:
//
//     "arrow"
//
// Points:
//
//     [startPoint, endPoint]
//
// Arrowhead is calculated from the endpoint.
//
// Shared:
//
//     color
//     width
//
// Verified:
//
//     shaft
//     arrowhead
//     live preview
//     persistence
//
// ============================================================================
// 52. ZONE / RECTANGLE TOOL
// ============================================================================
//
// Interaction:
//
//     click A
//         ↓
//     move
//         ↓
//     rectangle preview
//         ↓
//     click B
//         ↓
//     save
//
// Type:
//
//     "zone"
//
// Rendering:
//
//     context.strokeRect(...)
//
// IMPORTANT BUG FIX:
//
// Zone initially fell through the Line/Arrow rendering path,
// causing:
//
//     rectangle
//     +
//     diagonal line
//
// The rendering architecture was corrected with an explicit
// Zone branch.
//
// Verified:
//
//     rectangle only
//     no diagonal line
//     live preview
//     persistence
//
// ============================================================================
// 53. HIGHLIGHT TOOL
// ============================================================================
//
// Interaction:
//
//     click + hold
//         ↓
//     freehand highlight
//         ↓
//     release
//
// Highlight uses the shared drawing color/width architecture.
//
// Current behavior supports:
//
//     short strokes
//     long strokes
//     broad strokes
//     single-click dot-like marks
//
// Highlight preview behavior is implemented.
//
// ============================================================================
// 54. ERASER TOOL
// ============================================================================
//
// Interaction:
//
//     hover annotation
//         ↓
//     visual active feedback
//         ↓
//     click
//         ↓
//     delete persisted annotation
//
// Eraser does NOT alter canonical trading data.
//
// It only deletes NoteAnnotation records.
//
// ============================================================================
// 55. DRAWING HISTORY
// ============================================================================
//
// Parent file:
//
//     app/notes/page.tsx
//
// State:
//
//     annotationHistory
//     annotationRedoStack
//
// History item:
//
//     {
//         type: "create" | "delete",
//         annotation: NoteAnnotation
//     }
//
// This is DRAWING-ONLY history.
//
// Tiptap history is NOT involved.
//
// ============================================================================
// 56. DRAWING UNDO
// ============================================================================
//
// Function:
//
//     handleDrawingUndo()
//
// If history empty:
//
//     return
//
// Last action:
//
//     annotationHistory[last]
//
// CREATE → UNDO:
//
//     deleteNoteAnnotation(annotation)
//         ↓
//     remove annotation from selected Note
//
// DELETE → UNDO:
//
//     createNoteAnnotation(annotation)
//         ↓
//     append restored annotation
//
// After Undo:
//
//     remove last history action
//     push action onto redo stack
//
// ============================================================================
// 57. DRAWING REDO
// ============================================================================
//
// Function:
//
//     handleDrawingRedo()
//
// If redo stack empty:
//
//     return
//
// CREATE → REDO:
//
//     createNoteAnnotation(annotation)
//         ↓
//     append recreated annotation
//
// DELETE → REDO:
//
//     find current annotation
//         ↓
//     deleteNoteAnnotation()
//         ↓
//     remove from selected Note
//
// After Redo:
//
//     remove redo action
//     push resulting action back into history
//
// ============================================================================
// 58. ANNOTATION ID LIFECYCLE
// ============================================================================
//
// Critical:
//
// createNoteAnnotation() can return a NEW Supabase ID.
//
// Therefore:
//
//     CREATE
//       ↓
//     UNDO
//       ↓
//     REDO
//
// may produce a NEW annotation ID.
//
// Same:
//
//     DELETE
//       ↓
//     UNDO
//
// recreates the annotation with a NEW ID.
//
// This is explicitly handled.
//
// Undo DELETE:
//
//     restored = createNoteAnnotation(annotation)
//
// Then:
//
//     actionForRedo = {
//         type: "delete",
//         annotation: restored
//     }
//
// REDO CREATE:
//
//     recreated = createNoteAnnotation(annotation)
//
// Then:
//
//     actionForHistory = {
//         type: "create",
//         annotation: recreated
//     }
//
// This prevents stale IDs from breaking subsequent
// Undo / Redo operations.
//
// ============================================================================
// 59. DRAWING HISTORY NOTE ISOLATION
// ============================================================================
//
// annotationHistory and annotationRedoStack are:
//
//     page-level
//     transient
//
// They are NOT durable per-Note history.
//
// When selectedNoteId changes:
//
//     annotationHistory = []
//     annotationRedoStack = []
//
// This prevents:
//
//     Note A history
//         ↓
//     switch to Note B
//         ↓
//     Undo affecting Note A
//
// Current behavior:
//
//     switching Notes starts with clean drawing history.
//
// ============================================================================
// 60. DRAWING HISTORY PERSISTENCE DECISION
// ============================================================================
//
// Drawing history is SESSION-ONLY.
//
// It is intentionally NOT stored in Supabase.
//
// Therefore:
//
//     Draw
//       ↓
//     Undo
//       ↓
//     Redo
//
// works during the current session.
//
// But:
//
//     Draw
//       ↓
//     Refresh
//       ↓
//     Undo
//
// does NOTHING.
//
// This is INTENTIONAL.
//
// Persisted state:
//
//     annotations = durable
//
// Editing history:
//
//     Undo / Redo = transient
//
// Do NOT treat this refresh behavior as a bug.
//
// Persistent Undo/Redo would require a much larger durable
// history/versioning architecture.
//
// ============================================================================
// 61. DRAWING TOOLBAR HISTORY WIRING
// ============================================================================
//
// File:
//
//     components/notes/NoteToolsBar.tsx
//
// Props:
//
//     onDrawingUndo
//     onDrawingRedo
//
// Toolbar buttons call the parent handlers.
//
// Callback chain:
//
//     NoteToolsBar
//         ↓
//     onDrawingUndo / onDrawingRedo
//         ↓
//     NotesPage
//         ↓
//     handleDrawingUndo / handleDrawingRedo
//         ↓
//     Supabase annotation storage
//         +
//     selected Note state
//
// Important:
//
// Redo was initially visual-only.
//
// That was fixed.
//
// Final state:
//
//     Undo button = functional
//     Redo button = functional
//
// Tiptap Undo/Redo remains separate.
//
// ============================================================================
// 62. ATTACHMENT ARCHITECTURE
// ============================================================================
//
// File:
//
//     components/notes/NoteAttachmentCanvas.tsx
//
// Responsibilities:
//
//     render screenshot attachments
//     drag screenshots
//     resize screenshots
//     persist screenshot layout
//     render NoteAnnotationCanvas
//     pass annotation events upward
//
// Attachment local state:
//
//     localAttachments
//
// remains responsible for immediate attachment UI behavior.
//
// ============================================================================
// 63. ATTACHMENT STORAGE
// ============================================================================
//
// File:
//
//     lib/storage/noteAttachmentStorage.ts
//
// Storage bucket:
//
//     note-attachments
//
// Storage path:
//
//     {user_id}/{note_id}/{attachment_id}.{extension}
//
// Example:
//
//     user-id/
//       note-id/
//         attachment-id.png
//
// ============================================================================
// 64. NOTE ATTACHMENT DATABASE
// ============================================================================
//
// Table:
//
//     note_attachments
//
// Current fields:
//
//     id
//     note_id
//     file_name
//     storage_path
//     mime_type
//     file_size
//     position_x
//     position_y
//     width
//     height
//     created_at
//
// Current defaults:
//
//     position_x = 0
//     position_y = 0
//     width = 600
//     height = 400
//
// ============================================================================
// 65. ATTACHMENT UPLOAD FLOW
// ============================================================================
//
// Upload flow:
//
//     authenticate user
//         ↓
//     verify Note ownership
//         ↓
//     generate attachment UUID
//         ↓
//     generate user/note-scoped storage path
//         ↓
//     upload image to note-attachments
//         ↓
//     insert note_attachments row
//         ↓
//     if DB insert fails:
//         delete uploaded Storage object
//         return null
//         ↓
//     map row to NoteAttachment
//         ↓
//     update local Note state
//
// ============================================================================
// 66. ATTACHMENT DELETE FLOW
// ============================================================================
//
// Delete flow:
//
//     user clicks delete
//         ↓
//     NoteAttachmentCanvas onDelete()
//         ↓
//     NotesPage.handleDeleteAttachment()
//         ↓
//     deleteNoteAttachment()
//         ↓
//     authenticate user
//         ↓
//     verify Note ownership
//         ↓
//     delete Storage object
//         ↓
//     delete database row
//         ↓
//     remove attachment from local state
//
// Verified:
//
//     screenshot disappears immediately
//     Storage object is removed
//     DB row is removed
//     screenshot does not return after refresh
//
// DO NOT rewrite this working upload/delete architecture.
//
// ============================================================================
// 67. ATTACHMENT RENDERING
// ============================================================================
//
// Images use secure signed URLs.
//
// Current signed URL lifetime:
//
//     60 minutes
//
// Rendering uses:
//
//     attachment.width
//     attachment.height
//     width: 100%
//     object-contain
//
// Delete control:
//
//     Trash2
//
// Delete appears on hover.
//
// ============================================================================
// 68. ATTACHMENT MOVEMENT
// ============================================================================
//
// Screenshots are movable objects inside the shared Note Body.
//
// Current drag architecture:
//
//     pointer down
//         ↓
//     calculate delta
//         ↓
//     update localAttachments
//         ↓
//     pointer up
//         ↓
//     onLayoutChange()
//         ↓
//     updateNoteAttachmentLayout()
//
// Persistence happens on final layout state.
//
// This avoids excessive database writes during pointer movement.
//
// ============================================================================
// 69. ATTACHMENT RESIZING
// ============================================================================
//
// Screenshots resize proportionally.
//
// Aspect ratio:
//
//     aspectRatio =
//         initialWidth / initialHeight
//
// New dimensions:
//
//     newWidth =
//         max(MIN_WIDTH, initialWidth + deltaX)
//
//     newHeight =
//         newWidth / aspectRatio
//
// IMPORTANT:
//
// Screenshots should not be freely distorted by default.
//
// Preserve aspect ratio.
//
// Current behavior:
//
//     resize handle stays attached
//     delete button stays attached
//     no detached controls
//     no large empty screenshot box
//
// ============================================================================
// 70. ATTACHMENT LAYOUT / ANNOTATION RELATIONSHIP
// ============================================================================
//
// Screenshot layout:
//
//     positionX
//     positionY
//     width
//     height
//
// Annotation geometry:
//
//     normalized coordinates
//
// This combination allows:
//
//     screenshot move
//     screenshot resize
//
// without destroying annotation coordinate integrity.
//
// Existing layout operations are NOT part of drawing Undo/Redo.
//
// ============================================================================
// 71. ATTACHMENT SECURITY
// ============================================================================
//
// note_attachments RLS:
//
//     INSERT
//     SELECT
//     DELETE
//
// are restricted based on ownership of the parent Note.
//
// Storage policies for note-attachments:
//
//     authenticated user uploads only inside own folder
//     authenticated user reads only own folder
//     authenticated user deletes only own folder
//
// Private storage is preferred.
//
// Never trust client-provided:
//
//     MIME type
//     file extension
//     file size
//     filename
//
// Permanent production hardening may add file-size/type limits.
//
// ============================================================================
// 72. NOTE STORAGE SERVICE
// ============================================================================
//
// File:
//
//     lib/storage/supabaseNoteStorage.ts
//
// Responsibilities:
//
//     authentication
//     ownership checks
//     database queries
//     database → domain mapping
//     Note persistence
//     NoteBlock persistence
//     Trade link persistence
//     Trade Snapshot position persistence
//
// NotesPage should not contain arbitrary direct Supabase query logic
// when an isolated storage function already exists.
//
// ============================================================================
// 73. NOTE ROW
// ============================================================================
//
// Database notes fields:
//
//     id
//     title
//     is_title_custom
//     content
//     created_at
//     updated_at
//     user_id
//
// Application domain mapping:
//
//     is_title_custom → isTitleCustom
//     created_at      → createdAt
//     updated_at      → updatedAt
//
// Database snake_case must not leak unnecessarily into domain types.
//
// ============================================================================
// 74. LOAD NOTES
// ============================================================================
//
// loadNotesFromSupabase()
//
// Flow:
//
//     authenticate user
//         ↓
//     load notes by user_id
//         ↓
//     order updated_at DESC
//         ↓
//     collect note IDs
//         ↓
//     bulk load note_trades
//         ↓
//     bulk load note_attachments
//         ↓
//     bulk load note_annotations
//         ↓
//     bulk load note_blocks
//         ↓
//     group rows by parent
//         ↓
//     map to Note[]
//
// This avoids N+1 queries.
//
// Current architecture is batch-oriented.
//
// ============================================================================
// 75. NOTE BLOCK LOADING
// ============================================================================
//
// note_blocks rows are loaded in bulk.
//
// Grouped:
//
//     blocksByNote
//
// Then mapped to:
//
//     NoteBlock[]
//
// Default style fallbacks:
//
//     fontSize       = 13
//     color          = "#ffffff"
//     fontWeight     = "400"
//     fontStyle      = "normal"
//     textDecoration = "none"
//     textAlign      = "left"
//
// ============================================================================
// 76. NOTE ANNOTATION LOADING
// ============================================================================
//
// Attachments are loaded first.
//
// Their IDs are collected.
//
// note_annotations are then loaded for all attachment IDs.
//
// Grouped by:
//
//     attachment_id
//
// Then inserted into:
//
//     NoteAttachment.annotations[]
//
// This keeps attachment + annotation relationships explicit.
//
// ============================================================================
// 77. NOTE BLOCK CREATION
// ============================================================================
//
// createNoteBlockInSupabase()
//
// Flow:
//
//     authenticate user
//         ↓
//     verify Note ownership
//         ↓
//     insert block
//         ↓
//     return mapped NoteBlock
//
// Block persistence includes:
//
//     content
//     size
//     position
//     zIndex
//     text style
//
// ============================================================================
// 78. NOTE BLOCK UPDATE
// ============================================================================
//
// updateNoteBlockInSupabase()
//
// Ownership:
//
//     block.noteId
//         ↓
//     notes.user_id
//         ↓
//     auth.uid()
//
// Updates:
//
//     type
//     position
//     width
//     height
//     zIndex
//     content
//     fontSize
//     color
//     fontWeight
//     fontStyle
//     textDecoration
//     textAlign
//     updated_at
//
// ============================================================================
// 79. NOTE BLOCK DELETE
// ============================================================================
//
// deleteNoteBlockFromSupabase()
//
// Flow:
//
//     authenticate user
//         ↓
//     locate block
//         ↓
//     resolve note_id
//         ↓
//     verify Note ownership
//         ↓
//     delete block
//
// Deleting a Text Block never touches canonical trading data.
//
// ============================================================================
// 80. CREATE NOTE
// ============================================================================
//
// createNoteInSupabase()
//
// Current default Note:
//
//     title = "Trading Note"
//     isTitleCustom = false
//     content = ""
//     tradeLinks = []
//     blocks = []
//     attachments = []
//
// ID:
//
//     crypto.randomUUID()
//
// Timestamp:
//
//     current ISO timestamp
//
// Future architectural improvement:
//
//     PostgreSQL timestamp defaults/triggers can eventually become
//     the timestamp authority.
//
// ============================================================================
// 81. UPDATE NOTE
// ============================================================================
//
// updateNoteInSupabase(note)
//
// Updates:
//
//     title
//     is_title_custom
//     content
//     updated_at
//
// Ownership condition:
//
//     id = note.id
//     user_id = authenticated user
//
// Never updates canonical Trade data.
//
// ============================================================================
// 82. DELETE NOTE
// ============================================================================
//
// deleteNoteFromSupabase(noteId)
//
// Ownership condition:
//
//     id = noteId
//     user_id = authenticated user
//
// Recommended DB relationship:
//
//     note_trades.note_id
//         REFERENCES notes.id
//         ON DELETE CASCADE
//
// This avoids orphaned relationship rows.
//
// ============================================================================
// 83. TRADE LINK CREATION WITH LAYOUT
// ============================================================================
//
// addTradeToNoteInSupabase()
//
// Current signature includes initial layout:
//
//     noteId
//     tradeId
//     layout {
//         positionX
//         positionY
//         width
//         height
//         zIndex
//     }
//
// The layout is stored with the note_trades row.
//
// Default Trade Snapshot layout is approximately:
//
//     positionX = 20
//     positionY = 20
//     width = 320
//     height = 130
//     zIndex = 1000
//
// Existing cards preserve their own persisted positions.
//
// ============================================================================
// 84. TRADE LINK POSITION UPDATE
// ============================================================================
//
// updateNoteTradeLinkPositionInSupabase()
//
// Current design:
//
//     authenticate user
//         ↓
//     verify Note ownership
//         ↓
//     UPDATE note_trades
//         ↓
//     return updated domain object
//
// Only:
//
//     position_x
//     position_y
//
// are changed by the drag persistence operation.
//
// Width/height remain stored layout properties.
//
// ============================================================================
// 85. NOTE TRADE LINK SECURITY
// ============================================================================
//
// Application-level checks:
//
//     supabase.auth.getUser()
//
//     notes.user_id = authenticated user
//
// Database-level checks:
//
//     RLS
//
//     Postgres table privileges
//
// Both layers matter.
//
// The discovered UPDATE issue proved that an RLS policy alone
// was not sufficient without the authenticated role's underlying
// UPDATE privilege.
//
// ============================================================================
// 86. NOTE TRADE SELECTOR
// ============================================================================
//
// File:
//
//     components/notes/NoteTradeSelector.tsx
//
// Purpose:
//
//     search and select canonical Trades
//
// It receives:
//
//     trades
//     tradeLinks
//     onAddTrade
//     onRemoveTrade
//
// It does NOT create Trades.
//
// It does NOT modify Trades.
//
// It only manages Note relationships.
//
// ============================================================================
// 87. TRADE LINK DUPLICATE PROTECTION
// ============================================================================
//
// UI prevents attaching the same Trade to the same Note twice.
//
// Database should also enforce:
//
//     UNIQUE(note_id, trade_id)
//
// UI protection alone is insufficient.
//
// Database constraint is the final integrity boundary.
//
// ============================================================================
// 88. NOTES PAGE AUTHORITY
// ============================================================================
//
// app/notes/page.tsx owns:
//
//     Notes state
//     selected Note
//     available Trades
//     editor context
//     attachment callbacks
//     annotation callbacks
//     annotation history
//     trade-link layout orchestration
//
// Components should remain focused on:
//
//     rendering
//     interactions
//     editor events
//     local interaction state
//
// Storage modules own:
//
//     database persistence
//     auth checks
//     ownership checks
//     mapping
//
// ============================================================================
// 89. LEGACY LOCAL STORAGE
// ============================================================================
//
// Legacy file:
//
//     lib/storage/noteStorage.ts
//
// Legacy key:
//
//     elite-x-notes
//
// Legacy functions:
//
//     loadNotes()
//     saveNotes()
//     createNote()
//     updateNote()
//     deleteNote()
//
// This is NOT the current cloud source of truth.
//
// Current production Notes persistence:
//
//     Supabase
//
// If legacy localStorage remains in repository:
//
//     treat as LEGACY / FALLBACK / MIGRATION code
//
// Do not allow it to silently compete with Supabase.
//
// ============================================================================
// 90. LOCAL STORAGE HYDRATION SAFETY
// ============================================================================
//
// Browser APIs such as:
//
//     localStorage
//     crypto
//
// must not execute during server rendering.
//
// Browser-only legacy storage access therefore requires:
//
//     typeof window === "undefined"
//
// guards where appropriate.
//
// Current Notes route is a client-side interactive workspace.
//
// Future SSR authentication should use the project's SSR-safe
// Supabase architecture where appropriate.
//
// ============================================================================
// 91. SUPABASE AUTH
// ============================================================================
//
// Current Notes storage obtains the authenticated user through:
//
//     supabase.auth.getUser()
//
// Ownership is then checked using:
//
//     user.id
//
// Future broader application auth architecture may use:
//
//     @supabase/ssr
//
// for cookie-based SSR-safe session handling.
//
// Do not assume localStorage is accessible to Server Components.
//
// ============================================================================
// 92. RLS SECURITY MODEL
// ============================================================================
//
// RLS is the FINAL security boundary.
//
// Client-side ownership checks are defense-in-depth.
//
// Notes:
//
//     user can only SELECT own Notes
//     user can only INSERT own Notes
//     user can only UPDATE own Notes
//     user can only DELETE own Notes
//
// Note Trades:
//
//     SELECT
//     INSERT
//     UPDATE
//     DELETE
//
// must be constrained through Note ownership.
//
// Attachments:
//
//     SELECT
//     INSERT
//     DELETE
//
// must be constrained through Note ownership.
//
// Annotations:
//
//     access must be constrained through:
//
//         annotation
//             ↓
//         attachment
//             ↓
//         Note
//             ↓
//         user
//
// ============================================================================
// 93. PERFORMANCE ARCHITECTURE
// ============================================================================
//
// Current loading avoids N+1 behavior.
//
// Bulk-load:
//
//     Notes
//     Trade Links
//     Attachments
//     Annotations
//     Blocks
//
// Recommended indexes:
//
//     notes(user_id, updated_at DESC)
//
//     note_trades(note_id)
//
//     note_trades(trade_id)
//
//     note_attachments(note_id)
//
//     note_blocks(note_id)
//
//     note_annotations(attachment_id)
//
// Recommended uniqueness:
//
//     note_trades(note_id, trade_id)
//
// ============================================================================
// 94. OPTIMISTIC / LOCAL UI PRINCIPLE
// ============================================================================
//
// Notes is designed around responsive local interaction.
//
// Example:
//
//     user drags object
//         ↓
//     local state changes immediately
//         ↓
//     UI remains smooth
//         ↓
//     final state is persisted
//
// This pattern is now explicitly used by:
//
//     Trade Snapshot dragging
//     screenshot dragging
//     screenshot resizing
//     Text Block interaction
//
// Avoid writing to Supabase for every high-frequency pointer event.
//
// ============================================================================
// 95. RICH TEXT SAVE OPTIMIZATION
// ============================================================================
//
// Current editor updates are functionally valid.
//
// Long-term production optimization may use:
//
//     immediate local state
//         ↓
//     debounce
//         ↓
//     Supabase persistence
//
// Potential debounce:
//
//     ~500–1000ms
//
// But any future implementation MUST guarantee:
//
//     final content flushed
//     Note switching flushes pending changes
//     unmount flushes pending changes
//     failed save can be retried
//
// Do NOT introduce this optimization casually during unrelated
// UI fixes.
//
// ============================================================================
// 96. CONCURRENCY
// ============================================================================
//
// Current Notes system assumes a single-user workspace model.
//
// Same Note open in multiple tabs can potentially produce:
//
//     last successful write wins
//
// No collaboration engine exists.
//
// Future options:
//
//     optimistic versioning
//     updated_at conflict detection
//     version numbers
//     collaborative editing
//
// Do not introduce distributed collaboration complexity until
// the product actually requires it.
//
// ============================================================================
// 97. NOTES + ANALYTICS BOUNDARY
// ============================================================================
//
// Notes may contain behavioral observations such as:
//
//     entered too early
//     FOMO
//     revenge trade
//     followed plan
//     broke rules
//
// These remain journal observations.
//
// Future behavioral analytics may consume structured Note metadata.
//
// Architecture:
//
//     Notes
//        ↓
//     Behavioral Analytics
//
// NOT:
//
//     Notes
//        ↓
//     P&L
//
// Notes must never directly alter accounting truth.
//
// ============================================================================
// 98. FUTURE AI BOUNDARY
// ============================================================================
//
// Future AI architecture may consume:
//
//     Canonical Trades
//     +
//     Behavioral Notes
//
// then produce:
//
//     observations
//     summaries
//     behavioral patterns
//     suggestions
//
// AI output remains DERIVED information.
//
// AI must never silently mutate:
//
//     executions
//     canonical trades
//     accounting records
//
// ============================================================================
// 99. CALENDAR / BEHAVIORAL WORKSPACE BOUNDARY
// ============================================================================
//
// Notes and Calendar journaling belong to the:
//
//     Behavioral Workspace Layer
//
// Executions and reconstructed Trades belong to:
//
//     Canonical Trading Layer
//
// Both may reference the same trading ecosystem.
//
// Neither behavioral system should become accounting truth.
//
// ============================================================================
// 100. CANONICAL FILE MAP
// ============================================================================
//
// Domain:
//
//     types/note.ts
//
// Notes page:
//
//     app/notes/page.tsx
//
// Main editor:
//
//     components/notes/TiptapEditor.tsx
//
// Trade selector:
//
//     components/notes/NoteTradeSelector.tsx
//
// Linked Trade Snapshot:
//
//     components/notes/NoteLinkedTrades.tsx
//
// Text Block canvas:
//
//     components/notes/NoteBlockCanvas.tsx
//
// Text Block editor:
//
//     components/notes/NoteBlockEditor.tsx
//
// Toolbar:
//
//     components/notes/NoteToolsBar.tsx
//
// Screenshot / attachment canvas:
//
//     components/notes/NoteAttachmentCanvas.tsx
//
// Annotation engine:
//
//     components/notes/NoteAnnotationCanvas.tsx
//
// Note storage:
//
//     lib/storage/supabaseNoteStorage.ts
//
// Attachment storage:
//
//     lib/storage/noteAttachmentStorage.ts
//
// Annotation storage:
//
//     lib/storage/noteAnnotationStorage.ts
//
// Legacy local storage:
//
//     lib/storage/noteStorage.ts
//
// Canonical Trade type:
//
//     types/trade.ts
//
// Execution storage:
//
//     lib/storage/supabaseExecutionStorage.ts
//
// Trade reconstruction:
//
//     lib/parsers/pairTrades.ts
//
// ============================================================================
// 101. CURRENT COMPLETE DATA FLOW
// ============================================================================
//
// CANONICAL TRADING:
//
//     Broker
//        ↓
//     Executions
//        ↓
//     Supabase Execution Ledger
//        ↓
//     pairTrades / deterministic reconstruction
//        ↓
//     Canonical Trades
//
// NOTES:
//
//     /notes
//        ↓
//     NotesPage
//        ↓
//     supabaseNoteStorage
//        ↓
//     Supabase Notes tables
//
// TRADE REFERENCES:
//
//     Executions
//        ↓
//     pairTrades()
//        ↓
//     Trade[]
//        ↓
//     NoteTradeSelector
//        ↓
//     NoteTradeLink
//        ↓
//     note_trades
//
// RICH TEXT:
//
//     TiptapEditor
//        ↓
//     HTML
//        ↓
//     Note.content
//        ↓
//     Supabase notes.content
//
// TEXT BLOCKS:
//
//     NoteToolsBar
//        ↓
//     NoteBlockCanvas
//        ↓
//     NoteBlockEditor
//        ↓
//     NoteBlock
//        ↓
//     note_blocks
//
// SCREENSHOTS:
//
//     upload
//        ↓
//     Supabase Storage
//        +
//     note_attachments
//        ↓
//     NoteAttachment
//
// SCREENSHOT DRAWING:
//
//     Tool
//        ↓
//     NoteAttachmentCanvas
//        ↓
//     NoteAnnotationCanvas
//        ↓
//     NoteAnnotation
//        ↓
//     note_annotations
//
// DRAWING HISTORY:
//
//     NoteToolsBar
//        ↓
//     handleDrawingUndo / handleDrawingRedo
//        ↓
//     page-level history stacks
//        ↓
//     annotation persistence
//
// TRADE SNAPSHOT POSITION:
//
//     user drags
//        ↓
//     localTradeLinks
//        ↓
//     pointer up
//        ↓
//     updateNoteTradeLinkPositionInSupabase()
//        ↓
//     note_trades.position_x / position_y
//
// ============================================================================
// 102. CURRENT PRODUCTION BUILD STATUS
// ============================================================================
//
// Last verified production build:
//
//     npm run build
//
// Result:
//
//     ✓ Compiled successfully
//     ✓ TypeScript passes
//
// Notes V2 currently compiles.
//
// IMPORTANT:
//
// Any meaningful future change must be followed by:
//
//     npm run build
//
// ============================================================================
// 103. GITHUB CHECKPOINT
// ============================================================================
//
// A GitHub push was requested after the major Notes V2 milestone.
//
// Standard project workflow:
//
//     git add .
//     git commit -m "feat(notes): add movable trade snapshot cards"
//     git push origin main
//
// IMPORTANT:
//
// Do NOT invent a commit hash.
//
// Before treating the checkpoint as definitively pushed, verify:
//
//     git status
//
//     git log -1 --oneline
//
// and confirm:
//
//     HEAD == origin/main
//
// The repository should be considered the stable checkpoint only
// after the push is actually verified.
//
// ============================================================================
// 104. CURRENT STABLE FEATURE SET
// ============================================================================
//
// WORKING:
//
//     ✓ Notes load
//     ✓ Notes create
//     ✓ Notes update
//     ✓ Notes delete
//     ✓ Automatic Note titles
//     ✓ Manual Note title override
//     ✓ Trade search / selection
//     ✓ Multiple Trade links
//     ✓ Linked Trade removal
//     ✓ Trade Snapshot rendering
//     ✓ Trade Snapshot hover delete
//     ✓ Trade Snapshot dragging
//     ✓ Trade Snapshot local drag rendering
//     ✓ Trade Snapshot final-position persistence
//     ✓ Trade Snapshot position persistence after refresh
//     ✓ Screenshot upload
//     ✓ Screenshot delete
//     ✓ Screenshot storage cleanup
//     ✓ Screenshot move
//     ✓ Screenshot resize
//     ✓ Screenshot proportional resizing
//     ✓ Screenshot layout persistence
//     ✓ Screenshot refresh persistence
//     ✓ Screenshot annotations
//     ✓ Pen
//     ✓ Line
//     ✓ Arrow
//     ✓ Zone
//     ✓ Highlight
//     ✓ Eraser
//     ✓ Annotation persistence
//     ✓ Annotation delete
//     ✓ Drawing Undo
//     ✓ Drawing Redo
//     ✓ Drawing history isolation between Notes
//     ✓ Text Blocks
//     ✓ Text Block creation
//     ✓ Text Block editing
//     ✓ Text Block dragging
//     ✓ Text Block resizing
//     ✓ Text Block deletion
//     ✓ Text Block persistence
//     ✓ Main Tiptap editor
//     ✓ Bold
//     ✓ Italic
//     ✓ Underline
//     ✓ Strikethrough
//     ✓ Font Size
//     ✓ Bullet lists
//     ✓ Ordered lists
//     ✓ Alignment
//     ✓ Active editor architecture
//     ✓ Notes isolation from canonical trading system
//     ✓ TypeScript build
//
// ============================================================================
// 105. INTENTIONAL LIMITATIONS
// ============================================================================
//
// DRAWING HISTORY:
//
//     Undo / Redo does not survive page refresh.
//
// This is intentional.
//
// PERSISTED:
//
//     annotations
//
// TRANSIENT:
//
//     history
//
//
//
// Tiptap warning:
//
//     duplicate underline extension warning
//
// This remains a separate cleanup task.
//
//
//
// Rich text persistence:
//
//     current implementation is functionally correct,
//     but future debouncing may reduce write volume.
//
//
//
// Multi-tab Notes:
//
//     no conflict-resolution architecture yet.
//
// ============================================================================
// 106. REMAINING UI / POLISH WORK
// ============================================================================
//
// Major Notes V2 architecture is now complete enough for
// real-world testing.
//
// Remaining work should be mostly:
//
//     UI polish
//     responsive refinement
//     visual consistency
//     cleanup
//     minor interaction refinements
//
// Examples of remaining possible polish:
//
//     Trade Snapshot exact spacing
//     toolbar responsive behavior
//     More menu behavior
//     screenshot placement polish
//     final annotation visual polish
//     icon consistency
//     cursor consistency
//     removing temporary console logs
//     removing obsolete props/state
//     Tiptap duplicate Underline warning cleanup
//
// Do NOT perform broad architectural rewrites merely for UI polish.
//
// ============================================================================
// 107. REAL-WORLD TESTING PLAN
// ============================================================================
//
// The user intends to test Notes V2 over several days.
//
// Recommended tests:
//
//     1. Draw Pen circles / curves
//     2. Draw large Pen strokes
//     3. Create multiple Lines
//     4. Create Arrows
//     5. Create Zones
//     6. Test short Highlights
//     7. Test long Highlights
//     8. Test single-click Highlight marks
//     9. Erase each annotation type
//     10. Erase empty space
//     11. Test eraser hover feedback
//     12. Undo create
//     13. Redo create
//     14. Undo delete
//     15. Redo delete
//     16. Multiple Undo
//     17. Multiple Redo
//     18. Undo → new drawing → Redo cleared
//     19. Switch Notes
//     20. Refresh persistence
//     21. Resize screenshot after annotations
//     22. Move screenshot after annotations
//     23. Move Trade Snapshot
//     24. Refresh after Trade Snapshot movement
//     25. Delete Trade Snapshot
//     26. Create multiple Trade Snapshots
//     27. Move multiple Trade Snapshots independently
//     28. Refresh after multiple Trade movements
//     29. Resize Text Blocks
//     30. Move Text Blocks
//     31. Test formatting isolation between Text Blocks
//
// Any unexpected behavior should be verified before changing
// architecture.
//
// ============================================================================
// 108. DEVELOPMENT WORKFLOW
// ============================================================================
//
// The required development style is:
//
//     ONE STEP AT A TIME
//
// For EVERY code change:
//
//     1. Identify exact file path.
//
//     2. Identify exact section.
//
//     3. Explain exactly what is being replaced.
//
//     4. Make only that change.
//
//     5. Run:
//
//            npm run build
//
//     6. Test.
//
//     7. Report result.
//
//     8. Only then move to the next step.
//
//
//
// IMPORTANT USER COMMUNICATION RULE:
//
// Always provide exact file path before code.
//
// When replacing code:
//
//     REPLACE FROM:
//         exact visible section
//
//     REPLACE THROUGH:
//         exact visible section
//
// This avoids ambiguity.
//
// Do NOT casually say:
//
//     "change this part"
//
// without identifying the exact boundaries.
//
// ============================================================================
// 109. DEBUGGING RULES
// ============================================================================
//
// Separate:
//
//     FACTS
//
// from:
//
//     ASSUMPTIONS
//
// Never guess when debugging.
//
// Verify:
//
//     actual component
//     actual prop
//     actual state
//     actual editor instance
//     actual focus event
//     actual Supabase request
//     actual SQL policy
//     actual table privilege
//     actual persisted value
//
// If confidence is low:
//
//     perform the smallest verification step
//
// before making another code change.
//
// Do NOT stack multiple speculative fixes.
//
// ============================================================================
// 110. IMPORTANT DO-NOT-DO RULES
// ============================================================================
//
// DO NOT:
//
//     modify canonical trading architecture for Notes
//
//     modify executions for Notes
//
//     modify FIFO for Notes
//
//     modify pairTrades for Notes
//
//     modify P&L for Notes
//
//     create duplicate annotation stores
//
//     create duplicate drawing canvases
//
//     create duplicate editor state systems
//
//     solve toolbar context by adding separate logic to every
//     toolbar button
//
//     write Supabase on every pointermove for draggable objects
//
//     introduce arbitrary layout hacks to solve one viewport
//
//     rely solely on UI validation for data integrity
//
//     invent a Git commit hash
//
// ============================================================================
// 111. ARCHITECTURAL LAYER MODEL
// ============================================================================
//
// PRESENTATION:
//
//     NotesPage
//     TiptapEditor
//     NoteToolsBar
//     NoteTradeSelector
//     NoteLinkedTrades
//     NoteBlockCanvas
//     NoteBlockEditor
//     NoteAttachmentCanvas
//     NoteAnnotationCanvas
//
// DOMAIN:
//
//     Note
//     NoteTradeLink
//     NoteBlock
//     NoteAttachment
//     NoteAnnotation
//
// PERSISTENCE:
//
//     supabaseNoteStorage
//     noteAttachmentStorage
//     noteAnnotationStorage
//     Supabase notes
//     note_trades
//     note_blocks
//     note_attachments
//     note_annotations
//     Supabase Storage
//
// SECURITY:
//
//     Supabase Auth
//     RLS
//     Postgres privileges
//     Ownership checks
//
// CANONICAL TRADING:
//
//     executions
//     FIFO
//     Trades
//     Analytics
//
// Behavioral Notes remain DOWNSTREAM consumers of canonical
// information.
//
// ============================================================================
// 112. FINAL ARCHITECTURAL SUMMARY
// ============================================================================
//
// CANONICAL ACCOUNTING:
//
//     Broker
//        ↓
//     Executions
//        ↓
//     FIFO
//        ↓
//     Trades
//        ↓
//     Analytics
//
// BEHAVIORAL WORKSPACE:
//
//     Trades
//        ↓
//     Notes
//        ↓
//     Rich Text
//     Text Blocks
//     Screenshots
//     Annotations
//     Trade Snapshots
//     Behavioral Metadata
//
// NOTHING in Notes flows backward into:
//
//     Executions
//     FIFO
//     Trades
//     P&L
//     Reconciliation
//     Analytics
//
// ============================================================================
// 113. CURRENT RESUME POINT
// ============================================================================
//
// MAJOR ARCHITECTURE:
//
//     COMPLETE / STABLE CHECKPOINT
//
// Current priority:
//
//     REAL-WORLD TESTING
//     +
/     MINOR UI POLISH
//
// Do NOT restart from the old Text Color / basic drawing milestone.
//
// Those milestones are already completed.
//
//
//
// Before any further development:
//
//     npm run build
//
// Then verify GitHub:
//
//     git status
//     git log -1 --oneline
//
//     HEAD == origin/main
//
//
//
// When continuing development:
//
//     1. Start with the specific UI issue.
//     2. Do not refactor unrelated Notes architecture.
//     3. Preserve current persistence model.
//     4. Preserve canonical trading isolation.
//     5. Build after meaningful changes.
//     6. Test the actual behavior.
//     7. Update this master only after a stable checkpoint.
//
// ============================================================================
// END OF ELITE X NOTES V2 MASTER ARCHITECTURE
// ============================================================================
