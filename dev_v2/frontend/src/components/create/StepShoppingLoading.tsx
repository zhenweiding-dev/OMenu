import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apple, Carrot, LeafyGreen, Milk, ShoppingCart, Wheat, Clock3 } from "lucide-react";
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
      <div className="relative mb-8 flex h-[155px] w-[155px] items-center justify-center rounded-full bg-paper-muted animate-chef">
        <ShoppingCart className="h-14 w-14 text-accent-base ui-icon-strong" aria-hidden />
        {(() => {
          const items = [
            { Icon: LeafyGreen, size: "h-7 w-7", tone: "text-accent-base/70", anim: "animate-ingredient-a" },
            { Icon: Apple, size: "h-6 w-6", tone: "text-accent-base/70", anim: "animate-ingredient-b" },
            { Icon: Wheat, size: "h-6 w-6", tone: "text-accent-base/70", anim: "animate-ingredient-c" },
            { Icon: Carrot, size: "h-6 w-6", tone: "text-accent-base/70", anim: "animate-ingredient-d" },
            { Icon: Milk, size: "h-6 w-6", tone: "text-accent-base/70", anim: "animate-ingredient-c" },
          ];
          const startAngle = -135;
          const endAngle = 135;
          const step = items.length > 1 ? (endAngle - startAngle) / (items.length - 1) : 0;
          return items.map((item, index) => ({ ...item, angle: startAngle + step * index }));
        })().map(({ Icon, size, tone, angle, anim }) => {
          const radians = (angle * Math.PI) / 180;
          const radius = 58;
          return (
            <span
              key={angle}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${Math.cos(radians) * radius}px, ${Math.sin(radians) * radius}px)`,
              }}
              aria-hidden
            >
              <Icon className={`${size} ${tone} ${anim} ui-icon-strong`} aria-hidden />
            </span>
          );
        })}
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
