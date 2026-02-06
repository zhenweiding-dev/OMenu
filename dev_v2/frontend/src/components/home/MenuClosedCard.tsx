import { useMemo, useRef } from "react";
import { cn } from "@/utils/cn";
import { formatCurrency, getWeekDateRange } from "@/utils/helpers";
import { INGREDIENT_CATEGORY_DETAILS, MENU_CLOSED_ICON_FALLBACK, MENU_CLOSED_SURFACES } from "@/utils/constants";
import type { IngredientCategory, MenuBook } from "@/types";

interface MenuClosedCardProps {
  book: MenuBook;
  onSelect: (id: string) => void;
  onLongPress?: (book: MenuBook) => void;
  isActive: boolean;
  badgeLabel?: string;
}

function pickSurface(id: string) {
  const hash = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  return MENU_CLOSED_SURFACES[hash % MENU_CLOSED_SURFACES.length];
}

function collectIngredientCategories(book: MenuBook) {
  const categories = new Set<IngredientCategory>();
  Object.values(book.menus).forEach((day) => {
    Object.values(day).forEach((meal) => {
      meal.forEach((dish) => {
        dish.ingredients.forEach((ingredient) => {
          categories.add(ingredient.category);
        });
      });
    });
  });
  return categories;
}

function buildIconCover(book: MenuBook) {
  const categories = collectIngredientCategories(book);

  const iconPool = Array.from(categories)
    .map((category) => INGREDIENT_CATEGORY_DETAILS[category]?.icon)
    .filter(Boolean);

  const selection: Array<(typeof MENU_CLOSED_ICON_FALLBACK)[number]> = [];
  const seen = new Set<(typeof MENU_CLOSED_ICON_FALLBACK)[number]>();

  const pushUnique = (Icon?: (typeof MENU_CLOSED_ICON_FALLBACK)[number]) => {
    if (!Icon || seen.has(Icon)) return;
    seen.add(Icon);
    selection.push(Icon);
  };

  iconPool.forEach((Icon) => pushUnique(Icon));
  MENU_CLOSED_ICON_FALLBACK.forEach((Icon) => pushUnique(Icon));

  return selection.slice(0, 4);
}

export function MenuClosedCard({ book, onSelect, onLongPress, isActive, badgeLabel }: MenuClosedCardProps) {
  const surfaceClass = useMemo(() => pickSurface(book.id), [book.id]);
  const iconCover = buildIconCover(book);
  const weekRange = getWeekDateRange(book.createdAt);
  const budget = formatCurrency(book.preferences.budget);
  const totalDishes = Object.values(book.menus).reduce((count, day) => {
    return count + day.breakfast.length + day.lunch.length + day.dinner.length;
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
      className="group relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
      aria-pressed={isActive}
    >
      <div
        className={cn(
          "relative flex items-center gap-4 rounded-2xl border px-4 py-3 shadow-soft transition-colors",
          "hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]",
          isActive
            ? "border-accent-base bg-paper-muted/70 text-text-primary shadow-card"
            : "border-border-subtle/70 bg-paper-base/60 text-text-secondary",
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
          {iconCover.map((Icon, index) => (
            <Icon key={`${Icon.displayName ?? "icon"}-${index}`} className="h-4 w-4 text-text-secondary/80 ui-icon" />
          ))}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="ui-body-strong">{weekRange}</p>
          <p className="mt-1 ui-caption">
            {totalDishes} dishes · {budget}
          </p>
        </div>

        {/* Tag */}
        {badgeLabel && (
          <span className="rounded-full border border-accent-base/30 bg-accent-soft px-2.5 py-1 ui-label-soft text-accent-base">
            {badgeLabel}
          </span>
        )}
      </div>
    </button>
  );
}
