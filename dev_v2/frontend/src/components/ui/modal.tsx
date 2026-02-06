import { type PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

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

  // Get the phone screen container for portal rendering (fallback to body for tests/standalone)
  const container = document.getElementById("phone-screen") ?? document.body;

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
        {title && <h2 className="ui-heading">{title}</h2>}
        {description && <p className="mt-1 ui-caption">{description}</p>}
        <div className="mt-4 ui-stack">{children}</div>
        {onClose && showCloseButton && (
          <Button type="button" variant="outline" className="mt-6 w-full" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, container);
}
