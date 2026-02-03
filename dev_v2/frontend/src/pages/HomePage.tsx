import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useMenuExtrasStore } from "@/stores/useMenuExtrasStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/home/EmptyState";
import { MenuClosedCard } from "@/components/home/MenuClosedCard";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { AddMealModal } from "@/components/home/AddMealModal";
import { RecipeDetailSheet } from "@/components/home/RecipeDetailModal";
import { SwipeIndicator } from "@/components/home/SwipeIndicator";
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

  const [pendingDelete, setPendingDelete] = useState<MenuBook | null>(null);
  const [addMealDayKey, setAddMealDayKey] = useState<(typeof WEEK_DAYS)[number] | null>(null);
  const [activeDish, setActiveDish] = useState<{
    book: MenuBook;
    day: keyof MenuBook["mealPlan"]["days"];
    mealType: keyof DayMeals;
    recipe: Recipe;
    source: "base" | "extra";
  } | null>(null);

  const orderedBooks = useMemo(
    () => [...menuBooks].sort((a, b) => (a.mealPlan.createdAt < b.mealPlan.createdAt ? 1 : -1)),
    [menuBooks],
  );

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
    setCurrentWeekId(id);
    setCurrentDayIndex(0);
    setIsMenuPickerOpen(false);
  };

  const hasCurrentBook = Boolean(currentBook);
  const currentDayKey = hasCurrentBook ? WEEK_DAYS[currentDayIndex] : WEEK_DAYS[0];
  const currentMeals = hasCurrentBook ? currentBook.mealPlan.days[currentDayKey] : null;
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = hasCurrentBook
    ? getDayDisplay(currentBook.mealPlan.createdAt, currentDayIndex)
    : { dateLabel: "" };

  const handleOpenMeal = (mealType: keyof DayMeals, meal: Recipe) => {
    if (!currentBook) return;
    const source = (meal as Recipe & { source?: "base" | "extra" }).source === "extra" ? "extra" : "base";
    setActiveDish({
      book: currentBook,
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
    if (!currentBook) return;
    const existingMeal = currentBook.mealPlan.days[addMealDayKey][mealType];
    if (existingMeal) {
      addExtraMeal(currentBook.id, addMealDayKey, mealType, meal);
    } else {
      setDayMeal(currentBook.id, addMealDayKey, mealType, meal);
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
    if (!currentBook || !currentMeals) {
      return {
        breakfast: [] as Recipe[],
        lunch: [] as Recipe[],
        dinner: [] as Recipe[],
      };
    }
    const extraMealsForDay = extras[currentBook.id]?.[currentDayKey] ?? {};
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
  }, [currentBook, currentMeals, currentDayKey, extras]);

  // Menu Open view - current day card with swipe
  const openView = (
    <div className="space-y-4">
      {/* Swipe indicator */}
      <SwipeIndicator
        total={WEEK_DAYS.length}
        activeIndex={currentDayIndex}
        onSelect={setCurrentDayIndex}
        onPrev={handlePrevDay}
        onNext={handleNextDay}
        labels={WEEK_DAYS.map((day) => startCaseDay(day))}
      />

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
    <PageContainer className="pb-20">
      {currentBook ? openView : <EmptyState />}

      <Modal
        open={isMenuPickerOpen}
        onClose={() => setIsMenuPickerOpen(false)}
        className="max-w-xl"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary">All Menus</h2>
            <p className="mt-1 text-[12px] text-text-secondary">Select a week to view</p>
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
        <div className="mt-4 grid grid-cols-2 gap-3.5">
          {orderedBooks.map((book) => (
            <MenuClosedCard
              key={book.id}
              book={book}
              onSelect={handleSelectBook}
              onLongPress={handleRequestDelete}
              isActive={book.id === currentBook?.id}
              showCurrentWeekBadge={isCurrentCalendarWeek(book.mealPlan.createdAt)}
            />
          ))}
          <Link
            to="/create"
            onClick={() => setIsMenuPickerOpen(false)}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border-subtle bg-transparent transition hover:border-accent-base hover:bg-[rgba(139,148,105,0.03)]"
          >
            <span className="text-text-disabled">
              <PlusIcon />
            </span>
            <span className="text-[12px] font-medium text-text-secondary">New Menu</span>
          </Link>
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

      {currentBook && (
        <AddMealModal
          key={addMealDayKey ?? "closed"}
          open={addMealDayKey !== null}
          dayLabel={addMealDayKey ? startCaseDay(addMealDayKey) : ""}
          existingMeals={addMealDayKey ? currentBook.mealPlan.days[addMealDayKey] : currentBook.mealPlan.days[currentDayKey]}
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
