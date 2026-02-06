import { useRef } from "react";
import { getWeekDateRange } from "@/utils/helpers";
import type { MenuBook } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface MenuBookCardProps {
  book: MenuBook;
  onSelect: (id: string) => void;
  isActive: boolean;
  onLongPress?: (book: MenuBook) => void;
}

const LONG_PRESS_DURATION = 550;

export function MenuBookCard({ book, onSelect, isActive, onLongPress }: MenuBookCardProps) {
  const scheduledMeals = Object.values(book.menus).reduce((total, day) => {
    return (
      total +
      [day.breakfast, day.lunch, day.dinner].filter((items) => items.length > 0).length
    );
  }, 0);

  const weekRange = getWeekDateRange(book.createdAt);
  const shoppingCount = book.shoppingList.items.length;

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
    }, LONG_PRESS_DURATION);
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
      className="group w-full text-left transition-transform hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
      aria-pressed={isActive}
    >
      <Card
        className={
          isActive
            ? "border-accent-base shadow-card"
            : "border-border-subtle opacity-90 group-hover:shadow-soft"
        }
      >
        <CardHeader className="gap-1">
          <CardTitle>{weekRange}</CardTitle>
          <CardDescription className="flex items-center gap-2 ui-caption">
            <span>{scheduledMeals} meals</span>
            <span aria-hidden>•</span>
            <span>{shoppingCount} list items</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="ui-caption">
          Tap to open this menu book and view details.
        </CardContent>
      </Card>
    </button>
  );
}
