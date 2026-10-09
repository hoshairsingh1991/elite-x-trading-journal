# Elite X — Reusable Delete Confirmation Modal

## 1. Purpose

This is the standard custom delete confirmation window for Elite X. It replaces the browser's native `window.confirm()` dialog with a centered, dark-themed modal.

The UI was tuned manually, so preserve its current styling and positioning when reusing it. Do not redesign it or replace its positional classes without a specific reason.

## 2. Visual design specification

- **Overlay:** Full-screen, fixed positioning with a dark backdrop and blur.
- **Modal card:** Maximum width 320px, minimum height 220px, 8px corner radius, dark blue gradient, subtle border and shadow.
- **Delete icon:** Red trash icon centered inside a 40 × 40px circle.
- **Title:** “Delete this note?” — 20px, bold, white, centered.
- **Warning:** 13px text with 22px line height, centered in muted slate.
- **Divider:** Subtle horizontal gradient line.
- **Cancel button:** 100 × 36px, 12px text, understated dark styling.
- **Delete button:** 140 × 36px, 12px text, red gradient, white trash icon, hover glow.
- **Animation:** Modal fade-in and zoom-in. After successful deletion, the existing note-card deletion animation runs.

## 3. Exact reusable modal JSX

Copy this UI block when another page needs the same design. It includes the overlay, modal card, icon, warning, divider, and action buttons.

```tsx
{/* DELETE CONFIRMATION MODAL */}
{pendingDeleteNoteId !== null &&
  createPortal(
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/75
        p-4
        backdrop-blur-[5px]
      "
      onClick={() => {
        if (!isConfirmingDelete) {
          setPendingDeleteNoteId(null);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-note-modal-title"
        className="
          w-full
          max-w-[320px]
          min-h-[220px]
          rounded-[8px]
          border
          border-slate-700/70
          bg-gradient-to-br
          from-[#0d1625]
          to-[#080e19]
          p-6
          shadow-[0_24px_80px_rgba(0,0,0,0.65)]
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* CENTERED DELETE ICON */}
        <div className="flex justify-center">
          <div
            className="
              relative
              left-[0px]
              top-[16px]
              flex
              h-[40px]
              w-[40px]
              items-center
              justify-center
              rounded-full
              border
              border-red-500/40
              bg-red-500/[0.09]
              text-red-400
              shadow-[0_0_35px_rgba(239,68,68,0.10)]
            "
          >
            <Trash2 size={24} strokeWidth={1.8} />
          </div>
        </div>

        {/* CENTERED TITLE */}
        <h3
          id="delete-note-modal-title"
          className="
            relative
            left-[0px]
            top-[30px]
            mt-6
            text-center
            text-[20px]
            font-semibold
            tracking-tight
            text-white
          "
        >
          Delete this note?
        </h3>

        {/* WARNING MESSAGE */}
        <p
          className="
            relative
            left-[0px]
            top-[36px]
            mx-auto
            mt-4
            max-w-[320px]
            text-center
            text-[13px]
            leading-[22px]
            text-slate-400
          "
        >
          This note will be permanently deleted.
          <span className="block">
            This action cannot be undone.
          </span>
        </p>

        {/* DIVIDER */}
        <div
          className="
            relative
            top-[44px]
            mt-7
            h-px
            w-full
            bg-gradient-to-r
            from-transparent
            via-slate-700/70
            to-transparent
          "
        />

        {/* ACTION BUTTONS */}
        <div className="relative left-[30px] top-[56px] mt-6 flex gap-3 sm:gap-4">
          {/* CANCEL BUTTON */}
          <button
            type="button"
            onClick={() => setPendingDeleteNoteId(null)}
            disabled={isConfirmingDelete}
            className="
              flex
              h-[36px]
              w-[100px]
              shrink-0
              items-center
              justify-center
              rounded-[8px]
              border
              border-slate-700
              bg-white/[0.02]
              px-3
              text-[12px]
              font-medium
              text-slate-300
              transition-all
              duration-200
              hover:border-slate-500
              hover:bg-white/[0.06]
              hover:text-white
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          {/* DELETE BUTTON */}
          <button
            type="button"
            onClick={() => void confirmDeleteNote()}
            disabled={isConfirmingDelete}
            className="
              flex
              h-[36px]
              w-[140px]
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-[8px]
              border
              border-red-400/30
              bg-gradient-to-r
              from-red-600
              to-red-500
              px-3
              text-[12px]
              font-semibold
              text-white
              shadow-[0_4px_18px_rgba(239,68,68,0.15)]
              transition-all
              duration-200
              hover:from-red-500
              hover:to-red-400
              hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Trash2 size={17} strokeWidth={1.9} />
            {isConfirmingDelete
              ? "Deleting..."
              : "Delete note"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}
```

## 4. Required dependencies

The modal UI expects the following imports:

```tsx
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
```

If `Trash2` or `createPortal` is already imported in the target file, reuse the existing import instead of adding a duplicate.

The modal must also be inside a client-side React component.

## 5. Required state and handlers

The JSX is only the UI. Each page must connect it to its own delete workflow.

**Confirmation state:**

```tsx
const [pendingDeleteNoteId, setPendingDeleteNoteId] =
  useState<string | null>(null);

const [isConfirmingDelete, setIsConfirmingDelete] =
  useState(false);
```

**Open the modal:** Clicking the item's trash button should set the ID of the item to delete.

```tsx
function handleDelete(itemId: string) {
  if (isConfirmingDelete) {
    return;
  }

  setPendingDeleteNoteId(itemId);
}
```

**Confirm action:** The page must provide its own `confirmDeleteNote()` handler. It should perform the correct database deletion, handle failures, close the modal after success, and then trigger any item-removal animation. Do not reuse another feature's storage function or item types unless they genuinely match.

**Cancel action:** Clears `pendingDeleteNoteId` without deleting anything.

## 6. Reuse rules

When applying this modal to another page:

1. Copy the modal JSX and preserve the visual classes.
2. Connect `pendingDeleteNoteId` to the target page's item ID.
3. Connect `confirmDeleteNote()` to that page's own deletion logic.
4. Preserve that page's existing data model, storage layer, permissions, and deletion animation.
5. Avoid changing the modal's offsets, dimensions, font sizes, colors, or radius simply to reuse it.

**Important:** The fixed dimensions and manually tuned offsets describe the currently approved design. They are not a guarantee that every viewport will render identically. If a different page or screen size exposes a layout issue, adjust that instance deliberately rather than silently replacing the established design.

## 7. Current scope

This note documents the Delete Confirmation Modal UI and the integration contract only. It does not define a shared application-wide modal component, a new deletion service, database changes, or a replacement for existing page-specific deletion logic.