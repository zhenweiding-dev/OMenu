import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apple, Carrot, LeafyGreen, Milk, ShoppingCart, Clock3 } from "lucide-react";
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 text-center">
      <div className="relative h-36 w-36">
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-paper-muted/80 animate-pulse-subtle">
          <ShoppingCart className="h-10 w-10 text-accent-base ui-icon-strong" />
        </div>
        <Apple className="absolute -left-1 top-5 h-6 w-6 text-accent-base/70 animate-ingredient-a ui-icon" aria-hidden />
        <LeafyGreen className="absolute right-2 top-2 h-6 w-6 text-accent-base/70 animate-ingredient-b ui-icon" aria-hidden />
        <Milk className="absolute left-4 bottom-2 h-5 w-5 text-accent-base/70 animate-ingredient-c ui-icon" aria-hidden />
        <Carrot className="absolute right-1 bottom-5 h-6 w-6 text-accent-base/70 animate-ingredient-d ui-icon" aria-hidden />
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
