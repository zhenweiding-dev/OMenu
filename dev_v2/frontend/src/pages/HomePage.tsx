import { useEffect, useMemo, useRef, useState } from "react";
import { addWeeks, differenceInCalendarWeeks, startOfWeek } from "date-fns";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
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
import type { Dish, Menu, MenuBook } from "@/types";

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
  const removeDish = useAppStore((state) => state.removeDish);
  const updateDishNotes = useAppStore((state) => state.updateDishNotes);
  const isMenuPickerOpen = useAppStore((state) => state.isMenuPickerOpen);
  const setIsMenuPickerOpen = useAppStore((state) => state.setIsMenuPickerOpen);

  const addDish = useAppStore((state) => state.addDish);
  const resetDraftProgress = useDraftStore((state) => state.resetDraftProgress);
  const navigate = useNavigate();

  const [pendingDelete, setPendingDelete] = useState<MenuBook | null>(null);
  const [addMealDayKey, setAddMealDayKey] = useState<(typeof WEEK_DAYS)[number] | null>(null);
  const [activeDish, setActiveDish] = useState<{
    book: MenuBook;
    day: keyof MenuBook["menus"];
    mealType: keyof Menu;
    dish: Dish;
  } | null>(null);

  const hasUserSelectedWeekRef = useRef(false);

  const orderedBooks = useMemo(
    () => [...menuBooks].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
    [menuBooks],
  );

  const currentWeekBook = useMemo(
    () => menuBooks.find((book) => isCurrentCalendarWeek(book.createdAt)) ?? null,
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
      const bookWeekStart = getWeekStart(book.createdAt);
      items.push({ type: "book", book });

      const nextBook = orderedBooks[index + 1];
      if (nextBook) {
        const nextWeekStart = getWeekStart(nextBook.createdAt);
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
    const hasManualDishes = Object.values(currentBook.menus).some((day) =>
      Object.values(day).some((items) => items.some((dish) => dish.source === "manual")),
    );
    if (hasManualDishes) return;

    const baseLunch = currentBook.menus.monday.lunch[0] ?? currentBook.menus.monday.breakfast[0];
    if (!baseLunch) return;

    addDish(currentBook.id, "monday", "lunch", {
      ...baseLunch,
      id: `${baseLunch.id}-side`,
      name: "Citrus Side Salad",
      totalCalories: 180,
      estimatedTime: 10,
      servings: baseLunch.servings || 2,
      source: "manual",
    });
    addDish(currentBook.id, "wednesday", "dinner", {
      ...baseLunch,
      id: `${baseLunch.id}-soup`,
      name: "Herbed Veggie Soup",
      totalCalories: 220,
      estimatedTime: 20,
      servings: baseLunch.servings || 2,
      source: "manual",
    });
  }, [addDish, currentBook]);

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
  const currentMeals = hasCurrentBook ? activeBook.menus[currentDayKey] : null;
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = hasCurrentBook
    ? getDayDisplay(activeBook.createdAt, currentDayIndex)
    : { dateLabel: "" };

  const handleOpenDish = (mealType: keyof Menu, dish: Dish) => {
    if (!activeBook) return;
    setActiveDish({
      book: activeBook,
      day: currentDayKey,
      mealType,
      dish,
    });
  };

  const handleOpenAddMeal = () => {
    setAddMealDayKey(currentDayKey);
  };

  const handleCloseAddMeal = () => {
    setAddMealDayKey(null);
  };

  const handleSubmitAddMeal = ({ mealType, dish }: { mealType: keyof Menu; dish: Dish }) => {
    if (!addMealDayKey) return;
    if (!activeBook) return;
    addDish(activeBook.id, addMealDayKey, mealType, dish);
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

  // Menu Open view - current day card with swipe
  const openView = (
    <div className="space-y-4">
      {activeBook && (
        <WeekDateBar
          createdAt={activeBook.createdAt}
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
          menu={currentMeals ?? { breakfast: [], lunch: [], dinner: [] }}
          onOpenDish={handleOpenDish}
          onAddMeal={handleOpenAddMeal}
        />
      </div>
    </div>
  );

  return (
    <PageContainer
      className={
        shouldShowWelcome
          ? "px-0 pt-0 pb-0 flex flex-col"
          : "pb-4"
      }
    >
      {shouldShowWelcome ? (
        <StepWelcome
          label="WELCOME"
          inline
          onNext={() => {
            resetDraftProgress();
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuPickerOpen(false)}
            className="h-9 w-9 rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close menu picker"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
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
                  showCurrentWeekBadge={isCurrentCalendarWeek(book.createdAt)}
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
            ? `This will remove the week of ${getWeekDateRange(pendingDelete.createdAt)} and its shopping list.`
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
          existingMenu={addMealDayKey ? activeBook.menus[addMealDayKey] : activeBook.menus[currentDayKey]}
          defaultServings={activeBook.preferences.numPeople}
          defaultDifficulty={activeBook.preferences.difficulty}
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
              key={`${activeDish.book.id}-${activeDish.dish.id}`}
              active={{
                book: activeDish.book,
                day: activeDish.day,
                mealType: activeDish.mealType,
                dish: activeDish.dish,
              }}
              onClose={() => setActiveDish(null)}
              onSaveNotes={(notes) => {
                updateDishNotes(activeDish.book.id, activeDish.day, activeDish.mealType, activeDish.dish.id, notes);
              }}
              onDelete={() => {
                removeDish(activeDish.book.id, activeDish.day, activeDish.mealType, activeDish.dish.id);
                setActiveDish(null);
              }}
            />,
            container,
          );
        })()}
    </PageContainer>
  );
}
