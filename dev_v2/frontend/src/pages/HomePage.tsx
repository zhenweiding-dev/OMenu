import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/home/EmptyState";
import { MenuClosedCard } from "@/components/home/MenuClosedCard";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { AddMealModal } from "@/components/home/AddMealModal";
import { SwipeIndicator } from "@/components/home/SwipeIndicator";
import { WEEK_DAYS } from "@/utils/constants";
import { getDayDisplay, getWeekDateRange, isCurrentCalendarWeek, startCaseDay } from "@/utils/helpers";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { DayMeals, MenuBook } from "@/types";

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
  const setActiveMeal = useAppStore((state) => state.setActiveMeal);
  const deleteMenuBook = useAppStore((state) => state.deleteMenuBook);
  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useAppStore((state) => state.setIsMenuOpen);
  const setDayMeal = useAppStore((state) => state.setDayMeal);

  const [pendingDelete, setPendingDelete] = useState<MenuBook | null>(null);
  const [addMealDayKey, setAddMealDayKey] = useState<(typeof WEEK_DAYS)[number] | null>(null);

  const orderedBooks = useMemo(
    () => [...menuBooks].sort((a, b) => (a.mealPlan.createdAt < b.mealPlan.createdAt ? 1 : -1)),
    [menuBooks],
  );

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
    setIsMenuOpen(true);
  };

  if (!currentBook) {
    return (
      <PageContainer>
        <EmptyState />
      </PageContainer>
    );
  }

  const currentDayKey = WEEK_DAYS[currentDayIndex];
  const currentMeals = currentBook.mealPlan.days[currentDayKey];
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = getDayDisplay(currentBook.mealPlan.createdAt, currentDayIndex);

  const handleOpenMeal = (mealType: keyof typeof currentMeals) => {
    setActiveMeal({
      bookId: currentBook.id,
      day: currentDayKey,
      mealType,
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
    setDayMeal(currentBook.id, addMealDayKey, mealType, meal);
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

  // Menu Closed view - grid of all menu books
  const closedView = (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-3.5">
        {orderedBooks.map((book) => (
          <MenuClosedCard
            key={book.id}
            book={book}
            onSelect={handleSelectBook}
            onLongPress={handleRequestDelete}
            isActive={book.id === currentBook.id}
            showCurrentWeekBadge={isCurrentCalendarWeek(book.mealPlan.createdAt)}
          />
        ))}
        <Link
          to="/create"
          className="flex min-h-[160px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border-subtle bg-transparent transition hover:border-accent-base hover:bg-paper-muted/30"
        >
          <span className="text-text-disabled">
            <PlusIcon />
          </span>
          <span className="text-[12px] font-medium text-text-secondary">New Menu</span>
        </Link>
      </div>
    </div>
  );

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
          meals={currentMeals}
          onOpenMeal={handleOpenMeal}
          onAddMeal={handleOpenAddMeal}
        />
      </div>
    </div>
  );

  return (
    <PageContainer className="pb-20">
      {isMenuOpen ? openView : closedView}

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

      <AddMealModal
        key={addMealDayKey ?? "closed"}
        open={addMealDayKey !== null}
        dayLabel={addMealDayKey ? startCaseDay(addMealDayKey) : ""}
        existingMeals={addMealDayKey ? currentBook.mealPlan.days[addMealDayKey] : currentMeals}
        onClose={handleCloseAddMeal}
        onSubmit={handleSubmitAddMeal}
      />
    </PageContainer>
  );
}
