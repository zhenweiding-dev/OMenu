import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { SwipeIndicator } from "@/components/home/SwipeIndicator";
import { WEEK_DAYS } from "@/utils/constants";
import { getDayDisplay, startCaseDay } from "@/utils/helpers";
import type { MealPlan, ShoppingList, DayMeals } from "@/types";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useAppStore } from "@/stores/useAppStore";

interface StepPlanOverviewProps {
  mealPlan: MealPlan;
  shoppingList: ShoppingList;
  onPlanUpdated: (plan: MealPlan, list: ShoppingList) => void;
  onCreateAnother: () => void;
  onViewShopping: () => void;
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function StepPlanOverview({ mealPlan, shoppingList, onPlanUpdated, onCreateAnother, onViewShopping }: StepPlanOverviewProps) {
  const { updatePlan } = useMealPlan();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const globalError = useAppStore((state) => state.error);
  const clearError = useAppStore((state) => state.clearError);
  const setActiveMeal = useAppStore((state) => state.setActiveMeal);

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modification, setModification] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const touchStartXRef = useRef<number | null>(null);

  const hasShoppingItems = shoppingList.items.length > 0;
  const currentDayKey = WEEK_DAYS[currentDayIndex];
  const currentMeals = mealPlan.days[currentDayKey];
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = getDayDisplay(mealPlan.createdAt, currentDayIndex);

  const handlePrevDay = () => {
    setCurrentDayIndex((prev) => (prev + WEEK_DAYS.length - 1) % WEEK_DAYS.length);
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % WEEK_DAYS.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    if (startX == null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) > 60) {
      deltaX < 0 ? handleNextDay() : handlePrevDay();
    }
    touchStartXRef.current = null;
  };

  const handleOpenMeal = (mealType: keyof DayMeals) => {
    setActiveMeal({
      bookId: mealPlan.id,
      day: currentDayKey,
      mealType,
    });
  };

  const handleModifyPlan = async () => {
    const trimmed = modification.trim();
    if (!trimmed) return;

    setSuccessMessage("");
    clearError();

    try {
      const result = await updatePlan(mealPlan, trimmed);
      onPlanUpdated(result.plan, result.list);
      setModification("");
      setShowModifyModal(false);
      setSuccessMessage("Plan updated successfully.");
    } catch {
      // Errors piped through global store
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col">
      {/* Header with back button */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          type="button"
          onClick={onCreateAnother}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-base shadow-btn"
        >
          <ArrowLeftIcon />
        </button>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest text-accent-base">
            Your New Menu
          </p>
          {successMessage && (
            <p className="text-[11px] text-success">{successMessage}</p>
          )}
        </div>
      </div>

      {/* Swipe indicator */}
      <div className="px-5">
        <SwipeIndicator
          total={WEEK_DAYS.length}
          activeIndex={currentDayIndex}
          onSelect={setCurrentDayIndex}
          onPrev={handlePrevDay}
          onNext={handleNextDay}
          labels={WEEK_DAYS.map((day) => startCaseDay(day))}
        />
      </div>

      {/* Daily card with swipe navigation */}
      <div
        className="flex-1 px-4 py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { touchStartXRef.current = null; }}
      >
        <DailyMenuCard
          day={currentDayLabel}
          dateLabel={dateLabel}
          meals={currentMeals}
          onOpenMeal={handleOpenMeal}
          onAddMeal={() => {}}
        />
      </div>

      {/* Error display */}
      {globalError && <p className="px-5 pb-4 text-center text-[12px] text-error">{globalError}</p>}

      {/* Dual action buttons */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-6 pt-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowModifyModal(true)}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card-base px-4 py-3.5 text-[14px] font-semibold text-text-primary transition-colors hover:bg-paper-muted disabled:opacity-50"
          >
            💬 Modify
          </button>
          <button
            type="button"
            onClick={onViewShopping}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-base px-4 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-base/90 disabled:opacity-50"
          >
            🛒 Shopping List
          </button>
        </div>
      </div>

      {/* Modify Plan Modal */}
      <Modal
        open={showModifyModal}
        title="Modify Your Plan"
        description="Describe what you'd like to change and we'll regenerate the week."
        onClose={() => setShowModifyModal(false)}
        className="max-w-md"
      >
        <div className="space-y-4">
          <Textarea
            value={modification}
            onChange={(event) => setModification(event.target.value.slice(0, 200))}
            placeholder="Example: Swap Friday dinner for a vegetarian option."
            maxLength={200}
            className="min-h-[120px]"
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-text-tertiary">{modification.length}/200</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowModifyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleModifyPlan} disabled={isGenerating || !modification.trim()}>
                {isGenerating ? "Updating..." : "Apply Changes"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
