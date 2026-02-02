import * as React from "react";
import { cn } from "@/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-border-subtle bg-card-base px-3 py-2 text-sm text-text-primary shadow-soft transition-colors placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
