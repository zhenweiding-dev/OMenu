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
  for (let index = 0; index < 6; index += 1) {
    selection.push(source[index % source.length]);
  }
  return selection.join(" ");
}

export function MenuClosedCard({ book, onSelect, onLongPress, isActive, showCurrentWeekBadge }: MenuClosedCardProps) {
  const surfaceClass = useMemo(() => pickSurface(book.id), [book.id]);
  const emojiCover = buildEmojiCover(book);
  const weekRange = getWeekDateRange(book.mealPlan.createdAt);
  const relativeLabel = getRelativeWeekLabel(book.mealPlan.createdAt);
  const budget = formatCurrency(book.mealPlan.preferences.budget);
  const totalMeals = Object.values(book.mealPlan.days).reduce((count, day) => {
    return count + [day.breakfast, day.lunch, day.dinner].filter(Boolean).length;
  }, 0);

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
      className="group relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base aspect-[3/4] sm:aspect-[4/5]"
      aria-pressed={isActive}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-subtle bg-card-base p-5 text-text-primary shadow-soft transition-transform",
          "hover:-translate-y-[2px]",
          isActive ? "ring-2 ring-accent-base/60 ring-offset-2 ring-offset-paper-base" : "ring-0",
        )}
      >
        {showCurrentWeekBadge && (
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-primary">
            {relativeLabel}
          </span>
        )}

        <div
          className={cn(
            "mt-4 flex flex-1 items-center justify-center rounded-2xl border border-border-subtle/60 text-center text-3xl leading-relaxed",
            surfaceClass,
          )}
          aria-hidden
        >
          {emojiCover}
        </div>

        <div className="mt-4 space-y-1 rounded-2xl border border-border-subtle/80 bg-white/90 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{weekRange}</p>
          <p className="text-[13px] text-text-primary">
            {totalMeals} meals • {budget}
          </p>
        </div>
      </div>
    </button>
  );
}
