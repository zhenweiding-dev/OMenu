import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
  dateRange?: string;
  label?: string;
  compact?: boolean;
  inline?: boolean;
}

const FOOD_EMOJIS = ["🍳", "🥗", "🍜"];

export function StepWelcome({
  onNext,
  dateRange,
  label = "THIS WEEK",
  compact = false,
  inline = false,
}: StepWelcomeProps) {
  return (
    <div
      className={
        inline
          ? "flex flex-1 flex-col items-center justify-center px-5 pt-20 pb-8 text-center"
          : compact
            ? "flex flex-1 flex-col items-center justify-center px-5 pt-20 pb-8 text-center"
            : "flex flex-1 flex-col items-center justify-center px-5 pt-20 pb-10 text-center"
      }
    >
      {dateRange && (
        <div className="mb-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent-base">{label}</p>
          <p className="mt-1 text-[12px] text-text-secondary">{dateRange}</p>
        </div>
      )}
      {/* Animated food circle */}
      <div className="mb-10 flex h-[200px] w-[200px] items-center justify-center rounded-full bg-gradient-to-br from-paper-muted to-border-subtle animate-float">
        <span className="text-5xl tracking-wider">
          {FOOD_EMOJIS.join(" ")}
        </span>
      </div>

      {/* Title */}
      <h1 className="mb-4 text-[24px] font-semibold leading-snug text-text-primary">
        Let&apos;s plan meals
        <br />
        for next week!
      </h1>

      {/* Subtitle */}
      <p className="mb-12 text-[15px] leading-relaxed text-text-secondary">
        Tell us your preferences and we&apos;ll
        <br />
        create a personalized meal plan for you.
      </p>

      {/* Begin button */}
      <Button
        onClick={onNext}
        className="rounded-xl bg-accent-base px-16 py-4 text-[15px] font-semibold text-white hover:bg-accent-base/90"
      >
        Begin
      </Button>
    </div>
  );
}
