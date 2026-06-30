# EliteX Trading OS — Receipt Upload System (V1 Master Notes)

## Status

**V1 COMPLETE**

The Receipt Upload System is fully implemented and production-ready for V1. It provides secure receipt storage, viewing, replacement, and deletion using Supabase Storage with a private bucket and Row Level Security (RLS).

---

# Design Philosophy

The receipt system follows a **Save-first architecture**.

**Receipts are NOT uploaded when selected.**

Instead:

1. User selects a receipt.
2. Receipt is temporarily stored in React state.
3. User reviews the expense.
4. Receipt uploads only after the user presses **Save**.
5. Expense record is then saved with the receipt path.

This prevents orphaned files when a user closes the drawer or cancels the expense before saving.

---

# Upload Flow

```
User selects receipt
        ↓
Store File object in React state
        ↓
NO upload yet
        ↓
User presses Save
        ↓
Upload receipt to Supabase Storage
        ↓
Save returned file path
        ↓
Save expense record
        ↓
Done
```

---

# Storage Architecture

Storage Provider:

* Supabase Storage

Bucket Name:

* receipts

Bucket Visibility:

* Private

Folder Structure:

```
receipts/

└── {user_id}/
      receipt1.pdf
      receipt2.png
      receipt3.jpg
```

Each authenticated user receives their own folder named using:

```
auth.uid()
```

This ensures complete isolation between users.

---

# Security

Bucket is private.

Users NEVER receive permanent public URLs.

Viewing receipts uses:

* Signed URLs

Signed URL Lifetime:

* 60 seconds

This allows temporary secure viewing without exposing storage publicly.

---

# Storage Policies (RLS)

Policies implemented:

✓ INSERT

Allows authenticated users to upload into their own folder.

---

✓ SELECT

Allows users to read only files inside their own folder.

Required for:

* View Receipt
* Signed URLs

---

✓ UPDATE

Future-proof.

Allows updating objects inside the user's own folder.

---

✓ DELETE

Allows deleting files from the user's own folder.

Used when removing receipts.

---

Folder Isolation Rule:

```
auth.uid() == storage.foldername(name)[1]
```

Users can never access another user's receipts.

---

# Database

Expenses table stores:

```
receipt_url
```

Example:

```
60617ddf-15b4-4b07-a87c-38e80cdd2190/
1782693992302-Invoice.pdf
```

Only the storage path is saved.

No public URLs are stored.

---

# React State

Receipt system uses:

```
receiptFile
```

Stores selected File object before Save.

---

```
receiptUrl
```

Stores existing storage path loaded from database.

---

# New Expense Workflow

Drawer opens

↓

No receipt attached

↓

User selects file

↓

Upload box changes to:

```
Receipt Selected

✓ Ready to Upload
```

↓

User presses Save

↓

Receipt uploads

↓

Expense saved

↓

Drawer closes

---

# Edit Expense Workflow

Expense loads

↓

receipt_url loaded from database

↓

Upload box displays:

```
Receipt Attached

View Receipt

Remove Receipt
```

User may:

* View
* Replace
* Remove

---

# View Receipt

Uses:

```
createSignedUrl()
```

Flow:

```
receipt_url
      ↓
createSignedUrl()
      ↓
Temporary URL
      ↓
window.open()
```

Supports:

* PNG
* JPG
* JPEG
* PDF

---

# Replace Receipt

User selects another file.

New file remains only in React state until Save.

After Save:

* new receipt uploads
* receipt_url updated

No upload occurs before Save.

---

# Remove Receipt

User clicks:

```
✕ Remove
```

Confirmation appears.

If confirmed:

Storage:

```
supabase.storage.remove()
```

Database:

```
receipt_url = null
```

UI resets.

Works for:

* Existing expenses
* Newly selected receipts

---

# UI States

State 1

No Receipt

```
Drag & Drop Receipt

JPG • PNG • PDF
```

---

State 2

Receipt Selected

```
Receipt Selected

✓ Ready to Upload
```

Appears before Save.

---

State 3

Receipt Attached

```
Receipt Attached

👁 View

✕ Remove
```

Appears when editing existing expenses.

---

# Supported File Types

Current V1:

* JPG
* JPEG
* PNG
* PDF

Configured via:

```
accept=".jpg,.jpeg,.png,.pdf"
```

---

# V1 Advantages

✓ Private bucket

✓ Secure signed URLs

✓ Save-first upload architecture

✓ No unnecessary uploads before Save

✓ View existing receipts

✓ Replace receipts

✓ Remove receipts

✓ Full Supabase integration

✓ User folder isolation

✓ Production-ready security

---

# Future Improvements (V2)

Potential enhancements:

* Display original filename instead of generic "Receipt Attached"
* Thumbnail preview for images
* PDF icon preview
* Drag & Drop upload support
* Upload progress indicator
* Multiple receipt attachments
* Receipt compression before upload
* OCR (extract vendor, amount, date automatically)
* AI receipt parsing
* Receipt search/filtering
* Automatic cleanup of replaced/orphaned files if desired
* Receipt download option

None of the above are required for V1.

---

# Final Status

Receipt Upload System is officially **V1 COMPLETE**.

The implementation provides secure, private, production-ready receipt management with full CRUD support, integrated into the Expenses module and backed by Supabase Storage using private buckets, signed URLs, and Row Level Security.


==========================================
ELITEX TRADING OS
FUTURE ROADMAP — UNLIMITED EXPENSE ATTACHMENTS (V2)
==========================================

STATUS
------
Deferred to V2.

The current V1 implementation supports ONE attachment per expense using the `receipt_url` column. This implementation is intentionally kept because it is simple, secure, stable, and production-ready.

No further work is required for V1.

--------------------------------------------------

WHY THIS WAS DEFERRED
---------------------

A simple "add another receipt" solution (receipt_url_2, receipt_url_3, etc.) was intentionally rejected because it creates technical debt and does not scale.

Instead, V2 will replace the entire receipt architecture with a proper unlimited attachment system.

--------------------------------------------------

CURRENT V1 ARCHITECTURE
-----------------------

expenses table

- receipt_url

↓

One expense

↓

One uploaded file

Storage Bucket:

receipts/

user-id/

receipt.png

Security:

✔ Private Storage Bucket
✔ Signed URLs
✔ User Folder Isolation
✔ RLS Policies

This architecture is complete and should NOT be modified.

--------------------------------------------------

V2 ARCHITECTURE
---------------

The expenses table should NO LONGER store receipt_url.

Instead create a new table.

expense_attachments

Fields:

id (UUID)

expense_id
(Foreign Key → expenses.id)

storage_path

file_name

file_size

mime_type

uploaded_at

created_at

Now one expense can contain unlimited files.

Example:

Expense

├── receipt.pdf

├── invoice.pdf

├── screenshot.png

├── payment_confirmation.pdf

└── statement.pdf

Unlimited attachments.

--------------------------------------------------

DATABASE DESIGN RULE
--------------------

NEVER implement:

receipt_url_2

receipt_url_3

receipt_url_4

etc.

Always normalize using a dedicated attachment table.

--------------------------------------------------

STORAGE
-------

Continue using the existing private Supabase Storage bucket.

No storage architecture changes are required.

Reuse:

Private Bucket

Signed URLs

User Folder Structure

Existing RLS Policies

--------------------------------------------------

UI CHANGES
----------

Rename the feature.

Instead of:

Receipt

Use:

Attachments

Reason:

Users may upload:

Receipt

Invoice

Credit Card Statement

Tax Document

Screenshot

PDF

Email Confirmation

The feature is no longer limited to receipts.

--------------------------------------------------

ADD / EDIT EXPENSE DRAWER
-------------------------

Replace:

Drag & Drop Receipt

With:

Attachments

Display attached files:

receipt.pdf

invoice.pdf

payment.png

statement.pdf

Buttons:

View

Delete

Add Another File

Support unlimited uploads.

--------------------------------------------------

VIEW EXPENSE DRAWER
-------------------

Display:

Attachments

receipt.pdf

invoice.pdf

statement.pdf

payment.png

Each attachment opens using a signed URL.

--------------------------------------------------

MANUAL EXPENSES TABLE
---------------------

Do NOT show attachment count.

Continue using ONE paperclip icon.

Logic:

0 attachments

↓

Gray Paperclip

1 or more attachments

↓

Blue Paperclip

This keeps the table clean.

--------------------------------------------------

SHARED HELPERS
--------------

Create reusable helpers.

uploadExpenseAttachment()

deleteExpenseAttachment()

viewExpenseAttachment()

loadExpenseAttachments()

replaceExpenseAttachment()

Avoid duplicate upload/view/delete logic.

--------------------------------------------------

MIGRATION PLAN
--------------

Current V1:

expenses.receipt_url

Future migration:

For every existing expense:

Create one record inside:

expense_attachments

using the existing receipt_url.

After successful migration:

receipt_url can eventually be removed from the expenses table.

--------------------------------------------------

IMPLEMENTATION SIZE
-------------------

Database:
Medium

Storage:
Minimal (reuse existing bucket)

Backend:
Medium

UI:
Medium

Migration:
Small

Testing:
Medium

Estimated effort:

One dedicated development session
(~4–8 hours)

--------------------------------------------------

FINAL DECISION
--------------

This feature is intentionally postponed until V2.

The current single-attachment implementation is secure, stable, and sufficient for V1.

When V2 begins, replace the single `receipt_url` architecture with a dedicated `expense_attachments` table supporting unlimited files.

Do NOT build temporary solutions such as receipt_url_2 or receipt_url_3.

The long-term goal is a fully normalized, scalable attachment system capable of storing receipts, invoices, statements, screenshots, PDFs, and any other supporting business documents while reusing the existing private Supabase Storage bucket and signed URL security model.