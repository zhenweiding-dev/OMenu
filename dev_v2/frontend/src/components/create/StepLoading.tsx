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
      <div className="relative mb-8 flex h-[155px] w-[155px] items-center justify-center rounded-full bg-paper-muted animate-chef">
        <span className="text-[66px]" aria-hidden>👨‍🍳</span>
        <span className="absolute -left-4 top-6 text-[26px] animate-ingredient-a" aria-hidden>🌮</span>
        <span className="absolute left-1 bottom-6 text-[24px] animate-ingredient-b" aria-hidden>🍲</span>
        <span className="absolute -right-3 top-10 text-[25px] animate-ingredient-c" aria-hidden>🥘</span>
        <span className="absolute right-3 bottom-7 text-[22px] animate-ingredient-d" aria-hidden>🍣</span>
        <span className="absolute right-14 top-0 text-[23px] animate-ingredient-c" aria-hidden>🥧</span>
      </div>

      {/* Title */}
      <h2 className="mb-2 text-[20px] font-semibold text-text-primary">
        Designing your menu...
      </h2>

      {/* Subtitle */}
      <p className="mb-6 text-[14px] text-text-secondary">
        Our chef is sketching a fresh menu for you
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
