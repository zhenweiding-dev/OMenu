import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface StepLoadingProps {
  onGoHome?: () => void;
  minWaitSeconds?: number;
}

const MIN_WAIT_DEFAULT = 60; // 1 minute per spec

export function StepLoading({ onGoHome, minWaitSeconds = MIN_WAIT_DEFAULT }: StepLoadingProps) {
  const navigate = useNavigate();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const showGoHomeButton = elapsedSeconds >= minWaitSeconds;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 text-center">
      {/* Animated chef icon */}
      <div className="mb-8 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-paper-muted animate-pulse-subtle">
        <span className="text-[56px]" aria-hidden>👨‍🍳</span>
      </div>

      {/* Title */}
      <h2 className="mb-2 text-[20px] font-semibold text-text-primary">
        Generating your meal plan...
      </h2>

      {/* Subtitle */}
      <p className="mb-6 text-[14px] text-text-secondary">
        Our chef is preparing something delicious
      </p>

      {/* Timer */}
      <div className="mb-10 text-[24px] font-semibold text-accent-base">
        ⏱️ {formatTime(elapsedSeconds)}
      </div>

      {/* Go to Home button - appears after minimum wait */}
      {showGoHomeButton && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoHome}
            className="bg-transparent border-none text-[15px] font-medium text-accent-base hover:opacity-80"
          >
            Go to Home
          </button>
          <p className="text-[12px] text-text-secondary">
            We&apos;ll keep working in the background
          </p>
        </div>
      )}
    </div>
  );
}
