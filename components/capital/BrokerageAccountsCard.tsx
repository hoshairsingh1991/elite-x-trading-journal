import { ArrowUp, ArrowDown } from "lucide-react";

import type {
  BrokerageAccount,
  CapitalTransaction,
} from "@/lib/capital/types";

import { formatBreakdown } from "@/lib/capital/calculations";

type BrokerageAccountsCardProps = {
  accounts: BrokerageAccount[];
  completedTransactions: CapitalTransaction[];
  accountFilter: string;
  onAccountSelect: (accountId: string) => void;
};

export default function BrokerageAccountsCard({
  accounts,
  completedTransactions,
  accountFilter,
  onAccountSelect,
}: BrokerageAccountsCardProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#091321] shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
<div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
  <div className="relative left-4">
    <div className="h-1" />

    <h2 className="text-[14px] font-semibold text-white">
      Brokerage Accounts
    </h2>

    <p className="mt-1 text-[12px] text-slate-500">
      Capital movements by account · Not account balances
    </p>

    <div className="h-1" />
  </div>

<span className="relative right-4 inline-flex h-[28px] w-[80px] items-center justify-center rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-2.5 text-[11px] text-slate-400">
  {accounts.length} accounts
</span>
      </div>

<div className="manage-accounts-scrollbar max-h-[254px] overflow-auto">
  <table className="w-full table-fixed border-collapse text-left">
    <thead className="sticky top-0 z-10">
      <tr className="border-b border-white/[0.06] bg-white/[0.015]">
{[
  "Account",
  "Broker",
  "Type",
  "Base",
  "Deposits",
  "Withdrawals",
  "Transfer In/Out",
].map((heading, index) => (
  <th
    key={heading}
    className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
  >
    <span className={index === 0 ? "relative left-3 inline-block" : "inline-block"}>
      {heading}
    </span>
  </th>
))}
      </tr>
    </thead>

          <tbody>
            {accounts.map((account) => {
              const accountDeposits = completedTransactions.filter(
                (transaction) =>
                  transaction.type === "DEPOSIT" &&
                  transaction.toAccountId === account.id
              );

              const accountWithdrawals = completedTransactions.filter(
                (transaction) =>
                  transaction.type === "WITHDRAWAL" &&
                  transaction.fromAccountId === account.id
              );

              const transfersIn = completedTransactions.filter(
                (transaction) =>
                  transaction.type === "TRANSFER" &&
                  transaction.toAccountId === account.id
              );

              const transfersOut = completedTransactions.filter(
                (transaction) =>
                  transaction.type === "TRANSFER" &&
                  transaction.fromAccountId === account.id
              );

              const isSelected = accountFilter === account.id;

              return (
              <tr
  key={account.id}
  className="h-[48px] border-b border-white/[0.045] transition hover:bg-white/[0.025]"
>
<td className="px-2 py-3.5 text-center">
  <button
    type="button"
    onClick={() =>
      onAccountSelect(isSelected ? "ALL" : account.id)
    }
    className="relative left-3 block w-full text-center"
  >
                      <span className="block whitespace-nowrap text-[12px] font-semibold text-slate-200 transition hover:text-blue-400">
                        {account.name}
                      </span>

                      {isSelected && (
                        <span className="mt-1 block text-[10px] text-blue-400">
                          Filtered account
                        </span>
                      )}
                    </button>
                  </td>

               <td className="px-2 py-3.5 text-center text-[12px] text-slate-400">
  {account.broker}
</td>

<td className="px-2 py-3.5 text-center">
  <span className="text-[12px] text-slate-300">
    {account.type}
  </span>
</td>

<td className="px-2 py-3.5 text-center text-[12px] font-semibold text-slate-300">
  {account.baseCurrency}
</td>

<td className="px-2 py-3.5 text-center text-[12px] font-semibold text-emerald-400 tabular-nums">
  {formatBreakdown(accountDeposits)}
</td>

<td className="px-2 py-3.5 text-center text-[12px] font-semibold text-rose-400 tabular-nums">
  {formatBreakdown(accountWithdrawals)}
</td>

<td className="px-2 py-3.5 text-center">
  <div className="flex flex-col items-center gap-1 whitespace-nowrap tabular-nums">

    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
      <ArrowUp size={11} strokeWidth={1.5} />
      {formatBreakdown(transfersIn, true)}
    </span>

    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400">
      <ArrowDown size={11} strokeWidth={1.5} />
      {formatBreakdown(transfersOut)}
    </span>

  </div>
</td>


                </tr>
              );
            })}

            {accounts.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-[12px] text-slate-500"
                >
                  No accounts match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-3">
<div className="h-1" />
<p className="relative left-4 text-[11px] text-slate-500">
  Select an account name to filter the overview to that account.
</p>
<div className="h-1" />
      </div>
    </section>
  );
}
