import { ChefHat, Salad, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
  dateRange?: string;
  label?: string;
  compact?: boolean;
  inline?: boolean;
}

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
          <p className="ui-label-soft text-accent-base">{label}</p>
          <p className="mt-1 ui-caption">{dateRange}</p>
        </div>
      )}
      {/* Animated food circle */}
      <div className="mb-10 flex h-[200px] w-[200px] items-center justify-center rounded-full bg-gradient-to-br from-paper-muted to-border-subtle animate-float">
        <div className="flex items-center gap-4 text-accent-base/80" aria-hidden>
          <ChefHat className="h-9 w-9 ui-icon-strong" />
          <Salad className="h-9 w-9 ui-icon-strong" />
          <Soup className="h-9 w-9 ui-icon-strong" />
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-4 ui-title-lg">
        Let&apos;s design a menu together!
      </h1>

      {/* Subtitle */}
      <p className="mb-12 ui-subtitle">
        Tell us your preferences and let magic happen.
      </p>

      {/* Begin button */}
      <Button
        onClick={onNext}
        size="lg"
        className="px-16"
      >
        Let's go!
      </Button>
    </div>
  );
}
