
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
} from "lucide-react";

import type { TransactionType } from "@/lib/capital/types";

export function TypeIcon({
  type,
}: {
  type: TransactionType;
}) {
  const iconProps = {
    size: 14,
    strokeWidth: 1.7,
  };

  if (type === "DEPOSIT") {
    return (
      <ArrowDownToLine
        {...iconProps}
        className="shrink-0 text-emerald-400"
      />
    );
  }

  if (type === "WITHDRAWAL") {
    return (
      <ArrowUpFromLine
        {...iconProps}
        className="shrink-0 text-rose-400"
      />
    );
  }

  return (
    <ArrowLeftRight
      {...iconProps}
      className="shrink-0 text-blue-400"
    />
  );
}
