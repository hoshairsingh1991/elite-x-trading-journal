"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  RotateCcw,
  Info,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import UserMenuV2 from "@/components/layout/UserMenuV2";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// =====================================================
// TYPES
// =====================================================

type AccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "READ_ONLY"
  | "SUSPENDED";

type PlanType =
  | "TRIAL"
  | "BASIC"
  | "PRO"
  | "ELITE";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  registered: string;
  verified: boolean;
  status: AccountStatus;
  plan: PlanType | null;
  lastActive: string;
  entitlementSource: string;
  trialExpiration: string;
  notes: string;
}


// =====================================================
// MOCK DATA — UI PREVIEW ONLY
// =====================================================

const MOCK_USERS: AdminUser[] = [
  {
    id: "USR-1001",
    name: "Emily Carter",
    email: "emily@example.com",
    registered: "Oct 30, 2026",
    verified: true,
    status: "PENDING",
    plan: null,
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Awaiting administrator review.",
  },
  {
    id: "USR-1002",
    name: "Daniel Kim",
    email: "daniel@example.com",
    registered: "Oct 29, 2026",
    verified: false,
    status: "PENDING",
    plan: null,
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Email verification is still pending.",
  },
  {
    id: "USR-1003",
    name: "Marcus Reed",
    email: "marcus@example.com",
    registered: "Sep 18, 2026",
    verified: true,
    status: "ACTIVE",
    plan: "ELITE",
    lastActive: "Nov 02, 2026 12:42",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Active Elite account.",
  },
  {
    id: "USR-1004",
    name: "Sophie Laurent",
    email: "sophie@example.com",
    registered: "Sep 22, 2026",
    verified: true,
    status: "ACTIVE",
    plan: "PRO",
    lastActive: "Nov 01, 2026 18:25",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Active Pro account.",
  },
  {
    id: "USR-1005",
    name: "Noah Patel",
    email: "noah@example.com",
    registered: "Oct 20, 2026",
    verified: true,
    status: "ACTIVE",
    plan: "TRIAL",
    lastActive: "Nov 02, 2026 09:10",
    entitlementSource: "Trial grant",
    trialExpiration: "Nov 03, 2026",
    notes: "Currently using the Elite trial.",
  },
  {
    id: "USR-1006",
    name: "Olivia Chen",
    email: "olivia@example.com",
    registered: "Oct 10, 2026",
    verified: true,
    status: "READ_ONLY",
    plan: "TRIAL",
    lastActive: "Oct 25, 2026 16:30",
    entitlementSource: "Expired trial",
    trialExpiration: "Oct 24, 2026",
    notes: "Trial expired. Historical access only.",
  },
  {
    id: "USR-1007",
    name: "Ethan Brooks",
    email: "ethan@example.com",
    registered: "Sep 12, 2026",
    verified: true,
    status: "SUSPENDED",
    plan: "PRO",
    lastActive: "Oct 28, 2026 14:12",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Account suspended.",
  },
  {
    id: "USR-1008",
    name: "Ava Thompson",
    email: "ava@example.com",
    registered: "Oct 05, 2026",
    verified: true,
    status: "ACTIVE",
    plan: "BASIC",
    lastActive: "Nov 02, 2026 11:15",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Active Basic account.",
  },
  {
    id: "USR-1009",
    name: "Grace Wilson",
    email: "grace@example.com",
    registered: "Nov 01, 2026",
    verified: false,
    status: "PENDING",
    plan: null,
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "New registration awaiting email verification and administrator review.",
  },
{
  id: "USR-1011",
  name: "Isabella Morgan",
  email: "isabella@example.com",
  registered: "Nov 01, 2026",
  verified: true,
  status: "ACTIVE",
  plan: "PRO",
  lastActive: "Nov 02, 2026 14:10",
  entitlementSource: "Administrator grant",
  trialExpiration: "—",
  notes: "Active Pro account.",
},
{
  id: "USR-1012",
  name: "James Anderson",
  email: "james@example.com",
  registered: "Nov 01, 2026",
  verified: true,
  status: "PENDING",
  plan: null,
  lastActive: "Never",
  entitlementSource: "—",
  trialExpiration: "—",
  notes: "Awaiting administrator review.",
},
{
  id: "USR-1013",
  name: "Charlotte Davis",
  email: "charlotte@example.com",
  registered: "Oct 31, 2026",
  verified: true,
  status: "READ_ONLY",
  plan: "BASIC",
  lastActive: "Oct 31, 2026 16:45",
  entitlementSource: "Expired subscription",
  trialExpiration: "—",
  notes: "Read-only account.",
},
{
  id: "USR-1014",
  name: "Benjamin Scott",
  email: "benjamin@example.com",
  registered: "Oct 30, 2026",
  verified: true,
  status: "ACTIVE",
  plan: "ELITE",
  lastActive: "Nov 02, 2026 15:20",
  entitlementSource: "Administrator grant",
  trialExpiration: "—",
  notes: "Active Elite account.",
},
{
  id: "USR-1015",
  name: "Amelia Robinson",
  email: "amelia@example.com",
  registered: "Oct 29, 2026",
  verified: false,
  status: "SUSPENDED",
  plan: "PRO",
  lastActive: "Oct 29, 2026 10:15",
  entitlementSource: "Administrator grant",
  trialExpiration: "—",
  notes: "Account suspended pending review.",
},
];

// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG: Record<
  AccountStatus,
  {
    label: string;
    className: string;
    dotClass: string;
  }
> = {
  PENDING: {
    label: "Pending",
    className: "text-amber-400",
    dotClass: "bg-amber-400",
  },

  ACTIVE: {
    label: "Active",
    className: "text-emerald-400",
    dotClass: "bg-emerald-400",
  },

  READ_ONLY: {
    label: "Read-only",
    className: "text-blue-400",
    dotClass: "bg-blue-400",
  },

  SUSPENDED: {
    label: "Suspended",
    className: "text-red-400",
    dotClass: "bg-red-400",
  },
};

const PLAN_CONFIG: Record<
  PlanType,
  {
    label: string;
    className: string;
  }
> = {
  TRIAL: {
    label: "Trial",
    className: "text-purple-300",
  },

  BASIC: {
    label: "Basic",
    className: "text-slate-300",
  },

  PRO: {
    label: "Pro",
    className: "text-blue-300",
  },

  ELITE: {
    label: "Elite",
    className: "text-[#78A9FF]",
  },
};

// =====================================================
// HELPERS
// =====================================================

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getAvatarStyle(name: string) {
  const styles = [
    "border-blue-400/20 bg-blue-500/[0.13] text-blue-300",
    "border-emerald-400/20 bg-emerald-500/[0.12] text-emerald-300",
    "border-cyan-400/20 bg-cyan-500/[0.12] text-cyan-300",
    "border-purple-400/20 bg-purple-500/[0.12] text-purple-300",
    "border-amber-400/20 bg-amber-500/[0.12] text-amber-300",
  ];

  return styles[
    name.charCodeAt(0) % styles.length
  ];
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: AccountStatus;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
      />

      {config.label}
    </span>
  );
}

// =====================================================
// PLAN BADGE
// =====================================================

function PlanBadge({
  plan,
}: {
  plan: PlanType | null;
}) {
  if (!plan) {
    return (
      <span className="text-[11px] text-slate-500">
        —
      </span>
    );
  }

  const config = PLAN_CONFIG[plan];

  return (
    <span
      className={`inline-flex whitespace-nowrap text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// =====================================================
// KPI CARD
// =====================================================

function Sparkline({
  color,
  variant,
  offset = "",
  height = "",
}: {
  color: string;
  variant: number;
  offset?: string;
  height?: string;
}) {
  const paths = [
    "M0 29 C22 28 29 18 48 22 S80 13 98 17 S130 3 150 8",
    "M0 30 C20 29 29 26 48 24 S76 29 95 15 S123 8 150 3",
    "M0 29 C20 25 33 29 51 19 S80 20 98 12 S128 9 150 2",
    "M0 30 C20 30 33 16 52 22 S79 23 99 12 S130 15 150 4",
  ];

  return (
    <svg
      viewBox="0 0 150 36"
      preserveAspectRatio="none"
      className={`
        ml-auto
        block
        ${height || "h-[45px]"}
        w-[44%]
        opacity-40
        ${offset}
      `}
    >
      <defs>
        <linearGradient
          id={`admin-spark-${variant}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.45"
          />

          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path
        d={`${paths[variant]} L150 36 L0 36 Z`}
        fill={`url(#admin-spark-${variant})`}
      />

      <path
        d={paths[variant]}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}




type MetricCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: string;
  variant: number;

  valueColor?: "default" | "green" | "red" | "blue";
  subtitleColor?: "default" | "green" | "red" | "yellow";
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  variant,
  valueColor = "default",
  subtitleColor = "default",
}: MetricCardProps) {
  const valueClasses = {
    default: "text-white",
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };

  const subtitleClasses = {
    default: "text-slate-400",
    green: "text-emerald-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
  };

  const wavePaths = [
    "M0 85 C35 80 48 57 78 67 S125 49 160 31 S210 12 250 -5",
    "M0 85 C35 83 55 66 83 69 S126 57 155 34 S205 15 250 -5",
    "M0 85 C35 78 50 75 78 55 S122 57 157 32 S210 18 250 -5",
    "M0 85 C35 83 53 57 81 67 S127 48 160 34 S211 17 250 -5",
  ];

  return (
    <div
      className="
        group
        relative
        flex
        h-[106px]
        min-w-0
        items-center
        gap-3
        overflow-hidden
        rounded-[10px]
        border
        border-white/[0.07]
        px-4
        transition-all
        duration-200
        hover:-translate-y-[2px]
        hover:border-white/[0.14]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]
      "
      style={{
        background: `
          linear-gradient(
            125deg,
            ${accent}16 0%,
            ${accent}0B 55%,
            #0b1220 100%
          )
        `,
      }}
    >
      {/* BACKGROUND GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-12
          h-32
          w-32
          rounded-full
          opacity-[0.12]
          blur-3xl
        "
        style={{ backgroundColor: accent }}
      />

      {/* DECORATIVE CURVE */}

      <svg
        viewBox="0 0 250 90"
        preserveAspectRatio="none"
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          h-[85px]
          w-[65%]
          opacity-80
        "
      >
        <defs>
          <linearGradient
            id={`admin-card-gradient-${variant}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor={accent}
              stopOpacity="0"
            />
            <stop
              offset="100%"
              stopColor={accent}
              stopOpacity="0.9"
            />
          </linearGradient>

          <linearGradient
            id={`admin-card-fill-${variant}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={accent}
              stopOpacity="0.16"
            />
            <stop
              offset="100%"
              stopColor={accent}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path
          d={`${wavePaths[variant]} L250 90 L0 90 Z`}
          fill={`url(#admin-card-fill-${variant})`}
        />

        <path
          d={wavePaths[variant]}
          fill="none"
          stroke={`url(#admin-card-gradient-${variant})`}
          strokeWidth="1.5"
        />
      </svg>

      {/* ICON */}

      <div
        className="
          relative
          z-10
          flex
          h-[40px]
          w-[40px]
          shrink-0
          translate-x-2
          items-center
          justify-center
          rounded-full
          border
        "
        style={{
          color: accent,
          backgroundColor: `${accent}18`,
          borderColor: `${accent}30`,
          boxShadow: `0 0 22px ${accent}18`,
        }}
      >
        <Icon size={21} strokeWidth={2} />
      </div>

      {/* KPI CONTENT */}

      <div className="relative z-10 min-w-0 flex-1 translate-x-2 translate-y-0">

{/* VALUE */}
<p
  className={`
    relative
    left-0
    -top-1
    text-[29px]
    font-bold
    leading-[1]
    tracking-[-0.04em]
    tabular-nums
    ${valueClasses[valueColor]}
  `}
>
  {value.toString().padStart(2, "0")}
</p>

{/* TITLE */}
<p
  className="
    relative
    left-0
    top-0
    mt-1
    truncate
    text-[12px]
    font-semibold
    leading-tight
    text-white
  "
>
  {title}
</p>

{/* DESCRIPTION */}
<p
  className={`
    relative
    left-0
    top-1
    mt-1
    truncate
    text-[11px]
    leading-tight
    ${subtitleClasses[subtitleColor]}
  `}
>
  {description}
</p>

      </div>
    </div>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({
  label,
  value,
  valueClassName = "text-slate-200",
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        compact ? "min-h-[26px]" : "min-h-[39px]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
        {Icon && (
          <Icon
            size={13}
            className="shrink-0 text-slate-500"
          />
        )}

        {label}
      </span>

<span
  className={`relative -left-6 max-w-[58%] truncate text-right text-[11px] font-medium ${valueClassName}`}
  title={value}
>
        {value}
      </span>
    </div>
  );
}

// =====================================================
// USER DETAILS PANEL
// =====================================================


function UserDetailsPanel({
  user,
}: {
  user: AdminUser;
}) {
  return (
   <aside className="flex min-h-0 w-full flex-1 shrink-0 flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-[8px] border border-white/[0.07] bg-[#071321] p-3 xl:w-[326px]">
      {/* PANEL HEADER */}

      <div className="relative left-[10px] top-[10px] flex shrink-0 items-start justify-between border-b border-white/[0.06] px-1 pb-3 pt-1">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-white">
            User Details
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Account overview and information
          </p>
        </div>

        <button
          type="button"
          aria-label="Close user details"
          title="Close user details"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
          onClick={() => {}}
        >
          <X size={17} strokeWidth={1.8} />
        </button>
      </div>

      {/* USER PROFILE */}

      <div className="relative left-[10px] top-[6px] flex shrink-0 items-center gap-3 px-1 py-1">
        <div
          className={`flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border text-[20px] font-semibold ${getAvatarStyle(user.name)}`}
        >
          {getInitials(user.name)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold tracking-[-0.02em] text-white">
            {user.name}
          </p>

          <p className="mt-0.5 truncate text-[12px] text-slate-400">
            {user.email}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {user.id}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={user.status} />
            <PlanBadge plan={user.plan} />
          </div>
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}

      <section className="relative left-1/2 top-[6px] w-[95%] -translate-x-1/2 shrink-0 overflow-hidden rounded-[8px] border border-white/[0.09] bg-gradient-to-b from-[#0B1A2A] to-[#081522]">

        <div className="relative left-[10px] flex h-[40px] items-center gap-2 border-b border-white/[0.08] px-3.5">
          <Users
            size={16}
            className="text-slate-300"
          />

          <h3 className="text-[12px] font-semibold text-white">
            Account Information
          </h3>
        </div>

        <div className="relative left-[10px] px-3.5 py-1">
          <DetailRow
            label="Registration Date"
            value={user.registered}
            compact
          />

          <DetailRow
            label="Email Verification"
            value={user.verified ? "Verified" : "Unverified"}
            compact
            valueClassName={
              user.verified
                ? "text-emerald-400"
                : "text-amber-400"
            }
          />

          <DetailRow
            label="Last Active"
            value={user.lastActive}
            compact
          />
        </div>
      </section>

      {/* ACCESS AND ENTITLEMENT */}

      <section className="relative left-1/2 top-[6px] w-[95%] -translate-x-1/2 shrink-0 overflow-hidden rounded-[8px] border border-white/[0.09] bg-gradient-to-b from-[#0B1A2A] to-[#081522]">

      <div className="relative left-[10px] flex h-[40px] items-center gap-2 border-b border-white/[0.08] px-3.5">
          <Activity
            size={16}
            className="text-slate-300"
          />

          <h3 className="text-[12px] font-semibold text-white">
            Access & Entitlement
          </h3>
        </div>

        <div className="relative left-[10px] px-3.5 py-1">
          <DetailRow
            label="Account Status"
            value={STATUS_CONFIG[user.status].label}
            compact
            valueClassName={
              user.status === "ACTIVE"
                ? "text-emerald-400"
                : user.status === "PENDING"
                  ? "text-amber-400"
                  : user.status === "READ_ONLY"
                    ? "text-blue-400"
                    : "text-red-400"
            }
          />

          <DetailRow
            label="Assigned Plan"
            value={
              user.plan
                ? PLAN_CONFIG[user.plan].label
                : "Not assigned"
            }
            compact
            valueClassName={
              user.plan
                ? "text-[#70A8FF]"
                : "text-slate-400"
            }
          />

          <DetailRow
            label="Entitlement Source"
            value={user.entitlementSource}
            compact
          />

          <DetailRow
            label="Trial Expiration"
            value={user.trialExpiration}
            compact
          />
        </div>
      </section>

      {/* ACCOUNT NOTES */}

     <section className="relative left-1/2 top-[6px] w-[95%] -translate-x-1/2 shrink-0 overflow-hidden rounded-[8px] border border-white/[0.09] bg-gradient-to-b from-[#0B1A2A] to-[#081522]">

        <div className="relative left-[10px] flex h-[40px] items-center gap-2 border-b border-white/[0.08] px-3.5">
          <FileText
            size={16}
            className="text-slate-300"
          />

          <h3 className="text-[12px] font-semibold text-white">
            Account Notes
          </h3>
        </div>

<div className="h-[100px] p-3">
  <div className="relative left-1/2 top-1/2 flex h-[85%] w-[95%] -translate-x-1/2 -translate-y-1/2 items-start rounded-[8px] border border-white/[0.07] bg-[#101E2E]">
<div
  className="w-full"
  style={{ padding: "12px 16px" }}
>
  <p className="m-0 text-[12px] leading-[18px] text-slate-300">
    {user.notes || "No account notes available."}
  </p>
</div>
  </div>
</div>
      </section>

    </aside>
  );
}


// =====================================================
// ADMIN DATA SOURCE INDICATOR
// =====================================================

type AdminDataSourceStatus =
  | "PREVIEW"
  | "LOADING"
  | "LIVE"
  | "UNAVAILABLE";

function AdminDataSourceIndicator({
  status,
}: {
  status: AdminDataSourceStatus;
}) {
  const config = {
    PREVIEW: {
      label: "PREVIEW",
      container:
        "border-blue-400/[0.18] bg-[#101B2A]",
      dot:
        "bg-blue-400 shadow-[0_0_7px_rgba(96,165,250,0.45)]",
      text: "text-blue-300",
    },

    LOADING: {
      label: "CONNECTING",
      container:
        "border-amber-400/[0.18] bg-[#1B1912]",
      dot:
        "bg-amber-400 animate-pulse shadow-[0_0_7px_rgba(251,191,36,0.45)]",
      text: "text-amber-300",
    },

    LIVE: {
      label: "LIVE DATA",
      container:
        "border-emerald-400/[0.18] bg-[#0D211E]",
      dot:
        "bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.45)]",
      text: "text-emerald-300",
    },

    UNAVAILABLE: {
      label: "UNAVAILABLE",
      container:
        "border-red-400/[0.18] bg-[#211212]",
      dot:
        "bg-red-400 shadow-[0_0_7px_rgba(248,113,113,0.45)]",
      text: "text-red-300",
    },
  }[status];

  return (
    <div
      className={`
        relative
        flex
        h-[32px]
        w-[80px]
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-[8px]
        border
        px-2
        transition-all
        duration-200
        ${config.container}
      `}
      role="status"
      aria-live="polite"
    >
      <span
        className={`
          h-[6px]
          w-[6px]
          shrink-0
          rounded-full
          ${config.dot}
        `}
      />

      <span
        className={`
          whitespace-nowrap
          text-[9px]
          font-semibold
          tracking-[0.04em]
          ${config.text}
        `}
      >
        {config.label}
      </span>
    </div>
  );
}

// =====================================================
// MAIN ADMIN CONTENT
// =====================================================

function AdminUsersContent() {
const [searchTerm, setSearchTerm] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("ALL");

const [planFilter, setPlanFilter] =
  useState("ALL");

const [currentPage, setCurrentPage] =
  useState(1);

const [selectedUserId, setSelectedUserId] =
  useState("USR-1003");

const USERS_PER_PAGE = 10;

  const selectedUser =
    MOCK_USERS.find(
      (user) => user.id === selectedUserId
    ) ?? MOCK_USERS[0];

  // ===================================================
  // KPI METRICS
  // ===================================================

  const metrics = useMemo(
    () => ({
      total: MOCK_USERS.length,

      pending: MOCK_USERS.filter(
        (user) => user.status === "PENDING"
      ).length,

      active: MOCK_USERS.filter(
        (user) => user.status === "ACTIVE"
      ).length,

      readOnly: MOCK_USERS.filter(
        (user) => user.status === "READ_ONLY"
      ).length,
    }),
    []
  );

  // ===================================================
  // FILTER USERS
  // ===================================================

  const filteredUsers = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return MOCK_USERS.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        user.status === statusFilter;

      const matchesPlan =
        planFilter === "ALL" ||
        (planFilter === "NONE"
          ? user.plan === null
          : user.plan === planFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlan
      );
    });
  }, [
    searchTerm,
    statusFilter,
    planFilter,
  ]);

// ===================================================
// PAGINATION
// ===================================================

const totalPages = Math.max(
  1,
  Math.ceil(filteredUsers.length / USERS_PER_PAGE)
);

const startIndex =
  (currentPage - 1) * USERS_PER_PAGE;

const endIndex = Math.min(
  startIndex + USERS_PER_PAGE,
  filteredUsers.length
);

const paginatedUsers = filteredUsers.slice(
  startIndex,
  endIndex
);

function goToPreviousPage() {
  if (currentPage <= 1) return;

  const nextPage = currentPage - 1;

  setCurrentPage(nextPage);

  const firstUserOnPage =
    filteredUsers[(nextPage - 1) * USERS_PER_PAGE];

  if (firstUserOnPage) {
    setSelectedUserId(firstUserOnPage.id);
  }
}

function goToNextPage() {
  if (currentPage >= totalPages) return;

  const nextPage = currentPage + 1;

  setCurrentPage(nextPage);

  const firstUserOnPage =
    filteredUsers[(nextPage - 1) * USERS_PER_PAGE];

  if (firstUserOnPage) {
    setSelectedUserId(firstUserOnPage.id);
  }
}

  // ===================================================
  // RESET FILTERS
  // ===================================================

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPlanFilter("ALL");
  }

  return (
    <main className="flex h-screen min-w-0 gap-4 overflow-hidden bg-[#020817] text-slate-300">
      {/* ============================================= */}
      {/* LEFT SIDEBAR */}
      {/* ============================================= */}

      <div className="shrink-0 p-[10px]">
        <Sidebar showAdministrationPreview />
      </div>

      {/* ============================================= */}
      {/* ADMIN APPLICATION SHELL */}
      {/* ============================================= */}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-5">
        {/* =========================================== */}
        {/* TOP HEADER */}
        {/* =========================================== */}

<header
  className="
    grid
    h-[58px]
    min-w-0
    shrink-0
    grid-cols-[320px_minmax(0,1fr)_auto]
    items-center
    border-b
    border-white/[0.05]
  "
>
  {/* ================================================= */}
  {/* LEFT SIDE */}
  {/* ================================================= */}

  <div
    className="
      min-w-0
      w-[290px]
      shrink-0
    "
  >
    <h1 className="text-[22px] font-semibold leading-none text-white">
      Administration
    </h1>

    <p className="mt-1 text-[14px] text-slate-500">
      Account management and access control
    </p>
  </div>

  {/* ================================================= */}
  {/* CENTER SPACE */}
  {/* ================================================= */}

  <div
    className="
      ml-16
      flex
      min-w-0
      items-center
      justify-center
      gap-3
      overflow-visible
    "
  />

  {/* ================================================= */}
  {/* RIGHT SIDE */}
  {/* ================================================= */}

  <div
    className="
      relative
      right-4
      mr-2
      flex
      shrink-0
      items-center
      gap-3
    "
  >

{/* DATA SOURCE INDICATOR */}

<AdminDataSourceIndicator status="LIVE" />

{/* NOTIFICATIONS */}

    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025]">
      <Bell
        size={16}
        className="text-slate-400"
      />

      <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#4F8CFF]" />
    </div>

    {/* USER MENU */}

    <div className="shrink-0">
      <UserMenuV2 />
    </div>
  </div>
</header>

        {/* =========================================== */}
        {/* ADMIN SUB NAVIGATION */}
        {/* =========================================== */}

        <nav className="flex h-[46px] shrink-0 items-stretch gap-5 overflow-x-auto border-b border-white/[0.06] px-6">
          {/* ACTIVE SECTION */}

          <div className="relative flex shrink-0 items-center gap-2.5 px-4 text-[13px] font-semibold text-white">
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#397DF1] to-[#4F8CFF] shadow-[0_0_12px_rgba(79,140,255,0.5)]" />

            <ShieldCheck
              size={16}
              className="text-[#78A9FF]"
            />

            User Management
          </div>

          {/* FUTURE SECTIONS — VISUAL PLACEHOLDERS */}

          <div
            title="Planned for a later development stage"
            className="flex shrink-0 items-center gap-2.5 px-4 text-[13px] text-slate-500"
          >
            <Activity size={15} />

            Access & Plans
          </div>

          <div
            title="Planned for a later development stage"
            className="flex shrink-0 items-center gap-2.5 px-4 text-[13px] text-slate-500"
          >
            <CalendarDays size={15} />

            Audit Log
          </div>

          <div
            title="Planned for a later development stage"
            className="flex shrink-0 items-center gap-2.5 px-4 text-[13px] text-slate-500"
          >
            <Users size={15} />

            System Settings
          </div>
        </nav>

        {/* =========================================== */}
        {/* MAIN WORKSPACE */}
        {/* =========================================== */}

<div
className="
  flex
  min-h-0
  flex-1
  flex-col
  gap-4
  overflow-y-auto
  px-5
  pb-10
  pt-5
  xl:flex-row
  xl:overflow-hidden
  2xl:pl-6
"
  style={{ paddingRight: 20 }}
>
          {/* ========================================= */}
          {/* LEFT CONTENT */}
          {/* ========================================= */}

          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-y-6">
            {/* PAGE TITLE */}

            <div className="relative top-3 flex items-center gap-3">
              <div className="flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-[8px] border border-[#347CE8]/25 bg-gradient-to-br from-[#112E50] to-[#09192D] shadow-[0_0_25px_rgba(32,106,206,0.12)]">
                <ShieldCheck
                  size={26}
                  className="text-[#69A7FF]"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#78A9FF]">
                  User administration
                </p>

                <h1 className="mt-1 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-white">
                  User Management
                </h1>

                <p className="mt-1 text-[10px] text-slate-500">
                  Review registrations, manage account status
                  and subscription access.
                </p>
              </div>
            </div>

{/* KPI CARDS */}


<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

  <MetricCard
    title="Total Users"
    value={metrics.total}
    description="All registered accounts"
    icon={Users}
    accent="#278BFF"
    variant={0}
  />

  <MetricCard
    title="Pending Approvals"
    value={metrics.pending}
    description="Awaiting administrator review"
    icon={Clock3}
    accent="#F5B942"
    variant={1}
    subtitleColor="yellow"
  />

  <MetricCard
    title="Active Accounts"
    value={metrics.active}
    description="Currently enabled accounts"
    icon={CheckCircle2}
    accent="#00D4A0"
    variant={2}
    valueColor="green"
    subtitleColor="green"
  />

  <MetricCard
    title="Read-only Accounts"
    value={metrics.readOnly}
    description="Historical access only"
    icon={Eye}
    accent="#8B5CF6"
    variant={3}
    valueColor="blue"
  />

</div>

{/* SEARCH AND FILTERS */}

<div className="relative -top-2 flex w-full min-w-0 flex-col gap-3 p-3.5 xl:flex-row xl:items-center xl:justify-between">

  {/* LEFT: SEARCH AND FILTERS */}

  <div className="flex min-w-0 items-center gap-3">

    {/* SEARCH */}

    <div className="relative min-w-0 w-[400px] shrink">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        type="text"
        value={searchTerm}
    onChange={(event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
}}
        placeholder="Search name, email or user ID..."
        style={{ paddingLeft: "44px" }}
        className="h-[39px] w-full rounded-[8px] border border-white/[0.08] bg-[#030D19] pr-9 text-[12px] text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#4F8CFF]/40"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={() => {
  setSearchTerm("");
  setCurrentPage(1);
}}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
        >
          <X size={13} />
        </button>
      )}
    </div>

    {/* STATUS FILTER */}

    <div className="flex shrink-0 items-center gap-2">
      <label
        htmlFor="admin-status-filter"
        className="text-[11px] font-medium text-slate-400"
      >
        Status
      </label>

      <div className="relative">
        <select
          id="admin-status-filter"
          value={statusFilter}
        onChange={(event) => {
  setStatusFilter(event.target.value);
  setCurrentPage(1);
}}
          style={{ textIndent: "8px" }}
          className="h-[39px] w-[110px] appearance-none rounded-[8px] border border-white/[0.08] bg-[#030D19] pr-9 text-[11px] text-slate-200 outline-none transition-colors focus:border-[#4F8CFF]/40"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="READ_ONLY">Read-only</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>

    {/* PLAN FILTER */}

    <div className="flex shrink-0 items-center gap-2">
      <label
        htmlFor="admin-plan-filter"
        className="text-[11px] font-medium text-slate-400"
      >
        Plan
      </label>

      <div className="relative">
        <select
          id="admin-plan-filter"
          value={planFilter}
         onChange={(event) => {
  setPlanFilter(event.target.value);
  setCurrentPage(1);
}}
          style={{ textIndent: "8px" }}
          className="h-[39px] min-w-[100px] appearance-none rounded-[8px] border border-white/[0.08] bg-[#030D19] pr-8 text-[11px] text-slate-300 outline-none focus:border-[#4F8CFF]/40"
        >
          <option value="ALL">All Plans</option>
          <option value="TRIAL">Trial</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="ELITE">Elite</option>
          <option value="NONE">Not assigned</option>
        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>

  </div>

  {/* RIGHT: RESET */}

  <button
    type="button"
    onClick={resetFilters}
    className="flex h-[39px] w-[110px] shrink-0 items-center justify-center gap-2 self-end rounded-[8px] border border-[#347CE8]/40 bg-gradient-to-b from-[#2868C5] to-[#1D4F9C] text-[11px] font-semibold text-white shadow-[0_2px_10px_rgba(37,99,235,0.18)] transition-all duration-200 hover:border-[#5595F5]/60 hover:from-[#347CE8] hover:to-[#2868C5] hover:shadow-[0_3px_14px_rgba(37,99,235,0.3)] active:scale-[0.98] xl:self-auto"
  >
    <RotateCcw size={13} strokeWidth={1.9} />
    <span>Reset Filters</span>
  </button>

</div>

            {/* USER TABLE PANEL */}

<section className="relative -top-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#071321]">


              {/* USER TABLE */}

              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
               <table className="w-full min-w-0 table-fixed border-collapse text-left">
<colgroup>
  <col style={{ width: "23%" }} />
  <col style={{ width: "14%" }} />
  <col style={{ width: "14%" }} />
  <col style={{ width: "15%" }} />
  <col style={{ width: "9%" }} />
  <col style={{ width: "16%" }} />
  <col style={{ width: "9%" }} />
</colgroup>

                  <thead>
                    <tr className="h-[30px] border-b border-white/[0.07] bg-[#091827]">
                    <th className="px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
  <span className="relative left-14">User</span>
</th>
                      <th className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Registered
                      </th>
                      <th className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Verification
                      </th>
                      <th className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
  <span className="relative -left-2">Account Status</span>
</th>
                      <th className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Plan
                      </th>
                      <th className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
  <span className="relative -left-1">Last Active</span>
</th>
                      <th className="px-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((user) => {
                      const isSelected = selectedUserId === user.id;

                      return (
                        <tr
                          key={user.id}
className={`group h-[44px] cursor-pointer border-b border-white/[0.045]
  transition-all
  duration-200
  ease-[cubic-bezier(0.22,1,0.36,1)]
  hover:z-10
  hover:-translate-y-[0.5px]
  hover:scale-[1.001]
  ${
    isSelected
      ? "bg-[#10294A]/65 shadow-[inset_2px_0_0_#4F8CFF] hover:bg-[#163253]"
      : "hover:bg-[#10243A]/75 hover:shadow-[inset_2px_0_0_rgba(79,140,255,0.65),0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.025)]"
  }
`}
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          {/* USER */}
                          <td className="px-4">
                            <div className="relative left-2 flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${getAvatarStyle(user.name)}`}
                              >
                                {getInitials(user.name)}
                              </div>

                              <div className="min-w-0">
                               <p className="truncate text-[12px] font-semibold text-slate-200 transition-colors duration-150 group-hover:text-white">
  {user.name}
</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* REGISTERED */}
                          <td className="whitespace-nowrap px-2 text-[11px] text-slate-400">
                            <span className="relative -left-1 inline-flex items-center gap-2">
                              <CalendarDays
                                size={13}
                                className="shrink-0 text-slate-600"
                              />
                              {user.registered}
                            </span>
                          </td>

                          {/* VERIFICATION */}
                          <td className="whitespace-nowrap px-2">
                            {user.verified ? (
                              <span className="relative left-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                                <CheckCircle2 size={13} />
                                Verified
                              </span>
                            ) : (
                              <span className="relative left-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
                                <AlertCircle size={13} />
                                Unverified
                              </span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="whitespace-nowrap px-2">
                            <StatusBadge status={user.status} />
                          </td>

                          {/* PLAN */}
                          <td className="whitespace-nowrap px-2">
                            <PlanBadge plan={user.plan} />
                          </td>

                          {/* LAST ACTIVE */}
                          <td className="whitespace-nowrap px-2 text-[11px] text-slate-400">
                            {user.lastActive}
                          </td>

                          {/* ACTION */}
                          <td className="px-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                title={`View ${user.name}`}
                                aria-label={`View ${user.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedUserId(user.id);
                                }}
                                className={`inline-flex h-[29px] w-[29px] items-center justify-center rounded-[6px] border transition-colors ${
                                  isSelected
                                    ? "border-[#4F8CFF]/30 bg-[#4F8CFF]/[0.10] text-[#8DB8FF]"
                                    : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-[#4F8CFF]/30 hover:text-white"
                                }`}
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <Search
                            size={20}
                            className="mx-auto text-slate-600"
                          />
                          <p className="mt-3 text-[11px] font-medium text-slate-300">
                            No users found
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            Adjust your search or filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

{/* TABLE FOOTER */}

<div className="flex min-h-[38px] shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#091827] px-4">

  {/* RESULTS COUNT */}

  <p className="relative left-2 text-[11px] text-slate-500">
    Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}
    {"–"}
    {endIndex} of {filteredUsers.length} accounts
  </p>

  {/* PAGINATION CONTROLS */}

  <div className="relative -left-4 flex items-center gap-3">

    <span className="text-[11px] tabular-nums text-slate-400">
      Page {currentPage} of {totalPages}
    </span>

    <div className="flex items-center gap-1">

      {/* PREVIOUS PAGE */}

      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        aria-label="Previous page"
        title="Previous page"
        className="flex h-[27px] w-[27px] items-center justify-center rounded-[6px] border border-white/[0.08] bg-white/[0.025] text-slate-400 transition-colors hover:border-[#4F8CFF]/40 hover:bg-[#4F8CFF]/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.025] disabled:hover:text-slate-400"
      >
        <ChevronLeft size={15} />
      </button>

      {/* NEXT PAGE */}

      <button
        type="button"
        onClick={goToNextPage}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        title="Next page"
        className="flex h-[27px] w-[27px] items-center justify-center rounded-[6px] border border-white/[0.08] bg-white/[0.025] text-slate-400 transition-colors hover:border-[#4F8CFF]/40 hover:bg-[#4F8CFF]/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.025] disabled:hover:text-slate-400"
      >
        <ChevronRight size={15} />
      </button>

    </div>
  </div>
</div>
            </section>

          </div>

          {/* ========================================= */}
          {/* RIGHT USER DETAILS PANEL */}
          {/* ========================================= */}

<div className="relative top-[82px] flex h-[calc(100dvh-205px)] min-h-0 w-full shrink-0 flex-col xl:mr-5 xl:w-[326px]">
  <UserDetailsPanel user={selectedUser} />
</div>
        </div>
      </section>
    </main>
  );
}

// =====================================================
// PAGE ENTRY
// =====================================================

export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}