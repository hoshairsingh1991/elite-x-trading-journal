"use client";

import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import type {
  AccountCurrencyCode,
  BrokerageAccount,
  CapitalAccountCategory,
  CapitalTradingMode,
} from "@/lib/capital/types";

import type {
  CreateCapitalAccountInput,
  UpdateCapitalAccountInput,
} from "@/lib/storage/supabaseCapitalStorage";

const OWNERSHIP_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "joint", label: "Joint" },
  { value: "corporate", label: "Corporate" },
  { value: "trust", label: "Trust" },
  { value: "other", label: "Other" },
] as const;

// =====================================================
// PROPS
// =====================================================

interface ManageAccountsDrawerProps {
  isOpen: boolean;
  accounts: BrokerageAccount[];

  accountsLoading: boolean;
  accountsError: string | null;

  onClose: () => void;
  onRetryAccounts: () => void;

  onCreate: (
    input: CreateCapitalAccountInput
  ) => Promise<void>;

  onUpdate: (
    input: UpdateCapitalAccountInput
  ) => Promise<void>;

  onArchive: (
    accountId: string
  ) => Promise<void>;
}

// =====================================================
// MANAGE ACCOUNTS DRAWER
// =====================================================

export default function ManageAccountsDrawer({
  isOpen,
  accounts,
  accountsLoading,
  accountsError,
  onClose,
  onRetryAccounts,
  onCreate,
  onUpdate,
}: ManageAccountsDrawerProps) {

  // =====================================================
  // DRAWER STATE
  // =====================================================

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
const [editAccountError, setEditAccountError] = useState("");

// =====================================================
// EDIT ACCOUNT FORM STATE
// =====================================================

const [editAccountName, setEditAccountName] = useState("");
const [editBrokerName, setEditBrokerName] = useState("");
const [editAccountCategory, setEditAccountCategory] =
  useState<CapitalAccountCategory>("brokerage");
const [editAccountSubtype, setEditAccountSubtype] = useState("");
const [editAccountNumberLast4, setEditAccountNumberLast4] = useState("");
const [editTradingMode, setEditTradingMode] =
  useState<CapitalTradingMode>("unknown");
const [editAccountCurrency, setEditAccountCurrency] =
  useState<AccountCurrencyCode>("UNKNOWN");
const [editOwnership, setEditOwnership] = useState("");
const [editOwnershipCustom, setEditOwnershipCustom] = useState("");
const [editRegistration, setEditRegistration] = useState("");
const [editTradingModeCustom, setEditTradingModeCustom] = useState("");

  // =====================================================
  // CREATE ACCOUNT FORM STATE
  // =====================================================

  const [newAccountName, setNewAccountName] = useState("");
  const [newBrokerName, setNewBrokerName] = useState("");

  const [newAccountCategory, setNewAccountCategory] =
    useState<CapitalAccountCategory>("brokerage");

  const [newAccountSubtype, setNewAccountSubtype] =
    useState("");

    const [newAccountNumberLast4, setNewAccountNumberLast4] =
  useState("");

const [newTradingMode, setNewTradingMode] =
  useState<CapitalTradingMode>("unknown");

  const [newAccountCurrency, setNewAccountCurrency] =
    useState<AccountCurrencyCode>("UNKNOWN");
  const [newOwnership, setNewOwnership] = useState("");
  const [newOwnershipCustom, setNewOwnershipCustom] = useState("");
  const [newRegistration, setNewRegistration] = useState("");
  const [newTradingModeCustom, setNewTradingModeCustom] = useState("");

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createAccountError, setCreateAccountError] = useState("");

// =====================================================
// EDIT ACCOUNT HANDLER
// =====================================================

const handleEditAccount = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (isUpdatingAccount || !editingAccountId) return;

  const accountName = editAccountName.trim();

  if (!accountName) {
    setEditAccountError("Account name is required.");
    return;
  }

  const ownership = editOwnership.trim() || null;
  const ownershipCustom =
    ownership === "other" ? editOwnershipCustom.trim() || null : null;
  const registration = editRegistration.trim() || null;
  const tradingModeCustom =
    editAccountCategory === "brokerage" && editTradingMode === "other"
      ? editTradingModeCustom.trim() || null
      : null;

  if (ownership === "other" && !ownershipCustom) {
    setEditAccountError(
      "Custom ownership is required when Ownership is Other."
    );
    return;
  }

  if (
    editAccountCategory === "brokerage" &&
    editTradingMode === "other" &&
    !tradingModeCustom
  ) {
    setEditAccountError(
      "Custom trading mode is required when Trading Mode is Other."
    );
    return;
  }

  setEditAccountError("");
  setIsUpdatingAccount(true);

try {
  await onUpdate({
    accountId: editingAccountId,
    accountName,
    brokerName: editBrokerName.trim() || null,
    accountType: editAccountCategory,
    accountSubtype: editAccountSubtype.trim() || null,

    ownership,
    ownershipCustom,
    registration,

    accountNumberLast4: editAccountNumberLast4.trim() || null,
    tradingMode: editTradingMode,
    tradingModeCustom,

    currency: editAccountCurrency,
  });

    setEditingAccountId(null);
  } catch (error) {
    console.error("Failed to update capital account:", {
      message: error instanceof Error ? error.message : error,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
    });

    setEditAccountError(
      error instanceof Error
        ? error.message
        : "Failed to update account. Please try again."
    );
  } finally {
    setIsUpdatingAccount(false);
  }
};

  // =====================================================
  // CREATE ACCOUNT HANDLER
  // =====================================================

  const handleCreateAccount = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isCreatingAccount) return;

    const accountName = newAccountName.trim();

    if (!accountName) {
      setCreateAccountError("Account name is required.");
      return;
    }

    const ownership = newOwnership.trim() || null;
    const ownershipCustom =
      ownership === "other" ? newOwnershipCustom.trim() || null : null;
    const registration = newRegistration.trim() || null;
    const tradingModeCustom =
      newAccountCategory === "brokerage" && newTradingMode === "other"
        ? newTradingModeCustom.trim() || null
        : null;

    if (ownership === "other" && !ownershipCustom) {
      setCreateAccountError(
        "Custom ownership is required when Ownership is Other."
      );
      return;
    }

    if (
      newAccountCategory === "brokerage" &&
      newTradingMode === "other" &&
      !tradingModeCustom
    ) {
      setCreateAccountError(
        "Custom trading mode is required when Trading Mode is Other."
      );
      return;
    }

    setCreateAccountError("");
    setIsCreatingAccount(true);

    try {
await onCreate({
  accountName,
  brokerName: newBrokerName.trim() || null,
  accountType: newAccountCategory,
  accountSubtype: newAccountSubtype.trim() || null,
  ownership,
  ownershipCustom,
  registration,
  accountNumberLast4: newAccountNumberLast4.trim() || null,
  tradingMode: newTradingMode,
  tradingModeCustom,
  currency: newAccountCurrency,
});

setNewAccountName("");
setNewBrokerName("");
setNewAccountCategory("brokerage");
setNewAccountSubtype("");
setNewAccountNumberLast4("");
setNewTradingMode("unknown");
setNewAccountCurrency("UNKNOWN");
setNewOwnership("");
setNewOwnershipCustom("");
setNewRegistration("");
setNewTradingModeCustom("");

      setIsCreateFormOpen(false);

    } catch (error) {
      console.error("Failed to create capital account:", error);

      setCreateAccountError(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );

    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-[2px]">

      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close account management"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* DRAWER */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-accounts-title"
        className="
          relative
          z-10
          flex
          h-full
          w-full
          max-w-[620px]
          flex-col
          border-l
          border-white/[0.08]
          bg-[#07111F]
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">

          <div>
            <h2
              id="manage-accounts-title"
              className="text-[17px] font-semibold text-white"
            >
              Manage Accounts
            </h2>

            <p className="mt-1 text-[12px] text-slate-500">
              Create, edit and manage your brokerage accounts.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={() => {
  setEditingAccountId(null);
  setEditAccountError("");
  setIsCreateFormOpen((current) => !current);
}}
              className="
                inline-flex
                h-[36px]
                w-[125px]
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-blue-400/25
                bg-blue-500/[0.09]
                text-[12px]
                font-semibold
                text-blue-200
                transition-all
                duration-200
                hover:border-blue-400/50
                hover:bg-blue-500/[0.17]
                hover:text-white
              "
            >
              <Plus size={15} />
              Add Account
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-white/[0.07]
                bg-white/[0.03]
                text-slate-400
                transition
                hover:bg-white/[0.08]
                hover:text-white
              "
              aria-label="Close drawer"
            >
              <X size={17} />
            </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">

          {accountsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <span className="text-[13px] text-slate-400">
                Loading accounts...
              </span>
            </div>
          ) : accountsError ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">

              <p className="text-[13px] text-red-400">
                Failed to load accounts.
              </p>

              <button
                type="button"
                onClick={onRetryAccounts}
                className="rounded-lg border border-white/[0.10] px-4 py-2 text-[12px] text-slate-300 transition hover:bg-white/[0.06]"
              >
                Retry
              </button>

            </div>
          ) : (
            <div className="space-y-8">

                {isCreateFormOpen && (
  <form
    onSubmit={handleCreateAccount}
    className="mb-7 rounded-xl border border-blue-400/20 bg-blue-500/[0.035] p-5"
  >
    <h3 className="mb-4 text-[14px] font-semibold text-white">
      Create New Account
    </h3>

    <div className="grid grid-cols-2 gap-4">

      {/* ACCOUNT NAME */}
      <div className="col-span-2">
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Name *
        </label>

        <input
          required
          value={newAccountName}
          onChange={(event) => setNewAccountName(event.target.value)}
          placeholder="e.g. IBKR Main"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* BROKER */}
      <div className="col-span-2">
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Broker / Institution
        </label>

        <input
          value={newBrokerName}
          onChange={(event) => setNewBrokerName(event.target.value)}
          placeholder="e.g. Interactive Brokers"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Category *
        </label>

        <select
          value={newAccountCategory}
          onChange={(event) => {
            const category = event.target.value as CapitalAccountCategory;
            setNewAccountCategory(category);
            setNewTradingMode(
              category === "brokerage" ? "unknown" : "not_applicable"
            );
            setNewTradingModeCustom("");
          }}
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="brokerage">Brokerage</option>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* TRADING MODE */}
      {newAccountCategory === "brokerage" && (
        <div>
          <label className="mb-2 block text-[11px] font-medium text-slate-300">
            Trading Mode
          </label>

          <select
            value={newTradingMode}
            onChange={(event) => {
              const mode = event.target.value as CapitalTradingMode;
              setNewTradingMode(mode);
              if (mode !== "other") setNewTradingModeCustom("");
            }}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          >
            <option value="unknown">Unknown</option>
            <option value="cash">Cash</option>
            <option value="margin">Margin</option>
            <option value="portfolio_margin">Portfolio Margin</option>
            <option value="limited_margin">Limited Margin</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* OWNERSHIP */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Ownership
        </label>
        <select
          value={newOwnership}
          onChange={(event) => {
            const ownership = event.target.value;
            setNewOwnership(ownership);
            if (ownership !== "other") setNewOwnershipCustom("");
          }}
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="">Not specified</option>
          {OWNERSHIP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* REGISTRATION */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Registration
        </label>
        <input
          value={newRegistration}
          maxLength={80}
          onChange={(event) => setNewRegistration(event.target.value)}
          placeholder="e.g. TFSA, RRSP, IRA"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {newOwnership === "other" && (
        <div className="col-span-2">
          <label className="mb-2 block text-[11px] font-medium text-slate-300">
            Custom Ownership *
          </label>
          <input
            required
            value={newOwnershipCustom}
            maxLength={80}
            onChange={(event) => setNewOwnershipCustom(event.target.value)}
            placeholder="Specify ownership type"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      {newAccountCategory === "brokerage" && newTradingMode === "other" && (
        <div className="col-span-2">
          <label className="mb-2 block text-[11px] font-medium text-slate-300">
            Custom Trading Mode *
          </label>
          <input
            required
            value={newTradingModeCustom}
            maxLength={80}
            onChange={(event) => setNewTradingModeCustom(event.target.value)}
            placeholder="Specify trading mode"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      )}

{/* ACCOUNT NUMBER */}
<div className="col-span-2">
  <label className="mb-2 block text-[11px] font-medium text-slate-300">
    Account Number (Last 4 Digits)
  </label>

  <input
    inputMode="numeric"
    maxLength={4}
    value={newAccountNumberLast4}
    onChange={(event) =>
      setNewAccountNumberLast4(
        event.target.value.replace(/\D/g, "").slice(0, 4)
      )
    }
    placeholder="e.g. 4821"
    className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
  />
</div>

      {/* SUBTYPE */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Subtype
        </label>

        <input
          value={newAccountSubtype}
          onChange={(event) => setNewAccountSubtype(event.target.value)}
          placeholder="e.g. TFSA, Margin"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CURRENCY */}
      <div className="col-span-2">
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Currency
        </label>

        <select
          value={newAccountCurrency}
          onChange={(event) =>
            setNewAccountCurrency(
              event.target.value as AccountCurrencyCode
            )
          }
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="UNKNOWN">Not specified</option>
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="INR">INR</option>
        </select>
      </div>

    </div>

    {createAccountError && (
      <p className="mt-4 text-[11px] text-red-400">
        {createAccountError}
      </p>
    )}

    <div className="mt-5 flex justify-end gap-2">

      <button
        type="button"
        onClick={() => {
          setIsCreateFormOpen(false);
          setCreateAccountError("");
        }}
        disabled={isCreatingAccount}
        className="h-9 rounded-lg border border-white/[0.08] px-4 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isCreatingAccount}
        className="h-9 rounded-lg border border-blue-400/30 bg-blue-600 px-5 text-[11px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreatingAccount ? "Creating..." : "Create Account"}
      </button>

    </div>
  </form>
)}

{/* EDIT ACCOUNT FORM */}
{editingAccountId && (
  <form
    onSubmit={handleEditAccount}
    className="mb-7 rounded-xl border border-amber-400/20 bg-amber-500/[0.035] p-5"
  >
    <h3 className="mb-4 text-[14px] font-semibold text-white">
      Edit Account
    </h3>

    <div className="grid grid-cols-2 gap-4">
      {/* ACCOUNT NAME */}
      <div className="col-span-2">
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Name *
        </label>

        <input
          required
          value={editAccountName}
          onChange={(event) => setEditAccountName(event.target.value)}
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* BROKER */}
      <div className="col-span-2">
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Broker / Institution
        </label>

        <input
          value={editBrokerName}
          onChange={(event) => setEditBrokerName(event.target.value)}
          placeholder="e.g. Interactive Brokers"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Category *
        </label>

        <select
          value={editAccountCategory}
          onChange={(event) => {
            const category = event.target.value as CapitalAccountCategory;

            setEditAccountCategory(category);

            setEditTradingMode(
              category === "brokerage" ? "unknown" : "not_applicable"
            );
            setEditTradingModeCustom("");
          }}
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="brokerage">Brokerage</option>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* TRADING MODE */}
      {editAccountCategory === "brokerage" && (
        <div>
          <label className="mb-2 block text-[11px] font-medium text-slate-300">
            Trading Mode
          </label>

          <select
            value={editTradingMode}
            onChange={(event) => {
              const mode = event.target.value as CapitalTradingMode;
              setEditTradingMode(mode);
              if (mode !== "other") setEditTradingModeCustom("");
            }}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          >
            <option value="unknown">Unknown</option>
            <option value="cash">Cash</option>
            <option value="margin">Margin</option>
            <option value="portfolio_margin">Portfolio Margin</option>
            <option value="limited_margin">Limited Margin</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* OWNERSHIP */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Ownership
        </label>
        <select
          value={editOwnership}
          onChange={(event) => {
            const ownership = event.target.value;
            setEditOwnership(ownership);
            if (ownership !== "other") setEditOwnershipCustom("");
          }}
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="">Not specified</option>
          {editOwnership &&
            !OWNERSHIP_OPTIONS.some((option) => option.value === editOwnership) && (
              <option value={editOwnership}>{editOwnership}</option>
            )}
          {OWNERSHIP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* REGISTRATION */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Registration
        </label>
        <input
          value={editRegistration}
          maxLength={80}
          onChange={(event) => setEditRegistration(event.target.value)}
          placeholder="e.g. TFSA, RRSP, IRA"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {editOwnership === "other" && (
        <div className="col-span-2">
          <label className="mb-2 block text-[11px] font-medium text-slate-300">
            Custom Ownership *
          </label>
          <input
            required
            value={editOwnershipCustom}
            maxLength={80}
            onChange={(event) => setEditOwnershipCustom(event.target.value)}
            placeholder="Specify ownership type"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      {editAccountCategory === "brokerage" && editTradingMode === "other" && (
        <div className="col-span-2">
          <label className="mb-2 block text-[11px] font-medium text-slate-300">
            Custom Trading Mode *
          </label>
          <input
            required
            value={editTradingModeCustom}
            maxLength={80}
            onChange={(event) => setEditTradingModeCustom(event.target.value)}
            placeholder="Specify trading mode"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      {/* ACCOUNT NUMBER */}
      <div className="col-span-2">
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Number (Last 4 Digits)
        </label>

        <input
          inputMode="numeric"
          maxLength={4}
          value={editAccountNumberLast4}
          onChange={(event) =>
            setEditAccountNumberLast4(
              event.target.value.replace(/\D/g, "").slice(0, 4)
            )
          }
          placeholder="e.g. 4821"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* SUBTYPE */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Subtype
        </label>

        <input
          value={editAccountSubtype}
          onChange={(event) => setEditAccountSubtype(event.target.value)}
          placeholder="e.g. TFSA, Margin"
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CURRENCY */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-slate-300">
          Account Currency
        </label>

        <select
          value={editAccountCurrency}
          onChange={(event) =>
            setEditAccountCurrency(
              event.target.value as AccountCurrencyCode
            )
          }
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="UNKNOWN">Not specified</option>
          <option value="CAD">CAD</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="INR">INR</option>
        </select>
      </div>
    </div>

    {/* ERROR */}
    {editAccountError && (
      <p className="mt-4 text-[11px] text-red-400">
        {editAccountError}
      </p>
    )}

    {/* ACTIONS */}
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => {
          setEditingAccountId(null);
          setEditAccountError("");
        }}
        disabled={isUpdatingAccount}
        className="h-9 rounded-lg border border-white/[0.08] px-4 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isUpdatingAccount}
        className="h-9 rounded-lg border border-amber-400/30 bg-amber-500/[0.85] px-5 text-[11px] font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUpdatingAccount ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </form>
)}

              {/* ACTIVE ACCOUNTS */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-semibold text-white">
                      Active Accounts
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Available for deposits, withdrawals and transfers.
                    </p>
                  </div>

                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                    {accounts.filter((account) => account.status === "ACTIVE").length}
                  </span>
                </div>

                <div className="space-y-2">
                  {accounts
                    .filter((account) => account.status === "ACTIVE")
                    .map((account) => (
                      <div
                        key={account.id}
                        className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-white">
                              {account.name}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-500">
                              {account.broker}
                            </p>
                          </div>

                         <div className="flex shrink-0 items-center gap-2">
  <button
    type="button"
onClick={() => {
  setEditingAccountId(account.id);
  setEditAccountError("");

  setEditAccountName(account.name);
  setEditBrokerName(account.broker ?? "");
  setEditAccountCategory(account.accountCategory);
  setEditAccountSubtype(account.accountSubtype ?? "");
  setEditAccountNumberLast4(account.accountNumberLast4 ?? "");
  setEditTradingMode(account.tradingMode);
  setEditAccountCurrency(account.baseCurrency);
  setEditOwnership(account.ownership ?? "");
  setEditOwnershipCustom(account.ownershipCustom ?? "");
  setEditRegistration(account.registration ?? "");
  setEditTradingModeCustom(account.tradingModeCustom ?? "");
}}
    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
  >
    Edit
  </button>

  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-1 text-[10px] font-semibold text-emerald-400">
    Active
  </span>
</div>
</div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] text-slate-300">
                            {account.accountCategory}
                          </span>

                          {account.accountSubtype && (
                            <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] text-slate-300">
                              {account.accountSubtype}
                            </span>
                          )}

                          <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] text-slate-300">
                            {account.baseCurrency}
                          </span>

                          <span className="ml-auto text-[10px] font-medium text-blue-400">
                            {account.source === "CONNECTED"
                              ? "Connected"
                              : "Manual"}
                          </span>
                        </div>
                      </div>
                    ))}

                  {accounts.filter((account) => account.status === "ACTIVE").length === 0 && (
                    <div className="rounded-lg border border-dashed border-white/[0.10] px-4 py-8 text-center">
                      <p className="text-[12px] font-medium text-slate-300">
                        No active accounts
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Create an account to start recording capital transactions.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ARCHIVED ACCOUNTS */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-semibold text-white">
                      Archived Accounts
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Historical accounts unavailable for new transactions.
                    </p>
                  </div>

                  <span className="rounded-md border border-slate-500/20 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                    {accounts.filter((account) => account.status === "CLOSED").length}
                  </span>
                </div>

                <div className="space-y-2">
                  {accounts
                    .filter((account) => account.status === "CLOSED")
                    .map((account) => (
                      <div
                        key={account.id}
                        className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3.5 opacity-70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-slate-300">
                              {account.name}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-500">
                              {account.broker}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-md border border-slate-500/20 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-slate-400">
                            Archived
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
                            {account.accountCategory}
                          </span>

                          {account.accountSubtype && (
                            <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
                              {account.accountSubtype}
                            </span>
                          )}

                          <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
                            {account.baseCurrency}
                          </span>

                          <span className="ml-auto text-[10px] text-slate-500">
                            {account.source === "CONNECTED"
                              ? "Connected"
                              : "Manual"}
                          </span>
                        </div>
                      </div>
                    ))}

                  {accounts.filter((account) => account.status === "CLOSED").length === 0 && (
                    <p className="rounded-lg border border-dashed border-white/[0.07] px-4 py-5 text-center text-[11px] text-slate-500">
                      No archived accounts.
                    </p>
                  )}
                </div>
              </section>

            </div>
          )}

        </div>

      </section>
    </div>
  );
}