"use client";

import * as Select from "@radix-ui/react-select";

import {
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type EliteSelectOption = {
  value: string;
  label: string;
  icon?: string;
};

type EliteSelectProps = {
  value: string;

  options: EliteSelectOption[];

  onChange: (
    value: string
  ) => void;

  width?: string;
};

export default function EliteSelect({
  value,
  options,
  onChange,
  width = "w-[90px]",
}: EliteSelectProps) {

  return (

    <Select.Root
      value={value}
      onValueChange={onChange}
    >

      {/* Trigger */}

      <Select.Trigger
        className={`
          ${width}

          flex
          items-center
          justify-between
          gap-2

          bg-transparent

          text-[12px]
          font-medium
          text-slate-200

          outline-none

          transition-all
          duration-200

          data-[state=open]:text-white
        `}
      >

       <div className="flex items-center gap-2 translate-x-4  translate-y-1">

          {options.find(
            (option) =>
              option.value === value
          )?.icon && (

            <span className="text-[15px]">
              {
                options.find(
                  (option) =>
                    option.value === value
                )?.icon
              }
            </span>

          )}

          <span className="translate-x-0">
  {value}
</span>

        </div>

        <Select.Icon
  className="translate-y-[4px]"
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
    className="
      z-[99999]

      min-w-[100px]

      overflow-hidden

      rounded-xl
      border
      border-white/[0.08]

      bg-[#0B1625]

      shadow-[0_16px_40px_rgba(0,0,0,0.45)]

      animate-in
      fade-in
      zoom-in-95

      duration-150
    "
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
      className="p-1.5"
    >

      {options.map((option) => (

        <Select.Item
  key={option.value}
  value={option.value}
  className="
    relative
    flex
    cursor-pointer
    select-none
    items-center
    justify-center

    rounded-lg

    px-3
    py-2.5

    text-slate-300
    text-[12px]
    font-medium

    outline-none

    transition-colors
    duration-150

    data-[highlighted]:bg-blue-500/15
    data-[highlighted]:text-slate-100

    data-[state=checked]:bg-blue-500/10
    data-[state=checked]:text-white
  "
>

          <div className="flex items-center gap-2">

            {option.icon && (
              <span className="text-[15px]">
                {option.icon}
              </span>
            )}

            <Select.ItemText asChild>
  <span className="text-[12px] font-medium text-slate-200">
    {option.label}
  </span>
</Select.ItemText>

          </div>

          <Select.ItemIndicator>

            <Check
              size={14}
              className="text-blue-400"
            />

          </Select.ItemIndicator>

        </Select.Item>

      ))}

    </Select.Viewport>

    <Select.ScrollDownButton
      className="
        flex
        h-7
        items-center
        justify-center

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