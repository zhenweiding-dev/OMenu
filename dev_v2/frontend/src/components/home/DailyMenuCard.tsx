import type { Dish, Menu } from "@/types";
import { ChevronRight, Flame, Moon, Plus, Sunrise, Sun, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyMenuCardProps {
  day: string;
  dateLabel: string;
  menu: Menu;
  onOpenDish: (mealType: keyof Menu, dish: Dish) => void;
  onAddMeal: () => void;
}

const MEAL_META: Record<keyof Menu, { label: string; Icon: LucideIcon; bgColor: string }> = {
  breakfast: { label: "Breakfast", Icon: Sunrise, bgColor: "bg-meal-breakfast" },
  lunch: { label: "Lunch", Icon: Sun, bgColor: "bg-meal-lunch" },
  dinner: { label: "Dinner", Icon: Moon, bgColor: "bg-meal-dinner" },
};

function sortDishes(dishes: Dish[]) {
  return [...dishes].sort((a, b) => {
    if (a.source === b.source) return 0;
    return a.source === "manual" ? -1 : 1;
  });
}

function MealRow({
  mealType,
  dishes,
  onOpen,
}: {
  mealType: keyof Menu;
  dishes: Dish[];
  onOpen?: (dish: Dish) => void;
}) {
  const meta = MEAL_META[mealType];
  const ordered = sortDishes(dishes);
  const totalCalories = ordered.reduce((sum, item) => sum + (item?.totalCalories ?? 0), 0);
  const hasDishes = ordered.length > 0;
  const Icon = meta.Icon;

  return (
    <div className="flex w-full items-start gap-3.5 border-b border-border-subtle px-5 py-3.5 text-left last:border-b-0">
      <div className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl ${meta.bgColor}`}>
        <Icon className="h-5 w-5 text-text-primary/80 ui-icon" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="ui-label-soft text-text-secondary">
            {meta.label}
          </p>
          <span className="ui-caption-soft">
            {ordered.length} {ordered.length === 1 ? "dish" : "dishes"} · {totalCalories.toLocaleString()} cal
          </span>
        </div>
        <div className="mt-2 space-y-2">
          {hasDishes ? (
            ordered.map((dish, index) => (
              <div key={dish.id ?? `${mealType}-${index}`} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => onOpen?.(dish)}
                  className="group flex w-full items-center justify-between gap-3 text-left transition-colors hover:text-text-primary"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block max-w-[220px] truncate ui-heading-sm leading-tight">
                      {dish.name}
                    </span>
                    <span className="ui-caption">
                      {dish.estimatedTime > 0 ? `${dish.estimatedTime} min` : "—"} · {dish.servings || "—"} servings · {dish.totalCalories} cal
                    </span>
                  </div>
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-text-tertiary opacity-60 transition-opacity group-hover:opacity-100" />
                </button>
                {index < ordered.length - 1 && (
                  <span className="mt-2 h-px w-full border-t border-dashed border-border-subtle" aria-hidden />
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border-subtle bg-paper-base/70 px-3 py-2 ui-caption-soft">
              No planned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DailyMenuCard({ day, dateLabel, menu, onOpenDish, onAddMeal }: DailyMenuCardProps) {
  const totalDishes = menu.breakfast.length + menu.lunch.length + menu.dinner.length;
  const totalCalories = [...menu.breakfast, ...menu.lunch, ...menu.dinner].reduce((sum, item) => {
    return sum + (item?.totalCalories ?? 0);
  }, 0);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-subtle bg-card-base shadow-card">
      <div className="relative border-b border-border-subtle bg-card-header px-5 py-5">
        <div className="pr-12">
          <div className="flex items-end gap-2">
            <p className="ui-title-lg tracking-[-0.02em]">{day}</p>
            <p className="ui-body">{dateLabel}</p>
          </div>
          <div className="mt-2.5 flex items-center gap-3.5 ui-caption">
            <span className="inline-flex items-center gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5 ui-icon" aria-hidden />
              {totalDishes} {totalDishes === 1 ? "dish" : "dishes"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 ui-icon" aria-hidden />
              {totalCalories.toLocaleString()} cal
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddMeal}
          aria-label="Add meal"
          className="absolute right-4 top-4 h-9 w-9 rounded-xl border-dashed border-border-tag bg-white text-text-tertiary hover:border-accent-base"
        >
          <Plus className="h-[15px] w-[15px] text-text-disabled ui-icon-strong" />
        </Button>
      </div>

      <div>
        <MealRow mealType="breakfast" dishes={menu.breakfast} onOpen={(dish) => onOpenDish("breakfast", dish)} />
        <MealRow mealType="lunch" dishes={menu.lunch} onOpen={(dish) => onOpenDish("lunch", dish)} />
        <MealRow mealType="dinner" dishes={menu.dinner} onOpen={(dish) => onOpenDish("dinner", dish)} />
      </div>
    </div>
  );
}
