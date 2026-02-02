import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutGrid, Plus } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/home/EmptyState";
import { MenuBookCard } from "@/components/home/MenuBookCard";
import { MenuClosedCard } from "@/components/home/MenuClosedCard";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { SwipeIndicator } from "@/components/home/SwipeIndicator";
import { WEEK_DAYS } from "@/utils/constants";
import { getDayDisplay, getWeekDateRange, isCurrentCalendarWeek, startCaseDay } from "@/utils/helpers";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { MenuBook } from "@/types";

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
  const toggleMenuView = useAppStore((state) => state.toggleMenuView);

  const [pendingDelete, setPendingDelete] = useState<MenuBook | null>(null);

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
  const currentWeekRange = getWeekDateRange(currentBook.mealPlan.createdAt);

  const handleOpenMeal = (mealType: keyof typeof currentMeals) => {
    setActiveMeal({
      bookId: currentBook.id,
      day: currentDayKey,
      mealType,
    });
  };

  const closedView = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} aria-label="Back to menu open view">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[24px] font-semibold text-text-primary">My Menus</h1>
            <p className="text-[13px] text-text-secondary">Browse previous weeks or start a new plan.</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Menu
          </Link>
        </Button>
      </div>

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
          className="flex h-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border-subtle bg-paper-base p-6 text-center text-text-secondary transition hover:border-accent-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
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

      <p className="text-center text-[12px] text-text-tertiary">Long-press any menu to delete it.</p>
    </>
  );

  const openView = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">This Week</p>
          <h1 className="text-[26px] font-semibold text-text-primary">{currentWeekRange}</h1>
          <p className="text-[13px] text-text-secondary">Swipe through your meals or jump to another menu.</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMenuView}
          aria-label="View all menus"
          className="h-10 w-10 rounded-full"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Menu Books</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {orderedBooks.map((book) => (
            <MenuBookCard
              key={book.id}
              book={book}
              onSelect={handleSelectBook}
              isActive={book.id === currentBook.id}
              onLongPress={handleRequestDelete}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SwipeIndicator currentDay={currentDayLabel} onPrev={handlePrevDay} onNext={handleNextDay} />
        <DailyMenuCard day={currentDayLabel} dateLabel={dateLabel} meals={currentMeals} onOpenMeal={handleOpenMeal} />
      </section>
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
    </PageContainer>
  );
}
