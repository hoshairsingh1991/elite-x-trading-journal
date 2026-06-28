"use client";

import * as Select from "@radix-ui/react-select";

import CurrencyFlag from "@/components/ui/CurrencyFlag";

import {
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { ReactNode } from "react";

export type EliteSelectOption = {
  value: string;
  label: string;

  icon?: ReactNode;
};

type EliteSelectProps = {
  value: string;
  options: EliteSelectOption[];
  onChange: (value: string) => void;

  width?: string;
  height?: string;
  variant?: "compact" | "form";

  placeholder?: string;
  disabled?: boolean;
};

export default function EliteSelect({
  value,
  options,
  onChange,
  width = "w-[90px]",
  height = "h-[40px]",
  variant = "compact",

  placeholder = "Select...",
  disabled = false,
}: EliteSelectProps) {

  const selectedOption = options.find(
  (option) => option.value === value
);
console.log("value:", value);
console.log("selected:", selectedOption);
  return (

<Select.Root
  value={value}
  onValueChange={onChange}
  disabled={disabled}
>

      {/* Trigger */}

<Select.Trigger
  className={`
    ${width}
    ${height}

    flex
    items-center
    ${variant === "form" ? "justify-center" : "justify-between"}
    gap-2

    ${
      variant === "form"
        ? `
          rounded-xl
          border
          border-white/10
          bg-white/[0.03]
          px-4
        `
        : `
          bg-transparent
        `
    }

    text-[12px]
    font-medium
    text-slate-200

outline-none

${disabled ? "cursor-not-allowed opacity-50" : ""}

transition-all
duration-200

hover:border-white/20

    data-[state=open]:text-white
  `}
>

<div
  className={`
    flex
    ${
      variant === "form"
        ? "items-center justify-center mx-auto"
        : "w-full items-center"
    }

    gap-2

    ${
      variant === "form"
        ? ""
        : "translate-x-4 translate-y-1"
    }
  `}
>

{selectedOption?.icon ? (
  selectedOption.icon
) : (
  ["USD", "CAD", "EUR", "GBP", "JPY", "INR"].includes(value) && (
    <CurrencyFlag currency={value} />
  )
)}

<span className="text-[12px] font-medium text-slate-200">
  {selectedOption?.label ?? value}
</span>

</div>

       <Select.Icon
  className={
    variant === "form"
      ? "absolute right-4 top-1/2 translate-y-1"
      : "translate-y-[2px]"
  }
>

  <ChevronDown
    size={14}
    className="text-slate-500"
  />

</Select.Icon>

      </Select.Trigger>

      <Select.Portal>

<Select.Content
  position="popper"
  sideOffset={8}
  className={`
    z-[99999]

    ${
      variant === "form"
        ? "w-[var(--radix-select-trigger-width)]"
        : "min-w-[100px]"
    }

    max-h-[280px]

    overflow-hidden

    rounded-2xl
    border
    border-white/[0.08]

    bg-[#0B1625]

    shadow-[0_16px_40px_rgba(0,0,0,0.45)]
  `}
>

    <Select.ScrollUpButton
      className="
        flex
        h-7
        items-center
        justify-center

        text-slate-400
      "
    >
      <ChevronUp size={14} />
    </Select.ScrollUpButton>

<Select.Viewport
  className="p-2 space-y-1"
>

      {options.map((option) => (

<Select.Item
  key={option.value}
  value={option.value}
className="
  relative
  flex
  justify-center
  cursor-pointer
  select-none
  items-center

  rounded-xl

    px-4
    py-3.5

    text-slate-300
    text-[13px]
    font-medium

    outline-none

    transition-all
    duration-150

    data-[highlighted]:bg-blue-500/15
    data-[highlighted]:text-white

    data-[state=checked]:bg-blue-500/10
    data-[state=checked]:text-white
  "
>

          <div className="mx-auto flex items-center gap-3">

{option.icon ? (
  option.icon
) : (
  ["USD", "CAD", "EUR", "GBP", "JPY", "INR"].includes(option.value) && (
    <CurrencyFlag currency={option.value} />
  )
)}

<Select.ItemText asChild>
  <span className="text-[12px] font-medium text-slate-200">
    {option.label}
  </span>
</Select.ItemText>

          </div>

{variant === "form" && (
  <Select.ItemIndicator className="absolute right-4 top-1/2 -translate-y-1/2">
    <Check
      size={14}
      className="text-blue-400"
    />
  </Select.ItemIndicator>
)}

        </Select.Item>

      ))}

    </Select.Viewport>

    <Select.ScrollDownButton
      className="
        flex
        h-7
        items-center
        justify-between

        text-slate-400
      "
    >
      <ChevronDown size={14} />
    </Select.ScrollDownButton>

  </Select.Content>

</Select.Portal>

    </Select.Root>

  );

}