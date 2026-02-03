import { useEffect, useMemo, useRef, useState } from "react";
import { addWeeks, differenceInCalendarWeeks, startOfWeek } from "date-fns";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useMenuExtrasStore } from "@/stores/useMenuExtrasStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/home/EmptyState";
import { MenuClosedCard } from "@/components/home/MenuClosedCard";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { AddMealModal } from "@/components/home/AddMealModal";
import { RecipeDetailSheet } from "@/components/home/RecipeDetailModal";
import { WeekDateBar } from "@/components/home/WeekDateBar";
import { StepWelcome } from "@/components/create/StepWelcome";
import { WEEK_DAYS } from "@/utils/constants";
import { getDayDisplay, getWeekDateRange, isCurrentCalendarWeek, startCaseDay } from "@/utils/helpers";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { DayMeals, MenuBook, Recipe } from "@/types";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HomePage() {
  const menuBooks = useAppStore((state) => state.menuBooks);
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const setCurrentWeekId = useAppStore((state) => state.setCurrentWeekId);
  const currentDayIndex = useAppStore((state) => state.currentDayIndex);
  const setCurrentDayIndex = useAppStore((state) => state.setCurrentDayIndex);
  const deleteMenuBook = useAppStore((state) => state.deleteMenuBook);
  const setDayMeal = useAppStore((state) => state.setDayMeal);
  const clearDayMeal = useAppStore((state) => state.clearDayMeal);
  const updateMealNotes = useAppStore((state) => state.updateMealNotes);
  const isMenuPickerOpen = useAppStore((state) => state.isMenuPickerOpen);
  const setIsMenuPickerOpen = useAppStore((state) => state.setIsMenuPickerOpen);

  const extras = useMenuExtrasStore((state) => state.extras);
  const addExtraMeal = useMenuExtrasStore((state) => state.addExtraMeal);
  const updateExtraMealNotes = useMenuExtrasStore((state) => state.updateExtraMealNotes);
  const removeExtraMeal = useMenuExtrasStore((state) => state.removeExtraMeal);
  const resetDraft = useDraftStore((state) => state.resetDraft);
  const navigate = useNavigate();

  const [pendingDelete, setPendingDelete] = useState<MenuBook | null>(null);
  const [addMealDayKey, setAddMealDayKey] = useState<(typeof WEEK_DAYS)[number] | null>(null);
  const [activeDish, setActiveDish] = useState<{
    book: MenuBook;
    day: keyof MenuBook["mealPlan"]["days"];
    mealType: keyof DayMeals;
    recipe: Recipe;
    source: "base" | "extra";
  } | null>(null);

  const hasUserSelectedWeekRef = useRef(false);

  const orderedBooks = useMemo(
    () => [...menuBooks].sort((a, b) => (a.mealPlan.createdAt < b.mealPlan.createdAt ? -1 : 1)),
    [menuBooks],
  );

  const currentWeekBook = useMemo(
    () => menuBooks.find((book) => isCurrentCalendarWeek(book.mealPlan.createdAt)) ?? null,
    [menuBooks],
  );

  const menuPickerItems = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    if (orderedBooks.length === 0) {
      return [{ type: "placeholder" as const, weekStart: currentWeekStart }];
    }

    const getWeekStart = (isoDate: string) => startOfWeek(new Date(isoDate), { weekStartsOn: 1 });
    const items: Array<
      | { type: "book"; book: MenuBook }
      | { type: "placeholder"; weekStart: Date }
    > = [];

    orderedBooks.forEach((book, index) => {
      const bookWeekStart = getWeekStart(book.mealPlan.createdAt);
      items.push({ type: "book", book });

      const nextBook = orderedBooks[index + 1];
      if (nextBook) {
        const nextWeekStart = getWeekStart(nextBook.mealPlan.createdAt);
        const gap = differenceInCalendarWeeks(nextWeekStart, bookWeekStart, { weekStartsOn: 1 });
        if (gap > 1) {
          for (let step = 1; step < gap; step += 1) {
            const missingWeek = addWeeks(bookWeekStart, step);
            if (differenceInCalendarWeeks(missingWeek, currentWeekStart, { weekStartsOn: 1 }) >= 0) {
              items.push({ type: "placeholder", weekStart: missingWeek });
            }
          }
        }
      } else {
        const nextWeek = addWeeks(bookWeekStart, 1);
        items.push({ type: "placeholder", weekStart: nextWeek });
      }
    });

    return items;
  }, [orderedBooks]);

  useEffect(() => {
    if (!currentWeekBook) return;
    if (hasUserSelectedWeekRef.current) return;
    if (currentBook?.id === currentWeekBook.id) return;
    setCurrentWeekId(currentWeekBook.id);
  }, [currentBook?.id, currentWeekBook, setCurrentWeekId]);

  useEffect(() => {
    if (!currentWeekBook && !hasUserSelectedWeekRef.current) {
      setCurrentWeekId(null);
    }
  }, [currentWeekBook, setCurrentWeekId]);

  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK !== "true") return;
    if (!currentBook) return;
    const bookExtras = extras[currentBook.id];
    const hasExtras =
      bookExtras &&
      Object.values(bookExtras).some((day) => day && Object.values(day).some((items) => items && items.length > 0));
    if (hasExtras) return;

    const baseLunch = currentBook.mealPlan.days.monday.lunch ?? currentBook.mealPlan.days.monday.breakfast;
    if (!baseLunch) return;

    addExtraMeal(currentBook.id, "monday", "lunch", {
      ...baseLunch,
      id: `${baseLunch.id}-side`,
      name: "Citrus Side Salad",
      totalCalories: 180,
      estimatedTime: 10,
      servings: baseLunch.servings || 2,
    });
    addExtraMeal(currentBook.id, "wednesday", "dinner", {
      ...baseLunch,
      id: `${baseLunch.id}-soup`,
      name: "Herbed Veggie Soup",
      totalCalories: 220,
      estimatedTime: 20,
      servings: baseLunch.servings || 2,
    });
  }, [addExtraMeal, currentBook, extras]);

  const handleRequestDelete = (book: MenuBook) => {
    setPendingDelete(book);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteMenuBook(pendingDelete.id);
    const nextBook = useAppStore.getState().menuBooks[0];
    if (nextBook) {
      setCurrentWeekId(nextBook.id);
      setCurrentDayIndex(0);
    }
    setPendingDelete(null);
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const handlePrevDay = () => {
    setCurrentDayIndex((currentDayIndex + WEEK_DAYS.length - 1) % WEEK_DAYS.length);
  };

  const handleNextDay = () => {
    setCurrentDayIndex((currentDayIndex + 1) % WEEK_DAYS.length);
  };

  const touchStartXRef = useRef<number | null>(null);

  const handleSelectBook = (id: string) => {
    hasUserSelectedWeekRef.current = true;
    setCurrentWeekId(id);
    setCurrentDayIndex(0);
    setIsMenuPickerOpen(false);
  };

  const shouldShowWelcome = !currentWeekBook && !hasUserSelectedWeekRef.current;
  const activeBook = shouldShowWelcome ? null : currentBook ?? currentWeekBook;
  const hasCurrentBook = Boolean(activeBook);
  const currentDayKey = hasCurrentBook ? WEEK_DAYS[currentDayIndex] : WEEK_DAYS[0];
  const currentMeals = hasCurrentBook ? activeBook.mealPlan.days[currentDayKey] : null;
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = hasCurrentBook
    ? getDayDisplay(activeBook.mealPlan.createdAt, currentDayIndex)
    : { dateLabel: "" };

  const handleOpenMeal = (mealType: keyof DayMeals, meal: Recipe) => {
    if (!activeBook) return;
    const source = (meal as Recipe & { source?: "base" | "extra" }).source === "extra" ? "extra" : "base";
    setActiveDish({
      book: activeBook,
      day: currentDayKey,
      mealType,
      recipe: meal,
      source,
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
    if (!addMealDayKey) return;
    if (!activeBook) return;
    const existingMeal = activeBook.mealPlan.days[addMealDayKey][mealType];
    if (existingMeal) {
      addExtraMeal(activeBook.id, addMealDayKey, mealType, meal);
    } else {
      setDayMeal(activeBook.id, addMealDayKey, mealType, meal);
    }
    setAddMealDayKey(null);
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
      if (deltaX < 0) {
        handleNextDay();
      } else {
        handlePrevDay();
      }
    }
    touchStartXRef.current = null;
  };

  const currentMealEntries = useMemo(() => {
    if (!activeBook || !currentMeals) {
      return {
        breakfast: [] as Recipe[],
        lunch: [] as Recipe[],
        dinner: [] as Recipe[],
      };
    }
    const extraMealsForDay = extras[activeBook.id]?.[currentDayKey] ?? {};
    const buildEntries = (mealType: keyof DayMeals) => {
      const baseMeal = currentMeals[mealType];
      const extraMeals = extraMealsForDay[mealType] ?? [];
      const baseEntries = baseMeal ? [{ ...baseMeal, source: "base" as const }] : [];
      const extraEntries = extraMeals.map((meal) => ({ ...meal, source: "extra" as const }));
      return [...baseEntries, ...extraEntries];
    };
    return {
      breakfast: buildEntries("breakfast"),
      lunch: buildEntries("lunch"),
      dinner: buildEntries("dinner"),
    };
  }, [activeBook, currentMeals, currentDayKey, extras]);

  // Menu Open view - current day card with swipe
  const openView = (
    <div className="space-y-4">
      {activeBook && (
        <WeekDateBar
          createdAt={activeBook.mealPlan.createdAt}
          activeIndex={currentDayIndex}
          onSelect={setCurrentDayIndex}
        />
      )}

      {/* Daily card with swipe */}
      <div
        className="px-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartXRef.current = null;
        }}
      >
        <DailyMenuCard
          day={currentDayLabel}
          dateLabel={dateLabel}
          meals={currentMealEntries}
          onOpenMeal={handleOpenMeal}
          onAddMeal={handleOpenAddMeal}
        />
      </div>
    </div>
  );

  return (
    <PageContainer className={shouldShowWelcome ? "px-0 pt-0 pb-20" : "pb-20"}>
      {shouldShowWelcome ? (
        <StepWelcome
          onNext={() => {
            resetDraft();
            navigate("/create", { state: { startStep: 2, skipResume: true } });
          }}
        />
      ) : hasCurrentBook ? (
        openView
      ) : (
        <EmptyState />
      )}

      <Modal
        open={isMenuPickerOpen}
        onClose={() => setIsMenuPickerOpen(false)}
        className="max-w-xl"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">Menu Book</h2>
            <p className="mt-1 text-[12px] text-text-secondary">Long press a menu book to delete.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuPickerOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close menu picker"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {menuPickerItems.map((item) => {
            if (item.type === "book") {
              const { book } = item;
              return (
                <MenuClosedCard
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  onLongPress={handleRequestDelete}
                  isActive={book.id === activeBook?.id}
                  showCurrentWeekBadge={isCurrentCalendarWeek(book.mealPlan.createdAt)}
                />
              );
            }

            const weekRange = getWeekDateRange(item.weekStart.toISOString());
            return (
              <Link
                key={item.weekStart.toISOString()}
                to="/create"
                onClick={() => setIsMenuPickerOpen(false)}
                className="flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-border-subtle bg-transparent px-4 py-3 transition hover:border-accent-base hover:bg-[rgba(139,148,105,0.03)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-text-disabled">
                    <PlusIcon />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">Add Menu</p>
                    <p className="mt-1 text-[11px] text-text-secondary">{weekRange}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this menu book?"
        description={
          pendingDelete
            ? `This will remove the week of ${getWeekDateRange(pendingDelete.mealPlan.createdAt)} and its shopping list.`
            : undefined
        }
        onClose={handleCancelDelete}
        className="max-w-sm"
        showCloseButton={false}
      >
        <p className="text-sm text-text-secondary">This action cannot be undone.</p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-white hover:bg-error/90"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {activeBook && (
        <AddMealModal
          key={addMealDayKey ?? "closed"}
          open={addMealDayKey !== null}
          dayLabel={addMealDayKey ? startCaseDay(addMealDayKey) : ""}
          existingMeals={addMealDayKey ? activeBook.mealPlan.days[addMealDayKey] : activeBook.mealPlan.days[currentDayKey]}
          defaultServings={activeBook.mealPlan.preferences.numPeople}
          defaultDifficulty={activeBook.mealPlan.preferences.difficulty}
          onClose={handleCloseAddMeal}
          onSubmit={handleSubmitAddMeal}
        />
      )}

      {activeDish &&
        (() => {
          const container = document.getElementById("phone-screen");
          if (!container) return null;
          return createPortal(
            <RecipeDetailSheet
              key={`${activeDish.book.id}-${activeDish.recipe.id}`}
              active={{
                book: activeDish.book,
                day: activeDish.day,
                mealType: activeDish.mealType,
                recipe: activeDish.recipe,
              }}
              onClose={() => setActiveDish(null)}
              onSaveNotes={(notes) => {
                if (activeDish.source === "extra") {
                  updateExtraMealNotes(activeDish.book.id, activeDish.day, activeDish.mealType, activeDish.recipe.id, notes);
                } else {
                  updateMealNotes(activeDish.book.id, activeDish.day, activeDish.mealType, notes);
                }
              }}
              onDelete={() => {
                if (activeDish.source === "extra") {
                  removeExtraMeal(activeDish.book.id, activeDish.day, activeDish.mealType, activeDish.recipe.id);
                } else {
                  clearDayMeal(activeDish.book.id, activeDish.day, activeDish.mealType);
                }
                setActiveDish(null);
              }}
            />,
            container,
          );
        })()}
    </PageContainer>
  );
}
