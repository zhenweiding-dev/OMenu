import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface StepLoadingProps {
  onGoHome?: () => void;
  status?: "idle" | "retrying" | "failed";
  attempt?: number;
  maxRetries?: number;
  onRetry?: () => void;
  startTime?: number | null;
}

export function StepLoading({
  onGoHome,
  status = "idle",
  attempt = 1,
  maxRetries = 3,
  onRetry,
  startTime,
}: StepLoadingProps) {
  const navigate = useNavigate();
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    // Calculate initial elapsed time from startTime if available
    if (startTime) {
      return Math.floor((Date.now() - startTime) / 1000);
    }
    return 0;
  });

  const showGoHomeButton = true;

  useEffect(() => {
    const timer = setInterval(() => {
      if (startTime) {
        // Calculate elapsed from start time to keep it accurate across navigation
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      } else {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

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

  const statusMessage = useMemo(() => {
    if (status === "retrying") {
      return `Taking longer than expected. Retrying in the background (${attempt}/${maxRetries}).`;
    }
    if (status === "failed") {
      return "We couldn't finish this time. Please try again.";
    }
    return null;
  }, [attempt, maxRetries, status]);

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
      <div className="mb-6 text-[24px] font-semibold text-accent-base">
        ⏱️ {formatTime(elapsedSeconds)}
      </div>

      {statusMessage && (
        <p className={status === "failed" ? "mb-4 text-[13px] text-error" : "mb-4 text-[13px] text-text-secondary"}>
          {statusMessage}
        </p>
      )}

      {/* Go to Home button */}
      {showGoHomeButton && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGoHome}
            className="px-4"
          >
            Go to Home
          </Button>
          <p className="text-[12px] text-text-secondary">
            We&apos;ll keep working in the background
          </p>
        </div>
      )}

      {status === "failed" && onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
