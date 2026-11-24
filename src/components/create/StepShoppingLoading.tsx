import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Clock3 } from "lucide-react";
import { useMenuBook } from "@/hooks/useMenuBook";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { failureMessage } from "@/utils/helpers";
import type { MenuBook, ShoppingList } from "@/types";

interface StepShoppingLoadingProps {
  menuBook: MenuBook;
  onGenerated: (list: ShoppingList) => void;
}

export function StepShoppingLoading({ menuBook, onGenerated }: StepShoppingLoadingProps) {
  const navigate = useNavigate();
  const { generateList } = useMenuBook();
  const error = useAppStore((state) => state.error);
  const [retrySeed, setRetrySeed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<"idle" | "failed">("idle");

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [retrySeed]);

  // One request per attempt: the server already tries several models within its
  // own time budget. The list still lands in the store if the user leaves this page.
  useEffect(() => {
    let cancelled = false;
    generateList(menuBook)
      .then((list) => {
        if (cancelled) return;
        onGenerated(list);
        navigate("/shopping");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [generateList, menuBook, navigate, onGenerated, retrySeed]);

  const statusMessage = status === "failed" ? failureMessage(error) : null;

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
            setElapsedSeconds(0);
            setRetrySeed((prev) => prev + 1);
            setStatus("idle");
          }}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
