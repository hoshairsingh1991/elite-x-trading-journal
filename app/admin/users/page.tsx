"use client";

import {
  useEffect,
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
  Search,
  ShieldCheck,
  Users,
  UserCheck,
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

type AdminUserDisplayStatus = AccountStatus | "REJECTED";

type PlanType =
  | "TRIAL"
  | "BASIC"
  | "PRO"
  | "ELITE";

type PaidPlanType = "BASIC" | "PRO" | "ELITE";

// ADMINISTRATOR APPROVAL

type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

// APPLICATION ACCESS PROVISIONING

type AccessProvisioningStatus =
  | "NOT_PROVISIONED"
  | "PROVISIONED";

// TRIAL LIFECYCLE

type TrialStatus =
  | "NOT_APPLICABLE"
  | "NOT_STARTED"
  | "SCHEDULED"
  | "ACTIVE"
  | "EXPIRED";

// SUBSCRIPTION LIFECYCLE

type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "UNPAID";

type PaymentStatus =
  | "PAID"
  | "FAILED"
  | "PENDING"
  | "UNKNOWN";

interface AdminSubscriptionSummary {
  plan: PaidPlanType;
  status: SubscriptionStatus;
  priceLabel: string;
  billingInterval: string;
  paymentStatus: PaymentStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  scheduledPlan: PaidPlanType | null;
  scheduledChangeAt: string | null;
}

// IBKR

type IBKRAccountState =
  | "ACTIVE"
  | "INACTIVE";

type IBKRConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR"
  | "PENDING";

type IBKRSyncStatus =
  | "SUCCESS"
  | "FAILED"
  | "RUNNING"
  | "NEVER";

interface AdminIBKRAccount {
  id: string;
  maskedAccountId: string;
  accountState: IBKRAccountState;
  connectionStatus: IBKRConnectionStatus;
  scheduledSyncEnabled: boolean;
  lastSuccessfulSync: string | null;
  lastSyncStatus: IBKRSyncStatus;
  lastSyncResult: string;
}

// TRIAL USAGE

interface AdminTrialUsage {
  tradesUsed: number;
  expensesUsed: number;
  notesUsed: number;
  ibkrAccountsUsed: number;
}

// ADMINISTRATOR ENTITLEMENT GRANT

interface AdminEntitlementGrant {
  id: string;
  plan: PaidPlanType;
  grantedAt: string;
  startsAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
}

// ADMIN USER

interface AdminUser {
  id: string;
  name: string;
  email: string;
  registered: string;
  verified: boolean;

  // Existing account access state
  status: AccountStatus;

  // Explicit lifecycle states
  approvalStatus?: ApprovalStatus;
  accessProvisioningStatus?: AccessProvisioningStatus;

  // Effective plan
  plan: PlanType | null;

  // Trial lifecycle
  trialStatus?: TrialStatus;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  trialUsage?: AdminTrialUsage | null;

  // Administrator entitlement grant
  adminGrant?: AdminEntitlementGrant | null;

  // Subscription
  subscription?: AdminSubscriptionSummary | null;

  // Broker accounts
  ibkrAccounts?: AdminIBKRAccount[] | null;

  // Account information
  lastActive: string;
  entitlementSource: string;
  trialExpiration: string;
  notes: string;
}


// =====================================================
// MOCK DATA — UI PREVIEW ONLY
// =====================================================

// =====================================================
// MOCK DATA — UI PREVIEW ONLY
// =====================================================

const MOCK_USERS: AdminUser[] = [
  // 1001 — VERIFIED, AWAITING ADMIN APPROVAL
  {
    id: "USR-1001",
    name: "Emily Carter",
    email: "emily@example.com",
    registered: "Oct 30, 2026",
    verified: true,
    status: "PENDING",
    approvalStatus: "PENDING",
    accessProvisioningStatus: "NOT_PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Email verified. Awaiting administrator approval.",
  },

  // 1002 — EMAIL VERIFICATION AND ADMIN APPROVAL PENDING
  {
    id: "USR-1002",
    name: "Daniel Kim",
    email: "daniel@example.com",
    registered: "Oct 29, 2026",
    verified: false,
    status: "PENDING",
    approvalStatus: "PENDING",
    accessProvisioningStatus: "NOT_PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Email verification and administrator approval are outstanding.",
  },

  // 1003 — REJECTED APPLICATION
  {
    id: "USR-1003",
    name: "Priya Shah",
    email: "priya@example.com",
    registered: "Oct 28, 2026",
    verified: true,
    status: "PENDING",
    approvalStatus: "REJECTED",
    accessProvisioningStatus: "NOT_PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Application rejected. No application access was provisioned.",
  },

  // 1004 — APPROVED BUT NOT YET PROVISIONED
  {
    id: "USR-1004",
    name: "Leo Martin",
    email: "leo@example.com",
    registered: "Oct 27, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "NOT_PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Never",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Approved. Awaiting application access provisioning.",
  },

  // 1005 — ENTITLEMENT EXISTS, BUT EMAIL IS UNVERIFIED
  {
    id: "USR-1005",
    name: "Nadia Brooks",
    email: "nadia@example.com",
    registered: "Oct 26, 2026",
    verified: false,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "PRO",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1005",
      plan: "PRO",
      grantedAt: "2026-10-26T14:00:00.000Z",
      startsAt: "2026-10-26T14:00:00.000Z",
      expiresAt: null,
      revokedAt: null,
      revocationReason: null,
    },
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Oct 26, 2026 14:15",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Pro entitlement retained. Email verification still required for access.",
  },

  // 1006 — ACTIVE ELITE TRIAL WITH USAGE AND ONE IBKR ACCOUNT
  {
    id: "USR-1006",
    name: "Noah Patel",
    email: "noah@example.com",
    registered: "Oct 20, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "TRIAL",
    trialStatus: "ACTIVE",
    trialStartDate: "2026-10-28T14:00:00.000Z",
    trialEndDate: "2026-11-11T14:00:00.000Z",
    trialUsage: {
      tradesUsed: 18,
      expensesUsed: 12,
      notesUsed: 16,
      ibkrAccountsUsed: 1,
    },
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [
      {
        id: "IBKR-1006-A",
        maskedAccountId: "U•••••612",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 09:30 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
    ],
    lastActive: "Nov 03, 2026 09:42",
    entitlementSource: "Trial grant",
    trialExpiration: "Nov 11, 2026",
    notes: "Active Elite trial. Usage is approaching the trade quota.",
  },

  // 1007 — SCHEDULED ELITE TRIAL
  {
    id: "USR-1007",
    name: "Maya Chen",
    email: "maya@example.com",
    registered: "Oct 25, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: null,
    trialStatus: "SCHEDULED",
    trialStartDate: "2026-11-07T14:00:00.000Z",
    trialEndDate: "2026-11-21T14:00:00.000Z",
    trialUsage: null,
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Nov 02, 2026 16:20",
    entitlementSource: "—",
    trialExpiration: "Nov 21, 2026",
    notes: "Trial is scheduled. Trial capabilities are not active yet.",
  },

  // 1008 — APPROVED, TRIAL NOT STARTED, NO START DATE RECORDED
  {
    id: "USR-1008",
    name: "Ethan Clarke",
    email: "ethan.clarke@example.com",
    registered: "Oct 24, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: null,
    trialStatus: "NOT_STARTED",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Nov 01, 2026 10:15",
    entitlementSource: "—",
    trialExpiration: "—",
    notes: "Approved account. Trial has not been started or scheduled.",
  },

  // 1009 — EXPIRED TRIAL, READ-ONLY ACCESS
  {
    id: "USR-1009",
    name: "Olivia Chen",
    email: "olivia@example.com",
    registered: "Oct 10, 2026",
    verified: true,
    status: "READ_ONLY",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "TRIAL",
    trialStatus: "EXPIRED",
    trialStartDate: "2026-10-10T13:00:00.000Z",
    trialEndDate: "2026-11-01T13:00:00.000Z",
    trialUsage: {
      tradesUsed: 20,
      expensesUsed: 20,
      notesUsed: 18,
      ibkrAccountsUsed: 1,
    },
    adminGrant: null,
    subscription: null,
    ibkrAccounts: [
      {
        id: "IBKR-1009-A",
        maskedAccountId: "U•••••384",
        accountState: "INACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Oct 31, 2026 · 03:20 PM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Last successful sync before trial expiration.",
      },
    ],
    lastActive: "Oct 31, 2026 16:30",
    entitlementSource: "Expired trial",
    trialExpiration: "Nov 01, 2026",
    notes: "Trial expired. Historical account data remains available.",
  },

  // 1010 — PERMANENT ELITE ADMINISTRATOR GRANT
  {
    id: "USR-1010",
    name: "Marcus Reed",
    email: "marcus.reed@example.com",
    registered: "Sep 18, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "ELITE",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1010",
      plan: "ELITE",
      grantedAt: "2026-10-01T13:00:00.000Z",
      startsAt: "2026-10-01T13:00:00.000Z",
      expiresAt: null,
      revokedAt: null,
      revocationReason: null,
    },
    subscription: null,
    ibkrAccounts: [
      {
        id: "IBKR-1010-A",
        maskedAccountId: "U•••••789",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 09:30 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
      {
        id: "IBKR-1010-B",
        maskedAccountId: "U•••••421",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 09:28 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
      {
        id: "IBKR-1010-C",
        maskedAccountId: "U•••••936",
        accountState: "ACTIVE",
        connectionStatus: "ERROR",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 02, 2026 · 02:15 PM",
        lastSyncStatus: "FAILED",
        lastSyncResult: "Connection authentication failed. Reauthorization required.",
      },
    ],
    lastActive: "Nov 03, 2026 12:42",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Permanent Elite administrator entitlement. Unlimited IBKR account allowance.",
  },

  // 1011 — ACTIVE PRO GRANT OVERRIDES ACTIVE BASIC SUBSCRIPTION
  {
    id: "USR-1011",
    name: "Sophie Laurent",
    email: "sophie@example.com",
    registered: "Sep 22, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "BASIC",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1011",
      plan: "PRO",
      grantedAt: "2026-10-20T13:00:00.000Z",
      startsAt: "2026-10-20T13:00:00.000Z",
      expiresAt: "2026-11-10T23:59:59.000Z",
      revokedAt: null,
      revocationReason: null,
    },
    subscription: {
      plan: "BASIC",
      status: "ACTIVE",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "PAID",
      currentPeriodStart: "2026-10-15T00:00:00.000Z",
      currentPeriodEnd: "2026-11-15T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [
      {
        id: "IBKR-1011-A",
        maskedAccountId: "U•••••112",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 10:00 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
      {
        id: "IBKR-1011-B",
        maskedAccountId: "U•••••224",
        accountState: "ACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 01, 2026 · 02:20 PM",
        lastSyncStatus: "FAILED",
        lastSyncResult: "Broker connection disconnected. Reconnection required.",
      },
    ],
    lastActive: "Nov 03, 2026 10:25",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Temporary Pro grant overrides the lower Basic subscription.",
  },

  // 1012 — SCHEDULED ELITE ADMINISTRATOR GRANT
  {
    id: "USR-1012",
    name: "James Anderson",
    email: "james@example.com",
    registered: "Nov 01, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1012",
      plan: "ELITE",
      grantedAt: "2026-11-02T14:00:00.000Z",
      startsAt: "2026-11-06T15:00:00.000Z",
      expiresAt: null,
      revokedAt: null,
      revocationReason: null,
    },
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Nov 02, 2026 14:10",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Elite administrator grant is scheduled to begin November 6.",
  },

  // 1013 — EXPIRED ELITE GRANT FALLS BACK TO ACTIVE BASIC SUBSCRIPTION
  {
    id: "USR-1013",
    name: "Charlotte Davis",
    email: "charlotte@example.com",
    registered: "Oct 31, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "BASIC",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1013",
      plan: "ELITE",
      grantedAt: "2026-09-01T12:00:00.000Z",
      startsAt: "2026-09-01T12:00:00.000Z",
      expiresAt: "2026-11-01T23:59:59.000Z",
      revokedAt: null,
      revocationReason: null,
    },
    subscription: {
      plan: "BASIC",
      status: "ACTIVE",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "PAID",
      currentPeriodStart: "2026-10-15T00:00:00.000Z",
      currentPeriodEnd: "2026-11-15T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [
      {
        id: "IBKR-1013-A",
        maskedAccountId: "U•••••335",
        accountState: "INACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Oct 30, 2026 · 11:30 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Connection retained after downgrade to Basic.",
      },
      {
        id: "IBKR-1013-B",
        maskedAccountId: "U•••••446",
        accountState: "INACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Oct 30, 2026 · 11:25 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Connection retained after downgrade to Basic.",
      },
    ],
    lastActive: "Nov 02, 2026 16:45",
    entitlementSource: "Paid subscription",
    trialExpiration: "—",
    notes: "Expired Elite grant. Basic subscription remains active. Existing broker records are retained but inactive.",
  },

  // 1014 — SUSPENDED ACCOUNT, REVOKED GRANT FALLS BACK TO ACTIVE PRO SUBSCRIPTION
  {
    id: "USR-1014",
    name: "Benjamin Scott",
    email: "benjamin@example.com",
    registered: "Oct 30, 2026",
    verified: true,
    status: "SUSPENDED",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "PRO",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1014",
      plan: "ELITE",
      grantedAt: "2026-10-01T12:00:00.000Z",
      startsAt: "2026-10-01T12:00:00.000Z",
      expiresAt: null,
      revokedAt: "2026-11-02T15:00:00.000Z",
      revocationReason: "Temporary administrator entitlement ended.",
    },
    subscription: {
      plan: "PRO",
      status: "ACTIVE",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "PAID",
      currentPeriodStart: "2026-10-15T00:00:00.000Z",
      currentPeriodEnd: "2026-11-15T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [
      {
        id: "IBKR-1014-A",
        maskedAccountId: "U•••••557",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Nov 03, 2026 · 08:45 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Connection retained while account access is suspended. Scheduled synchronization is disabled.",
      },
      {
        id: "IBKR-1014-B",
        maskedAccountId: "U•••••668",
        accountState: "ACTIVE",
        connectionStatus: "PENDING",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: null,
        lastSyncStatus: "NEVER",
        lastSyncResult: "Broker connection setup is pending. Scheduled synchronization is disabled while the account is suspended.",
      },
    ],
    lastActive: "Nov 02, 2026 15:20",
    entitlementSource: "Paid subscription",
    trialExpiration: "—",
    notes: "Account access is suspended. The revoked Elite grant falls back to the active Pro subscription. Entitlement is retained, but application capabilities and scheduled IBKR synchronization are restricted.",
  },

  // 1015 — INVALID ADMINISTRATOR GRANT DATES, NO FALLBACK ENTITLEMENT
  {
    id: "USR-1015",
    name: "Amelia Robinson",
    email: "amelia@example.com",
    registered: "Oct 29, 2026",
    verified: true,
    status: "READ_ONLY",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: {
      id: "AGR-1015",
      plan: "PRO",
      grantedAt: "2026-10-29T10:00:00.000Z",
      startsAt: "2026-11-01T10:00:00.000Z",
      expiresAt: "2026-10-30T10:00:00.000Z",
      revokedAt: null,
      revocationReason: null,
    },
    subscription: null,
    ibkrAccounts: [],
    lastActive: "Oct 29, 2026 10:15",
    entitlementSource: "Administrator grant",
    trialExpiration: "—",
    notes: "Grant dates are invalid because expiration precedes the start date.",
  },

  // 1016 — ACTIVE PRO SUBSCRIPTION WITH SCHEDULED DOWNGRADE TO BASIC
  {
    id: "USR-1016",
    name: "Lucas Mitchell",
    email: "lucas@example.com",
    registered: "Oct 28, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "PRO",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: {
      plan: "PRO",
      status: "ACTIVE",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "PAID",
      currentPeriodStart: "2026-10-20T00:00:00.000Z",
      currentPeriodEnd: "2026-11-20T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: "BASIC",
      scheduledChangeAt: "2026-11-10T00:00:00.000Z",
    },
    ibkrAccounts: [
      {
        id: "IBKR-1016-A",
        maskedAccountId: "U•••••771",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 09:15 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
      {
        id: "IBKR-1016-B",
        maskedAccountId: "U•••••882",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 09:10 AM",
        lastSyncStatus: "RUNNING",
        lastSyncResult: "Synchronization is currently running.",
      },
      {
        id: "IBKR-1016-C",
        maskedAccountId: "U•••••993",
        accountState: "INACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Oct 25, 2026 · 11:00 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Retained broker account. Inactive under current Pro selection.",
      },
    ],
    lastActive: "Nov 02, 2026 13:45",
    entitlementSource: "Paid subscription",
    trialExpiration: "—",
    notes: "Pro subscription is active. Downgrade to Basic is scheduled for November 10.",
  },

  // 1017 — PAST-DUE ELITE SUBSCRIPTION, ACCESS RETAINED THROUGH CURRENT PERIOD
  {
    id: "USR-1017",
    name: "Isabella Morgan",
    email: "isabella.morgan@example.com",
    registered: "Oct 23, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "ELITE",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: {
      plan: "ELITE",
      status: "PAST_DUE",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "FAILED",
      currentPeriodStart: "2026-10-20T00:00:00.000Z",
      currentPeriodEnd: "2026-11-10T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [
      {
        id: "IBKR-1017-A",
        maskedAccountId: "U•••••114",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 08:30 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
      {
        id: "IBKR-1017-B",
        maskedAccountId: "U•••••225",
        accountState: "ACTIVE",
        connectionStatus: "ERROR",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 02, 2026 · 04:10 PM",
        lastSyncStatus: "FAILED",
        lastSyncResult: "Broker returned an authorization error.",
      },
      {
        id: "IBKR-1017-C",
        maskedAccountId: "U•••••336",
        accountState: "ACTIVE",
        connectionStatus: "CONNECTED",
        scheduledSyncEnabled: true,
        lastSuccessfulSync: "Nov 03, 2026 · 08:25 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Sync completed successfully.",
      },
    ],
    lastActive: "Nov 02, 2026 08:45",
    entitlementSource: "Paid subscription",
    trialExpiration: "—",
    notes: "Payment is past due. Elite entitlement remains active through the current billing period.",
  },

  // 1018 — CANCELED SUBSCRIPTION, PERIOD ENDED, READ-ONLY ACCESS
  {
    id: "USR-1018",
    name: "William Foster",
    email: "william@example.com",
    registered: "Oct 24, 2026",
    verified: true,
    status: "READ_ONLY",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "PRO",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: {
      plan: "PRO",
      status: "CANCELED",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "PAID",
      currentPeriodStart: "2026-10-01T00:00:00.000Z",
      currentPeriodEnd: "2026-11-01T23:59:59.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [
      {
        id: "IBKR-1018-A",
        maskedAccountId: "U•••••447",
        accountState: "INACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Oct 31, 2026 · 02:30 PM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Final successful sync before subscription cancellation.",
      },
    ],
    lastActive: "Nov 01, 2026 17:18",
    entitlementSource: "Expired subscription",
    trialExpiration: "—",
    notes: "Subscription canceled and billing period ended. Historical access only.",
  },

  // 1019 — INCOMPLETE SUBSCRIPTION, NO EFFECTIVE ENTITLEMENT
  {
    id: "USR-1019",
    name: "Ella Thompson",
    email: "ella@example.com",
    registered: "Oct 21, 2026",
    verified: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: null,
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: {
      plan: "PRO",
      status: "INCOMPLETE",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "PENDING",
      currentPeriodStart: "2026-11-03T00:00:00.000Z",
      currentPeriodEnd: "2026-11-17T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [],
    lastActive: "Nov 02, 2026 11:26",
    entitlementSource: "No active entitlement",
    trialExpiration: "—",
    notes: "Subscription setup is incomplete. No paid entitlement is active.",
  },

  // 1020 — UNPAID SUBSCRIPTION, READ-ONLY ACCESS
  {
    id: "USR-1020",
    name: "Jack Harrison",
    email: "jack@example.com",
    registered: "Oct 20, 2026",
    verified: true,
    status: "READ_ONLY",
    approvalStatus: "APPROVED",
    accessProvisioningStatus: "PROVISIONED",
    plan: "ELITE",
    trialStatus: "NOT_APPLICABLE",
    trialStartDate: null,
    trialEndDate: null,
    trialUsage: null,
    adminGrant: null,
    subscription: {
      plan: "ELITE",
      status: "UNPAID",
      priceLabel: "Not configured in preview",
      billingInterval: "Monthly",
      paymentStatus: "FAILED",
      currentPeriodStart: "2026-10-05T00:00:00.000Z",
      currentPeriodEnd: "2026-11-02T23:59:59.000Z",
      cancelAtPeriodEnd: false,
      scheduledPlan: null,
      scheduledChangeAt: null,
    },
    ibkrAccounts: [
      {
        id: "IBKR-1020-A",
        maskedAccountId: "U•••••558",
        accountState: "INACTIVE",
        connectionStatus: "DISCONNECTED",
        scheduledSyncEnabled: false,
        lastSuccessfulSync: "Nov 01, 2026 · 10:15 AM",
        lastSyncStatus: "SUCCESS",
        lastSyncResult: "Synchronization stopped after entitlement ended.",
      },
    ],
    lastActive: "Nov 01, 2026 09:52",
    entitlementSource: "Expired subscription",
    trialExpiration: "—",
    notes: "Subscription is unpaid. Application access is read-only and historical data is retained.",
  },
];

// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG: Record<
  AdminUserDisplayStatus,
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

  REJECTED: {
    label: "Rejected",
    className: "text-red-400",
    dotClass: "bg-red-400",
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
// ADMIN PREVIEW — PLAN CAPABILITIES
// =====================================================

// Preview configuration only.
// These values do not enforce production permissions.

const ADMIN_PREVIEW_TRIAL_USAGE_LIMITS = {
  trades: 20,
  expenses: 20,
  notes: 20,
  ibkrAccounts: 1,
} as const;

type AdminPreviewPlanCapabilities = {
  maxIbkrAccounts: number | "UNLIMITED" | null;
  canConnectIBKR: boolean;
  canScheduledSync: boolean;
  canManualSync: boolean;
  trialUsageLimits:
    | typeof ADMIN_PREVIEW_TRIAL_USAGE_LIMITS
    | null;
};

const ADMIN_PREVIEW_PLAN_CAPABILITIES: Record<
  PlanType,
  AdminPreviewPlanCapabilities
> = {
  TRIAL: {
    maxIbkrAccounts: 1,
    canConnectIBKR: true,
    canScheduledSync: true,
    canManualSync: true,
    trialUsageLimits: ADMIN_PREVIEW_TRIAL_USAGE_LIMITS,
  },

  BASIC: {
    maxIbkrAccounts: 0,
    canConnectIBKR: false,
    canScheduledSync: false,
    canManualSync: false,
    trialUsageLimits: null,
  },

  PRO: {
    maxIbkrAccounts: 2,
    canConnectIBKR: true,
    canScheduledSync: true,
    canManualSync: false,
    trialUsageLimits: null,
  },

  ELITE: {
    maxIbkrAccounts: "UNLIMITED",
    canConnectIBKR: true,
    canScheduledSync: true,
    canManualSync: true,
    trialUsageLimits: null,
  },
};

const ADMIN_PREVIEW_NO_ENTITLEMENT_CAPABILITIES: AdminPreviewPlanCapabilities = {
  maxIbkrAccounts: null,
  canConnectIBKR: false,
  canScheduledSync: false,
  canManualSync: false,
  trialUsageLimits: null,
};

const SUBSCRIPTION_STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  },
  PAST_DUE: {
    label: "Past due",
    className: "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
  },
  CANCELED: {
    label: "Canceled",
    className: "border-slate-400/20 bg-slate-400/[0.08] text-slate-400",
  },
  INCOMPLETE: {
    label: "Incomplete",
    className: "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
  },
  UNPAID: {
    label: "Unpaid",
    className: "border-red-400/20 bg-red-400/[0.08] text-red-300",
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PAID: {
    label: "Paid",
    className: "text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className: "text-red-400",
  },
  PENDING: {
    label: "Pending",
    className: "text-amber-400",
  },
  UNKNOWN: {
    label: "Unknown",
    className: "text-slate-400",
  },
};

const IBKR_ACCOUNT_STATE_CONFIG: Record<
  IBKRAccountState,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "text-emerald-400",
  },
  INACTIVE: {
    label: "Inactive",
    className: "text-slate-500",
  },
};

const IBKR_CONNECTION_STATUS_CONFIG: Record<
  IBKRConnectionStatus,
  { label: string; className: string }
> = {
  CONNECTED: {
    label: "Connected",
    className: "text-emerald-400",
  },
  DISCONNECTED: {
    label: "Disconnected",
    className: "text-slate-400",
  },
  ERROR: {
    label: "Connection Error",
    className: "text-red-400",
  },
  PENDING: {
    label: "Pending",
    className: "text-amber-400",
  },
};

const IBKR_SYNC_STATUS_CONFIG: Record<
  IBKRSyncStatus,
  { label: string; className: string }
> = {
  SUCCESS: {
    label: "Successful",
    className: "text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className: "text-red-400",
  },
  RUNNING: {
    label: "Running",
    className: "text-blue-400",
  },
  NEVER: {
    label: "Never synced",
    className: "text-slate-500",
  },
};

// =====================================================
// HELPERS
// =====================================================
// =====================================================
// SHARED ADMIN PREVIEW RESOLVERS
// =====================================================

// Fixed evaluation time for deterministic UI testing.
// November 3, 2026, end of day in Toronto.

const ADMIN_PREVIEW_EVALUATION_TIME = Date.parse(
  "2026-11-03T23:59:59.999-05:00"
);

function resolveAdminPreviewApprovalStatus(
  user: AdminUser
): ApprovalStatus {
  return (
    user.approvalStatus ??
    (user.status === "PENDING" ? "PENDING" : "APPROVED")
  );
}

function resolveAdminPreviewDisplayStatus(
  user: AdminUser
): AdminUserDisplayStatus {
  return resolveAdminPreviewApprovalStatus(user) === "REJECTED"
    ? "REJECTED"
    : user.status;
}

function resolveAdminPreviewProvisioningStatus(
  user: AdminUser
): AccessProvisioningStatus {
  return (
    user.accessProvisioningStatus ??
    (user.status === "PENDING"
      ? "NOT_PROVISIONED"
      : "PROVISIONED")
  );
}


function resolveAdminPreviewTrialStatus(
  user: AdminUser
): TrialStatus {
  return (
    user.trialStatus ??
    (user.plan === "TRIAL"
      ? user.entitlementSource === "Expired trial"
        ? "EXPIRED"
        : "ACTIVE"
      : "NOT_APPLICABLE")
  );
}

function resolveAdminPreviewEntitlementPlan(
  user: AdminUser
): PlanType | null {
  // ENTITLEMENT RESOLUTION ONLY
  // Account verification, approval, provisioning, and access
  // restrictions are evaluated separately.

  // ADMINISTRATOR GRANT

  const grant = user.adminGrant ?? null;

  const grantStart = grant
    ? Date.parse(grant.startsAt)
    : Number.NaN;

  const grantExpiry = grant?.expiresAt
    ? Date.parse(grant.expiresAt)
    : null;

  const hasValidGrantDates =
    grant !== null &&
    Number.isFinite(grantStart) &&
    (
      grantExpiry === null ||
      (
        Number.isFinite(grantExpiry) &&
        grantExpiry > grantStart
      )
    );

  const isGrantActive =
    hasValidGrantDates &&
    !grant?.revokedAt &&
    grantStart <= ADMIN_PREVIEW_EVALUATION_TIME &&
    (
      grantExpiry === null ||
      grantExpiry > ADMIN_PREVIEW_EVALUATION_TIME
    );

  if (isGrantActive && grant) {
    return grant.plan;
  }

  // PAID SUBSCRIPTION

  const subscription = user.subscription ?? null;

  const periodStart = subscription
    ? Date.parse(subscription.currentPeriodStart)
    : Number.NaN;

  const periodEnd = subscription
    ? Date.parse(subscription.currentPeriodEnd)
    : Number.NaN;

  const isSubscriptionActive =
    subscription !== null &&
    (
      subscription.status === "ACTIVE" ||
      subscription.status === "PAST_DUE"
    ) &&
    Number.isFinite(periodStart) &&
    Number.isFinite(periodEnd) &&
    periodStart <= ADMIN_PREVIEW_EVALUATION_TIME &&
    periodEnd > ADMIN_PREVIEW_EVALUATION_TIME;

  const scheduledChange = subscription?.scheduledChangeAt
    ? Date.parse(subscription.scheduledChangeAt)
    : Number.NaN;

  const subscriptionPlan: PaidPlanType | null =
    subscription
      ? subscription.scheduledPlan &&
        Number.isFinite(scheduledChange) &&
        scheduledChange <= ADMIN_PREVIEW_EVALUATION_TIME
        ? subscription.scheduledPlan
        : subscription.plan
      : null;

  // LEGACY ADMIN GRANT COMPATIBILITY

  const hasLegacyAdminGrant =
    grant === null &&
    user.entitlementSource === "Administrator grant" &&
    user.plan !== null &&
    user.plan !== "TRIAL";

  if (hasLegacyAdminGrant) {
    return user.plan as PaidPlanType;
  }

  if (isSubscriptionActive && subscriptionPlan) {
    return subscriptionPlan;
  }

  // TRIAL ENTITLEMENT

  const trialStatus =
    resolveAdminPreviewTrialStatus(user);

  if (trialStatus === "ACTIVE") {
    return "TRIAL";
  }

  return null;
}
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
  status: AdminUserDisplayStatus;
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
  const [selectedPlan, setSelectedPlan] = useState<PlanType | "">(
    user.plan ?? ""
  );
  const [effectiveDate, setEffectiveDate] = useState("IMMEDIATELY");
  const [customEffectiveDate, setCustomEffectiveDate] = useState("");
  const [trialDuration, setTrialDuration] = useState("14");
  const [trialStartDate, setTrialStartDate] = useState("");
  const [adminNotes, setAdminNotes] = useState(user.notes);
  const [feedback, setFeedback] = useState("");


  useEffect(() => {
    setSelectedPlan(user.plan ?? "");
    setEffectiveDate("IMMEDIATELY");
    setCustomEffectiveDate("");
    setTrialDuration("14");
    setTrialStartDate("");

    setAdminNotes(user.notes);
    setFeedback("");
  }, [user.id, user.plan, user.status, user.notes]);

  const sectionClass =
    "relative left-1/2 top-[6px] w-[95%] -translate-x-1/2 shrink-0 overflow-hidden rounded-[8px] border border-white/[0.09] bg-gradient-to-b from-[#0B1A2A] to-[#081522]";

  const sectionHeaderClass =
    "relative left-[10px] flex h-[40px] items-center gap-2 border-b border-white/[0.08] px-3.5";

  const sectionContentClass =
    "relative left-[10px] px-3.5 py-1";

   const fieldClass =
    "h-[34px] w-full rounded-[6px] border border-white/[0.09] bg-[#030D19] px-2.5 text-[11px] text-slate-200 outline-none transition-colors focus:border-[#4F8CFF]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78A9FF]";

  const labelClass =
    "mb-1.5 block text-[10px] font-medium text-slate-400";

  const actionButtonClass =
    "flex h-[32px] items-center justify-center gap-2 rounded-[6px] border border-[#347CE8]/30 bg-[#17345A] px-3 text-[10px] font-semibold text-blue-200 transition-colors hover:border-[#5595F5]/50 hover:bg-[#1D4779]";

  const secondaryButtonClass =
    "flex h-[32px] items-center justify-center gap-2 rounded-[6px] border border-white/[0.09] bg-white/[0.035] px-3 text-[10px] font-medium text-slate-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white";

const showPreviewFeedback = (message: string) => {
  setFeedback(message);
};

// =====================================================
// ACCOUNT LIFECYCLE & EFFECTIVE ACCESS
// =====================================================

// APPROVAL

const approvalStatus =
  resolveAdminPreviewApprovalStatus(user);

const displayStatus =
  resolveAdminPreviewDisplayStatus(user);

const isApprovalPending = approvalStatus === "PENDING";
const isApprovalRejected = approvalStatus === "REJECTED";

const approvalStatusLabel =
  approvalStatus === "PENDING"
    ? "Pending approval"
    : approvalStatus === "REJECTED"
      ? "Rejected"
      : "Approved";

// ACCESS PROVISIONING

const provisioningStatus =
  resolveAdminPreviewProvisioningStatus(user);

const isProvisioned =
  provisioningStatus === "PROVISIONED";

// ADMINISTRATOR GRANT LIFECYCLE

const adminGrant = user.adminGrant ?? null;

const grantEvaluationTime =
  ADMIN_PREVIEW_EVALUATION_TIME;

const grantStartTimestamp = adminGrant
  ? Date.parse(adminGrant.startsAt)
  : Number.NaN;

const grantExpiryTimestamp = adminGrant?.expiresAt
  ? Date.parse(adminGrant.expiresAt)
  : null;

const hasValidAdminGrantDates =
  adminGrant !== null &&
  Number.isFinite(grantStartTimestamp) &&
  (
    grantExpiryTimestamp === null ||
    (
      Number.isFinite(grantExpiryTimestamp) &&
      grantExpiryTimestamp > grantStartTimestamp
    )
  );

const isAdminGrantRevoked =
  Boolean(adminGrant?.revokedAt);

const isAdminGrantInvalid =
  adminGrant !== null &&
  !hasValidAdminGrantDates;

const isAdminGrantScheduled =
  hasValidAdminGrantDates &&
  !isAdminGrantRevoked &&
  grantStartTimestamp > grantEvaluationTime;

const isAdminGrantExpired =
  hasValidAdminGrantDates &&
  !isAdminGrantRevoked &&
  grantExpiryTimestamp !== null &&
  grantExpiryTimestamp <= grantEvaluationTime;

const isAdminGrantActive =
  hasValidAdminGrantDates &&
  !isAdminGrantRevoked &&
  grantStartTimestamp <= grantEvaluationTime &&
  (
    grantExpiryTimestamp === null ||
    grantExpiryTimestamp > grantEvaluationTime
  );

// TRIAL LIFECYCLE

const trialStatus =
  resolveAdminPreviewTrialStatus(user);

const isScheduledTrial =
  trialStatus === "SCHEDULED";

const isTrialNotStarted =
  trialStatus === "NOT_STARTED";

// EFFECTIVE ENTITLEMENT RESOLUTION

const paidSubscription = user.subscription ?? null;

const subscriptionPeriodStart = paidSubscription
  ? Date.parse(paidSubscription.currentPeriodStart)
  : Number.NaN;

const subscriptionPeriodEnd = paidSubscription
  ? Date.parse(paidSubscription.currentPeriodEnd)
  : Number.NaN;

// ACTIVE AND PAST-DUE SUBSCRIPTIONS RETAIN ACCESS
// THROUGH THEIR CURRENT BILLING PERIOD IN THIS PREVIEW.

const isPaidSubscriptionActive =
  paidSubscription !== null &&
  (
    paidSubscription.status === "ACTIVE" ||
    paidSubscription.status === "PAST_DUE"
  ) &&
  Number.isFinite(subscriptionPeriodStart) &&
  Number.isFinite(subscriptionPeriodEnd) &&
  subscriptionPeriodStart <= grantEvaluationTime &&
  subscriptionPeriodEnd > grantEvaluationTime;


// TEMPORARY COMPATIBILITY FOR EXISTING MOCK DATA

const hasLegacyAdminGrant =
  adminGrant === null &&
  user.entitlementSource === "Administrator grant" &&
  user.plan !== null &&
  user.plan !== "TRIAL";

// EFFECTIVE ENTITLEMENT

const effectivePlan =
  resolveAdminPreviewEntitlementPlan(user);

// ADMIN PREVIEW PLAN CAPABILITIES

const planCapabilities =
  effectivePlan !== null
    ? ADMIN_PREVIEW_PLAN_CAPABILITIES[effectivePlan]
    : ADMIN_PREVIEW_NO_ENTITLEMENT_CAPABILITIES;

const ibkrLimit =
  planCapabilities.maxIbkrAccounts === null
    ? "N/A"
    : planCapabilities.maxIbkrAccounts === "UNLIMITED"
      ? "Unlimited"
      : String(planCapabilities.maxIbkrAccounts);

const ibkrUsageLimitLabel = ibkrLimit;

const trialUsageQuotaLabel =
  planCapabilities.trialUsageLimits !== null
    ? `${planCapabilities.trialUsageLimits.trades} each`
    : effectivePlan !== null
      ? "No trial quota"
      : "Unavailable";

  const accountAccessLabel =
  isApprovalRejected
    ? "Rejected — No access"
    : user.status === "SUSPENDED"
      ? "Suspended"
      : isApprovalPending
        ? "Pending approval"
        : !isProvisioned
          ? "Not provisioned"
          : !user.verified
            ? "Email unverified — No access"
            : user.status === "READ_ONLY"
              ? "Read-only"
              : user.status === "ACTIVE"
                ? effectivePlan !== null
                  ? "Enabled"
                  : "No active entitlement"
                : "Unavailable";

// APPLICATION ACCESS IS INDEPENDENT OF ENTITLEMENT

const hasApplicationAccess =
  user.verified &&
  approvalStatus === "APPROVED" &&
  isProvisioned &&
  user.status === "ACTIVE" &&
  effectivePlan !== null;

// EFFECTIVE PLAN LABEL

const effectivePlanLabel =
  effectivePlan === "TRIAL"
    ? "Elite Trial"
    : effectivePlan
      ? PLAN_CONFIG[effectivePlan].label
      : isScheduledTrial
        ? "Trial scheduled"
        : isTrialNotStarted
          ? "Trial not started"
          : trialStatus === "EXPIRED"
            ? "Trial expired"
            : "None";

// ADMINISTRATOR GRANT STATUS

const adminGrantStatusLabel =
  !adminGrant
    ? "Not assigned"
    : isAdminGrantRevoked
      ? "Revoked"
      : isAdminGrantInvalid
        ? "Invalid dates"
        : isAdminGrantScheduled
          ? "Scheduled"
          : isAdminGrantExpired
            ? "Expired"
            : isAdminGrantActive
              ? "Active"
              : "Unavailable";

// ADMINISTRATOR GRANT DATE FORMATTING

const formatGrantDate = (
  value: string | null | undefined
): string => {
  if (!value) return "—";

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(timestamp);
};

// ENTITLEMENT SOURCE

const accessSourceLabel =
  isAdminGrantActive || hasLegacyAdminGrant
    ? "Administrator grant"
    : isPaidSubscriptionActive
      ? "Paid subscription"
      : effectivePlan === "TRIAL"
        ? "Trial entitlement"
        : "No active entitlement";

// NEXT ACCESS CHANGE

const accessChangeEvents: {
  timestamp: number;
  label: string;
}[] = [];

const addAccessChangeEvent = (
  dateValue: string | null | undefined,
  label: string
) => {
  if (!dateValue) return;

  const timestamp = Date.parse(dateValue);

  if (
    Number.isFinite(timestamp) &&
    timestamp > grantEvaluationTime
  ) {
    accessChangeEvents.push({
      timestamp,
      label: `${label} ${formatGrantDate(dateValue)}`,
    });
  }
};

// SCHEDULED ADMINISTRATOR GRANT

if (isAdminGrantScheduled && adminGrant) {
  addAccessChangeEvent(
    adminGrant.startsAt,
    "Grant starts"
  );
}

// ACTIVE ADMINISTRATOR GRANT EXPIRATION

if (
  accessSourceLabel === "Administrator grant" &&
  isAdminGrantActive &&
  adminGrant?.expiresAt
) {
  addAccessChangeEvent(
    adminGrant.expiresAt,
    "Grant expires — entitlement will be reevaluated on"
  );
}

// PAID SUBSCRIPTION EVENTS

if (
  accessSourceLabel === "Paid subscription" &&
  isPaidSubscriptionActive &&
  paidSubscription
) {
  if (paidSubscription.status === "PAST_DUE") {
    addAccessChangeEvent(
      paidSubscription.currentPeriodEnd,
      "Past-due entitlement ends — access reevaluated on"
    );
  } else if (paidSubscription.cancelAtPeriodEnd) {
    addAccessChangeEvent(
      paidSubscription.currentPeriodEnd,
      "Subscription ends"
    );
  }

  if (
    paidSubscription.scheduledPlan &&
    paidSubscription.scheduledChangeAt
  ) {
    addAccessChangeEvent(
      paidSubscription.scheduledChangeAt,
      `Plan changes to ${PLAN_CONFIG[paidSubscription.scheduledPlan].label} on`
    );
  }
}

// ACTIVE TRIAL EXPIRATION

if (
  accessSourceLabel === "Trial entitlement" &&
  effectivePlan === "TRIAL"
) {
  addAccessChangeEvent(
    user.trialEndDate ?? user.trialExpiration,
    "Trial expires"
  );
}

// SCHEDULED TRIAL START

if (
  effectivePlan === null &&
  (
    trialStatus === "SCHEDULED" ||
    trialStatus === "NOT_STARTED"
  )
) {
  addAccessChangeEvent(
    user.trialStartDate,
    "Trial starts"
  );
}

// CHRONOLOGICAL EVENT RESOLUTION

const nextTimedAccessChange = [...accessChangeEvents].sort(
  (a, b) => a.timestamp - b.timestamp
)[0];

// FALLBACK WHEN NO FUTURE EVENT EXISTS

const accessChangeFallback =
  effectivePlan === null && trialStatus === "EXPIRED"
    ? "Trial expired"
    : effectivePlan === "TRIAL"
      ? "Trial expiration not recorded"
      : effectivePlan === null &&
          (
            trialStatus === "SCHEDULED" ||
            trialStatus === "NOT_STARTED"
          )
        ? "Trial start date not scheduled"
        : isAdminGrantRevoked
          ? "Grant revoked — fallback entitlement evaluated"
          : "No upcoming access change recorded";

// FINAL ACCESS CHANGE LABEL

const nextAccessChangeLabel =
  isApprovalPending
    ? user.verified
      ? "Awaiting administrator approval"
      : "After email verification and approval"
    : isApprovalRejected
      ? "No activation scheduled"
      : !user.verified
        ? "Awaiting email verification"
        : user.status === "SUSPENDED"
          ? "Account suspended"
          : !isProvisioned
            ? "Awaiting access provisioning"
            : nextTimedAccessChange?.label ??
              accessChangeFallback;

const subscription = user.subscription ?? null;

return (
    <aside className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden rounded-[8px] border border-white/[0.07] bg-[#071321] p-3">

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
  <StatusBadge status={displayStatus} />
  <PlanBadge plan={effectivePlan} />
</div>
        </div>
      </div>

      {feedback && (
        <>
          <div className="h-[8px] w-full shrink-0" />

          <div
            role="status"
            aria-live="polite"
            className="relative left-[10px] w-[calc(100%-20px)] rounded-[6px] border border-blue-400/[0.16] bg-blue-400/[0.05] px-3 py-2"
          >
            <p className="text-[10px] leading-[15px] text-blue-200">
              {feedback}
            </p>
          </div>
        </>
      )}

      {/* ACCOUNT INFORMATION */}

      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <Users size={16} className="text-slate-300" />

          <h3 className="text-[12px] font-semibold text-white">
            Account Information
          </h3>
        </div>

        <div className={sectionContentClass}>
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

{/* ACCOUNT LIFECYCLE & EFFECTIVE ACCESS */}

<section className={`${sectionClass} min-h-[275px] h-auto`}>
  <div className={sectionHeaderClass}>
    <ShieldCheck
      size={16}
      className="text-slate-300"
    />

    <h3 className="text-[12px] font-semibold text-white">
      Account Lifecycle & Effective Access
    </h3>
  </div>

  <div className={sectionContentClass}>

    {/* EMAIL VERIFICATION */}

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

    {/* ADMIN APPROVAL */}

{/* ADMINISTRATOR APPROVAL */}

<DetailRow
  label="Administrator Approval"
  value={approvalStatusLabel}
  compact
valueClassName={
  isApprovalRejected
    ? "text-red-400"
    : isApprovalPending
      ? "text-amber-400"
      : "text-emerald-400"
}
/>

{/* ACCESS PROVISIONING */}

<DetailRow
  label="Access Provisioning"
  value={
    provisioningStatus === "PROVISIONED"
      ? "Provisioned"
      : "Not provisioned"
  }
  compact
  valueClassName={
    isProvisioned
      ? "text-emerald-400"
      : "text-amber-400"
  }
/>

{/* TRIAL LIFECYCLE */}

<DetailRow
  label="Trial Status"
  value={
    trialStatus === "NOT_APPLICABLE"
      ? "Not applicable"
      : trialStatus === "NOT_STARTED"
        ? "Not started"
        : trialStatus === "SCHEDULED"
          ? "Scheduled"
          : trialStatus === "ACTIVE"
            ? "Active"
            : "Expired"
  }
  compact
  valueClassName={
    trialStatus === "ACTIVE"
      ? "text-emerald-400"
      : trialStatus === "EXPIRED"
        ? "text-red-400"
        : trialStatus === "NOT_APPLICABLE"
          ? "text-slate-400"
          : "text-amber-400"
  }
/>

    {/* ACCOUNT ACCESS */}

    <DetailRow
      label="Account Access"
      value={accountAccessLabel}
      compact
valueClassName={
  isApprovalRejected ||
  user.status === "SUSPENDED" ||
  !user.verified
    ? "text-red-400"
    : isApprovalPending || !isProvisioned
      ? "text-amber-400"
      : user.status === "READ_ONLY"
        ? "text-blue-400"
        : user.status === "ACTIVE" && effectivePlan !== null
          ? "text-emerald-400"
          : "text-slate-400"
}
    />

    <div className="my-2 border-t border-white/[0.07]" />

    {/* EFFECTIVE ACCESS */}

    <DetailRow
      label="Entitlement Plan"
      value={effectivePlanLabel}
      compact
      valueClassName={
        effectivePlanLabel === "None" ||
        effectivePlanLabel === "Not activated"
          ? "text-slate-400"
          : "text-[#78A9FF]"
      }
    />

{/* ACCESS SOURCE */}

<DetailRow
  label="Entitlement Source"
  value={accessSourceLabel}
  compact
/>

{/* ADMINISTRATOR GRANT */}

<DetailRow
  label="Administrator Grant"
  value={adminGrantStatusLabel}
  compact
  valueClassName={
    isAdminGrantActive
      ? "text-emerald-400"
      : isAdminGrantScheduled
        ? "text-amber-400"
        : isAdminGrantRevoked ||
            isAdminGrantExpired ||
            isAdminGrantInvalid
          ? "text-red-400"
          : "text-slate-400"
  }
/>

{adminGrant && (
  <>
    <DetailRow
      label="Grant ID"
      value={adminGrant.id}
      compact
    />

    <DetailRow
      label="Grant Plan"
      value={PLAN_CONFIG[adminGrant.plan].label}
      compact
      valueClassName="text-[#78A9FF]"
    />

    <DetailRow
      label="Granted At"
      value={formatGrantDate(adminGrant.grantedAt)}
      compact
    />

    <DetailRow
      label="Grant Starts"
      value={formatGrantDate(adminGrant.startsAt)}
      compact
    />

    <DetailRow
      label="Grant Expires"
      value={
        adminGrant.expiresAt
          ? formatGrantDate(adminGrant.expiresAt)
          : "Permanent"
      }
      compact
    />

    <DetailRow
      label="Grant Revoked"
      value={
        adminGrant.revokedAt
          ? formatGrantDate(adminGrant.revokedAt)
          : "Not revoked"
      }
      compact
      valueClassName={
        adminGrant.revokedAt
          ? "text-red-400"
          : "text-slate-300"
      }
    />

    {adminGrant.revokedAt && (
      <DetailRow
        label="Revocation Reason"
        value={adminGrant.revocationReason ?? "Not provided"}
        compact
        valueClassName="text-red-300"
      />
    )}
  </>
)}

    <DetailRow
      label="Next Access Change"
      value={nextAccessChangeLabel}
      compact
      valueClassName="text-slate-300"
    />

{/* ACCESS RESOLUTION NOTE */}

<div className="relative left-[0px] mt-2 min-h-[62px] w-[calc(100%-20px)] rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-2.5">

  <div className="relative left-[10px] flex min-h-[62px] flex-col justify-center">
    <p className="text-[10px] font-medium text-slate-300">
      Access Resolution
    </p>

    <p className="mt-1 text-[10px] leading-[16px] text-slate-500">
{isApprovalRejected
  ? "This application was rejected. The account cannot access Elite X, and no activation is scheduled."
  : isApprovalPending
    ? user.verified
      ? "Email is verified. Administrator approval is still required before access can be provisioned and the trial can begin."
      : "Email verification and administrator approval are required before account access and trial activation."
    : user.status === "SUSPENDED"
  ? effectivePlan !== null
    ? `Account access is suspended. The ${effectivePlan === "TRIAL" ? "Elite Trial" : PLAN_CONFIG[effectivePlan].label} entitlement is retained, but application access remains blocked until suspension is lifted.`
    : "Account access is suspended. No current plan entitlement is recorded. Application access remains blocked until suspension is lifted."
      : !isProvisioned
        ? "Administrator approval is complete, but application access has not yet been provisioned."
        : !user.verified
          ? "Email verification is required before application access can be provided."
         : user.status === "READ_ONLY"
  ? effectivePlan !== null
    ? `Application access is read-only. The account retains its ${effectivePlan === "TRIAL" ? "Elite Trial" : PLAN_CONFIG[effectivePlan].label} entitlement, but management actions and broker operations are restricted. Historical account data remains accessible.`
    : "Application access is read-only. No current plan entitlement is recorded. Historical account data remains accessible."
            : effectivePlan === "TRIAL"
              ? "The user currently receives Elite trial capabilities subject to trial usage limits."
              : effectivePlan !== null
                ? `The user's ${PLAN_CONFIG[effectivePlan].label} entitlement is currently provided by ${accessSourceLabel.toLowerCase()}. Other entitlement sources do not stack.`
                : trialStatus === "SCHEDULED"
                  ? `The Elite trial is scheduled to begin on ${user.trialStartDate ?? "a date that has not been recorded"}. Trial access is not active yet.`
                  : trialStatus === "NOT_STARTED"
                    ? "The trial has not started. No active trial entitlement is currently available."
                    : trialStatus === "EXPIRED"
                      ? "The Elite trial has expired. No other active entitlement is currently available."
                      : "No active entitlement is currently available for this account."}
    </p>
  </div>

</div>
<div className="h-[6px] w-full shrink-0" />
{/* APPROVAL CONTROLS */}

{isApprovalPending && (
  <>
    <div className="h-[2px] w-full shrink-0" />

    <div className="relative left-[0px] flex min-h-[100px] flex-col justify-center w-[calc(100%-20px)] rounded-[6px] border border-amber-400/[0.14] bg-amber-400/[0.035] px-3 py-3">
<div className="relative left-[10px]">
  <p className="text-[11px] font-semibold text-slate-200">
    Registration Approval
  </p>

  <p className="mt-1 text-[10px] leading-[15px] text-slate-500">
    Approving a verified account starts its 14-day Elite trial.
  </p>
</div>

{/* EMAIL VERIFICATION WARNING SLOT */}

<div className={`w-full shrink-0 ${user.verified ? "h-[8px]" : "flex h-[28px] items-center"}`}>
  {!user.verified && (
    <p className="relative left-[10px] text-[10px] text-amber-400">
      Email verification is required before approval and trial activation.
    </p>
  )}
</div>

<div className="relative left-[16px] flex gap-2">

  <button
    type="button"
    disabled={!user.verified}
onClick={() =>
  showPreviewFeedback(
    "Approval preview only. No account changes were made and the trial was not activated."
  )
}
    className={`${actionButtonClass} w-[175px] shrink-0 disabled:cursor-not-allowed disabled:opacity-40`}
  >
    <UserCheck size={13} />
    Approve & Start Trial
  </button>

  <button
    type="button"
onClick={() =>
  showPreviewFeedback(
    "Rejection preview only. No account changes were made."
  )
}
    className="flex h-[32px] w-[85px] shrink-0 items-center justify-center gap-2 rounded-[6px] border border-red-400/[0.18] bg-red-500/[0.06] px-2 text-[10px] font-medium text-red-300 transition-colors hover:bg-red-500/[0.12]"
  >
    <X size={13} />
    Reject
  </button>

</div>


      </div>

    <div className="h-[8px] w-full shrink-0" />
  </>
    )}

  </div>
</section>

{/* SUBSCRIPTION AND PLAN */}

<section className={`${sectionClass} min-h-[200px] h-auto`}>
  <div className={sectionHeaderClass}>
    <Activity size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      Subscription & Plan
    </h3>
  </div>

  <div className="relative left-[10px] top-[4px] w-[calc(100%-20px)] px-3.5 pb-4 pt-1">

    {/* CURRENT SUBSCRIPTION SUMMARY */}

    <div className="mb-3 rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-3">

      {/* INTERNAL CONTENT WIDTH */}

      <div className="relative left-[8px] w-[90%]">
<div className="h-[6px] w-full shrink-0" />
        <div className="flex items-center justify-between gap-2">

          <p className="text-[11px] font-semibold text-slate-200">
            Current Subscription
          </p>

          {subscription && (
<span
  className={`inline-flex h-[20px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border text-[9px] font-semibold ${
    SUBSCRIPTION_STATUS_CONFIG[subscription.status].className
  }`}
>
  {SUBSCRIPTION_STATUS_CONFIG[subscription.status].label}
</span>
          )}

        </div>
<div className="h-[6px] w-full shrink-0" />
        {subscription ? (
          <>

            {/* SUBSCRIPTION DETAILS */}

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">

              <div>
                <p className="text-[9px] text-slate-500">
                  Plan
                </p>

                <p className="mt-1 text-[11px] font-semibold text-[#78A9FF]">
                  {PLAN_CONFIG[subscription.plan].label}
                </p>
              </div>

              <div>
                <p className="text-[9px] text-slate-500">
                  Price
                </p>

                <p className="mt-1 text-[10px] text-slate-200">
                  {subscription.priceLabel}
                </p>
              </div>

              <div>
                <p className="text-[9px] text-slate-500">
                  Billing Period
                </p>

                <p className="mt-1 text-[10px] text-slate-200">
                  {subscription.billingInterval}
                </p>
              </div>

              <div>
                <p className="text-[9px] text-slate-500">
                  Payment Status
                </p>

                <p
                  className={`mt-1 text-[10px] font-semibold ${
                    PAYMENT_STATUS_CONFIG[subscription.paymentStatus].className
                  }`}
                >
                  {PAYMENT_STATUS_CONFIG[subscription.paymentStatus].label}
                </p>
              </div>

            </div>
<div className="h-[4px] w-full shrink-0" />
            <div className="my-3 border-t border-white/[0.07]" />
<div className="h-[2px] w-full shrink-0" />
            {/* BILLING PERIOD */}

            <div className="space-y-2">

              <DetailRow
                label="Period Start"
                value={subscription.currentPeriodStart}
                compact
              />

              <DetailRow
                label="Period End"
                value={subscription.currentPeriodEnd}
                compact
              />

              <DetailRow
                label="Renewal"
                value={
                  subscription.cancelAtPeriodEnd
                    ? `Ends ${subscription.currentPeriodEnd}`
                    : subscription.status === "ACTIVE"
                      ? `Renews ${subscription.currentPeriodEnd}`
                      : "No renewal scheduled"
                }
                compact
                valueClassName="text-slate-200"
              />

              <DetailRow
                label="Cancellation"
                value={
                  subscription.cancelAtPeriodEnd
                    ? "Scheduled"
                    : subscription.status === "CANCELED"
                      ? "Completed"
                      : "Not scheduled"
                }
                compact
                valueClassName={
                  subscription.cancelAtPeriodEnd
                    ? "text-amber-400"
                    : "text-slate-300"
                }
              />

            </div>

{/* SCHEDULED PLAN CHANGE */}

<div className="mt-3 flex min-h-[35px] items-center rounded-[6px] border border-[#4F8CFF]/15 bg-[#17345A]/25 px-2.5">

  <div className="relative left-[8px]">

    <p className="text-[9px] font-medium text-slate-400">
      Scheduled Plan Change
    </p>

    {subscription.scheduledPlan &&
    subscription.scheduledChangeAt ? (
      <p className="mt-1 text-[10px] font-semibold text-[#78A9FF]">
        {PLAN_CONFIG[subscription.scheduledPlan].label}

        <span className="ml-1 font-normal text-slate-400">
          · Effective {subscription.scheduledChangeAt}
        </span>
      </p>
    ) : (
      <p className="mt-1 text-[10px] text-slate-500">
        No scheduled plan change.
      </p>
    )}

  </div>

</div>

<div className="h-[6px] w-full shrink-0" />
{/* BILLING SOURCE */}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[9px] text-slate-500">
                Billing Source
              </span>

              <span className="text-[10px] font-medium text-slate-300">
                Stripe
              </span>
            </div>

          </>
        ) : (
<div className="rounded-[6px] border border-dashed border-white/[0.08] px-3 py-3">

  <div className="relative left-[8px]  w-[90%]">
<div className="h-[2px] w-full shrink-0" />
    <p className="text-[10px] font-medium text-slate-300">
      No subscription record
    </p>

    <p className="mt-1 text-[9px] leading-[15px] text-slate-500">
      Subscription information is not available in this preview.
      Trial and administrator-granted access are managed separately.
    </p>
<div className="h-[0px] w-full shrink-0" />
  </div>

</div>

        )}
<div className="h-[2px] w-full shrink-0" />
      </div>
<div className="h-[4px] w-full shrink-0" />
    </div>
<div className="h-[6px] w-full shrink-0" />
    {/* END CURRENT SUBSCRIPTION SUMMARY */}

    {/* PLAN ASSIGNMENT */}

    <div style={{ marginBottom: "8px" }}>
      <label
        htmlFor="admin-assign-plan"
        className={labelClass}
      >
        Assign Plan
      </label>

      <select
        id="admin-assign-plan"
        value={selectedPlan}
        onChange={(event) =>
          setSelectedPlan(event.target.value as PlanType | "")
        }
        className={`${fieldClass} relative top-[2px]`}
      >
        <option value="">Not assigned</option>
        <option value="TRIAL">Trial</option>
        <option value="BASIC">Basic</option>
        <option value="PRO">Pro</option>
        <option value="ELITE">Elite</option>
      </select>
    </div>

    {/* PLAN EFFECTIVE DATE */}

    <div style={{ marginBottom: "8px" }}>
      <label
        htmlFor="admin-plan-effective-date"
        className={labelClass}
      >
        Plan Effective Date
      </label>

      <select
        id="admin-plan-effective-date"
        value={effectiveDate}
        onChange={(event) =>
          setEffectiveDate(event.target.value)
        }
        className={`${fieldClass} relative top-[2px]`}
      >
        <option value="IMMEDIATELY">Immediately</option>
        <option value="NEXT_BILLING">Next billing cycle</option>
        <option value="CUSTOM">Custom date</option>
      </select>
    </div>

    {/* CUSTOM EFFECTIVE DATE */}

    {effectiveDate === "CUSTOM" && (
      <div style={{ marginBottom: "8px" }}>
        <label
          htmlFor="admin-custom-effective-date"
          className={labelClass}
        >
          Custom Effective Date
        </label>

        <input
          id="admin-custom-effective-date"
          type="date"
          value={customEffectiveDate}
          onChange={(event) =>
            setCustomEffectiveDate(event.target.value)
          }
          onClick={(event) => {
            const input = event.currentTarget;

            if (typeof input.showPicker === "function") {
              try {
                input.showPicker();
              } catch {
                input.focus();
              }
            }
          }}
          style={{ textIndent: "10px" }}
          className={`${fieldClass} cursor-pointer admin-date-input`}
        />
      </div>
    )}

    {/* APPLY PLAN */}

    <button
      type="button"
      onClick={() =>
        showPreviewFeedback(
          "Plan assignment preview only. No account changes were made."
        )
      }
      className={`${actionButtonClass} w-full`}
    >
      <CheckCircle2 size={13} />
      Apply Plan
    </button>

  </div>

  <div className="h-[12px] w-full shrink-0" />

</section>

{/* TRIAL MANAGEMENT & USAGE */}

<section className={`${sectionClass} min-h-[240px] h-auto`}>
  <div className={sectionHeaderClass}>
    <Clock3 size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      Trial Management & Usage
    </h3>
  </div>

  <div className="relative left-[10px] top-[4px] w-[calc(100%-20px)] px-3.5 pb-4 pt-1">

{/* TRIAL STATUS */}

<div className="relative left-[0px] flex min-h-[60px] w-full flex-col justify-center rounded-[6px] border border-blue-400/[0.12] bg-[#101E2E] px-3">
<div className="h-[4px] w-full shrink-0" />
  <div className="relative left-[10px]">
    <p className="text-[10px] font-medium text-slate-400">
      Trial Entitlement
    </p>

    <p className="mt-1 text-[12px] font-semibold text-[#78A9FF]">
      {trialStatus === "ACTIVE"
        ? "Elite Trial"
        : trialStatus === "SCHEDULED"
          ? "Scheduled Elite Trial"
          : trialStatus === "NOT_STARTED"
            ? "Trial Not Started"
            : trialStatus === "EXPIRED"
              ? "Expired Elite Trial"
              : "No Trial Entitlement"}
    </p>

    <p className="mt-1 text-[10px] text-slate-500">
      {trialStatus === "ACTIVE"
        ? `Active Elite trial. Expires ${user.trialEndDate ?? user.trialExpiration ?? "date not recorded"}. Usage limits apply.`
        : trialStatus === "SCHEDULED"
          ? `Scheduled to begin ${user.trialStartDate ?? "on a date not recorded"}. Trial capabilities are not active yet.`
          : trialStatus === "NOT_STARTED"
            ? "The trial has not started. No trial entitlement is currently active."
            : trialStatus === "EXPIRED"
              ? `The trial expired ${user.trialEndDate ?? user.trialExpiration ?? "on an unrecorded date"}. Another valid entitlement may still provide access.`
              : "This account has no trial entitlement. Paid and administrator-granted access are managed separately."}
    </p>

  </div>

</div>

    <div className="h-[10px] w-full shrink-0" />

    {/* TRIAL CONFIGURATION */}

    <div style={{ marginBottom: "8px" }}>
      <label
        htmlFor="admin-trial-duration"
        className={labelClass}
      >
        Trial Duration
      </label>

      <select
        id="admin-trial-duration"
        value={trialDuration}
        onChange={(event) =>
          setTrialDuration(event.target.value)
        }
        className={`${fieldClass} relative top-[2px]`}
      >
        <option value="7">7 days</option>
        <option value="14">14 days</option>
        <option value="30">30 days</option>
        <option value="60">60 days</option>
        <option value="90">90 days</option>
      </select>
    </div>

    <div style={{ marginBottom: "8px" }}>
      <label
        htmlFor="admin-trial-start-date"
        className={labelClass}
      >
        Trial Start Date
      </label>

      <input
        id="admin-trial-start-date"
        type="date"
        value={trialStartDate}
        onChange={(event) =>
          setTrialStartDate(event.target.value)
        }
        onClick={(event) => {
          const input = event.currentTarget;

          if (typeof input.showPicker === "function") {
            try {
              input.showPicker();
            } catch {
              input.focus();
            }
          }
        }}
        style={{ textIndent: "10px" }}
        className={`${fieldClass} relative top-[2px] cursor-pointer admin-date-input`}
      />
    </div>

{/* CURRENT EXPIRATION */}

<div className="relative left-[0px] top-[2px] w-full rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-2">

  <div className="relative left-[10px]">
    <p className="text-[10px] text-slate-500">
      Current Trial Expiration
    </p>

<p className="mt-1 text-[11px] font-medium text-slate-200">
  {trialStatus === "NOT_APPLICABLE"
    ? "Not applicable"
    : trialStatus === "NOT_STARTED" ||
        trialStatus === "SCHEDULED"
      ? "Not started"
      : user.trialEndDate ?? user.trialExpiration ?? "Not recorded"}
</p>
  </div>

</div>

<div className="h-[14px] w-full shrink-0" />

{/* TRIAL USAGE */}

<div className="relative left-[0px]">

  <div className="flex items-center justify-between">
    <p className="text-[11px] font-semibold text-slate-200">
      Trial Usage
    </p>

   <span className="text-[9px] text-slate-500">
  {user.trialUsage
    ? "Account usage snapshot"
    : "Usage not recorded"}
</span>
  </div>

{user.trialUsage ? (
  <div className="mt-2 grid grid-cols-2 gap-2">

    {[
  {
    label: "Trades",
    used: user.trialUsage.tradesUsed,
    limit: ADMIN_PREVIEW_TRIAL_USAGE_LIMITS.trades,
  },
  {
    label: "Expenses",
    used: user.trialUsage.expensesUsed,
    limit: ADMIN_PREVIEW_TRIAL_USAGE_LIMITS.expenses,
  },
  {
    label: "Notes",
    used: user.trialUsage.notesUsed,
    limit: ADMIN_PREVIEW_TRIAL_USAGE_LIMITS.notes,
  },
  {
    label: "IBKR Accounts",
    used: user.trialUsage.ibkrAccountsUsed,
    limit: ADMIN_PREVIEW_TRIAL_USAGE_LIMITS.ibkrAccounts,
  },
].map((item) => {
      const usagePercentage = Math.min(
        Math.max((item.used / item.limit) * 100, 0),
        100
      );

      return (
        <div
          key={item.label}
          className="flex h-[30px] w-full flex-col justify-center rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3"
        >

          <div className="relative left-[8px] w-[90%]">

            <div className="flex items-center justify-between gap-2">

              <p className="text-[10px] text-slate-400">
                {item.label}
              </p>

              <p className="shrink-0 text-[10px] font-medium text-slate-200">
                {item.used}/{item.limit}
              </p>

            </div>

            <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.07]">

              <div
                className="h-full rounded-full bg-[#4F8CFF]"
                style={{
                  width: `${usagePercentage}%`,
                }}
              />

            </div>

          </div>

        </div>
      );
    })}

  </div>
) : (
  <div className="relative left-[0px] top-[6px] flex min-h-[48px] w-full items-center rounded-[6px] border border-dashed border-white/[0.08] bg-[#101E2E] px-3">

    <p className="relative left-[8px] text-[10px] text-slate-500">
      {trialStatus === "NOT_APPLICABLE"
        ? "No trial entitlement for this account."
        : "Trial usage has not been recorded for this account."}
    </p>

  </div>
)}

</div>

<div className="h-[14px] w-full shrink-0" />

{/* TRIAL ACTIONS */}

{user.verified &&
 approvalStatus === "APPROVED" &&
 isProvisioned &&
 user.status === "ACTIVE" ? (

  <div className="flex gap-2">

    {trialStatus === "NOT_STARTED" && (
      <button
        type="button"
        onClick={() =>
          showPreviewFeedback(
            "Trial activation preview only. No account changes were made."
          )
        }
        className={`${actionButtonClass} flex-1`}
      >
        <CheckCircle2 size={13} />
        Start Trial
      </button>
    )}

    {trialStatus === "ACTIVE" && (
      <button
        type="button"
        onClick={() =>
          showPreviewFeedback(
            "Trial extension preview only. No account changes were made."
          )
        }
        className={`${secondaryButtonClass} flex-1`}
      >
        <RotateCcw size={13} />
        Extend Trial
      </button>
    )}

    {trialStatus !== "NOT_STARTED" &&
     trialStatus !== "ACTIVE" && (
      <p className="text-[10px] leading-[16px] text-slate-500">
        {trialStatus === "SCHEDULED"
          ? "Trial is scheduled. Trial actions are unavailable until it starts."
          : trialStatus === "EXPIRED"
            ? "Trial has expired. A new entitlement is required."
            : "No trial entitlement is assigned to this account."}
      </p>
    )}

  </div>

) : (
  <div className="rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-2.5">

    <p className="relative left-[8px] text-[10px] leading-[16px] text-slate-500">
      {!user.verified
        ? "Email verification is required before trial actions are available."
        : isApprovalRejected
          ? "Rejected applications cannot activate or extend a trial."
          : isApprovalPending
            ? "Administrator approval is required before trial actions are available."
            : !isProvisioned
              ? "Application access must be provisioned before trial actions are available."
              : user.status === "SUSPENDED"
                ? "Trial actions are unavailable while the account is suspended."
                : "Trial actions are unavailable for this account's current access state."}
    </p>

  </div>
)}

  </div>

  {/* BOTTOM SPACING */}

  <div className="h-[12px] w-full shrink-0" />

</section>


{/* IBKR ACCOUNTS & SYNCHRONIZATION */}

<section className={`${sectionClass} min-h-[150px] h-auto`}>
  <div className={sectionHeaderClass}>
    <Activity size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      IBKR Accounts & Synchronization
    </h3>
  </div>

  <div className="relative left-[10px] top-[4px] w-[calc(100%-20px)] px-3.5 pb-4 pt-1">

    {/* ACCOUNT USAGE */}

    <div className="relative left-[0px] top-[4px] w-full rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-2">
<div className="h-[4px] w-full shrink-0" />
      <div className="relative left-[8px] w-[90%]">

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            IBKR Account Usage
          </p>

          <p className="text-[11px] font-semibold text-slate-200">
{(user.ibkrAccounts ?? []).filter(
  (account) => account.accountState === "ACTIVE"
).length}
{" / "}
{ibkrUsageLimitLabel}
          </p>
        </div>
<div className="h-[4px] w-full shrink-0" />
      </div>

    </div>

    <div className="h-[12px] w-full shrink-0" />

{/* IBKR ACCOUNT RECORDS */}

<div className="relative left-[0px]">

  <div className="flex items-center justify-between">
    <p className="text-[11px] font-semibold text-slate-200">
      IBKR Account Records
    </p>

    <span className="text-[9px] text-slate-500">
      Mock account data
    </span>
  </div>

      <div className="h-[8px] w-full shrink-0" />

      {(user.ibkrAccounts ?? []).length > 0 ? (

        <div className="flex flex-col gap-2">

          {(user.ibkrAccounts ?? []).map((account) => (

            <div
              key={account.id}
              className="w-full rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-3"
            >

              <div className="relative left-[8px] w-[90%]">

                {/* ACCOUNT HEADER */}
<div className="h-[6px] w-full shrink-0" />
                <div className="flex items-center justify-between gap-2">

                  <p className="text-[11px] font-semibold text-slate-200">
                    {account.maskedAccountId}
                  </p>

                  <span
                    className={`text-[9px] font-semibold ${
                      IBKR_ACCOUNT_STATE_CONFIG[account.accountState].className
                    }`}
                  >
                    {IBKR_ACCOUNT_STATE_CONFIG[account.accountState].label}
                  </span>

                </div>

                <div className="h-[10px] w-full shrink-0" />

                {/* CONNECTION STATUS */}

                <div className="space-y-2">

                  <DetailRow
                    label="Connection"
                    value={
                      IBKR_CONNECTION_STATUS_CONFIG[account.connectionStatus].label
                    }
                    compact
                    valueClassName={
                      IBKR_CONNECTION_STATUS_CONFIG[account.connectionStatus].className
                    }
                  />

                  <DetailRow
                    label="Scheduled Sync"
                    value={
                      account.scheduledSyncEnabled ? "Enabled" : "Disabled"
                    }
                    compact
                    valueClassName={
                      account.scheduledSyncEnabled
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }
                  />

                  <DetailRow
                    label="Last Successful Sync"
                    value={account.lastSuccessfulSync ?? "Never"}
                    compact
                  />

                  <DetailRow
                    label="Last Sync Status"
                    value={
                      IBKR_SYNC_STATUS_CONFIG[account.lastSyncStatus].label
                    }
                    compact
                    valueClassName={
                      IBKR_SYNC_STATUS_CONFIG[account.lastSyncStatus].className
                    }
                  />

                </div>

                {/* LAST SYNC RESULT */}

                <div className="h-[10px] w-full shrink-0" />

                <div className="rounded-[6px] border border-white/[0.06] bg-[#0B1827] px-2.5 py-2">
<div className="h-[4px] w-full shrink-0" />
                  <div className="relative left-[6px]">
                    <p className="text-[9px] text-slate-500">
                      Last Sync Result
                    </p>

                    <p className="mt-1 text-[10px] leading-[15px] text-slate-300">
                      {account.lastSyncResult}
                    </p>
                  </div>
<div className="h-[4px] w-full shrink-0" />
                </div>
<div className="h-[8px] w-full shrink-0" />
              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="rounded-[6px] border border-dashed border-white/[0.08] bg-[#101E2E] px-3 py-3">

          <div className="relative left-[8px] w-[90%]">
            <p className="text-[10px] font-medium text-slate-300">
              No IBKR accounts connected
            </p>

            <p className="mt-1 text-[9px] leading-[15px] text-slate-500">
              No broker account records are available for this user.
            </p>
          </div>

        </div>

      )}

    </div>

  </div>

  <div className="h-[12px] w-full shrink-0" />

</section>

{/* END IBKR ACCOUNTS & SYNCHRONIZATION */}


{/* ACCOUNT ACCESS AND PERMISSIONS */}

<section className={`${sectionClass} min-h-[380px] h-auto`}>
  <div className={sectionHeaderClass}>
    <ShieldCheck size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      Account Access & Permissions
    </h3>
  </div>

  <div className="relative left-[10px] top-[4px] w-[calc(100%-20px)] px-3.5 pb-4 pt-1">

    {(() => {
const hasAccess = hasApplicationAccess;
const isReadOnly = user.status === "READ_ONLY";
const isSuspended = user.status === "SUSPENDED";
const isPending = isApprovalPending;

const accessState = isApprovalRejected
  ? "Rejected"
  : isPending
    ? "Pending Approval"
    : isSuspended
      ? "Suspended"
      : !isProvisioned
        ? "Not Provisioned"
        : isReadOnly
          ? "Read-only"
          : hasAccess
            ? "Full Access"
            : "Unavailable";

const accessStateClass =
  isApprovalRejected || isSuspended
    ? "text-red-400"
    : isPending
      ? "text-amber-400"
      : isReadOnly
        ? "text-blue-400"
        : hasAccess
          ? "text-emerald-400"
          : "text-slate-400";

const planLabel = effectivePlanLabel;

const accessSource = accessSourceLabel;

const canViewHistoricalData =
  user.verified &&
  isProvisioned &&
  approvalStatus === "APPROVED" &&
  user.status === "READ_ONLY";

const canViewData =
  hasAccess || canViewHistoricalData;

const capabilities = {
  trades: {
    view: canViewData,
    manage: hasAccess,
  },
  expenses: {
    view: canViewData,
    manage: hasAccess,
  },
  notes: {
    view: canViewData,
    manage: hasAccess,
  },
  analytics: canViewData,
  export: canViewData,
  ibkrConnect:
    hasAccess &&
    planCapabilities.canConnectIBKR,
  scheduledSync:
    hasAccess &&
    planCapabilities.canScheduledSync,
  manualSync:
    hasAccess &&
    planCapabilities.canManualSync,
};

const permissionValue = (allowed: boolean) =>
  allowed ? "Allowed" : "Restricted";

const permissionClass = (allowed: boolean) =>
  allowed ? "text-emerald-400" : "text-slate-500";

const PermissionGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            {title}
          </p>

          <div className="h-[6px] w-full shrink-0" />

          <div className="rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-1">
            <div className="relative left-[8px] w-[90%]">
              {children}
            </div>
          </div>
        </div>
      );

      return (
        <>
          {/* EFFECTIVE ACCESS */}

          <div className="rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-3">

          <div className="relative left-[8px] top-[0px] w-[90%]">

              <div className="relative top-[6px] flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-200">
                  Effective Access
                </p>

<span className={`relative -left-[20px] text-[10px] font-semibold ${accessStateClass}`}>
  {accessState}
</span>
              </div>

              <div className="h-[10px] w-full shrink-0" />

              <DetailRow
               label="Entitlement Plan"
                value={planLabel}
                compact
                valueClassName="text-[#78A9FF]"
              />

              <DetailRow
               label="Entitlement Source"
                value={accessSource}
                compact
              />

              <DetailRow
  label="Account Status"
  value={STATUS_CONFIG[displayStatus].label}
  compact
  valueClassName={STATUS_CONFIG[displayStatus].className}
/>

            </div>

          </div>

          <div className="h-[12px] w-full shrink-0" />

          {/* TRADING & JOURNAL */}

          <PermissionGroup title="Trading & Journal Permissions">
            <DetailRow
              label="View Trades"
              value={permissionValue(capabilities.trades.view)}
              compact
              valueClassName={permissionClass(capabilities.trades.view)}
            />

            <DetailRow
              label="Create / Edit / Delete Trades"
              value={permissionValue(capabilities.trades.manage)}
              compact
              valueClassName={permissionClass(capabilities.trades.manage)}
            />

            <DetailRow
              label="View Analytics"
              value={permissionValue(capabilities.analytics)}
              compact
              valueClassName={permissionClass(capabilities.analytics)}
            />

            <DetailRow
              label="Export Data"
              value={permissionValue(capabilities.export)}
              compact
              valueClassName={permissionClass(capabilities.export)}
            />
          </PermissionGroup>

          <div className="h-[10px] w-full shrink-0" />

          {/* BUSINESS MANAGEMENT */}

          <PermissionGroup title="Business Management Permissions">
            <DetailRow
              label="View Expenses"
              value={permissionValue(capabilities.expenses.view)}
              compact
              valueClassName={permissionClass(capabilities.expenses.view)}
            />

            <DetailRow
              label="Create / Edit / Delete Expenses"
              value={permissionValue(capabilities.expenses.manage)}
              compact
              valueClassName={permissionClass(capabilities.expenses.manage)}
            />

            <DetailRow
              label="View Notes"
              value={permissionValue(capabilities.notes.view)}
              compact
              valueClassName={permissionClass(capabilities.notes.view)}
            />

            <DetailRow
              label="Create / Edit / Delete Notes"
              value={permissionValue(capabilities.notes.manage)}
              compact
              valueClassName={permissionClass(capabilities.notes.manage)}
            />
          </PermissionGroup>

          <div className="h-[10px] w-full shrink-0" />

          {/* IBKR PERMISSIONS */}

          <PermissionGroup title="Broker Permissions">
            <DetailRow
              label="Connect IBKR"
              value={permissionValue(capabilities.ibkrConnect)}
              compact
              valueClassName={permissionClass(capabilities.ibkrConnect)}
            />

            <DetailRow
              label="Scheduled Synchronization"
              value={permissionValue(capabilities.scheduledSync)}
              compact
              valueClassName={permissionClass(capabilities.scheduledSync)}
            />

            <DetailRow
              label="Manual Sync Now"
              value={permissionValue(capabilities.manualSync)}
              compact
              valueClassName={permissionClass(capabilities.manualSync)}
            />
          </PermissionGroup>

          <div className="h-[10px] w-full shrink-0" />

          {/* ACCESS LIMITS */}

          <PermissionGroup title="Access Limits & Restrictions">
            <DetailRow
              label="Maximum IBKR Accounts"
              value={ibkrLimit}
              compact
            />

<DetailRow
  label="Trade / Expense / Notes Quotas"
  value={trialUsageQuotaLabel}
  compact
/>
          </PermissionGroup>

          <div className="h-[10px] w-full shrink-0" />

          {/* ACCESS EXPLANATION */}

          <div className="rounded-[6px] border border-white/[0.07] bg-[#101E2E] px-3 py-2.5">
            <div className="relative left-[8px] w-[90%]">
              <div className="h-[4px] w-full shrink-0" />
              <p className="text-[10px] font-medium text-slate-300">
                Permission Resolution
              </p>

              <p className="mt-1 text-[10px] leading-[15px] text-slate-500">
{isApprovalRejected
  ? "This application was rejected. Application permissions are unavailable, while existing account data remains preserved."
  : isPending
    ? user.verified
      ? "Email is verified, but administrator approval is still required before application permissions can be granted."
      : "Email verification and administrator approval are required before application permissions can be granted."
    : isSuspended
      ? effectivePlan !== null
        ? `Application access is suspended. The ${effectivePlan === "TRIAL" ? "Elite Trial" : PLAN_CONFIG[effectivePlan].label} entitlement remains recorded, but all application capabilities are restricted.`
        : "Application access is suspended. No current plan entitlement is recorded. All application capabilities are restricted."
      : !user.verified
        ? "Email verification is required before application permissions can be granted."
        : !isProvisioned
          ? "Administrator approval is complete, but application access has not been provisioned. All application capabilities remain restricted."
          : isReadOnly
            ? "Read-only access permits viewing historical trades, expenses, notes and analytics, and exporting records. Creating, editing, deleting, and all IBKR operations are restricted."
            : !hasAccess
              ? effectivePlan === null
                ? "No active entitlement is available. Application capabilities remain restricted until an eligible plan is assigned."
                : "The account has a recorded entitlement, but its current account-access state does not permit full application access."
              : effectivePlan === "TRIAL"
                ? "Full Elite trial capabilities are available, subject to the configured trial usage limits and plan-specific IBKR restrictions."
                : "Full application access is available. Individual capabilities are determined by the effective plan and its limits."}
              </p>
            </div>
            <div className="h-[4px] w-full shrink-0" />
          </div>
<div className="h-[4px] w-full shrink-0" />
        </>
      );
    })()}

  </div>

  <div className="h-[12px] w-full shrink-0" />

</section>

{/* ACCOUNT SECURITY */}

<section className={`${sectionClass} min-h-[154px]`}>
  <div className={sectionHeaderClass}>
    <ShieldCheck size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      Account Security
    </h3>
  </div>

  <div className="relative left-[10px] top-[4px] flex w-[calc(100%-20px)] flex-col gap-3 px-3.5 py-3">
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

<div className="relative -top-[10px] flex flex-col gap-2">
  <button
    type="button"
    onClick={() =>
      showPreviewFeedback(
        "Password reset preview only. No email was sent."
      )
    }
    className={`${secondaryButtonClass} w-full`}
  >
    <Bell size={13} />
    Send Password Reset
  </button>

  <button
    type="button"
    onClick={() =>
      showPreviewFeedback(
        "Session revocation preview only. No sessions were revoked."
      )
    }
    className={`${secondaryButtonClass} w-full`}
  >
    <RotateCcw size={13} />
    Revoke All Sessions
  </button>
</div>

    {!user.verified && (
      <button
        type="button"
        onClick={() =>
          showPreviewFeedback(
            "Email verification review preview only. No account changes were made."
          )
        }
        className={`${secondaryButtonClass} relative -top-[14px] w-full`}
      >
        <CheckCircle2 size={13} />
        Review Email Verification
      </button>
    )}
  </div>
</section>

{/* ACCOUNT NOTES */}

      <section className={sectionClass}>
        <div className={sectionHeaderClass}>
          <FileText size={16} className="text-slate-300" />

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

{/* ADMINISTRATOR NOTES */}

<section className={`${sectionClass} h-[200px]`}>
  <div className={sectionHeaderClass}>
    <FileText size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      Administrator Notes
    </h3>
  </div>

  <div className="h-[120px] p-3">
    <div className="relative left-1/2 top-1/2 flex h-[90%] w-[95%] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[8px] border border-white/[0.07] bg-[#101E2E]">
      <div
        className="w-full"
        style={{ padding: "12px 16px" }}
      >
        <label
          htmlFor="admin-internal-notes"
          className={`${labelClass} relative -top-[4px]`}
        >
          Internal Notes
        </label>

        <textarea
          id="admin-internal-notes"
          value={adminNotes}
          onChange={(event) =>
            setAdminNotes(event.target.value)
          }
          rows={4}
          placeholder="Add internal administrator notes..."
          className="min-h-0 w-full resize-y border-0 bg-transparent px-0 py-1 text-[12px] leading-[18px] text-slate-200 outline-none placeholder:text-slate-600 focus:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78A9FF]"
        />
      </div>
    </div>

    <div className="relative left-1/2 top-[12px] mt-2 w-[95%] -translate-x-1/2">
      <button
        type="button"
        onClick={() =>
          showPreviewFeedback(
            "Administrator note save preview only. Notes were not persisted."
          )
        }
        className={`${actionButtonClass} w-full`}
      >
        <CheckCircle2 size={13} />
        Save Notes
      </button>
    </div>
  </div>
</section>

{/* AUDIT HISTORY */}

<section className={`${sectionClass} h-[120px]`}>
  <div className={sectionHeaderClass}>
    <CalendarDays size={16} className="text-slate-300" />

    <h3 className="text-[12px] font-semibold text-white">
      Audit History
    </h3>
  </div>

  <div className="relative left-[10px] top-[4px] w-[calc(100%-20px)] space-y-3 px-3.5 py-3">

{/* ACCOUNT REGISTRATION */}

<div className="flex items-start gap-2.5">
  <span className="relative top-[6px] h-[7px] w-[7px] shrink-0 rounded-full bg-blue-400" />

  <div className="min-w-0">
    <p className="text-[11px] font-medium text-slate-300">
      Account registered
    </p>

    <p className="mt-0.5 text-[10px] text-slate-500">
      {user.registered}
    </p>
  </div>
</div>

{/* EMAIL VERIFICATION */}

<div className="relative top-[4px] flex items-start gap-2.5">
  <span
    className={`relative top-[6px] h-[7px] w-[7px] shrink-0 rounded-full ${
      user.verified
        ? "bg-emerald-400"
        : "bg-amber-400"
    }`}
  />

  <div className="min-w-0">
    <p className="text-[11px] font-medium text-slate-300">
      {user.verified
        ? "Email verified"
        : "Email verification pending"}
    </p>

    <p className="mt-0.5 text-[10px] text-slate-500">
      Current account state
    </p>
  </div>
</div>


  </div>
</section>

{/* DANGER ZONE */}

<section
  className={`${sectionClass} mb-2 h-[204px] !border-red-400/[0.18] !bg-gradient-to-b !from-[#21151B] !to-[#160F17]`}
>
  {/* HEADER */}

  <div className="relative left-[10px] flex h-[40px] items-center gap-2 border-b border-red-400/[0.12] px-3.5">
    <AlertCircle size={16} className="text-red-300" />

    <h3 className="text-[12px] font-semibold text-red-200">
      Danger Zone
    </h3>
  </div>

  {/* CONTENT */}

  <div className="relative left-[10px] top-[4px] w-[calc(100%-20px)] space-y-3 px-3.5 py-3">

    {/* REVOKE ACCOUNT ACCESS */}

    <div>
      <p className="text-[11px] font-medium text-slate-200">
        Revoke Account Access
      </p>

      <p className="mt-1 text-[10px] leading-[15px] text-slate-500">
        Restrict this account from accessing the application.
      </p>
<div className="h-[6px] w-full shrink-0" />
      <button
        type="button"
        onClick={() =>
          showPreviewFeedback(
            "Access revocation preview only. The account remains unchanged."
          )
        }
        className="mt-2 flex h-[31px] w-full items-center justify-center gap-2 rounded-[6px] border border-red-400/[0.20] bg-red-500/[0.08] px-3 text-[10px] font-semibold text-red-300 transition-colors hover:bg-red-500/[0.14]"
      >
        <ShieldCheck size={13} />
        Revoke Access
      </button>
    </div>
<div className="h-[6px] w-full shrink-0" />
    {/* DELETE ACCOUNT */}

    <div className="border-t border-red-400/[0.10] pt-3">
    <div className="h-[6px] w-full shrink-0" />
      <p className="text-[11px] font-medium text-slate-200">
        Delete Account
      </p>

      <p className="mt-1 text-[10px] leading-[15px] text-slate-500">
        Permanently delete this user account and associated data.
      </p>
<div className="h-[6px] w-full shrink-0" />
      <button
        type="button"
        onClick={() =>
          showPreviewFeedback(
            "Account deletion preview only. No data was deleted."
          )
        }
        className="mt-2 flex h-[31px] w-full items-center justify-center gap-2 rounded-[6px] border border-red-400/[0.25] bg-red-500/[0.12] px-3 text-[10px] font-semibold text-red-300 transition-colors hover:bg-red-500/[0.20]"
      >
        <AlertCircle size={13} />
        Delete Account
      </button>

    </div>

  </div>
</section>

{/* BOTTOM SPACING */}

<div className="relative h-[8px] w-full shrink-0" />
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

const USERS_PER_PAGE = 19;

  const selectedUser =
    MOCK_USERS.find(
      (user) => user.id === selectedUserId
    ) ?? MOCK_USERS[0];

  // ===================================================
  // KPI METRICS
  // ===================================================

  const metrics = useMemo(() => {
    return {
      total: MOCK_USERS.length,

      pending: MOCK_USERS.filter(
        (user) =>
          resolveAdminPreviewApprovalStatus(user) === "PENDING"
      ).length,

      active: MOCK_USERS.filter((user) => {
        const hasEntitlement =
          resolveAdminPreviewEntitlementPlan(user) !== null;

        return (
          user.verified &&
          resolveAdminPreviewApprovalStatus(user) === "APPROVED" &&
          resolveAdminPreviewProvisioningStatus(user) === "PROVISIONED" &&
          user.status === "ACTIVE" &&
          hasEntitlement
        );
      }).length,

      readOnly: MOCK_USERS.filter(
        (user) =>
          user.verified &&
          resolveAdminPreviewApprovalStatus(user) === "APPROVED" &&
          resolveAdminPreviewProvisioningStatus(user) === "PROVISIONED" &&
          user.status === "READ_ONLY"
      ).length,
    };
  }, []);

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
  resolveAdminPreviewDisplayStatus(user) === statusFilter;

const resolvedPlan =
  resolveAdminPreviewEntitlementPlan(user);

const matchesPlan =
  planFilter === "ALL" ||
  (planFilter === "NONE"
    ? resolvedPlan === null
    : resolvedPlan === planFilter);

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

useEffect(() => {
  if (filteredUsers.length === 0) return;

  const selectedUserIsVisible = filteredUsers.some(
    (user) => user.id === selectedUserId
  );

  if (!selectedUserIsVisible) {
    setSelectedUserId(filteredUsers[0].id);
  }
}, [filteredUsers, selectedUserId]);

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
  setCurrentPage(1);
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

<AdminDataSourceIndicator status="PREVIEW" />

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
      <label
        htmlFor="admin-user-search"
        className="sr-only"
      >
        Search users by name, email or user ID
      </label>

      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        id="admin-user-search"
        type="text"
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
          setCurrentPage(1);
        }}
        placeholder="Search name, email or user ID..."
        style={{ paddingLeft: "44px" }}
        className="h-[39px] w-full rounded-[8px] border border-white/[0.08] bg-[#030D19] pr-9 text-[12px] text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-[#4F8CFF]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78A9FF]"
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
          className="h-[39px] w-[110px] appearance-none rounded-[8px] border border-white/[0.08] bg-[#030D19] pr-9 text-[11px] text-slate-200 outline-none transition-colors focus:border-[#4F8CFF]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78A9FF]"
        >
          <option value="ALL">All Statuses</option>
<option value="PENDING">Pending</option>
<option value="REJECTED">Rejected</option>
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
          className="h-[39px] min-w-[100px] appearance-none rounded-[8px] border border-white/[0.08] bg-[#030D19] pr-8 text-[11px] text-slate-300 outline-none focus:border-[#4F8CFF]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78A9FF]"
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

              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
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
                      <th scope="col" className="px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <span className="relative left-14">User</span>
                      </th>
                      <th scope="col" className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Registered
                      </th>
                      <th scope="col" className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Verification
                      </th>
                      <th scope="col" className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <span className="relative -left-2">Account Status</span>
                      </th>
                      <th scope="col" className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Plan
                      </th>
                      <th scope="col" className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <span className="relative -left-1">Last Active</span>
                      </th>
                      <th scope="col" className="px-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
                          className={`group h-[44px] border-b border-white/[0.045]
  transition-all
  duration-200
  ease-[cubic-bezier(0.22,1,0.36,1)]
  hover:z-10
  hover:-translate-y-[0.5px]
  hover:-translate-y-[0.5px]
  ${
    isSelected
      ? "bg-[#10294A]/65 shadow-[inset_2px_0_0_#4F8CFF] hover:bg-[#163253]"
      : "hover:bg-[#10243A]/75 hover:shadow-[inset_2px_0_0_rgba(79,140,255,0.65),0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.025)]"
  }
`}
                        >
                          {/* USER */}
                          <td className="px-4">
                            <button
                              type="button"
                              aria-label={`Select ${user.name}`}
                              aria-pressed={isSelected}
                              onClick={() => setSelectedUserId(user.id)}
                              className="relative left-2 flex min-w-0 w-full cursor-pointer items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78A9FF]"
                            >
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
                            </button>
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
  <StatusBadge status={resolveAdminPreviewDisplayStatus(user)} />
</td>

                         {/* PLAN */}
<td className="whitespace-nowrap px-2">
  <PlanBadge plan={resolveAdminPreviewEntitlementPlan(user)} />
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
                                 onClick={() => setSelectedUserId(user.id)}
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

<div className="flex min-h-[46px] shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#091827] px-4">

  {/* RESULTS COUNT */}

  <p
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="relative left-2 text-[11px] text-slate-500"
  >
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

<div className="relative top-[10px] flex h-[calc(100dvh-130px)] min-h-0 w-full shrink-0 flex-col xl:mr-5 xl:w-[360px]">
  {filteredUsers.length > 0 ? (
    <UserDetailsPanel
      user={
        filteredUsers.find(
          (user) => user.id === selectedUser.id
        ) ?? filteredUsers[0]
      }
    />
  ) : (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-[8px] border border-white/[0.07] bg-[#071321]">
      <div className="text-center">
        <Search size={20} className="mx-auto text-slate-500" />
        <p className="mt-3 text-[12px] font-medium text-slate-300">
          No matching users
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Adjust your search or filters to see account details.
        </p>
      </div>
    </div>
  )}
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