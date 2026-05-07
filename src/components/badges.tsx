import { AlertTriangle, Check } from "lucide-react";
import type { Priority } from "@/lib/types";

export function ConfidenceBadge({ value }: { value: number }) {
  const display = value.toFixed(2);
  let cls: string;
  let Icon = Check;
  if (value >= 0.85) {
    cls = "bg-emerald-50 text-emerald-700 border-emerald-100";
  } else if (value >= 0.7) {
    cls = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = Check;
  } else {
    cls = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = AlertTriangle;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${cls}`}
      title={
        value >= 0.85
          ? `High confidence · ${display}`
          : value >= 0.7
            ? `Medium confidence · ${display}`
            : `Low confidence · ${display} · review recommended`
      }
    >
      <Icon className="h-3 w-3" />
      {display}
    </span>
  );
}

const PRIORITY_CLASS: Record<Priority, string> = {
  urgent: "bg-rose-50 text-rose-700 border-rose-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  medium: "bg-sky-50 text-sky-700 border-sky-100",
  low: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "bg-rose-500",
  high: "bg-orange-500",
  medium: "bg-sky-500",
  low: "bg-zinc-400",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityBadge({ value }: { value: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CLASS[value]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[value]}`}
      />
      {PRIORITY_LABEL[value]}
    </span>
  );
}

const AVATAR_TONES = [
  "bg-amber-200 text-amber-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
  "bg-emerald-200 text-emerald-900",
  "bg-rose-200 text-rose-900",
  "bg-fuchsia-200 text-fuchsia-900",
  "bg-cyan-200 text-cyan-900",
];

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarTone(seed: string | null | undefined): string {
  if (!seed) return "bg-zinc-200 text-zinc-500";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length];
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string | null | undefined;
  size?: "sm" | "md";
}) {
  const initials = getInitials(name);
  const tone =
    !name || name === "?"
      ? "border border-dashed border-zinc-300 text-zinc-400"
      : getAvatarTone(name);
  const cls =
    size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${cls} ${tone}`}
    >
      {initials}
    </span>
  );
}
