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