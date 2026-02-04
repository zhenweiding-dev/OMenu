import { type PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // Get the phone screen container for portal rendering
  const container = document.getElementById("phone-screen");
  if (!container) return null;

  const modalContent = (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onPointerDown={(event) => {
        if (!onClose) return;
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-3xl border border-border-subtle bg-card-base p-6 shadow-[0_4px_20px_rgba(0,0,0,0.12)]",
          "max-h-[85%] overflow-y-auto",
          className,
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        <div className="mt-4 space-y-4">{children}</div>
        {onClose && showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-secondary hover:bg-paper-muted"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, container);
}
