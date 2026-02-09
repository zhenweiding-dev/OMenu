import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Clock3 } from "lucide-react";
import { useMenuBook } from "@/hooks/useMenuBook";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import type { MenuBook, ShoppingList } from "@/types";

interface StepShoppingLoadingProps {
  menuBook: MenuBook;
  onGenerated: (list: ShoppingList) => void;
}

export function StepShoppingLoading({ menuBook, onGenerated }: StepShoppingLoadingProps) {
  const navigate = useNavigate();
  const { generateList } = useMenuBook();
  const clearError = useAppStore((state) => state.clearError);
  const [retrySeed, setRetrySeed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<"idle" | "retrying" | "failed">("idle");
  const [attempt, setAttempt] = useState(1);
  const MAX_RETRIES = 3;
  const REQUEST_TIMEOUT_MS = 45000;

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error("timeout")), ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  };

  useEffect(() => {
    setElapsedSeconds(0);
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [retrySeed]);

  useEffect(() => {
    let cancelled = false;

    const runGeneration = async () => {
      for (let currentAttempt = 1; currentAttempt <= MAX_RETRIES; currentAttempt += 1) {
        if (cancelled) return;
        clearError();
        setAttempt(currentAttempt);
        setStatus(currentAttempt === 1 ? "idle" : "retrying");
        try {
          const list = await withTimeout(generateList(menuBook), REQUEST_TIMEOUT_MS);
          if (cancelled) return;
          onGenerated(list);
          navigate("/shopping");
          return;
        } catch {
          if (cancelled) return;
          clearError();
          if (currentAttempt < MAX_RETRIES) {
            await delay(900 * currentAttempt);
            continue;
          }
          setStatus("failed");
          return;
        }
      }
    };

    void runGeneration();

    return () => {
      cancelled = true;
    };
  }, [clearError, generateList, menuBook, navigate, onGenerated, retrySeed]);

  const statusMessage = useMemo(() => {
    if (status === "retrying") {
      return `Taking longer than expected. Retrying in the background (${attempt}/${MAX_RETRIES}).`;
    }
    if (status === "failed") {
      return "We couldn't finish this time. Please try again.";
    }
    return null;
  }, [attempt, status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col items-center justify-center px-5 py-12 text-center">
      <div className="relative mb-8 flex h-[155px] w-[155px] shrink-0 items-center justify-center rounded-full bg-paper-muted animate-chef">
        <ShoppingCart className="h-14 w-14 text-accent-base ui-icon-strong" aria-hidden />
      </div>
      <div className="space-y-1">
        <h2 className="ui-title">Generating your shopping list...</h2>
        <p className="ui-subtitle">
          We&apos;re gathering ingredients across your week.
        </p>
      </div>
      <div className="mb-6 flex items-center gap-2 ui-title-lg text-accent-base">
        <Clock3 className="h-5 w-5 ui-icon-strong" aria-hidden />
        {formatTime(elapsedSeconds)}
      </div>

      {statusMessage && (
        <p className={status === "failed" ? "mb-4 ui-body text-error" : "mb-4 ui-body"}>
          {statusMessage}
        </p>
      )}

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
        <p className="ui-caption">
          We&apos;ll keep working in the background
        </p>
      </div>

      {status === "failed" && (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            setRetrySeed((prev) => prev + 1);
            setStatus("idle");
            setAttempt(1);
          }}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
