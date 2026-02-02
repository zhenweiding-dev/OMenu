import type { KeyboardEvent } from "react";

interface SwipeIndicatorProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  labels?: string[];
}

export function SwipeIndicator({ total, activeIndex, onSelect, onPrev, onNext, labels }: SwipeIndicatorProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onNext();
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="tablist"
      aria-label="Days of the week"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base ${isActive ? "w-6 bg-accent-base" : "w-2.5 bg-border-subtle"}`}
            aria-label={labels?.[index] ?? `Day ${index + 1}`}
            role="tab"
            aria-selected={isActive}
          />
        );
      })}
    </div>
  );
}
