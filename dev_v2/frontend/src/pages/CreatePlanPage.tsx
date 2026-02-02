import { useCallback, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDraftStore } from "@/stores/useDraftStore";
import { useMealPlan } from "@/hooks/useMealPlan";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppStore } from "@/stores/useAppStore";
import { StepWelcome } from "@/components/create/StepWelcome";
import { StepKeywords } from "@/components/create/StepKeywords";
import { StepMustHave } from "@/components/create/StepMustHave";
import { StepDisliked } from "@/components/create/StepDisliked";
import { StepPeopleBudget } from "@/components/create/StepPeopleBudget";
import { StepSchedule } from "@/components/create/StepSchedule";
import { StepLoading } from "@/components/create/StepLoading";
import { StepPlanOverview } from "@/components/create/StepPlanOverview";
import { StepShoppingLoading } from "@/components/create/StepShoppingLoading";
import type { MealPlan, ShoppingList } from "@/types";

const steps = {
  welcome: 1,
  keywords: 2,
  mustHave: 3,
  disliked: 4,
  peopleBudget: 5,
  schedule: 6,
  loading: 7,
  overview: 8,
  shoppingLoading: 9,
} as const;

export function CreatePlanPage() {
  const draft = useDraftStore();
  const { createPlan } = useMealPlan();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);
  const resetDraft = useDraftStore((state) => state.resetDraft);
  const setStep = useDraftStore((state) => state.setStep);
  const navigate = useNavigate();

  const [result, setResult] = useState<{ plan: MealPlan; list: ShoppingList } | null>(null);

  const goToStep = useCallback((step: number) => setStep(step), [setStep]);

  const handleBackToWelcome = () => {
    resetDraft();
    setResult(null);
    clearError();
  };

  const handleGenerate = async () => {
    setResult(null);
    if (draft.getSelectedMealCount() === 0) {
      setError("Select at least one meal slot before generating your plan.");
      goToStep(steps.schedule);
      return;
    }

    clearError();
    goToStep(steps.loading);
    try {
      const outcome = await createPlan({
        keywords: draft.keywords,
        mustHaveItems: draft.mustHaveItems,
        dislikedItems: draft.dislikedItems,
        numPeople: draft.numPeople,
        budget: draft.budget,
        difficulty: draft.difficulty,
        cookSchedule: draft.cookSchedule,
      });
      setResult(outcome);
      goToStep(steps.overview);
    } catch {
      // Error messaging handled via store error state; return user to schedule review.
      goToStep(steps.schedule);
    }
  };

  const handleViewShopping = useCallback(() => {
    if (!result) return;
    if (result.list.items.length > 0) {
      navigate("/shopping");
      return;
    }
    goToStep(steps.shoppingLoading);
  }, [goToStep, navigate, result]);

  const handleShoppingGenerated = useCallback(
    (plan: MealPlan, list: ShoppingList) => {
      setResult({ plan, list });
      resetDraft();
    },
    [resetDraft],
  );

  const handleShoppingError = useCallback(() => {
    goToStep(steps.overview);
  }, [goToStep]);

  let content: ReactNode;

  switch (draft.currentStep) {
    case steps.welcome:
      content = <StepWelcome onNext={() => goToStep(steps.keywords)} />;
      break;
    case steps.keywords:
      content = (
        <StepKeywords
          keywords={draft.keywords}
          onAddKeyword={draft.addKeyword}
          onRemoveKeyword={draft.removeKeyword}
          onNext={() => goToStep(steps.mustHave)}
          onBack={() => goToStep(steps.welcome)}
        />
      );
      break;
    case steps.mustHave:
      content = (
        <StepMustHave
          mustHaveItems={draft.mustHaveItems}
          onAddItem={draft.addMustHaveItem}
          onRemoveItem={draft.removeMustHaveItem}
          onNext={() => goToStep(steps.disliked)}
          onBack={() => goToStep(steps.keywords)}
        />
      );
      break;
    case steps.disliked:
      content = (
        <StepDisliked
          dislikedItems={draft.dislikedItems}
          onAddItem={draft.addDislikedItem}
          onRemoveItem={draft.removeDislikedItem}
          onNext={() => goToStep(steps.peopleBudget)}
          onBack={() => goToStep(steps.mustHave)}
        />
      );
      break;
    case steps.peopleBudget:
      content = (
        <StepPeopleBudget
          numPeople={draft.numPeople}
          budget={draft.budget}
          difficulty={draft.difficulty}
          onUpdatePeople={draft.setNumPeople}
          onUpdateBudget={draft.setBudget}
          onUpdateDifficulty={draft.setDifficulty}
          onNext={() => goToStep(steps.schedule)}
          onBack={() => goToStep(steps.disliked)}
        />
      );
      break;
    case steps.schedule:
      content = (
        <StepSchedule
          cookSchedule={draft.cookSchedule}
          onToggleMeal={draft.toggleMeal}
          onSelectAll={draft.selectAllMeals}
          onDeselectAll={draft.deselectAllMeals}
          onNext={handleGenerate}
          onBack={() => goToStep(steps.peopleBudget)}
        />
      );
      break;
    case steps.loading:
      content = <StepLoading />;
      break;
    case steps.overview:
      if (result) {
        content = (
          <StepPlanOverview
            mealPlan={result.plan}
            shoppingList={result.list}
            onPlanUpdated={(plan, list) => setResult({ plan, list })}
            onCreateAnother={handleBackToWelcome}
            onViewShopping={handleViewShopping}
          />
        );
      } else {
        content = <StepLoading />;
      }
      break;
    case steps.shoppingLoading:
      if (result) {
        content = (
          <StepShoppingLoading
            mealPlan={result.plan}
            onGenerated={handleShoppingGenerated}
            onError={handleShoppingError}
          />
        );
      } else {
        content = <StepLoading />;
      }
      break;
    default:
      content = <StepWelcome onNext={() => goToStep(steps.keywords)} />;
  }

  return (
    <PageContainer className="space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Create Meal Plan</h1>
        <p className="text-sm text-slate-500">Answer a few quick questions to generate your personalized weekly plan.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {content}
      </section>

      {isGenerating && draft.currentStep !== steps.loading && (
        <p className="text-xs text-slate-400">Generating in background...</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </PageContainer>
  );
}
