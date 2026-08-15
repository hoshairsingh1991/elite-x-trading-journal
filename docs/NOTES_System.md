
// ============================================================
// ELITE X TRADING JOURNAL
// NOTES SYSTEM — MASTER ARCHITECTURE NOTES
// ============================================================
//
// PURPOSE
// ============================================================
//
// The Notes system is a behavioral journaling and trade-review
// layer within Elite X.
//
// It is intentionally isolated from the canonical accounting
// architecture.
//
// Notes are NOT a source of truth for trading data.
//
// Canonical trading data remains:
//
// Broker
//   ↓
// Normalized Executions
//   ↓
// Supabase Execution Ledger
//   ↓
// Deterministic FIFO Reconstruction
//   ↓
// Canonical Trades
//   ↓
// Analytics / Dashboard / Reporting
//
// Notes exist beside this architecture:
//
// Canonical Trading Data
//        ↓
//      Trades
//        ↓
//   ┌───────────────┐
//   │ Notes System  │
//   └───────────────┘
//
// The Notes system may reference trades,
// but it must never become responsible for
// calculating or storing canonical trading state.
//
// ============================================================
// CORE ARCHITECTURAL PRINCIPLE
// ============================================================
//
// Notes are classified as:
//
//     NON-CANONICAL BEHAVIORAL WORKSPACE METADATA
//
// Notes MUST NEVER:
//
// - mutate executions
// - mutate reconstructed trades
// - modify broker data
// - affect reconciliation
// - affect deterministic trade reconstruction
// - alter realized P&L
// - alter unrealized P&L
// - alter analytics calculations
// - alter dashboard calculations
// - alter account balances
// - alter execution quantities
// - alter execution prices
// - alter FIFO reconstruction
//
// A note can reference a trade.
//
// A trade cannot depend on a note.
//
// Therefore:
//
//     Trade → exists independently
//
//     Note → may reference Trade
//
// This direction must remain one-way.
//
// ============================================================
// NOTES DOMAIN MODEL
// ============================================================
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
//
// ------------------------------------------------------------
// NOTE
// ------------------------------------------------------------
//
// A Note represents one behavioral journal document.
//
// Current structure:
//
//     id
//     title
//     content
//     createdAt
//     updatedAt
//     tradeLinks
//     attachments
//
// Content is stored as serialized rich-text HTML.
//
// Example:
//
//     Note
//       ├── id
//       ├── title
//       ├── content
//       ├── createdAt
//       ├── updatedAt
//       ├── tradeLinks[]
//       └── attachments[]
//
// ------------------------------------------------------------
// NOTE TRADE LINK
// ------------------------------------------------------------
//
// A NoteTradeLink creates an association between:
//
//     Note
//
// and:
//
//     Trade
//
// Structure:
//
//     id
//     noteId
//     tradeId
//     createdAt
//
// This is a relationship object.
//
// It does NOT duplicate the Trade object.
//
// The canonical Trade remains owned by the trading system.
//
// The Notes system only stores the relationship.
//
// ------------------------------------------------------------
// NOTE ATTACHMENT
// ------------------------------------------------------------
//
// NoteAttachment represents future/available note media.
//
// Structure:
//
//     id
//     noteId
//     fileName
//     storagePath
//     mimeType
//     fileSize
//     createdAt
//
// Attachments are intentionally represented in the domain model
// even though the current persistence implementation does not
// yet load or persist them.
//
// Current mapping:
//
//     attachments: []
//
// This allows the Notes architecture to evolve without changing
// the fundamental Note domain contract.
//
// ============================================================
// CURRENT DOMAIN TYPE
// ============================================================
//
// Conceptually:
//
//     Note = {
//
//         id: string
//
//         title: string
//
//         content: string
//
//         createdAt: string
//
//         updatedAt: string
//
//         tradeLinks: NoteTradeLink[]
//
//         attachments: NoteAttachment[]
//
//     }
//
// ============================================================
// NOTES WORKSPACE
// ============================================================
//
// Primary route:
//
//     /notes
//
// Main page:
//
//     app/notes/page.tsx
//
// The page is responsible for orchestration.
//
// It currently coordinates:
//
//     Notes
//     ↓
//     Selected Note
//     ↓
//     Trade loading
//     ↓
//     Trade linking
//     ↓
//     Tiptap editor
//
// The page should NOT become the permanent home for:
//
//     database implementation
//     editor internals
//     trade reconstruction logic
//     attachment storage logic
//
// Those responsibilities remain isolated.
//
// ============================================================
// NOTES PAGE RESPONSIBILITY
// ============================================================
//
// File:
//
//     app/notes/page.tsx
//
// Responsibilities:
//
// 1. Load Notes
//
// 2. Maintain Notes state
//
// 3. Maintain selected Note state
//
// 4. Load available Trades
//
// 5. Create Notes
//
// 6. Delete Notes
//
// 7. Update Note title/content
//
// 8. Add Trade → Note relationship
//
// 9. Remove Trade → Note relationship
//
// 10. Pass Note content into Tiptap
//
// 11. Pass available Trades into NoteTradeSelector
//
// The page acts as an orchestration layer.
//
// It should not contain:
//
//     Supabase query implementation
//     raw database mapping
//     editor implementation
//     execution pairing algorithms
//
// ============================================================
// RICH TEXT EDITOR ARCHITECTURE
// ============================================================
//
// Editor file:
//
//     components/notes/TiptapEditor.tsx
//
// The editor is intentionally isolated from:
//
//     app/notes/page.tsx
//
// This boundary provides:
//
//     editor-state isolation
//     modularity
//     future extension safety
//     easier testing
//     easier migration
//     future cloud synchronization
//     future AI workspace integration
//
// The editor emits serialized content through:
//
//     onChange(value)
//
// The Notes page treats the returned value as Note.content.
//
// Current persistence representation:
//
//     HTML string
//
// Therefore:
//
//     Tiptap
//        ↓
//     serialized HTML
//        ↓
//     Note.content
//        ↓
//     Supabase
//
// ============================================================
// TRADE SELECTION ARCHITECTURE
// ============================================================
//
// Trade selector file:
//
//     components/notes/NoteTradeSelector.tsx
//
// Purpose:
//
//     Allow users to associate one or more canonical Trades
//     with a Note.
//
// The selector receives:
//
//     trades
//     tradeLinks
//     onAddTrade
//     onRemoveTrade
//
// It does NOT create or modify Trade objects.
//
// It only manages relationships.
//
// ============================================================
// TRADE DATA SOURCE
// ============================================================
//
// Available Trades are currently rebuilt from the canonical
// execution ledger.
//
// Current flow:
//
//     Supabase executions
//             ↓
//     loadExecutionsFromSupabase()
//             ↓
//     pairTrades(executions)
//             ↓
//     availableTrades
//
// This is important.
//
// The Notes system does NOT maintain its own independent
// copy of trading truth.
//
// Trade references are resolved against canonical/reconstructed
// Trade objects.
//
// ============================================================
// TRADE LINKING FLOW
// ============================================================
//
// ADD TRADE:
//
//     User selects Trade
//            ↓
//     NoteTradeSelector
//            ↓
//     onAddTrade(tradeId)
//            ↓
//     NotesPage
//            ↓
//     addTradeToNoteInSupabase()
//            ↓
//     note_trades
//            ↓
//     NoteTradeLink returned
//            ↓
//     local Notes state updated
//
// REMOVE TRADE:
//
//     User removes Trade
//            ↓
//     NoteTradeSelector
//            ↓
//     onRemoveTrade(tradeId)
//            ↓
//     NotesPage
//            ↓
//     removeTradeFromNoteInSupabase()
//            ↓
//     note_trades relationship removed
//            ↓
//     local Notes state updated
//
// ============================================================
// MULTIPLE TRADE SUPPORT
// ============================================================
//
// A Note can reference multiple Trades.
//
// Example:
//
//     Note A
//       ├── Trade 101
//       ├── Trade 102
//       ├── Trade 103
//       └── Trade 104
//
// The relationship is represented by:
//
//     tradeLinks[]
//
// The same Trade should not be linked to the same Note more
// than once.
//
// The UI already prevents selecting an attached Trade again.
//
// Database-level uniqueness should also be enforced:
//
//     UNIQUE(note_id, trade_id)
//
// The database constraint is the final integrity boundary.
//
// UI protection alone is insufficient.
//
// ============================================================
// NOTES SUPABASE ARCHITECTURE
// ============================================================
//
// Primary persistence file:
//
//     lib/storage/supabaseNoteStorage.ts
//
// Supabase is currently the authoritative persistence layer
// for cloud Notes.
//
// The storage layer is responsible for:
//
//     authentication
//     database queries
//     ownership checks
//     database → domain mapping
//     relationship persistence
//
// The Notes page should not directly implement these operations.
//
// ============================================================
// NOTES DATABASE MODEL
// ============================================================
//
// Current primary table:
//
//     notes
//
// Expected fields:
//
//     id
//     title
//     content
//     created_at
//     updated_at
//     user_id
//
// The user_id establishes ownership.
//
// Notes must always be scoped to the authenticated user.
//
// ============================================================
// NOTE TRADE RELATIONSHIP TABLE
// ============================================================
//
// Current relationship table:
//
//     note_trades
//
// Expected fields:
//
//     note_id
//     trade_id
//     created_at
//
// This table represents the many-to-many relationship between:
//
//     Notes
//
// and:
//
//     Trades
//
// A Note can have many Trades.
//
// A Trade can be referenced by many Notes.
//
// Therefore:
//
//     Notes 1 ──────── * note_trades * ──────── 1 Trades
//
// ============================================================
// USER OWNERSHIP
// ============================================================
//
// Every Note belongs to exactly one authenticated user.
//
// Persistence operations must verify:
//
//     authenticated user
//
// before accessing user-owned data.
//
// Current storage implementation obtains the authenticated user
// through:
//
//     supabase.auth.getUser()
//
// The resulting user.id is used to scope Notes.
//
// Example:
//
//     notes.user_id = authenticatedUser.id
//
// ============================================================
// SUPABASE ROW → DOMAIN MAPPING
// ============================================================
//
// Database rows use snake_case:
//
//     created_at
//     updated_at
//     user_id
//     note_id
//     trade_id
//
// Application domain objects use camelCase:
//
//     createdAt
//     updatedAt
//     noteId
//     tradeId
//
// This mapping boundary must remain explicit.
//
// Database naming must NOT leak unnecessarily into application
// domain models.
//
// ============================================================
// LOAD NOTES FLOW
// ============================================================
//
// loadNotesFromSupabase()
//
// Flow:
//
//     authenticate user
//             ↓
//     load notes where user_id = user.id
//             ↓
//     order by updated_at DESC
//             ↓
//     collect note IDs
//             ↓
//     load note_trades for those note IDs
//             ↓
//     group links by note ID
//             ↓
//     construct Note domain objects
//             ↓
//     return Note[]
//
// This avoids performing one database query per Note.
//
// The current implementation performs:
//
//     1 query for Notes
//
// followed by:
//
//     1 query for all relationships
//
// rather than:
//
//     N queries for N Notes
//
// This is preferable for scalability.
//
// ============================================================
// TRADE LINK ID
// ============================================================
//
// The current application creates a deterministic relationship
// identifier:
//
//     `${noteId}:${tradeId}`
//
// This ID is currently application-level.
//
// The database relationship itself currently uses:
//
//     note_id
//     trade_id
//
// Future schema design should enforce:
//
//     UNIQUE(note_id, trade_id)
//
// This prevents duplicate relationships regardless of UI behavior.
//
// ============================================================
// CREATE NOTE
// ============================================================
//
// createNoteInSupabase()
//
// Flow:
//
//     authenticate user
//             ↓
//     generate UUID
//             ↓
//     create Note domain object
//             ↓
//     insert into notes
//             ↓
//     return Note
//
// Default values:
//
//     title   = "Untitled Note"
//     content = ""
//     tradeLinks = []
//     attachments = []
//
// Timestamps are currently generated by the application.
//
// Future schema evolution may move timestamp authority to
// PostgreSQL defaults/triggers.
//
// If that migration occurs, the database-returned row should
// become the authoritative createdAt/updatedAt value.
//
// ============================================================
// UPDATE NOTE
// ============================================================
//
// updateNoteInSupabase(note)
//
// Updates:
//
//     title
//     content
//     updated_at
//
// Ownership condition:
//
//     id = note.id
//
// AND:
//
//     user_id = authenticated user
//
// This prevents a client from intentionally updating another
// user's Note by ID.
//
// Important architectural rule:
//
//     Note update must never update Trade data.
//
// ============================================================
// DELETE NOTE
// ============================================================
//
// deleteNoteFromSupabase(noteId)
//
// Deletes only when:
//
//     id = noteId
//
// AND:
//
//     user_id = authenticated user
//
// Trade links should be removed automatically through database
// foreign-key cascade behavior where appropriate.
//
// Recommended database relationship:
//
//     note_trades.note_id
//         REFERENCES notes(id)
//         ON DELETE CASCADE
//
// This keeps orphaned relationship rows from accumulating.
//
// ============================================================
// ADD TRADE TO NOTE
// ============================================================
//
// addTradeToNoteInSupabase(noteId, tradeId)
//
// Current flow:
//
//     authenticate user
//             ↓
//     verify Note ownership
//             ↓
//     insert note_trades relationship
//             ↓
//     return relationship
//
// Important:
//
// The function currently verifies Note ownership.
//
// Future hardening should also verify that the referenced Trade
// belongs to the same authenticated user when Trade persistence
// is user-scoped.
//
// The final security boundary should be database RLS,
// not client-side validation.
//
// ============================================================
// REMOVE TRADE FROM NOTE
// ============================================================
//
// removeTradeFromNoteInSupabase(noteId, tradeId)
//
// Current flow:
//
//     authenticate user
//             ↓
//     verify Note ownership
//             ↓
//     delete matching relationship
//
// The operation must remain user-scoped.
//
// Database RLS should provide the final authorization boundary.
//
// ============================================================
// RLS SECURITY MODEL
// ============================================================
//
// Supabase Row Level Security is part of the Notes security
// architecture.
//
// Application-level:
//
//     supabase.auth.getUser()
//
// is useful for defensive checks.
//
// However:
//
//     application checks ≠ security boundary
//
// The database must enforce ownership using RLS.
//
// Recommended policy model:
//
//     notes.user_id = auth.uid()
//
// Users should only be able to:
//
//     SELECT their Notes
//     INSERT their Notes
//     UPDATE their Notes
//     DELETE their Notes
//
// For note_trades, access should be constrained through the
// ownership of the associated Note and, where applicable,
// ownership of the associated Trade.
//
// ============================================================
// LOCAL STORAGE LEGACY SYSTEM
// ============================================================
//
// Legacy file:
//
//     lib/storage/noteStorage.ts
//
// This file contains the original browser-local Notes persistence
// implementation.
//
// Storage key:
//
//     elite-x-notes
//
// It provides:
//
//     loadNotes()
//     saveNotes()
//     createNote()
//     updateNote()
//     deleteNote()
//
// This system is separate from the current Supabase Notes
// persistence architecture.
//
// ============================================================
// LEGACY LOCAL STORAGE ROLE
// ============================================================
//
// Current production cloud Notes flow:
//
//     Supabase
//
// Legacy local-storage flow:
//
//     localStorage
//
// The two systems must NOT silently become competing sources
// of truth.
//
// If localStorage remains in the repository for compatibility,
// it should be treated as:
//
//     LEGACY / FALLBACK / MIGRATION CODE
//
// and not as an independent canonical Notes backend.
//
// Any future removal should verify that no production route,
// component, or feature still depends on it.
//
// ============================================================
// LEGACY LOCAL STORAGE TYPE SAFETY
// ============================================================
//
// The Note domain model now requires:
//
//     tradeLinks
//     attachments
//
// Therefore legacy Note creation must construct the complete
// domain object.
//
// Required defaults:
//
//     tradeLinks: []
//     attachments: []
//
// This prevents TypeScript from allowing partially constructed
// Note objects.
//
// ============================================================
// HYDRATION SAFETY
// ============================================================
//
// The Notes workspace is a client-side interactive system.
//
// Browser-only APIs such as:
//
//     localStorage
//     crypto
//
// must not execute during server rendering.
//
// The legacy localStorage implementation therefore guards:
//
//     typeof window === "undefined"
//
// before accessing localStorage.
//
// Supabase authentication is handled through the client-side
// Supabase client in the current Notes implementation.
//
// Future SSR architecture must preserve hydration safety.
//
// ============================================================
// NOTE CONTENT STORAGE
// ============================================================
//
// Current content representation:
//
//     serialized HTML
//
// Example conceptual flow:
//
//     Tiptap document
//          ↓
//     HTML serialization
//          ↓
//     Note.content
//          ↓
//     Supabase notes.content
//
// HTML is treated as stored content.
//
// When rendering HTML outside Tiptap, rendering must remain
// controlled and sanitized where appropriate.
//
// Never introduce arbitrary unsanitized HTML rendering from
// untrusted external sources.
//
// ============================================================
// NOTE PREVIEW
// ============================================================
//
// Note list previews currently derive text from HTML by removing
// tags.
//
// Conceptually:
//
//     HTML
//       ↓
//     strip tags
//       ↓
//     preview text
//
// This is suitable for basic previews.
//
// If Notes eventually support richer content structures,
// a dedicated content-summary/plain-text extraction layer may
// be preferable to repeatedly parsing HTML in the UI.
//
// ============================================================
// CANONICAL TRADE RELATIONSHIP
// ============================================================
//
// Notes reference Trade IDs.
//
// They do NOT copy:
//
//     entryPrice
//     exitPrice
//     quantity
//     pnl
//     fees
//     currency
//     execution data
//
// This is deliberate.
//
// Example:
//
//     Note
//       tradeLinks:
//         tradeId = "ABC"
//
// Trade "ABC" remains canonical elsewhere.
//
// If the Trade changes because executions are rebuilt,
// the Note relationship remains:
//
//     note → trade ID
//
// The Notes system should resolve the current canonical Trade
// when displaying the relationship.
//
// ============================================================
// REBUILD INDEPENDENCE
// ============================================================
//
// Deterministic trade reconstruction may rebuild Trade objects.
//
// Example:
//
//     executions
//         ↓
//     FIFO reconstruction
//         ↓
//     new Trade representation
//
// Notes must survive this process.
//
// Therefore:
//
//     Note → Trade ID
//
// rather than:
//
//     Note → copied Trade snapshot
//
// This prevents Notes from becoming stale copies of accounting
// data.
//
// ============================================================
// IMPORTANT FUTURE TRADE-ID CONSIDERATION
// ============================================================
//
// Trade IDs must remain deterministic/stable enough for
// relationships to remain meaningful across rebuilds.
//
// If the Trade reconstruction system ever changes the identity
// of a logically identical Trade during rebuilds, NoteTradeLink
// relationships could become orphaned.
//
// Therefore the Trade identity model must be treated as a
// cross-system contract.
//
// Before changing Trade ID generation:
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
// ============================================================
// NOTE ATTACHMENTS — FUTURE
// ============================================================
//
// The domain model already supports:
//
//     NoteAttachment
//
// Current persistence:
//
//     NOT IMPLEMENTED
//
// Current mapping:
//
//     attachments: []
//
// Future attachment architecture should likely use:
//
//     Supabase Storage
//
// with metadata stored in a database table.
//
// Conceptual architecture:
//
//     File
//       ↓
//     Supabase Storage
//       ↓
//     note_attachments
//       ↓
//     NoteAttachment
//
// Metadata should include:
//
//     file name
//     storage path
//     MIME type
//     file size
//     created timestamp
//     note relationship
//
// Storage access must be user-scoped.
//
// ============================================================
// FUTURE NOTE MEDIA SECURITY
// ============================================================
//
// Attachments must not be treated as public files by default.
//
// Recommended future model:
//
//     private Supabase Storage bucket
//
// Access controlled through authenticated ownership.
//
// Never trust:
//
//     file name
//     MIME type
//     file extension
//     client-provided size
//
// Server/storage policies should enforce appropriate limits.
//
// ============================================================
// PERFORMANCE ARCHITECTURE
// ============================================================
//
// Current Notes loading performs bulk retrieval:
//
//     Notes
//     ↓
//     all relationships for loaded Notes
//
// This is preferable to N+1 queries.
//
// Future scalability considerations:
//
// - pagination for Notes
// - pagination for very large Note histories
// - indexed user_id
// - indexed updated_at
// - indexed note_trades.note_id
// - indexed note_trades.trade_id
// - unique constraint on note/trade pair
//
// Recommended indexes:
//
//     notes(user_id, updated_at DESC)
//
//     note_trades(note_id)
//
//     note_trades(trade_id)
//
// ============================================================
// DATA INTEGRITY
// ============================================================
//
// Application validation is not sufficient for permanent data
// integrity.
//
// Database should enforce:
//
//     user ownership
//     foreign keys
//     unique Note/Trade relationships
//     valid required fields
//
// Recommended constraints:
//
//     notes.user_id → auth user
//
//     note_trades.note_id → notes.id
//
//     note_trades.trade_id → canonical trade identity
//
//     UNIQUE(note_id, trade_id)
//
// ============================================================
// ERROR HANDLING
// ============================================================
//
// Current storage functions log Supabase errors and return:
//
//     []       for failed Note loading
//     null     for failed creation/linking
//     void     for failed updates/deletes
//
// This is acceptable for the current foundation,
// but it is not the ideal long-term service contract.
//
// Future architecture should distinguish:
//
//     authentication failure
//     authorization failure
//     validation failure
//     network failure
//     database failure
//     constraint failure
//
// Instead of silently collapsing all failures into:
//
//     null
//
// or:
//
//     []
//
// This becomes especially important when the application grows.
//
// ============================================================
// OPTIMISTIC UPDATE CONSIDERATIONS
// ============================================================
//
// The Notes page currently updates local React state immediately
// for Note editing and then persists to Supabase.
//
// This provides responsive UX.
//
// However:
//
//     UI state
//     ≠
//     persistence success
//
// Future production hardening should consider:
//
//     save status
//     retry behavior
//     debounced persistence
//     conflict handling
//     failed-save recovery
//
// Especially important for rich-text editing because users may
// generate many updates quickly.
//
// ============================================================
// RICH TEXT SAVE STRATEGY
// ============================================================
//
// Current architecture:
//
//     every editor change
//          ↓
//     handleUpdateNote()
//          ↓
//     updateNoteInSupabase()
//
// This is functionally valid but can create excessive database
// writes during continuous typing.
//
// Future optimization should consider:
//
//     local immediate state
//          ↓
//     debounce
//          ↓
//     Supabase persistence
//
// Example:
//
//     user typing
//         ↓
//     React state updates immediately
//         ↓
//     debounce ~500–1000ms
//         ↓
//     single persistence operation
//
// This should be implemented carefully so that:
//
//     final content is never lost
//     note switching flushes pending changes
//     unmount flushes pending changes
//     failed saves can be retried
//
// ============================================================
// CONCURRENCY / MULTI-TAB CONSIDERATIONS
// ============================================================
//
// Future Notes architecture should account for:
//
//     same Note open in multiple tabs
//
// Current system does not implement collaborative editing or
// conflict resolution.
//
// Therefore last successful write may overwrite another write.
//
// This is acceptable for the current single-user workspace.
//
// Future requirements may introduce:
//
//     updated_at conflict detection
//
// or:
//
//     optimistic concurrency/version numbers
//
// or:
//
//     collaborative editor architecture
//
// Do not introduce complexity until the product actually needs
// multi-device/multi-session conflict resolution.
//
// ============================================================
// NOTES + ANALYTICS BOUNDARY
// ============================================================
//
// Notes may contain behavioral observations such as:
//
//     "entered too early"
//     "followed plan"
//     "revenge traded"
//     "FOMO"
//
// These are journaling observations.
//
// They must NOT automatically become accounting data.
//
// Future behavioral analytics may derive statistics from
// structured Note metadata, but this must remain a separate
// analytical layer.
//
// Example:
//
//     Notes
//        ↓
//     Behavioral Analytics
//
// NOT:
//
//     Notes
//        ↓
//     P&L calculation
//
// ============================================================
// FUTURE AI ARCHITECTURE
// ============================================================
//
// Notes are a strong future input for AI-assisted trading
// reflection.
//
// Potential future architecture:
//
//     Canonical Trades
//          +
//     Behavioral Notes
//          ↓
//     AI Analysis Layer
//          ↓
//     Behavioral insights
//
// AI output must remain derived information.
//
// AI must never silently mutate:
//
//     executions
//     canonical trades
//     accounting records
//
// AI should produce:
//
//     observations
//     summaries
//     patterns
//     suggestions
//
// rather than rewriting canonical trading truth.
//
// ============================================================
// CALENDAR JOURNALING BOUNDARY
// ============================================================
//
// Calendar journaling and Notes are behavioral systems.
//
// They may reference the same trading ecosystem.
//
// However they should not become coupled to accounting logic.
//
// Both belong conceptually to:
//
//     Behavioral Workspace Layer
//
// while executions and reconstructed trades belong to:
//
//     Canonical Trading Layer
//
// ============================================================
// ARCHITECTURAL LAYERS
// ============================================================
//
// Elite X Notes should be understood as:
//
//
//     ┌───────────────────────────────────────────┐
//     │             PRESENTATION                  │
//     │                                           │
//     │ Notes Page                                │
//     │ Tiptap Editor                             │
//     │ Trade Selector                            │
//     └─────────────────────┬─────────────────────┘
//                           │
//                           ↓
//     ┌───────────────────────────────────────────┐
//     │             DOMAIN                        │
//     │                                           │
//     │ Note                                      │
//     │ NoteTradeLink                             │
//     │ NoteAttachment                            │
//     └─────────────────────┬─────────────────────┘
//                           │
//                           ↓
//     ┌───────────────────────────────────────────┐
//     │             PERSISTENCE                   │
//     │                                           │
//     │ supabaseNoteStorage                       │
//     │ Supabase notes                            │
//     │ Supabase note_trades                      │
//     │ Future note_attachments                   │
//     └─────────────────────┬─────────────────────┘
//                           │
//                           ↓
//     ┌───────────────────────────────────────────┐
//     │             SECURITY                      │
//     │                                           │
//     │ Supabase Auth                             │
//     │ Row Level Security                        │
//     │ Ownership constraints                     │
//     └───────────────────────────────────────────┘
//
// ============================================================
// CANONICAL FILE MAP
// ============================================================
//
// Domain:
//
//     types/note.ts
//
// Notes page:
//
//     app/notes/page.tsx
//
// Rich text editor:
//
//     components/notes/TiptapEditor.tsx
//
// Trade selector:
//
//     components/notes/NoteTradeSelector.tsx
//
// Cloud persistence:
//
//     lib/storage/supabaseNoteStorage.ts
//
// Legacy browser persistence:
//
//     lib/storage/noteStorage.ts
//
// Canonical Trade domain:
//
//     types/trade.ts
//
// Canonical execution persistence:
//
//     lib/storage/supabaseExecutionStorage.ts
//
// Trade reconstruction:
//
//     lib/parsers/pairTrades.ts
//
// ============================================================
// CURRENT PRODUCTION DATA FLOW
// ============================================================
//
// NOTES:
//
//     User
//       ↓
//     /notes
//       ↓
//     NotesPage
//       ↓
//     supabaseNoteStorage
//       ↓
//     Supabase
//
// TRADE REFERENCES:
//
//     Supabase executions
//       ↓
//     loadExecutionsFromSupabase()
//       ↓
//     pairTrades()
//       ↓
//     Canonical Trade[]
//       ↓
//     NoteTradeSelector
//       ↓
//     NoteTradeLink
//       ↓
//     Supabase note_trades
//
// RICH TEXT:
//
//     TiptapEditor
//       ↓
//     HTML string
//       ↓
//     Note.content
//       ↓
//     Supabase notes.content
//
// ============================================================
// CURRENT STABILIZATION STATUS
// ============================================================
//
// Current milestone:
//
//     NOTES FOUNDATION STABILIZED
//
// Verified capabilities:
//
//     ✓ Notes load from Supabase
//     ✓ Notes create in Supabase
//     ✓ Notes update in Supabase
//     ✓ Notes delete from Supabase
//     ✓ Rich-text content persistence
//     ✓ Trade search
//     ✓ Multiple Trade attachments
//     ✓ Trade removal
//     ✓ Trade relationships persist through note_trades
//     ✓ TypeScript build passes
//     ✓ Canonical Trade data remains separate
//     ✓ Notes do not mutate execution data
//
// ============================================================
// BUILD VERIFICATION
// ============================================================
//
// Production build command:
//
//     npm run build
//
// Current status:
//
//     PASS
//
// Next.js:
//
//     16.2.6
//
// TypeScript:
//
//     PASS
//
// Notes domain:
//
//     tradeLinks and attachments are now included in Note
//     object construction where required.
//
// ============================================================
// LONG-TERM ENGINEERING RULES
// ============================================================
//
// RULE 01
//
// Notes are behavioral metadata.
//
// Never turn them into accounting truth.
//
// RULE 02
//
// Trades are referenced by ID.
//
// Do not duplicate canonical Trade objects inside Notes.
//
// RULE 03
//
// Executions remain the source of truth.
//
// Notes must never mutate executions.
//
// RULE 04
//
// Trade reconstruction remains deterministic.
//
// Notes must not influence reconstruction.
//
// RULE 05
//
// Supabase is the current cloud persistence layer.
//
// Do not introduce another competing cloud source of truth.
//
// RULE 06
//
// RLS is the final security boundary.
//
// Client-side ownership checks are defense-in-depth only.
//
// RULE 07
//
// Keep editor logic isolated.
//
// Do not move Tiptap internals into NotesPage.
//
// RULE 08
//
// Keep persistence logic isolated.
//
// Do not put Supabase queries directly into presentation
// components unless there is a deliberate architectural reason.
//
// RULE 09
//
// Preserve Trade ID stability.
//
// Notes depend on Trade identity.
//
// RULE 10
//
// Database constraints should enforce relationship integrity.
//
// Do not rely exclusively on UI duplicate prevention.
//
// RULE 11
//
// Avoid N+1 queries.
//
// Load relationships in batches.
//
// RULE 12
//
// Rich-text persistence should eventually be debounced.
//
// Do not sacrifice data integrity for optimization.
//
// RULE 13
//
// Attachments are a future extension.
//
// Do not partially implement attachment persistence without
// proper storage, ownership, and security architecture.
//
// RULE 14
//
// Behavioral metadata may eventually power analytics or AI,
// but it must remain downstream from canonical accounting.
//
// RULE 15
//
// Any future Notes feature must preserve this boundary:
//
//
//     CANONICAL ACCOUNTING
//              │
//              │
//              ▼
//        EXECUTIONS
//              ↓
//        TRADE REBUILD
//              ↓
//          TRADES
//              │
//              │ reference only
//              ▼
//     ┌──────────────────────┐
//     │ BEHAVIORAL WORKSPACE  │
//     │                      │
//     │ Notes                │
//     │ Calendar Journaling  │
//     │ Behavioral Metadata  │
//     │ Future AI            │
//     └──────────────────────┘
//
// The behavioral workspace may consume canonical trading data,
// but canonical accounting must never depend on behavioral
// workspace data.
//
// ============================================================
// END OF NOTES MASTER ARCHITECTURE
// ============================================================
```
