"use client";

import { Plus, X, Pencil, Archive, Loader2 } from "lucide-react";
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
  onArchive,
}: ManageAccountsDrawerProps) {

  // =====================================================
  // DRAWER STATE
  // =====================================================

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
const [editAccountError, setEditAccountError] = useState("");

const [archivingAccountId, setArchivingAccountId] = useState<string | null>(null);

const [archiveAccountError, setArchiveAccountError] = useState<{
  accountId: string;
  message: string;
} | null>(null);

const [archiveSuccessMessage, setArchiveSuccessMessage] = useState("");

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
// =====================================================
// ARCHIVE ACCOUNT HANDLER
// =====================================================

const handleArchiveAccount = async (account: BrokerageAccount) => {
  if (account.status !== "ACTIVE" || archivingAccountId !== null) {
    return;
  }

  const confirmed = window.confirm(
    `Archive "${account.name}"?\n\nThis account will move to Archived Accounts. Its transaction history will be preserved.`
  );

  if (!confirmed) return;

  setArchivingAccountId(account.id);
  setArchiveAccountError(null);
setArchiveSuccessMessage("");
  try {
    await onArchive(account.id);

setArchiveSuccessMessage(
  `"${account.name}" archived successfully.`
);
  } catch (error) {
    setArchiveAccountError({
      accountId: account.id,
      message:
        error instanceof Error
          ? error.message
          : "Failed to archive account. Please try again.",
    });
  } finally {
    setArchivingAccountId(null);
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
  w-[420px]
  max-w-[96vw]
  flex-col
  overflow-x-hidden
  border-l
  border-white/[0.06]
  bg-[#07111d]
  shadow-2xl
"
      >
{/* HEADER */}
<div className="shrink-0 px-7 pt-6 pb-5">

  <div className="flex items-center justify-between">

    <div>
      <h2
        id="manage-accounts-title"
        className="translate-x-3 translate-y-2 text-[20px] leading-none font-bold tracking-tight text-white"
      >
        Manage Accounts
      </h2>
<div className="h-1" />
      <p className="mt-2 translate-x-3 translate-y-2 text-[12px] text-slate-400">
        Create, edit and manage your brokerage accounts.
      </p>
    </div>

    <div className="flex shrink-0 items-center gap-5">

{/* ADD ACCOUNT */}
<button
  type="button"
  onClick={() => {
    setEditingAccountId(null);
    setEditAccountError("");
    setIsCreateFormOpen((current) => !current);
  }}
  className="group relative translate-y-2 inline-flex h-[34px] w-[110px] items-center justify-center gap-2 rounded-[8px] border border-blue-400/25 bg-blue-500/[0.09] text-[12px] font-semibold text-blue-200 transition-all duration-200 hover:border-blue-400/50 hover:bg-blue-500/[0.17] hover:text-white"
>
  <Plus
    size={15}
    className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
  />
  Add Account
</button>

      {/* CLOSE */}
      <button
        type="button"
        onClick={onClose}
        className="-translate-x-2 translate-y-2 flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/[0.06] bg-white/[0.02] text-slate-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
        aria-label="Close drawer"
      >
        <X size={20} />
      </button>

    </div>

  </div>

  <div className="h-1" />

  <div className="relative top-2 border-b border-white/10" />

</div>

<div className="h-3" />

{/* CONTENT */}
<div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">

 <div className="mx-auto w-[95%] px-5 pt-6 pb-12">

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
          className="rounded-[8px] border border-white/[0.10] px-4 py-2 text-[12px] text-slate-300 transition hover:bg-white/[0.06]"
        >
          Retry
        </button>
      </div>
    ) : (
      <div className="space-y-8 pb-12">

        {isCreateFormOpen && (
          <form
            onSubmit={handleCreateAccount}
            className="relative left-2 top-2 mb-7 rounded-[8px] border border-blue-400/20 bg-blue-500/[0.035] p-5"
          >
            <div className="h-1" />
<h3 className="relative left-2 mb-4 text-[14px] font-semibold text-white">
  Create New Account
</h3>

            <div className="grid grid-cols-2 gap-4">

              {/* ACCOUNT NAME */}
      <div className="col-span-2">
<label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
  Account Name *
</label>
<div className="h-1" />
<input
  required
  value={newAccountName}
  onChange={(event) => setNewAccountName(event.target.value)}
  placeholder="e.g. IBKR Main"
  style={{ paddingLeft: "10px" }}
  className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
/>
      </div>

{/* BROKER */}
<div className="col-span-2">
  <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
    Broker / Institution
  </label>

  <div className="h-1" />

  <input
    value={newBrokerName}
    onChange={(event) => setNewBrokerName(event.target.value)}
    placeholder="e.g. Interactive Brokers"
    style={{ paddingLeft: "10px" }}
    className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
  />
</div>

{/* CATEGORY */}
<div>
  <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
    Account Category *
  </label>

  <div className="h-1" />

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
  style={{ paddingLeft: "10px" }}
  className="drawer-select relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
>
  <option value="brokerage">Brokerage</option>
  <option value="bank">Bank</option>
  <option value="cash">Cash</option>
  <option value="other">Other</option>
</select>
</div>

{/* TRADING MODE */}
<div
  className={newAccountCategory === "brokerage" ? "visible" : "invisible"}
  aria-hidden={newAccountCategory !== "brokerage"}
>
  <label className="relative left-0 mb-2 block text-[11px] font-medium text-slate-300">
    Trading Mode
  </label>

  <div className="h-1" />

  <select
    value={newTradingMode}
    disabled={newAccountCategory !== "brokerage"}
    onChange={(event) => {
      const mode = event.target.value as CapitalTradingMode;
      setNewTradingMode(mode);
      if (mode !== "other") setNewTradingModeCustom("");
    }}
    style={{ paddingLeft: "10px" }}
    className="drawer-select relative left-0 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
  >
    <option value="unknown">Unknown</option>
    <option value="cash">Cash</option>
    <option value="margin">Margin</option>
    <option value="portfolio_margin">Portfolio Margin</option>
    <option value="limited_margin">Limited Margin</option>
    <option value="other">Other</option>
  </select>
</div>

{/* OWNERSHIP */}
<div>
  <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
    Ownership
  </label>

  <div className="h-1" />

<select
  value={newOwnership}
  onChange={(event) => {
    const ownership = event.target.value;
    setNewOwnership(ownership);
    if (ownership !== "other") setNewOwnershipCustom("");
  }}
  style={{ paddingLeft: "10px" }}
  className="drawer-select relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
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
  <label className="relative left-0 mb-2 block text-[11px] font-medium text-slate-300">
    Account Registration
  </label>

  <div className="h-1" />

  <input
    value={newRegistration}
    maxLength={80}
    onChange={(event) => setNewRegistration(event.target.value)}
    placeholder="e.g. TFSA, RRSP, IRA"
    style={{ paddingLeft: "10px" }}
    className="relative left-0 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
  />
</div>

{/* CUSTOM OWNERSHIP */}
{newOwnership === "other" && (
  <div className="col-span-2">
    <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
      Custom Ownership *
    </label>

    <div className="h-1" />

    <input
      required
      value={newOwnershipCustom}
      maxLength={80}
      onChange={(event) => setNewOwnershipCustom(event.target.value)}
      placeholder="Specify ownership type"
      style={{ paddingLeft: "10px" }}
      className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
    />
  </div>
)}

{/* CUSTOM TRADING MODE */}
{newAccountCategory === "brokerage" && newTradingMode === "other" && (
  <div className="col-span-2">
    <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
      Custom Trading Mode *
    </label>

    <div className="h-1" />

    <input
      required
      value={newTradingModeCustom}
      maxLength={80}
      onChange={(event) => setNewTradingModeCustom(event.target.value)}
      placeholder="Specify trading mode"
      style={{ paddingLeft: "10px" }}
      className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
    />
  </div>
)}

{/* ACCOUNT NUMBER */}
<div className="col-span-2">
  <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
    Account Number (Last 4 Digits)
  </label>

  <div className="h-1" />

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
    style={{ paddingLeft: "10px" }}
    className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
  />
</div>

{/* CURRENCY */}
<div className="col-span-2">
  <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
    Account Currency
  </label>

  <div className="h-1" />

  <select
    value={newAccountCurrency}
    onChange={(event) =>
      setNewAccountCurrency(
        event.target.value as AccountCurrencyCode
      )
    }
    style={{ paddingLeft: "10px" }}
    className="drawer-select relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
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
 <div className="h-2" />
    <div className="relative -left-2 mt-5 flex justify-end gap-2">

<button
  type="button"
  onClick={() => {
    setIsCreateFormOpen(false);
    setCreateAccountError("");
  }}
  disabled={isCreatingAccount}
  className="relative h-8 w-[60px] rounded-[8px] border border-white/[0.08] text-[12px] font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
>
  Cancel
</button>

<button
  type="submit"
  disabled={isCreatingAccount}
  className="relative  h-8 w-[100px] rounded-[8px] border border-blue-400/30 bg-blue-600 text-[11px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {isCreatingAccount ? "Creating..." : "Create Account"}
</button>

    </div>
     <div className="h-2" />
  </form>
)}

{/* EDIT ACCOUNT FORM */}
{editingAccountId && (
  <form
    onSubmit={handleEditAccount}
    className="relative left-2 top-2 mb-7 rounded-[8px] border border-amber-400/20 bg-amber-500/[0.035] p-5"
  >
    <div className="h-1" />

    <h3 className="relative left-2 mb-4 text-[14px] font-semibold text-white">
      Edit Account
    </h3>

    <div className="grid grid-cols-2 gap-4">

      {/* ACCOUNT NAME */}
      <div className="col-span-2">
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Account Name *
        </label>

        <div className="h-1" />

        <input
          required
          value={editAccountName}
          onChange={(event) => setEditAccountName(event.target.value)}
          style={{ paddingLeft: "10px" }}
          className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* BROKER */}
      <div className="col-span-2">
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Broker / Institution
        </label>

        <div className="h-1" />

        <input
          value={editBrokerName}
          onChange={(event) => setEditBrokerName(event.target.value)}
          placeholder="e.g. Interactive Brokers"
          style={{ paddingLeft: "10px" }}
          className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Account Category *
        </label>

        <div className="h-1" />

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
          style={{ paddingLeft: "10px" }}
          className="drawer-select relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="brokerage">Brokerage</option>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* TRADING MODE */}
      <div
        className={editAccountCategory === "brokerage" ? "visible" : "invisible"}
        aria-hidden={editAccountCategory !== "brokerage"}
      >
        <label className="relative left-0 mb-2 block text-[11px] font-medium text-slate-300">
          Trading Mode
        </label>

        <div className="h-1" />

        <select
          value={editTradingMode}
          disabled={editAccountCategory !== "brokerage"}
          onChange={(event) => {
            const mode = event.target.value as CapitalTradingMode;

            setEditTradingMode(mode);

            if (mode !== "other") setEditTradingModeCustom("");
          }}
          style={{ paddingLeft: "10px" }}
          className="drawer-select relative left-0 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        >
          <option value="unknown">Unknown</option>
          <option value="cash">Cash</option>
          <option value="margin">Margin</option>
          <option value="portfolio_margin">Portfolio Margin</option>
          <option value="limited_margin">Limited Margin</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* OWNERSHIP */}
      <div>
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Ownership
        </label>

        <div className="h-1" />

        <select
          value={editOwnership}
          onChange={(event) => {
            const ownership = event.target.value;

            setEditOwnership(ownership);

            if (ownership !== "other") setEditOwnershipCustom("");
          }}
          style={{ paddingLeft: "10px" }}
          className="drawer-select relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
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
        <label className="relative left-0 mb-2 block text-[11px] font-medium text-slate-300">
          Account Registration
        </label>

        <div className="h-1" />

        <input
          value={editRegistration}
          maxLength={80}
          onChange={(event) => setEditRegistration(event.target.value)}
          placeholder="e.g. TFSA, RRSP, IRA"
          style={{ paddingLeft: "10px" }}
          className="relative left-0 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CUSTOM OWNERSHIP */}
      {editOwnership === "other" && (
        <div className="col-span-2">
          <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
            Custom Ownership *
          </label>

          <div className="h-1" />

          <input
            required
            value={editOwnershipCustom}
            maxLength={80}
            onChange={(event) => setEditOwnershipCustom(event.target.value)}
            placeholder="Specify ownership type"
            style={{ paddingLeft: "10px" }}
            className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      {/* CUSTOM TRADING MODE */}
      {editAccountCategory === "brokerage" && editTradingMode === "other" && (
        <div className="col-span-2">
          <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
            Custom Trading Mode *
          </label>

          <div className="h-1" />

          <input
            required
            value={editTradingModeCustom}
            maxLength={80}
            onChange={(event) => setEditTradingModeCustom(event.target.value)}
            placeholder="Specify trading mode"
            style={{ paddingLeft: "10px" }}
            className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      {/* ACCOUNT NUMBER */}
      <div className="col-span-2">
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Account Number (Last 4 Digits)
        </label>

        <div className="h-1" />

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
          style={{ paddingLeft: "10px" }}
          className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* SUBTYPE */}
      <div>
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Account Subtype
        </label>

        <div className="h-1" />

        <input
          value={editAccountSubtype}
          onChange={(event) => setEditAccountSubtype(event.target.value)}
          placeholder="e.g. TFSA, Margin"
          style={{ paddingLeft: "10px" }}
          className="relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
        />
      </div>

      {/* CURRENCY */}
      <div className="col-span-2">
        <label className="relative left-2 mb-2 block text-[11px] font-medium text-slate-300">
          Account Currency
        </label>

        <div className="h-1" />

        <select
          value={editAccountCurrency}
          onChange={(event) =>
            setEditAccountCurrency(
              event.target.value as AccountCurrencyCode
            )
          }
          style={{ paddingLeft: "10px" }}
          className="drawer-select relative left-2 h-10 w-[96%] rounded-[8px] border border-white/[0.08] bg-[#0b1220] px-3 text-[12px] text-white outline-none focus:border-blue-500/50"
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

    <div className="h-2" />

    {/* ACTIONS */}
    <div className="relative -left-2 mt-5 flex justify-end gap-2">

      <button
        type="button"
        onClick={() => {
          setEditingAccountId(null);
          setEditAccountError("");
        }}
        disabled={isUpdatingAccount}
        className="relative h-8 w-[60px] rounded-[8px] border border-white/[0.08] text-[12px] font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isUpdatingAccount}
        className="relative h-8 w-[100px] rounded-[8px] border border-amber-400/30 bg-amber-500/[0.85] text-[11px] font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUpdatingAccount ? "Saving..." : "Save Changes"}
      </button>

    </div>

    <div className="h-2" />

  </form>
)}

{(isCreateFormOpen || editingAccountId !== null) && (
  <div className="h-4" />
)}

{/* ACTIVE ACCOUNTS */}
<section className="relative left-2 top-1 pb-4">

  {/* SECTION HEADER */}
  <div className="mb-4 flex items-center justify-between">

    <div className="flex flex-col gap-[1px]">
      <h3 className="text-[13px] leading-[14px] font-semibold text-white">
        Active Accounts
      </h3>

      <p className="text-[11px] leading-[12px] text-slate-500">
        Available for deposits, withdrawals and transfers.
      </p>
    </div>

    {/* ACTIVE COUNT */}
    <span className="relative left-0 inline-flex h-[24px] w-[65px] shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-emerald-500/20 bg-emerald-500/[0.08] px-2 text-emerald-400">
      <span className="text-[11px] font-semibold tabular-nums">
        {accounts.filter((account) => account.status === "ACTIVE").length}
      </span>

      <span className="text-[9px] font-semibold tracking-wide">
        ACTIVE
      </span>
    </span>

  </div>

  <div className="h-2" />

{/* ACCOUNT CARDS */}
<div className="manage-accounts-scrollbar relative -right-1 flex max-h-[420px] flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2">
  {accounts
      .filter((account) => account.status === "ACTIVE")
      .map((account) => (
        <div
          key={account.id}
          className="group shrink-0 rounded-[8px] border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
        >
 <div className="h-1" />
          {/* INNER CONTENT WIDTH CONTROL */}
          <div className="relative left-2 mx-auto w-[95%]">

            {/* ACCOUNT NAME + ACTIONS */}
            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">
                  {account.name}
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  {account.broker}
                </p>
              </div>

{/* ACTIONS */}
<div className="relative flex h-7 w-16 shrink-0 items-center">

{/* ARCHIVE — APPEARS ON CARD HOVER */}
<button
  type="button"
  onClick={() => handleArchiveAccount(account)}
  disabled={archivingAccountId !== null}
  aria-label={`Archive ${account.name}`}
  title={
    archivingAccountId === account.id
      ? "Archiving account..."
      : "Archive account"
  }
  className="absolute right-8 flex h-7 w-7 translate-x-1 scale-90 items-center justify-center text-slate-500 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:scale-100 focus-visible:opacity-100 hover:scale-110 hover:-rotate-12 hover:text-rose-400 hover:drop-shadow-[0_0_5px_rgba(251,113,133,0.55)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
>
  {archivingAccountId === account.id ? (
  <Loader2 size={15} className="animate-spin text-blue-400" />
) : (
  <Archive size={15} strokeWidth={1.8} />
)}
</button>

  {/* EDIT — ALWAYS VISIBLE */}
  <button
    type="button"
onClick={() => {
  setIsCreateFormOpen(false);
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
    aria-label="Edit account"
    title="Edit account"
    className="absolute right-0 flex h-7 w-7 cursor-pointer items-center justify-center text-slate-400 transition-all duration-200 ease-out hover:scale-110 hover:-rotate-12 hover:text-blue-400 hover:drop-shadow-[0_0_5px_rgba(96,165,250,0.55)] active:scale-90"
  >
    <Pencil size={15} strokeWidth={1.8} />
  </button>

</div>
            </div>
<div className="h-0.5" />
{/* ACCOUNT DETAILS */}
<div className="mt-3 flex flex-wrap items-center gap-2">

  {/* CATEGORY */}
  <span
    title={account.accountCategory}
    style={{ paddingLeft: "6px", paddingRight: "6px" }}
    className="inline-flex h-[26px] w-fit items-center justify-center rounded-[8px] border border-blue-400/20 bg-blue-500/[0.08] text-[10px] font-semibold capitalize text-blue-300"
  >
    {account.accountCategory}
  </span>

  {/* SUBTYPE */}
  {account.accountSubtype && (
    <span
      title={account.accountSubtype}
      style={{ paddingLeft: "6px", paddingRight: "6px" }}
      className="inline-flex h-[26px] w-fit max-w-full min-w-0 items-center justify-center truncate rounded-[8px] border border-violet-400/20 bg-violet-500/[0.08] text-[10px] font-semibold capitalize text-violet-300"
    >
      {account.accountSubtype}
    </span>
  )}

  {/* CURRENCY */}
  <span
    title={account.baseCurrency}
    style={{ paddingLeft: "6px", paddingRight: "6px" }}
    className="inline-flex h-[26px] w-fit items-center justify-center rounded-[8px] border border-emerald-400/20 bg-emerald-500/[0.08] text-[10px] font-semibold uppercase text-emerald-300"
  >
    {account.baseCurrency}
  </span>

</div>
{archiveAccountError?.accountId === account.id && (
  <div
    role="alert"
    className="mt-3 rounded-[8px] border border-rose-400/20 bg-rose-500/[0.06] px-3 py-2 text-[11px] leading-relaxed text-rose-300"
  >
    {archiveAccountError.message}
  </div>
)}

<div className="h-1.5" />
          </div>
        </div>
      ))}

    {/* EMPTY STATE */}
    {accounts.filter((account) => account.status === "ACTIVE").length === 0 && (
      <div className="rounded-[8px] border border-dashed border-white/[0.10] px-4 py-8 text-center">

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

<div className="h-2" />

{/* ARCHIVED ACCOUNTS */}
<section className="relative left-2 top-1 pb-6">

  {/* SECTION HEADER */}
  <div className="mb-4 flex items-center justify-between">

    <div className="flex flex-col gap-[1px]">
      <h3 className="text-[13px] leading-[14px] font-semibold text-white">
        Archived Accounts
      </h3>

      <p className="text-[11px] leading-[12px] text-slate-500">
        Historical accounts unavailable for new transactions.
      </p>
    </div>

    {/* ARCHIVED COUNT */}
    <span className="inline-flex h-[24px] w-[75px] shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-slate-500/20 bg-white/[0.04] px-2 text-slate-400">
      <span className="text-[11px] font-semibold tabular-nums">
        {accounts.filter((account) => account.status === "CLOSED").length}
      </span>

      <span className="text-[9px] font-semibold tracking-wide">
        ARCHIVED
      </span>
    </span>

  </div>

  <div className="h-2" />

{/* ARCHIVED ACCOUNT CARDS */}
<div className="manage-accounts-scrollbar flex max-h-[420px] flex-col gap-3 overflow-y-auto overflow-x-hidden pr-2 pb-6">

    {accounts
      .filter((account) => account.status === "CLOSED")
      .map((account) => (
        <div
          key={account.id}
          className="shrink-0 rounded-[8px] border border-white/[0.05] bg-white/[0.015] px-4 py-3.5 opacity-70"
        >
<div className="h-1" />
          {/* INNER CONTENT WIDTH CONTROL */}
          <div className="relative left-2 mx-auto w-[95%]">

            {/* ACCOUNT NAME */}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-slate-300">
                {account.name}
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                {account.broker}
              </p>
            </div>
 <div className="h-1" />
            {/* ACCOUNT DETAILS */}
            <div className="mt-3 flex flex-wrap items-center gap-2">

              {/* CATEGORY */}
              <span
                title={account.accountCategory}
                style={{ paddingLeft: "6px", paddingRight: "6px" }}
                className="inline-flex h-[26px] w-fit items-center justify-center rounded-[8px] border border-blue-400/20 bg-blue-500/[0.08] text-[10px] font-semibold capitalize text-blue-300"
              >
                {account.accountCategory}
              </span>

              {/* SUBTYPE */}
              {account.accountSubtype && (
                <span
                  title={account.accountSubtype}
                  style={{ paddingLeft: "6px", paddingRight: "6px" }}
                  className="inline-flex h-[26px] w-fit max-w-full min-w-0 items-center justify-center truncate rounded-[8px] border border-violet-400/20 bg-violet-500/[0.08] text-[10px] font-semibold capitalize text-violet-300"
                >
                  {account.accountSubtype}
                </span>
              )}

              {/* CURRENCY */}
              <span
                title={account.baseCurrency}
                style={{ paddingLeft: "6px", paddingRight: "6px" }}
                className="inline-flex h-[26px] w-fit items-center justify-center rounded-[8px] border border-emerald-400/20 bg-emerald-500/[0.08] text-[10px] font-semibold uppercase text-emerald-300"
              >
                {account.baseCurrency}
              </span>

            </div>
<div className="h-2" />
          </div>
        </div>
      ))}

    {/* EMPTY STATE */}
    {accounts.filter((account) => account.status === "CLOSED").length === 0 && (
      <p className="rounded-[8px] border border-dashed border-white/[0.07] px-4 py-5 text-center text-[11px] text-slate-500">
        No archived accounts.
      </p>
    )}

  </div>

</section>

<div className="h-4 w-full shrink-0" />

            </div>
          )}

        </div>  {/* Closes the 95% inner wrapper */}

        </div>  {/* Closes the outer CONTENT scroll container */}

      </section>
    </div>
  );
}