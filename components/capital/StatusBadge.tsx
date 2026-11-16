
import type { TransactionStatus } from "@/lib/capital/types";

export function StatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  const styles = {
    COMPLETED: "text-emerald-400",
    PENDING: "text-amber-400",
    CANCELLED: "text-rose-400",
  };

  const labels = {
    COMPLETED: "Completed",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
