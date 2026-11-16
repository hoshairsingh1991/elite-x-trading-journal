
import type { BrokerageAccount } from "@/lib/capital/types";

export function getAccountById(
  accounts: BrokerageAccount[],
  id: string | null
): BrokerageAccount | undefined {
  return accounts.find(
    (account) => account.id === id
  );
}

export function getAccountName(
  accounts: BrokerageAccount[],
  id: string | null
): string {
  return getAccountById(accounts, id)?.name ?? "External account";
}
