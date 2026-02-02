import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeIndicatorProps {
  currentDay: string;
  onPrev: () => void;
  onNext: () => void;
}

export function SwipeIndicator({ currentDay, onPrev, onNext }: SwipeIndicatorProps) {
  return (
    <div className="flex items-center justify-between rounded-full border border-border-subtle bg-paper-muted px-4 py-2 text-[12px] uppercase tracking-[0.18em] text-text-secondary shadow-soft">
      <button
        type="button"
        onClick={onPrev}
        className="flex items-center gap-1 rounded-full px-1.5 py-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
        Prev
      </button>
      <span className="text-[13px] font-semibold tracking-[0.24em] text-text-primary">{currentDay}</span>
      <button
        type="button"
        onClick={onNext}
        className="flex items-center gap-1 rounded-full px-1.5 py-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
        aria-label="Next day"
      >
        Next
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
