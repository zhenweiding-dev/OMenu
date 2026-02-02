import { type PropsWithChildren, useEffect } from "react";
import { cn } from "@/utils/cn";

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({ open, title, description, onClose, children, className, showCloseButton = true }: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className={cn("w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl", "max-h-[90vh] overflow-y-auto", className)}>
        {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        <div className="mt-4 space-y-4">{children}</div>
        {onClose && showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
