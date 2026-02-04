import { useMemo, useRef } from "react";
import { cn } from "@/utils/cn";
import { formatCurrency, getRelativeWeekLabel, getWeekDateRange } from "@/utils/helpers";
import { MENU_CLOSED_EMOJI_FALLBACK, MENU_CLOSED_SURFACES } from "@/utils/constants";
import type { IngredientCategory, MenuBook } from "@/types";

interface MenuClosedCardProps {
  book: MenuBook;
  onSelect: (id: string) => void;
  onLongPress?: (book: MenuBook) => void;
  isActive: boolean;
  showCurrentWeekBadge: boolean;
}

const CATEGORY_EMOJI: Record<IngredientCategory, string> = {
  proteins: "🥩",
  vegetables: "🥦",
  fruits: "🍓",
  grains: "🍞",
  dairy: "🧀",
  seasonings: "🧂",
  pantry_staples: "🥫",
  others: "🍽️",
};

function pickSurface(id: string) {
  const hash = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  return MENU_CLOSED_SURFACES[hash % MENU_CLOSED_SURFACES.length];
}

function collectIngredientCategories(book: MenuBook) {
  const categories = new Set<IngredientCategory>();
  Object.values(book.mealPlan.days).forEach((day) => {
    Object.values(day).forEach((meal) => {
      meal?.ingredients.forEach((ingredient) => {
        categories.add(ingredient.category);
      });
    });
  });
  return categories;
}

function buildEmojiCover(book: MenuBook) {
  const categories = collectIngredientCategories(book);

  const emojiPool = Array.from(categories)
    .map((category) => CATEGORY_EMOJI[category])
    .filter(Boolean);

  const source = emojiPool.length > 0 ? emojiPool : MENU_CLOSED_EMOJI_FALLBACK;
  const selection: string[] = [];
  for (let index = 0; index < 4; index += 1) {
    selection.push(source[index % source.length]);
  }
  return selection;
}

export function MenuClosedCard({ book, onSelect, onLongPress, isActive, showCurrentWeekBadge }: MenuClosedCardProps) {
  const surfaceClass = useMemo(() => pickSurface(book.id), [book.id]);
  const emojiCover = buildEmojiCover(book);
  const weekRange = getWeekDateRange(book.mealPlan.createdAt);
  const relativeLabel = getRelativeWeekLabel(book.mealPlan.createdAt);
  const budget = formatCurrency(book.mealPlan.preferences.budget);
  const baseMeals = Object.values(book.mealPlan.days).reduce((count, day) => {
    return count + [day.breakfast, day.lunch, day.dinner].filter(Boolean).length;
  }, 0);
  const extraMeals = book.extraMeals
    ? Object.values(book.extraMeals).reduce((count, day) => {
        return count + day.breakfast.length + day.lunch.length + day.dinner.length;
      }, 0)
    : 0;
  const totalMeals = baseMeals + extraMeals;

  const holdTimeoutRef = useRef<number | null>(null);
  const ignoreNextClickRef = useRef(false);

  const clearHoldTimer = () => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const handlePointerDown = () => {
    if (!onLongPress) return;
    clearHoldTimer();
    ignoreNextClickRef.current = false;
    holdTimeoutRef.current = window.setTimeout(() => {
      ignoreNextClickRef.current = true;
      onLongPress(book);
    }, 550);
  };

  const handlePointerUp = () => {
    if (!onLongPress) return;
    clearHoldTimer();
  };

  const handlePointerLeave = () => {
    if (!onLongPress) return;
    clearHoldTimer();
  };

  const handleClick = () => {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    onSelect(book.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className="group relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
      aria-pressed={isActive}
    >
      <div
        className={cn(
          "relative flex items-center gap-4 rounded-2xl border bg-paper-base px-4 py-3 text-text-primary shadow-soft transition-transform",
          "hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]",
          isActive ? "border-accent-base" : "border-accent-base/35",
        )}
      >
        {/* Emoji block */}
        <div
          className={cn(
            "grid h-12 w-12 flex-shrink-0 grid-cols-2 place-items-center rounded-xl border border-border-subtle text-[16px]",
            surfaceClass,
          )}
          aria-hidden
        >
          {emojiCover.map((emoji, index) => (
            <span key={`${emoji}-${index}`} className="leading-none">
              {emoji}
            </span>
          ))}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-text-primary">{weekRange}</p>
          <p className="mt-1 text-[11px] text-text-secondary">
            {totalMeals} dishes · {budget}
          </p>
        </div>

        {/* Tag */}
        {showCurrentWeekBadge && (
          <span className="rounded-full border border-accent-base/30 bg-accent-soft px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-accent-base">
            {relativeLabel}
          </span>
        )}
      </div>
    </button>
  );
}
