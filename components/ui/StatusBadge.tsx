const toneMap: Record<string, string> = {
  REQUESTED: "bg-warning-soft text-warning-strong border-warning-soft",
  ACCEPTED: "bg-accent-soft text-accent-strong border-accent-soft",
  DECLINED: "bg-danger-soft text-danger-strong border-danger-soft",
  PAID: "bg-purple-soft text-purple-strong border-purple-soft",
  IN_PROGRESS: "bg-success-soft text-success-strong border-success-soft",
  COMPLETED: "bg-neutral-soft text-foreground border-border",
  CANCELLED: "bg-danger-soft text-danger-strong border-danger-soft",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = (status || "REQUESTED").toUpperCase();
  const tone = toneMap[normalized] || "bg-neutral-soft text-foreground border-border";

  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide', tone, className].filter(Boolean).join(' ')}>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
}
