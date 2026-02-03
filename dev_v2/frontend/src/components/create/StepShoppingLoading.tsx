import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useAppStore } from "@/stores/useAppStore";
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

  useEffect(() => {
    let cancelled = false;

    const runGeneration = async () => {
      try {
        const list = await generateList(mealPlan);
        if (cancelled) return;
        onGenerated(mealPlan, list);
        navigate("/shopping");
      } catch {
        if (cancelled) return;
        onError();
      }
    };

    void runGeneration();

    return () => {
      cancelled = true;
    };
  }, [generateList, mealPlan, navigate, onError, onGenerated]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-muted">
        <ShoppingCart className="h-8 w-8 animate-spin text-accent-base" />
      </div>
      <div className="space-y-1">
        <h2 className="text-[20px] font-semibold text-text-primary">Generating your shopping list</h2>
        <p className="text-[14px] text-text-secondary">
          We&apos;re consolidating ingredients across your week. This usually takes less than a minute.
        </p>
      </div>
      {error && !isGenerating && <p className="text-[13px] text-error">{error}</p>}
    </div>
  );
}
