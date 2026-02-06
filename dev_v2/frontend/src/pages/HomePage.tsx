import { useEffect, useMemo, useRef, useState } from "react";
import { addWeeks, startOfWeek } from "date-fns";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat, Salad, Soup } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/home/EmptyState";
import { MenuClosedCard } from "@/components/home/MenuClosedCard";
import { DailyMenuCard } from "@/components/home/DailyMenuCard";
import { AddMealModal } from "@/components/home/AddMealModal";
import { RecipeDetailSheet } from "@/components/home/RecipeDetailModal";
import { WeekDateBar } from "@/components/home/WeekDateBar";
import { WEEK_DAYS } from "@/utils/constants";
import { getDayDisplay, getWeekDateRange, startCaseDay } from "@/utils/helpers";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Dish, Menu, MenuBook } from "@/types";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
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

  const [hasUserSelectedWeek, setHasUserSelectedWeek] = useState(false);

  const currentWeekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const nextWeekStart = useMemo(() => addWeeks(currentWeekStart, 1), [currentWeekStart]);

  const orderedBooks = useMemo(
    () =>
      [...menuBooks].sort(
        (a, b) =>
          startOfWeek(new Date(a.createdAt), { weekStartsOn: 1 }).getTime() -
          startOfWeek(new Date(b.createdAt), { weekStartsOn: 1 }).getTime(),
      ),
    [menuBooks],
  );

  const booksByWeekStart = useMemo(() => {
    const map = new Map<number, MenuBook>();
    orderedBooks.forEach((book) => {
      const key = startOfWeek(new Date(book.createdAt), { weekStartsOn: 1 }).getTime();
      if (!map.has(key)) {
        map.set(key, book);
      }
    });
    return map;
  }, [orderedBooks]);

  const currentWeekBook = useMemo(
    () => booksByWeekStart.get(currentWeekStart.getTime()) ?? null,
    [booksByWeekStart, currentWeekStart],
  );

  const nextWeekBook = useMemo(
    () => booksByWeekStart.get(nextWeekStart.getTime()) ?? null,
    [booksByWeekStart, nextWeekStart],
  );

  const menuPickerItems = useMemo(() => {
    const items: Array<
      | { type: "book"; book: MenuBook }
      | { type: "placeholder"; weekStart: Date }
    > = [];

    const pastBooks = orderedBooks.filter(
      (book) =>
        startOfWeek(new Date(book.createdAt), { weekStartsOn: 1 }).getTime() <
        currentWeekStart.getTime(),
    );
    pastBooks.forEach((book) => items.push({ type: "book", book }));

    const futureBooks = orderedBooks.filter(
      (book) =>
        startOfWeek(new Date(book.createdAt), { weekStartsOn: 1 }).getTime() >=
        currentWeekStart.getTime(),
    );
    const futureWeekStarts = futureBooks
      .map((book) => startOfWeek(new Date(book.createdAt), { weekStartsOn: 1 }))
      .sort((a, b) => a.getTime() - b.getTime());
    const lastFutureWeekStart = futureWeekStarts[futureWeekStarts.length - 1] ?? null;
    const endWeek = lastFutureWeekStart
      ? addWeeks(lastFutureWeekStart, 1)
      : nextWeekStart;

    let cursor = currentWeekStart;
    while (cursor.getTime() <= endWeek.getTime()) {
      const key = cursor.getTime();
      const book = booksByWeekStart.get(key);
      if (book) {
        items.push({ type: "book", book });
      } else {
        items.push({ type: "placeholder", weekStart: cursor });
      }
      cursor = addWeeks(cursor, 1);
    }

    return items;
  }, [booksByWeekStart, currentWeekStart, nextWeekStart, orderedBooks]);

  const getWeekBadgeLabel = (weekStart: Date) => {
    if (weekStart.getTime() === currentWeekStart.getTime()) return "THIS WEEK";
    if (weekStart.getTime() === nextWeekStart.getTime()) return "NEXT WEEK";
    return undefined;
  };

  useEffect(() => {
    if (!currentWeekBook) return;
    if (hasUserSelectedWeek) return;
    if (currentBook?.id === currentWeekBook.id) return;
    setCurrentWeekId(currentWeekBook.id);
  }, [currentBook?.id, currentWeekBook, hasUserSelectedWeek, setCurrentWeekId]);

  useEffect(() => {
    if (!currentWeekBook && !currentBook && !hasUserSelectedWeek) {
      setCurrentWeekId(null);
    }
  }, [currentBook, currentWeekBook, hasUserSelectedWeek, setCurrentWeekId]);


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
    setHasUserSelectedWeek(true);
    setCurrentWeekId(id);
    setCurrentDayIndex(0);
    setIsMenuPickerOpen(false);
  };

  const handlePlanWeek = (weekStart: Date) => {
    resetDraftProgress();
    navigate("/create", { state: { startStep: 2, skipResume: true, weekStart: weekStart.toISOString() } });
  };

  const handleViewNextWeek = () => {
    if (!nextWeekBook) return;
    setHasUserSelectedWeek(true);
    setCurrentWeekId(nextWeekBook.id);
    setCurrentDayIndex(0);
  };

  const shouldShowWelcome = !currentWeekBook && !currentBook && !hasUserSelectedWeek;
  const activeBook = shouldShowWelcome ? null : currentBook ?? currentWeekBook;
  const hasCurrentBook = Boolean(activeBook);
  const currentDayKey = hasCurrentBook ? WEEK_DAYS[currentDayIndex] : WEEK_DAYS[0];
  const currentMeals = activeBook ? activeBook.menus[currentDayKey] : null;
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = activeBook
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

  const welcomeView = (
    <div className="flex flex-1 flex-col px-5 pt-4 pb-4 text-center">
      <div className="flex-1" />
      <div className="flex flex-col items-center">
        <div className="mb-8 flex h-[200px] w-[200px] items-center justify-center rounded-full bg-gradient-to-br from-paper-muted to-border-subtle animate-float">
          <div className="flex items-center gap-4 text-accent-base/80" aria-hidden>
            <ChefHat className="h-9 w-9 ui-icon-strong" />
            <Salad className="h-9 w-9 ui-icon-strong" />
            <Soup className="h-9 w-9 ui-icon-strong" />
          </div>
        </div>
        <h1 className="mb-4 ui-title-lg">
          Let&apos;s design a menu together!
        </h1>
        <p className="mb-6 ui-subtitle">
          Tell us your preferences and let magic happen.
        </p>
        <div className="flex w-full max-w-[260px] flex-col gap-3">
          <Button
            onClick={() => {
              if (nextWeekBook) {
                handleViewNextWeek();
              } else {
                handlePlanWeek(currentWeekStart);
              }
            }}
            size="lg"
            className="w-full"
          >
            {nextWeekBook ? "View next week" : "Plan this week"}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              nextWeekBook
                ? handlePlanWeek(currentWeekStart)
                : handlePlanWeek(nextWeekStart)
            }
            size="lg"
            className="w-full"
          >
            {nextWeekBook ? "Plan this week" : "Plan next week"}
          </Button>
        </div>
        {nextWeekBook && (
          <p className="mt-3 ui-caption-soft">
            Next week already has a menu.
          </p>
        )}
      </div>
      <div className="flex-1" />
    </div>
  );

  return (
    <PageContainer
      className={
        shouldShowWelcome
          ? "px-0 pt-0 pb-0 flex min-h-[calc(100%-var(--header-height,0px))] flex-col"
          : "pb-4"
      }
    >
      {shouldShowWelcome ? (
        welcomeView
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
          <div className="space-y-1">
            <h2 className="ui-heading">Menu Book</h2>
            <p className="ui-caption">Long press a menu book to delete.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuPickerOpen(false)}
            className="h-9 w-9 rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close menu picker"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {menuPickerItems.map((item) => {
            if (item.type === "book") {
              const { book } = item;
              const bookWeekStart = startOfWeek(new Date(book.createdAt), { weekStartsOn: 1 });
              const badgeLabel = getWeekBadgeLabel(bookWeekStart);
              return (
                <MenuClosedCard
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  onLongPress={handleRequestDelete}
                  isActive={book.id === activeBook?.id}
                  badgeLabel={badgeLabel}
                />
              );
            }

            const weekRange = getWeekDateRange(item.weekStart.toISOString());
            const badgeLabel = getWeekBadgeLabel(item.weekStart);
            return (
              <Link
                key={item.weekStart.toISOString()}
                to="/create"
                state={{ startStep: 2, skipResume: true, weekStart: item.weekStart.toISOString() }}
                onClick={() => setIsMenuPickerOpen(false)}
                className="flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-border-subtle bg-transparent px-4 py-3 transition hover:border-accent-base hover:bg-[rgba(139,148,105,0.03)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-text-disabled">
                    <PlusIcon />
                  </span>
                  <div>
                    <p className="ui-body-strong">Add Menu</p>
                    <p className="ui-caption">{weekRange}</p>
                  </div>
                </div>
                {badgeLabel && (
                  <span className="rounded-full border border-accent-base/30 bg-accent-soft px-2.5 py-1 ui-label-soft text-accent-base">
                    {badgeLabel}
                  </span>
                )}
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
        <p className="ui-caption">This action cannot be undone.</p>
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
