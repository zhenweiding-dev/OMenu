import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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

  const closedView = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border-subtle bg-paper-base p-6 text-center transition hover:border-accent-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base aspect-[3/4] sm:aspect-[4/5]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-muted text-accent-base">
            <Plus className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">New Menu</p>
            <p className="text-xs text-text-secondary">Start a fresh meal plan.</p>
          </div>
        </Link>
      </div>

      <p className="text-center text-[11px] uppercase tracking-[0.24em] text-text-tertiary">Long-press a menu to delete</p>
    </div>
  );

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

  const openView = (
    <>
      <div className="flex flex-col items-center gap-6">
        <SwipeIndicator
          total={WEEK_DAYS.length}
          activeIndex={currentDayIndex}
          onSelect={setCurrentDayIndex}
          onPrev={handlePrevDay}
          onNext={handleNextDay}
          labels={WEEK_DAYS.map((day) => startCaseDay(day))}
        />

        <div className="flex w-full items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrevDay}
            aria-label="Previous day"
            className="h-10 w-10 rounded-full border border-border-subtle text-text-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div
            className="flex-1"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => {
              touchStartXRef.current = null;
            }}
          >
            <div className="mx-auto w-full min-w-[260px] max-w-[560px] sm:min-w-[320px]">
              <DailyMenuCard
                day={currentDayLabel}
                dateLabel={dateLabel}
                meals={currentMeals}
                onOpenMeal={handleOpenMeal}
                onAddMeal={handleOpenAddMeal}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            aria-label="Next day"
            className="h-10 w-10 rounded-full border border-border-subtle text-text-secondary"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <PageContainer className="space-y-8">
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
            className="bg-accent-orange hover:bg-accent-orangeLight text-white"
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
