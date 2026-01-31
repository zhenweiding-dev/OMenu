import { useEffect } from 'react';

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  useEffect(() => {
    // Auto-advance after 2.5 seconds
    const timer = setTimeout(onNext, 2500);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <button
      onClick={onNext}
      className="min-h-screen bg-paper flex flex-col items-center justify-center p-8 w-full"
    >
      {/* Animated food circle */}
      <div className="w-48 h-48 bg-accent/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <div className="text-7xl">🍳</div>
      </div>

      {/* Text */}
      <h1 className="text-h1 text-primary-text text-center mb-2">
        Let's plan meals for
        <br />
        next week!
      </h1>
      <p className="text-body text-secondary-text text-center">
        Tap anywhere to continue
      </p>
    </button>
  );
}
