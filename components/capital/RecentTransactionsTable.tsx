
import type {
  BrokerageAccount,
  CapitalTransaction,
} from "@/lib/capital/types";

import {
  formatMoney,
  formatDate,
} from "@/lib/capital/formatters";

import {
  getTypeLabel,
} from "@/lib/capital/calculations";

import {
  getAccountName,
} from "@/lib/capital/helpers";

import { StatusBadge } from "@/components/capital/StatusBadge";
import { TypeIcon } from "@/components/capital/CapitalTypeIcon";

type RecentTransactionsTableProps = {
  transactions: CapitalTransaction[];
  accounts: BrokerageAccount[];
};

export default function RecentTransactionsTable({
  transactions,
  accounts,
}: RecentTransactionsTableProps) {
  return (
    <section className="relative left-3 mt-5 w-[98%] min-w-0 overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#091321] shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">

        <div className="relative left-4">
          <div className="h-1" />

          <h2 className="text-[14px] font-semibold text-white">
            Recent Transactions
          </h2>

          <p className="mt-1 text-[12px] text-slate-500">
            Latest completed capital movements
          </p>

          <div className="h-1" />
        </div>

        <span className="relative right-4 inline-flex h-[28px] w-[80px] items-center justify-center rounded-[8px] border border-white/[0.07] bg-white/[0.03] px-1 text-[10px] text-slate-400">
          {transactions.length} transactions
        </span>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">

        <table className="w-full table-fixed border-collapse text-left">

          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.015]">

              {[
                "Date",
                "Type",
                "Account / Description",
                "Method",
                "Amount",
                "Status",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
                >
                  {heading}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {transactions.map((transaction) => {
              const isDeposit =
                transaction.type === "DEPOSIT";

              const isWithdrawal =
                transaction.type === "WITHDRAWAL";

              const description =
                transaction.type === "TRANSFER"
                  ? `${getAccountName(accounts, transaction.fromAccountId)} → ${getAccountName(accounts, transaction.toAccountId)}`
                  : transaction.type === "DEPOSIT"
                    ? getAccountName(accounts, transaction.toAccountId)
                    : getAccountName(accounts, transaction.fromAccountId);

              return (
                <tr
                  key={transaction.id}
                  className="h-[48px] border-b border-white/[0.045] transition hover:bg-white/[0.025]"
                >

                  <td className="px-2 py-3.5 text-center text-[12px] text-slate-400 tabular-nums">
                    {formatDate(transaction.date)}
                  </td>

                  <td className="px-2 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <TypeIcon type={transaction.type} />

                      <span className="whitespace-nowrap text-[12px] font-medium text-slate-300">
                        {getTypeLabel(transaction.type)}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-3.5 text-center">

                    <p className="text-[12px] font-semibold text-slate-200">
                      {description}
                    </p>

                    {transaction.type !== "TRANSFER" && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        {transaction.counterpartyInstitution ||
                          transaction.referenceNumber}
                      </p>
                    )}

                  </td>

                  <td className="px-2 py-3.5 text-center text-[12px] text-slate-400">
                    {transaction.method}
                  </td>

                  <td
                    className={`px-2 py-3.5 text-center text-[12px] font-semibold tabular-nums ${
                      isDeposit
                        ? "text-emerald-400"
                        : isWithdrawal
                          ? "text-rose-400"
                          : "text-blue-300"
                    }`}
                  >
                    {isDeposit
                      ? "+"
                      : isWithdrawal
                        ? "−"
                        : ""}
                    {transaction.currency}{" "}
                    {formatMoney(transaction.amount)}
                  </td>

                  <td className="px-2 py-3.5 text-center">
                    <div className="flex justify-center">
                      <StatusBadge status={transaction.status} />
                    </div>
                  </td>

                </tr>
              );
            })}

            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[12px] text-slate-500"
                >
                  No completed transactions match the selected filters.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}
