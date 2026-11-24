import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { startOfWeek } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { useDraftStore } from "@/stores/useDraftStore";
import { useMenuBook } from "@/hooks/useMenuBook";
import { useAppStore } from "@/stores/useAppStore";
import { StepWelcome } from "@/components/create/StepWelcome";
import { StepDisliked, StepPreferred } from "@/components/create/StepTagPicker";
import { StepPeopleBudget } from "@/components/create/StepPeopleBudget";
import { StepSchedule } from "@/components/create/StepSchedule";
import { StepLoading } from "@/components/create/StepLoading";
import { StepPlanOverview } from "@/components/create/StepPlanOverview";
import { StepShoppingLoading } from "@/components/create/StepShoppingLoading";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { getRelativeWeekLabel, getWeekDateRange } from "@/utils/helpers";
import type { MenuBook, ShoppingList } from "@/types";

const steps = {
  welcome: 1,
  preferences: 2,
  disliked: 3,
  peopleBudget: 4,
  schedule: 5,
  loading: 6,
  overview: 7,
  shoppingLoading: 8,
} as const;

const STEP_LABELS: Record<number, string> = {
  2: "Preferences",
  3: "Dislikes",
  4: "People & Budget",
  5: "Schedule",
};

// Total steps for progress indicator (welcome + steps 2-5)
const TOTAL_PROGRESS_STEPS = 5;

interface ProgressDotsProps {
  currentStep: number;
}

function ProgressDots({ currentStep }: ProgressDotsProps) {
  // Show progress dots for welcome and steps 2-5
  if (currentStep < steps.welcome || currentStep > steps.schedule) return null;
  const progressStep = currentStep;
  
  return (
    <div className="flex gap-2 px-5 pt-14 pb-5">
      {Array.from({ length: TOTAL_PROGRESS_STEPS }).map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === progressStep;
        const isCompleted = stepNum < progressStep;
        
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
  const navigate = useNavigate();
  const { createMenu } = useMenuBook();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);
  const addMenuBook = useAppStore((state) => state.addMenuBook);
  const menuBooks = useAppStore((state) => state.menuBooks);
  const resetDraft = useDraftStore((state) => state.resetDraft);
  const resetDraftProgress = useDraftStore((state) => state.resetDraftProgress);
  const pendingResult = useDraftStore((state) => state.pendingResult);
  const setPendingResult = useDraftStore((state) => state.setPendingResult);
  const clearPendingResult = useDraftStore((state) => state.clearPendingResult);
  const setStep = useDraftStore((state) => state.setStep);
  const generationStartTime = useDraftStore((state) => state.generationStartTime);
  const setGenerationStartTime = useDraftStore((state) => state.setGenerationStartTime);
  const clearGenerationStartTime = useDraftStore((state) => state.clearGenerationStartTime);
  const targetWeekStart = useDraftStore((state) => state.targetWeekStart);
  const setTargetWeekStart = useDraftStore((state) => state.setTargetWeekStart);
  const [result, setResult] = useState<MenuBook | null>(pendingResult ?? null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<"idle" | "failed">("idle");
  const hasGenerateAttemptRef = useRef(false);

  // The create flow keeps its step and result state in several effects that depend
  // on each other. Three of them set state directly; moving that out of effects
  // means rewriting the flow, so those calls are marked for the linter below.
  useEffect(() => {
    if (result || !pendingResult) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restores the preview after the page is reopened.
    setResult(pendingResult);
  }, [pendingResult, result]);

  useEffect(() => {
    if (pendingResult && draft.currentStep < steps.overview) {
      setStep(steps.overview);
    }
  }, [draft.currentStep, pendingResult, setStep]);

  useEffect(() => {
    if (draft.currentStep < steps.loading) return;
    if (result || isGenerating || generationStartTime) return;
    if (pendingResult) return;
    if (draft.currentStep === steps.loading && (generateStatus === "failed" || hasGenerateAttemptRef.current)) {
      return;
    }
    // Reopened in a loading step with nothing in progress (e.g. left the page during
    // a generation that then failed): go back to the last editable step instead of
    // showing a loading screen that never finishes.
    setStep(steps.schedule);
  }, [draft.currentStep, generateStatus, generationStartTime, isGenerating, pendingResult, result, setStep]);

  useEffect(() => {
    const state = location.state as { startStep?: number; skipResume?: boolean; weekStart?: string } | null;
    if (!state?.startStep) return;
    if (state.skipResume) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- entry links such as "plan next week" skip the resume prompt.
      setShowResumePrompt(false);
      setHasCheckedResume(true);
    }
    setStep(state.startStep);
  }, [location.state, setStep]);

  useEffect(() => {
    const state = location.state as { weekStart?: string } | null;
    if (!state?.weekStart) return;
    setTargetWeekStart(state.weekStart);
  }, [location.state, setTargetWeekStart]);

  useEffect(() => {
    const state = location.state as { weekStart?: string } | null;
    if (state?.weekStart) return;
    if (targetWeekStart) return;
    const defaultWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
    setTargetWeekStart(defaultWeekStart);
  }, [location.state, setTargetWeekStart, targetWeekStart]);

  // Check for resume on mount
  useEffect(() => {
    const state = location.state as { startStep?: number; skipResume?: boolean; weekStart?: string } | null;
    if (state?.skipResume) return;
    if (pendingResult) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a finished generation replaces the resume prompt.
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
    const preservedWeekStart = targetWeekStart;
    resetDraft();
    if (preservedWeekStart) {
      setTargetWeekStart(preservedWeekStart);
    }
    clearPendingResult();
    clearError();
  };

  const goToStep = useCallback((step: number) => setStep(step), [setStep]);

  const handleGenerate = async () => {
    setResult(null);
    if (draft.getSelectedMealCount() === 0) {
      setError("Select at least one meal slot before generating your menu.");
      goToStep(steps.schedule);
      hasGenerateAttemptRef.current = false;
      return;
    }

    clearError();
    hasGenerateAttemptRef.current = true;
    goToStep(steps.loading);
    // Only set start time if not already generating (prevents reset on retry)
    if (!generationStartTime) {
      setGenerationStartTime(Date.now());
    }
    // One request: the server already tries several models within its own time
    // budget, and api.ts gives up after 180 s.
    setGenerateStatus("idle");
    try {
      const outcome = await createMenu({
        specificPreferences: draft.specificPreferences,
        specificDisliked: draft.specificDisliked,
        numPeople: draft.numPeople,
        budget: draft.budget,
        difficulty: draft.difficulty,
        cookSchedule: draft.cookSchedule,
      });
      const adjustedOutcome = targetWeekStart
        ? { ...outcome, createdAt: targetWeekStart }
        : outcome;
      setPendingResult(adjustedOutcome);
      setResult(adjustedOutcome);
      hasGenerateAttemptRef.current = false;
      clearGenerationStartTime();
      goToStep(steps.overview);
    } catch {
      // createMenu stored the server's message in `error`; StepLoading shows it.
      setGenerateStatus("failed");
      clearGenerationStartTime();
    }
  };

  const handleViewShopping = useCallback(() => {
    if (!result) return;
    const hasBook = menuBooks.some((book) => book.id === result.id);
    if (!hasBook) {
      addMenuBook(result);
    }
    goToStep(steps.shoppingLoading);
  }, [
    addMenuBook,
    goToStep,
    menuBooks,
    result,
  ]);

  const handleShoppingGenerated = useCallback(
    (list: ShoppingList) => {
      setResult((prev) => {
        if (!prev) return prev;
        return { ...prev, shoppingList: list };
      });
      clearPendingResult();
      resetDraftProgress();
    },
    [clearPendingResult, resetDraftProgress],
  );

  let content: ReactNode;

  switch (draft.currentStep) {
    case steps.welcome:
      content = (
        <StepWelcome
          label={getRelativeWeekLabel(targetWeekStart ?? new Date().toISOString())}
          dateRange={getWeekDateRange(targetWeekStart ?? new Date().toISOString())}
          onNext={() => goToStep(steps.preferences)}
          onBack={() => navigate("/")}
        />
      );
      break;
    case steps.preferences:
      content = (
        <StepPreferred
          specificPreferences={draft.specificPreferences}
          onAddItem={draft.addSpecificPreference}
          onRemoveItem={draft.removeSpecificPreference}
          onNext={() => goToStep(steps.disliked)}
          onBack={() => goToStep(steps.welcome)}
        />
      );
      break;
    case steps.disliked:
      content = (
        <StepDisliked
          specificDisliked={draft.specificDisliked}
          onAddItem={draft.addSpecificDisliked}
          onRemoveItem={draft.removeSpecificDisliked}
          onNext={() => goToStep(steps.peopleBudget)}
          onBack={() => goToStep(steps.preferences)}
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
          weekStart={targetWeekStart ?? new Date().toISOString()}
          onNext={handleGenerate}
          onBack={() => goToStep(steps.peopleBudget)}
        />
      );
      break;
    case steps.loading:
      content = (
        <StepLoading
          status={generateStatus}
          errorMessage={error}
          onRetry={handleGenerate}
          startTime={generationStartTime}
        />
      );
      break;
    case steps.overview:
      if (result) {
        content = (
          <StepPlanOverview
            menuBook={result}
            onMenuBookUpdated={(menuBook) => {
              setResult(menuBook);
              setPendingResult(menuBook);
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
            menuBook={result}
            onGenerated={handleShoppingGenerated}
          />
        );
      } else {
        content = <StepLoading />;
      }
      break;
    default:
      content = <StepWelcome onNext={() => goToStep(steps.preferences)} onBack={() => navigate("/")} />;
  }

  // Show resume prompt if user has a saved draft
  if (showResumePrompt) {
    const savedStepLabel = STEP_LABELS[draft.currentStep] ?? `Step ${draft.currentStep}`;
    return (
      <div className="relative flex min-h-full flex-1 flex-col bg-paper-base">
        <div className="px-5 pt-14 pb-6">
          <h1 className="ui-title">
            Continue where you left off?
          </h1>
          <p className="mt-2 ui-subtitle">
            You have an unfinished menu draft at <strong>{savedStepLabel}</strong>.
          </p>
        </div>

        <div className="mx-4 rounded-2xl border border-border-subtle bg-card-base p-5 shadow-soft">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="ui-heading-sm">Your saved progress:</h3>
              <ul className="space-y-1 ui-body">
                {draft.specificPreferences.length > 0 && (
                  <li>• {draft.specificPreferences.length} preference(s) added</li>
                )}
                {draft.specificDisliked.length > 0 && (
                  <li>• {draft.specificDisliked.length} disliked item(s)</li>
                )}
                <li>• {draft.numPeople} people, ${draft.budget} budget</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={handleResumeDraft} size="lg" className="w-full">
                Continue Draft
              </Button>
              <Button onClick={handleStartFresh} variant="outline" size="lg" className="w-full">
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
  const shouldShowError = Boolean(error) && draft.currentStep !== steps.loading && draft.currentStep !== steps.shoppingLoading;

  if (isFullScreenStep) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col bg-paper-base">
        {draft.currentStep === steps.welcome && (
          <ProgressDots currentStep={draft.currentStep} />
        )}
        {content}
        {shouldShowError && <p className="px-5 pb-4 text-center ui-caption text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-paper-base">
      <ProgressDots currentStep={draft.currentStep} />
      {content}
      {shouldShowError && <p className="px-5 pb-4 text-center ui-caption text-error">{error}</p>}
    </div>
  );
}
