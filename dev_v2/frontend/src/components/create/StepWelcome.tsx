import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
}

const FOOD_EMOJIS = ["🍳", "🥗", "🍜"];

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-10 text-center">
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
