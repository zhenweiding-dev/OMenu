import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { failureMessage } from "@/utils/helpers";

interface StepLoadingProps {
  status?: "idle" | "failed";
  errorMessage?: string | null;
  onRetry?: () => void;
  startTime?: number | null;
}

export function StepLoading({
  status = "idle",
  errorMessage,
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

  const statusMessage = status === "failed" ? failureMessage(errorMessage) : null;

  return (
    <div className="flex flex-1 min-h-0 flex-col items-center justify-center px-5 py-12 text-center">
      {/* Animated chef icon */}
      <div className="relative mb-8 flex h-[155px] w-[155px] shrink-0 items-center justify-center rounded-full bg-paper-muted animate-chef">
        <ChefHat className="h-14 w-14 text-accent-base ui-icon-strong" aria-hidden />
      </div>

      {/* Title */}
      <h2 className="mb-3 ui-title">
        Designing your menu...
      </h2>

      {/* Subtitle */}
      <p className="mb-6 ui-subtitle">
        Our chef is sketching a fresh menu for you
      </p>

      {/* Timer */}
      <div className="mb-6 flex items-center gap-2 ui-title-lg text-accent-base">
        <Clock3 className="h-5 w-5 ui-icon-strong" aria-hidden />
        {formatTime(elapsedSeconds)}
      </div>

      {statusMessage && (
        <p className={status === "failed" ? "mb-4 ui-body text-error" : "mb-4 ui-body"}>
          {statusMessage}
        </p>
      )}

      {/* Go to Home button */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="px-4"
        >
          Go to Home
        </Button>
        <p className="ui-caption">
          We&apos;ll keep working in the background
        </p>
      </div>

      {status === "failed" && onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
