"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn(
  `
    w-[285px]
    h-auto

    text-white
  `,
  defaultClassNames.root
),
        months: cn(
  "relative flex flex-col gap-2",
  defaultClassNames.months
),

month: cn(
  "flex w-full flex-col gap-2 scale-[1]",
  defaultClassNames.month
),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
       button_previous: cn(
  buttonVariants({ variant: buttonVariant }),
  `
    z-50

    h-8
    w-8

    p-0

    text-white

    hover:bg-white/10
  `,
  defaultClassNames.button_previous
),

button_next: cn(
  buttonVariants({ variant: buttonVariant }),
  `
    z-50

    h-8
    w-8

    p-0

    text-white

    hover:bg-white/10
  `,
  defaultClassNames.button_next
),
        month_caption: cn(
  "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
  "text-white",
  defaultClassNames.month_caption
),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
  "text-[24px] font-semibold text-white select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
day: cn(
  "group/day relative aspect-square h-full w-full p-0 text-center select-none",
  defaultClassNames.day
),
      range_start: cn(
  "relative isolate z-0 bg-transparent",
  defaultClassNames.range_start
),
range_middle: cn(
  "!bg-transparent",
  "!rounded-none"
),
range_end: cn(
  "relative isolate z-0 bg-transparent",
  defaultClassNames.range_end
),
        today: cn(
  "text-white",
  defaultClassNames.today
),
       outside: cn(
  "invisible",
  defaultClassNames.outside
),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
className={cn(
  `
    relative
    isolate
    z-10
    flex
    aspect-square
    size-auto
    w-full
    min-w-(--cell-size)
    flex-col
    gap-1
    border-0
    leading-none
    font-normal

    group-data-[focused=true]/day:relative
    group-data-[focused=true]/day:z-10
    
 

data-[range-end=true]:rounded-full
data-[range-end=true]:bg-white
data-[range-end=true]:hover:bg-white
data-[range-end=true]:text-black
data-[range-end=true]:w-[32px]
data-[range-end=true]:h-[32px]

data-[range-middle=true]:rounded-full
data-[range-middle=true]:bg-[#3a3a3a]
data-[range-middle=true]:hover:bg-[#3a3a3a]
data-[range-middle=true]:w-[32px]
data-[range-middle=true]:h-[32px]
[&[data-range-middle="true"]>span]:text-white

data-[range-start=true]:rounded-full
data-[range-start=true]:bg-white
data-[range-start=true]:hover:bg-white
data-[range-start=true]:text-black
data-[range-start=true]:w-[32px]
data-[range-start=true]:h-[32px]

    data-[selected-single=true]:bg-primary
    data-[selected-single=true]:text-primary-foreground

    hover:bg-transparent
dark:hover:bg-transparent
hover:bg-transparent
hover:text-white
dark:hover:bg-transparent
dark:hover:text-white
hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.65)]
hover:scale-[1.08]
transition-transform
duration-150

data-[range-middle=true]:hover:!bg-[#3a3a3a]
data-[range-middle=true]:hover:!text-white

data-[range-start=true]:hover:!bg-white
data-[range-start=true]:hover:!text-black

data-[range-end=true]:hover:!bg-white
data-[range-end=true]:hover:!text-black

focus-visible:ring-0
focus-visible:ring-offset-0

[&>span]:text-[15px]
[&>span]:opacity-70


  `,
  defaultClassNames.day,
  className
)}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
