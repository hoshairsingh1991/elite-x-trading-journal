"use client";

import {
  useState,
  type ReactNode,
} from "react";

import {
  Bold,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Italic,
  Link,
  List,
  Save,
  Underline,
} from "lucide-react";



export default function TradeNotesTab() {
  const [note, setNote] =
    useState("");



  const [savedLocally, setSavedLocally] =
    useState(false);

const canSave =
  note.trim().length > 0;



  function handleSave() {
    if (!canSave) {
      return;
    }

    setSavedLocally(true);
  }

  return (
<div
  className="
    flex
    h-full
    min-h-0
    w-full
    flex-col
    gap-3
    px-[14px]
    pb-5
  "
>
      {/* TRADE NOTES */}

<section
  className="
    flex
    h-[480px]
    shrink-0
    flex-col
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    px-5
    py-5
  "
>
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
<div
  className="
    flex
    items-center
    gap-2.5
    translate-x-[8px]
    translate-y-[6px]
  "
>
            <FileText
              size={17}
              strokeWidth={1.9}
              className="text-slate-200"
            />

            <h4
              className="
                text-[13px]
                font-semibold
                text-slate-100
              "
            >
              Trade Notes
            </h4>
          </div>

<div
  className="
    flex
    items-center
    gap-1.5
    text-[10px]
    translate-x-[-8px]
    translate-y-[6px]
  "
>
            <span
              className={
                savedLocally
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {savedLocally
                ? "Saved locally"
                : "Draft"}
            </span>

            <CheckCircle2
              size={15}
              strokeWidth={1.8}
              className={
                savedLocally
                  ? "text-emerald-400"
                  : "text-slate-600"
              }
            />
          </div>
        </div>

<div
  className="
    mt-3
    flex
    h-[400px]
    shrink-0
    w-[calc(100%-14px)]
    flex-col
    translate-x-[7px]
    translate-y-[12px]
    overflow-hidden
    rounded-[8px]
    border
    border-white/[0.08]
    bg-[#091521]
  "
>
  {/* EDITOR TOOLBAR */}

  <div
    className="
      flex
      h-10
      items-center
      gap-1.5
      border-b
      border-white/[0.06]
      px-2.5
      translate-x-[8px]
    "
  >
    <button
      type="button"
      title="Text style"
      className="
        flex
        h-7
        w-[80px]
        items-center
        justify-between
        rounded-[6px]
        border
        border-white/[0.08]
        px-2
        text-[11px]
        text-slate-300
      "
    >
      <span className="relative left-[8px]">
        Normal
      </span>

      <ChevronDown
        size={14}
        className="text-slate-400"
      />
    </button>

    <div
      className="
        ml-1
        flex
        items-center
        gap-0.5
      "
    >
      <ToolbarButton label="Bold">
        <Bold size={15} />
      </ToolbarButton>

      <ToolbarButton label="Italic">
        <Italic size={16} />
      </ToolbarButton>

      <ToolbarButton label="Underline">
        <Underline size={15} />
      </ToolbarButton>
    </div>

    <span
      className="
        mx-1
        h-5
        w-px
        bg-white/[0.06]
      "
    />

    <ToolbarButton label="Bulleted list">
      <List size={16} />
    </ToolbarButton>

    <ToolbarButton label="Add link">
      <Link size={16} />
    </ToolbarButton>
  </div>

<div
  className="
    box-border
    min-h-0
    flex-1
    w-full
  "
  style={{
    padding: "10px",
  }}
>
<textarea
  value={note}
    onChange={(event) => {
      setNote(
        event.target.value
      );

      setSavedLocally(false);
    }}
    placeholder="Write your notes about this trade..."
    className="
      h-full
      w-full
      resize-none
      bg-transparent
      px-0
      py-0
      text-[12px]
      leading-5
      text-slate-200
      outline-none
      placeholder:text-slate-500
    "
  />
</div>
</div>


<div
  className="
    mt-3
    flex
    justify-end
    translate-x-[-10px]
    translate-y-[20px]
  "
>
<button
  type="button"
  onClick={handleSave}
  disabled={!canSave}
  className="
    flex
    h-8
    w-[100px]
    items-center
    justify-center
    gap-2
    rounded-[7px]
    bg-blue-500
    px-3.5
    text-[11px]
    font-semibold
    text-white
    transition
    hover:bg-blue-400
    disabled:cursor-not-allowed
    disabled:opacity-45
  "
>
  <Save
    size={15}
    strokeWidth={2}
  />

  Save Note
</button>
        </div>
      </section>

      
{/* PAST NOTES */}

<section
  className="
    h-[80px]
    shrink-0
    rounded-[8px]
    border
    border-white/[0.06]
    bg-[#0b1220]
    p-4
  "
>
  <div
    className="
      flex
      items-center
      justify-between
      gap-3
    "
  >
    <div
      className="
        flex
        items-center
        gap-2.5
        translate-x-[8px]
        translate-y-[6px]
      "
    >
      <FileText
        size={17}
        strokeWidth={1.9}
        className="text-slate-200"
      />

      <h4
        className="
          text-[13px]
          font-semibold
          text-slate-100
        "
      >
        Past Notes
      </h4>
    </div>

    <button
      type="button"
      title="Past Notes will be connected later"
      className="
        flex
        items-center
        gap-1
        text-[11px]
        font-medium
        text-blue-400
        transition
        hover:text-blue-300
        translate-x-[-8px]
        translate-y-[6px]
      "
    >
      View All

      <ChevronRight
        size={14}
        strokeWidth={2}
      />
    </button>
  </div>

<div
  className="
    mt-5
    w-[calc(100%-14px)]
    rounded-[7px]
    border
    border-dashed
    border-white/[0.08]
    px-4
    py-5
    text-center
    translate-x-[7px]
    translate-y-[16px]
  "
>
    <p
      className="
        text-[11px]
        font-medium
        text-slate-400
      "
    >
      No saved notes yet
    </p>

    <p
      className="
        mt-1
        text-[10px]
        leading-4
        text-slate-500
      "
    >
      Saved trade notes will appear here.
    </p>
  </div>
</section>
    </div>
  );
}

function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={`${label} will be added later`}
      aria-label={label}
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-[5px]
        text-slate-300
        transition
        hover:bg-white/[0.06]
        hover:text-white
      "
    >
      {children}
    </button>
  );
}