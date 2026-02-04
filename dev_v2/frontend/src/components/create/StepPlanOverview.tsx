import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { WeekDateBar } from "@/components/home/WeekDateBar";
import { AddMealModal } from "@/components/home/AddMealModal";
import { RecipeDetailSheet } from "@/components/home/RecipeDetailModal";
import { WEEK_DAYS } from "@/utils/constants";
import { getDayDisplay, getWeekDateRange, startCaseDay } from "@/utils/helpers";
import type { MealPlan, ShoppingList, DayMeals, Recipe } from "@/types";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useAppStore } from "@/stores/useAppStore";
import { useMenuExtrasStore } from "@/stores/useMenuExtrasStore";

interface StepPlanOverviewProps {
  mealPlan: MealPlan;
  shoppingList: ShoppingList;
  onPlanUpdated: (plan: MealPlan, list: ShoppingList) => void;
  onViewShopping: () => void;
}

export function StepPlanOverview({
  mealPlan,
  shoppingList,
  onPlanUpdated,
  onViewShopping,
}: StepPlanOverviewProps) {
  const { updatePlan } = useMealPlan();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const globalError = useAppStore((state) => state.error);
  const clearError = useAppStore((state) => state.clearError);
  const extras = useMenuExtrasStore((state) => state.extras);
  const addExtraMeal = useMenuExtrasStore((state) => state.addExtraMeal);
  const updateExtraMealNotes = useMenuExtrasStore((state) => state.updateExtraMealNotes);
  const removeExtraMeal = useMenuExtrasStore((state) => state.removeExtraMeal);

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modification, setModification] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [addMealDayKey, setAddMealDayKey] = useState<(typeof WEEK_DAYS)[number] | null>(null);
  const [activeDish, setActiveDish] = useState<{
    day: keyof MealPlan["days"];
    mealType: keyof DayMeals;
    recipe: Recipe;
    source: "base" | "extra";
  } | null>(null);

  const touchStartXRef = useRef<number | null>(null);

  const currentDayKey = WEEK_DAYS[currentDayIndex];
  const extrasForDay = extras[mealPlan.id]?.[currentDayKey] ?? {};
  const currentMeals = {
    breakfast: mealPlan.days[currentDayKey].breakfast
      ? [
          { ...mealPlan.days[currentDayKey].breakfast, source: "base" as const },
          ...(extrasForDay.breakfast ?? []).map((recipe) => ({ ...recipe, source: "extra" as const })),
        ]
      : (extrasForDay.breakfast ?? null),
    lunch: mealPlan.days[currentDayKey].lunch
      ? [
          { ...mealPlan.days[currentDayKey].lunch, source: "base" as const },
          ...(extrasForDay.lunch ?? []).map((recipe) => ({ ...recipe, source: "extra" as const })),
        ]
      : (extrasForDay.lunch ?? null),
    dinner: mealPlan.days[currentDayKey].dinner
      ? [
          { ...mealPlan.days[currentDayKey].dinner, source: "base" as const },
          ...(extrasForDay.dinner ?? []).map((recipe) => ({ ...recipe, source: "extra" as const })),
        ]
      : (extrasForDay.dinner ?? null),
  } as DayMeals;
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

  const handleOpenMeal = (mealType: keyof DayMeals, meal: Recipe & { source?: "base" | "extra" }) => {
    setActiveDish({
      day: currentDayKey,
      mealType,
      recipe: meal,
      source: meal.source === "extra" ? "extra" : "base",
    });
  };

  const handleOpenAddMeal = () => {
    setAddMealDayKey(currentDayKey);
  };

  const handleCloseAddMeal = () => {
    setAddMealDayKey(null);
  };

  const handleSubmitAddMeal = ({
    mealType,
    meal,
  }: {
    mealType: keyof DayMeals;
    meal: NonNullable<DayMeals[keyof DayMeals]>;
  }) => {
    const base = mealPlan.days[currentDayKey][mealType];
    if (base) {
      addExtraMeal(mealPlan.id, currentDayKey, mealType, meal);
      return;
    }
    const updatedPlan: MealPlan = {
      ...mealPlan,
      days: {
        ...mealPlan.days,
        [currentDayKey]: {
          ...mealPlan.days[currentDayKey],
          [mealType]: meal,
        },
      },
    };
    onPlanUpdated(updatedPlan, shoppingList);
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
    <div className="flex flex-1 flex-col">
      <div className="px-5 pb-4 pt-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">
          REVIEW
        </p>
        <p className="mt-1 text-[11px] text-text-secondary">{getWeekDateRange(mealPlan.createdAt)}</p>
        {successMessage && (
          <p className="mt-1 text-[11px] text-success">{successMessage}</p>
        )}
      </div>

      <div className="px-5">
        <WeekDateBar
          createdAt={mealPlan.createdAt}
          activeIndex={currentDayIndex}
          onSelect={setCurrentDayIndex}
        />
      </div>

      <div
        className="flex-1 px-4 py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartXRef.current = null;
        }}
      >
        <DailyMenuCard
          day={currentDayLabel}
          dateLabel={dateLabel}
          meals={currentMeals}
          onOpenMeal={handleOpenMeal}
          onAddMeal={handleOpenAddMeal}
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
            className="flex flex-1 items-center justify-center rounded-xl border border-border-subtle bg-card-base px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-paper-muted disabled:opacity-50"
          >
            Modify
          </button>
          <button
            type="button"
            onClick={onViewShopping}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center rounded-xl bg-accent-base px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-base/90 disabled:opacity-50"
          >
            Generate Shopping List
          </button>
        </div>
      </div>

      {showModifyModal &&
        (() => {
          const container = document.getElementById("phone-screen");
          if (!container) return null;
          return createPortal(
            <div
              className="absolute inset-0 z-50 flex items-end justify-center bg-black/40"
              onPointerDown={(event) => {
                if (event.target !== event.currentTarget) return;
                setShowModifyModal(false);
              }}
            >
              <div
                className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-3xl bg-card-base"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <div className="border-b border-border-subtle px-5 py-4">
                  <h2 className="text-[16px] font-semibold text-text-primary">Modify Your Plan</h2>
                  <p className="mt-1 text-[12px] text-text-secondary">
                    Describe what you'd like to change and we'll regenerate the week.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
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
                          {isGenerating ? "Sending..." : "SEND TO AI"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            container,
          );
        })()}

      <AddMealModal
        key={addMealDayKey ?? "closed"}
        open={addMealDayKey !== null}
        dayLabel={addMealDayKey ? startCaseDay(addMealDayKey) : ""}
        existingMeals={addMealDayKey ? mealPlan.days[addMealDayKey] : mealPlan.days[currentDayKey]}
        onClose={handleCloseAddMeal}
        onSubmit={handleSubmitAddMeal}
        defaultServings={mealPlan.preferences.numPeople}
        defaultDifficulty={mealPlan.preferences.difficulty}
      />

      {activeDish &&
        (() => {
          const container = document.getElementById("phone-screen");
          if (!container) return null;
          return createPortal(
            <RecipeDetailSheet
              key={`${mealPlan.id}-${activeDish.recipe.id}`}
              active={{
                book: {
                  id: mealPlan.id,
                  mealPlan,
                  shoppingList,
                },
                day: activeDish.day,
                mealType: activeDish.mealType,
                recipe: activeDish.recipe,
              }}
              onClose={() => setActiveDish(null)}
              onSaveNotes={(notes) => {
                if (activeDish.source === "extra") {
                  updateExtraMealNotes(mealPlan.id, activeDish.day, activeDish.mealType, activeDish.recipe.id, notes);
                  setActiveDish(null);
                  return;
                }
                const updatedPlan: MealPlan = {
                  ...mealPlan,
                  days: {
                    ...mealPlan.days,
                    [activeDish.day]: {
                      ...mealPlan.days[activeDish.day],
                      [activeDish.mealType]: {
                        ...activeDish.recipe,
                        notes,
                      },
                    },
                  },
                };
                onPlanUpdated(updatedPlan, shoppingList);
                setActiveDish(null);
              }}
              onDelete={() => {
                if (activeDish.source === "extra") {
                  removeExtraMeal(mealPlan.id, activeDish.day, activeDish.mealType, activeDish.recipe.id);
                  setActiveDish(null);
                  return;
                }
                const updatedPlan: MealPlan = {
                  ...mealPlan,
                  days: {
                    ...mealPlan.days,
                    [activeDish.day]: {
                      ...mealPlan.days[activeDish.day],
                      [activeDish.mealType]: null,
                    },
                  },
                };
                onPlanUpdated(updatedPlan, shoppingList);
                setActiveDish(null);
              }}
            />,
            container,
          );
        })()}
    </div>
  );
}
