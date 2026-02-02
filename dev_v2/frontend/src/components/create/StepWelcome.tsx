import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Let&apos;s design your weekly menu</h2>
        <p className="text-sm text-slate-500">
          Follow the guided steps to tell OMenu about your tastes, schedule, and cooking goals. We&apos;ll generate recipes and a shopping list tailored for you.
        </p>
      </div>
      <Button onClick={onNext} className="px-6">
        Get Started
      </Button>
    </div>
  );
}
