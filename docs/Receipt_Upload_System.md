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
