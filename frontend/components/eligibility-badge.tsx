import { Check, Clock } from "lucide-react";
import clsx from "clsx";

interface EligibilityBadgeProps {
  status: "eligible" | "near-miss";
  size?: "sm" | "md";
}

export function EligibilityBadge({ status, size = "md" }: EligibilityBadgeProps) {
  const eligible = status === "eligible";
  const dims = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-seal animate-seal-stamp border-2",
        dims,
        eligible
          ? "bg-emerald-100 border-emerald-500 text-emerald-600"
          : "bg-amber-100 border-amber-500 text-amber-600"
      )}
      title={eligible ? "Eligible" : "Almost eligible"}
    >
      {eligible ? <Check size={iconSize} strokeWidth={2.5} /> : <Clock size={iconSize} strokeWidth={2.5} />}
    </span>
  );
}

export function EligibilityPill({ status }: { status: "eligible" | "near-miss" }) {
  const eligible = status === "eligible";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label",
        eligible
          ? "bg-emerald-100 text-emerald-600"
          : "bg-amber-100 text-amber-600"
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", eligible ? "bg-emerald-500" : "bg-amber-500")} />
      {eligible ? "Eligible" : "Almost there"}
    </span>
  );
}
