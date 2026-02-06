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
import type { Dish, Menu, MenuBook } from "@/types";
import { useMenuBook } from "@/hooks/useMenuBook";
import { useAppStore } from "@/stores/useAppStore";

interface StepPlanOverviewProps {
  menuBook: MenuBook;
  onMenuBookUpdated: (menuBook: MenuBook) => void;
  onViewShopping: () => void;
}

export function StepPlanOverview({ menuBook, onMenuBookUpdated, onViewShopping }: StepPlanOverviewProps) {
  const { updateMenu, generateList } = useMenuBook();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const globalError = useAppStore((state) => state.error);
  const clearError = useAppStore((state) => state.clearError);

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modification, setModification] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [addMealDayKey, setAddMealDayKey] = useState<(typeof WEEK_DAYS)[number] | null>(null);
  const [activeDish, setActiveDish] = useState<{
    day: keyof MenuBook["menus"];
    mealType: keyof Menu;
    dish: Dish;
  } | null>(null);

  const touchStartXRef = useRef<number | null>(null);

  const currentDayKey = WEEK_DAYS[currentDayIndex];
  const currentMenu = menuBook.menus[currentDayKey];
  const currentDayLabel = startCaseDay(currentDayKey);
  const { dateLabel } = getDayDisplay(menuBook.createdAt, currentDayIndex);

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
      if (deltaX < 0) {
        handleNextDay();
      } else {
        handlePrevDay();
      }
    }
    touchStartXRef.current = null;
  };

  const handleOpenDish = (mealType: keyof Menu, dish: Dish) => {
    setActiveDish({
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

  const handleSubmitAddMeal = ({
    mealType,
    dish,
  }: {
    mealType: keyof Menu;
    dish: Dish;
  }) => {
    const dayMenu = menuBook.menus[currentDayKey];
    const nextMenuBook: MenuBook = {
      ...menuBook,
      menus: {
        ...menuBook.menus,
        [currentDayKey]: {
          ...dayMenu,
          [mealType]: [dish, ...(dayMenu[mealType] ?? [])],
        },
      },
    };
    onMenuBookUpdated(nextMenuBook);
  };

  const handleModifyMenu = async () => {
    const trimmed = modification.trim();
    if (!trimmed) return;

    setSuccessMessage("");
    clearError();

    try {
      const updated = await updateMenu(menuBook, trimmed);
      const list = await generateList(updated);
      onMenuBookUpdated({ ...updated, shoppingList: list });
      setModification("");
      setShowModifyModal(false);
      setSuccessMessage("Menu updated successfully.");
    } catch {
      // Errors piped through global store
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-5 pb-4 pt-10">
        <p className="ui-label-soft text-accent-base">
          REVIEW
        </p>
        <p className="mt-1 ui-caption">{getWeekDateRange(menuBook.createdAt)}</p>
        {successMessage && (
          <p className="mt-1 ui-caption text-success">{successMessage}</p>
        )}
      </div>

      <div className="px-5">
        <WeekDateBar
          createdAt={menuBook.createdAt}
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
          menu={currentMenu}
          onOpenDish={handleOpenDish}
          onAddMeal={handleOpenAddMeal}
        />
      </div>

      {globalError && <p className="px-5 pb-4 text-center ui-caption text-error">{globalError}</p>}

      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-6 pt-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setShowModifyModal(true)}
            disabled={isGenerating}
          >
            Modify Menu
          </Button>
          <Button type="button" className="flex-1" onClick={onViewShopping} disabled={isGenerating}>
            Generate Shopping List
          </Button>
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
                  <h2 className="ui-heading">Modify Your Menu</h2>
                  <p className="mt-1 ui-caption">
                    Describe what you'd like to change and we'll regenerate the menu for the week.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="ui-stack">
                    <Textarea
                      value={modification}
                      onChange={(event) => setModification(event.target.value.slice(0, 200))}
                      placeholder="Example: Swap Friday dinner for a vegetarian option."
                      maxLength={200}
                      className="min-h-[120px]"
                      disabled={isGenerating}
                    />
                    <div className="flex items-center justify-between">
                      <p className="ui-caption-soft">{modification.length}/200</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowModifyModal(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleModifyMenu} disabled={isGenerating || !modification.trim()}>
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
        existingMenu={addMealDayKey ? menuBook.menus[addMealDayKey] : menuBook.menus[currentDayKey]}
        onClose={handleCloseAddMeal}
        onSubmit={handleSubmitAddMeal}
        defaultServings={menuBook.preferences.numPeople}
        defaultDifficulty={menuBook.preferences.difficulty}
      />

      {activeDish &&
        (() => {
          const container = document.getElementById("phone-screen");
          if (!container) return null;
          return createPortal(
            <RecipeDetailSheet
              key={`${menuBook.id}-${activeDish.dish.id}`}
              active={{
                book: menuBook,
                day: activeDish.day,
                mealType: activeDish.mealType,
                dish: activeDish.dish,
              }}
              onClose={() => setActiveDish(null)}
              onSaveNotes={(notes) => {
                const dayMenu = menuBook.menus[activeDish.day];
                const updatedMenuBook: MenuBook = {
                  ...menuBook,
                  menus: {
                    ...menuBook.menus,
                    [activeDish.day]: {
                      ...dayMenu,
                      [activeDish.mealType]: (dayMenu[activeDish.mealType] ?? []).map((dish) =>
                        dish.id === activeDish.dish.id ? { ...dish, notes } : dish,
                      ),
                    },
                  },
                };
                onMenuBookUpdated(updatedMenuBook);
                setActiveDish(null);
              }}
              onDelete={() => {
                const dayMenu = menuBook.menus[activeDish.day];
                const updatedMenuBook: MenuBook = {
                  ...menuBook,
                  menus: {
                    ...menuBook.menus,
                    [activeDish.day]: {
                      ...dayMenu,
                      [activeDish.mealType]: (dayMenu[activeDish.mealType] ?? []).filter(
                        (dish) => dish.id !== activeDish.dish.id,
                      ),
                    },
                  },
                };
                onMenuBookUpdated(updatedMenuBook);
                setActiveDish(null);
              }}
            />,
            container,
          );
        })()}
    </div>
  );
}
