import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDraftStore } from "@/stores/useDraftStore";
import { useMealPlan } from "@/hooks/useMealPlan";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
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

const STEP_LABELS: Record<number, string> = {
  2: "Keywords",
  3: "Must-Have Items",
  4: "Disliked Items",
  5: "People & Budget",
  6: "Schedule",
};

// Total steps for progress indicator (excluding welcome, loading, overview, shoppingLoading)
const TOTAL_PROGRESS_STEPS = 6;

interface ProgressDotsProps {
  currentStep: number;
}

function ProgressDots({ currentStep }: ProgressDotsProps) {
  // Only show progress dots for steps 2-6
  if (currentStep < 2 || currentStep > 6) return null;
  
  return (
    <div className="flex gap-2 px-5 pt-14 pb-5">
      {Array.from({ length: TOTAL_PROGRESS_STEPS }).map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        
        return (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              isActive && "bg-accent-base",
              isCompleted && "bg-accent-light",
              !isActive && !isCompleted && "bg-border-subtle"
            )}
          />
        );
      })}
    </div>
  );
}

export function CreatePlanPage() {
  const draft = useDraftStore();
  const location = useLocation();
  const { createPlan } = useMealPlan();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);
  const addMenuBook = useAppStore((state) => state.addMenuBook);
  const menuBooks = useAppStore((state) => state.menuBooks);
  const resetDraft = useDraftStore((state) => state.resetDraft);
  const pendingResult = useDraftStore((state) => state.pendingResult);
  const setPendingResult = useDraftStore((state) => state.setPendingResult);
  const clearPendingResult = useDraftStore((state) => state.clearPendingResult);
  const setStep = useDraftStore((state) => state.setStep);
  const navigate = useNavigate();

  const [result, setResult] = useState<{ plan: MealPlan; list: ShoppingList } | null>(
    pendingResult ?? null,
  );
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  useEffect(() => {
    if (result || !pendingResult) return;
    setResult(pendingResult);
  }, [pendingResult, result]);

  useEffect(() => {
    if (pendingResult && draft.currentStep < steps.overview) {
      setStep(steps.overview);
    }
  }, [draft.currentStep, pendingResult, setStep]);

  useEffect(() => {
    if (draft.currentStep < steps.loading) return;
    if (result || isGenerating) return;
    if (pendingResult) return;
    // If we refreshed while in loading/overview/shoppingLoading and no pending result exists,
    // return to the last editable step to avoid a stuck loading screen.
    setStep(steps.schedule);
  }, [draft.currentStep, isGenerating, pendingResult, result, setStep]);

  useEffect(() => {
    const state = location.state as { startStep?: number; skipResume?: boolean } | null;
    if (!state?.startStep) return;
    if (state.skipResume) {
      setShowResumePrompt(false);
      setHasCheckedResume(true);
    }
    setStep(state.startStep);
  }, [location.state, setStep]);

  // Check for resume on mount
  useEffect(() => {
    const state = location.state as { startStep?: number; skipResume?: boolean } | null;
    if (state?.skipResume) return;
    if (pendingResult) {
      setShowResumePrompt(false);
      setHasCheckedResume(true);
      return;
    }
    if (!hasCheckedResume) {
      const savedStep = useDraftStore.getState().currentStep;
      if (savedStep > 1 && savedStep <= steps.schedule) {
        setShowResumePrompt(true);
      }
      setHasCheckedResume(true);
    }
  }, [hasCheckedResume, location.state, pendingResult]);

  const handleResumeDraft = () => {
    setShowResumePrompt(false);
  };

  const handleStartFresh = () => {
    setShowResumePrompt(false);
    resetDraft();
    clearPendingResult();
    clearError();
  };

  const goToStep = useCallback((step: number) => setStep(step), [setStep]);

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
      setPendingResult(outcome);
      setResult(outcome);
      goToStep(steps.overview);
    } catch {
      goToStep(steps.schedule);
    }
  };

  const handleViewShopping = useCallback(() => {
    if (!result) return;
    const hasBook = menuBooks.some((book) => book.id === result.plan.id);
    if (!hasBook) {
      addMenuBook({ id: result.plan.id, mealPlan: result.plan, shoppingList: result.list });
    }
    if (result.list.items.length > 0) {
      clearPendingResult();
      resetDraft();
      navigate("/shopping");
      return;
    }
    goToStep(steps.shoppingLoading);
  }, [
    addMenuBook,
    clearPendingResult,
    goToStep,
    menuBooks,
    navigate,
    resetDraft,
    result,
  ]);

  const handleShoppingGenerated = useCallback(
    (plan: MealPlan, list: ShoppingList) => {
      setResult({ plan, list });
      clearPendingResult();
      resetDraft();
    },
    [clearPendingResult, resetDraft],
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
            onPlanUpdated={(plan, list) => {
              setResult({ plan, list });
              setPendingResult({ plan, list });
            }}
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

  // Show resume prompt if user has a saved draft
  if (showResumePrompt) {
    const savedStepLabel = STEP_LABELS[draft.currentStep] ?? `Step ${draft.currentStep}`;
    return (
      <div className="relative flex h-full flex-1 flex-col bg-paper-base">
        <div className="px-5 pt-14 pb-6">
          <h1 className="text-[22px] font-semibold leading-tight text-text-primary">
            Continue where you left off?
          </h1>
          <p className="mt-2 text-[14px] text-text-secondary">
            You have an unfinished meal plan draft at <strong>{savedStepLabel}</strong>.
          </p>
        </div>

        <div className="mx-4 rounded-2xl border border-border-subtle bg-card-base p-5 shadow-soft">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-[15px] font-semibold text-text-primary">Your saved progress:</h3>
              <ul className="space-y-1 text-[13px] text-text-secondary">
                {draft.keywords.length > 0 && (
                  <li>• {draft.keywords.length} keyword(s) selected</li>
                )}
                {draft.mustHaveItems.length > 0 && (
                  <li>• {draft.mustHaveItems.length} must-have item(s)</li>
                )}
                {draft.dislikedItems.length > 0 && (
                  <li>• {draft.dislikedItems.length} disliked item(s)</li>
                )}
                <li>• {draft.numPeople} people, ${draft.budget} budget</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={handleResumeDraft} className="w-full rounded-xl py-3">
                Continue Draft
              </Button>
              <Button onClick={handleStartFresh} variant="outline" className="w-full rounded-xl py-3">
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen view for welcome, loading, overview steps
  const isFullScreenStep = draft.currentStep === steps.welcome || 
                           draft.currentStep === steps.loading || 
                           draft.currentStep === steps.overview ||
                           draft.currentStep === steps.shoppingLoading;

  if (isFullScreenStep) {
    return (
      <div className="relative flex h-full flex-1 flex-col bg-paper-base">
        {content}
        {error && <p className="px-5 pb-4 text-center text-sm text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-1 flex-col bg-paper-base">
      <ProgressDots currentStep={draft.currentStep} />
      {content}
      {error && <p className="px-5 pb-4 text-center text-sm text-error">{error}</p>}
    </div>
  );
}
