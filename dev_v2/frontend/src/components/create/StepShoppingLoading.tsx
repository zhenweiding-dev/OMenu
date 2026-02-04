import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import type { MealPlan, ShoppingList } from "@/types";

interface StepShoppingLoadingProps {
  mealPlan: MealPlan;
  onGenerated: (plan: MealPlan, list: ShoppingList) => void;
  onError: () => void;
}

export function StepShoppingLoading({ mealPlan, onGenerated, onError }: StepShoppingLoadingProps) {
  const navigate = useNavigate();
  const { generateList } = useMealPlan();
  const error = useAppStore((state) => state.error);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const [retryCount, setRetryCount] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const runGeneration = async () => {
      try {
        setLocalError(null);
        const list = await generateList(mealPlan);
        if (cancelled) return;
        onGenerated(mealPlan, list);
        navigate("/shopping");
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to generate shopping list.";
        setLocalError(message);
      }
    };

    void runGeneration();

    return () => {
      cancelled = true;
    };
  }, [generateList, mealPlan, navigate, onGenerated, retryCount]);

  const errorMessage = localError ?? (error && !isGenerating ? error : null);

  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="relative h-36 w-36">
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-paper-muted/80 animate-pulse-subtle">
          <ShoppingCart className="h-10 w-10 text-accent-base" strokeWidth={1.8} />
        </div>
        <span className="absolute -left-1 top-5 text-[26px] animate-ingredient-a" aria-hidden>🍅</span>
        <span className="absolute right-2 top-2 text-[24px] animate-ingredient-b" aria-hidden>🥬</span>
        <span className="absolute left-4 bottom-2 text-[22px] animate-ingredient-c" aria-hidden>🧀</span>
        <span className="absolute right-1 bottom-5 text-[24px] animate-ingredient-d" aria-hidden>🥕</span>
      </div>
      <div className="space-y-1">
        <h2 className="text-[20px] font-semibold text-text-primary">Generating your shopping list...</h2>
        <p className="text-[14px] text-text-secondary">
          We&apos;re gathering ingredients across your week.
        </p>
      </div>
      {errorMessage && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-[13px] text-error">{errorMessage}</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-4"
              onClick={() => {
                setRetryCount((prev) => prev + 1);
              }}
              disabled={isGenerating}
            >
              Try Again
            </Button>
            <Button type="button" variant="ghost" onClick={onError}>
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
