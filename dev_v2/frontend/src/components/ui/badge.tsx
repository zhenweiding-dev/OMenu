import { cn } from "@/utils/cn";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border-tag bg-paper-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
