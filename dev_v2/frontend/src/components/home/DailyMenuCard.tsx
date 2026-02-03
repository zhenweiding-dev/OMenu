import type { DayMeals, Recipe } from "@/types";
import { Plus } from "lucide-react";

type MealInput = Recipe | Recipe[] | null;

type MealEntry = Recipe & { source?: "base" | "extra" };

interface DailyMenuCardProps {
  day: string;
  dateLabel: string;
  meals: Record<keyof DayMeals, MealInput>;
  onOpenMeal: (mealType: keyof DayMeals, meal: MealEntry) => void;
  onAddMeal: () => void;
}

const MEAL_META: Record<keyof DayMeals, { label: string; icon: string; bgColor: string }> = {
  breakfast: { label: "Breakfast", icon: "🌅", bgColor: "bg-meal-breakfast" },
  lunch: { label: "Lunch", icon: "☀️", bgColor: "bg-meal-lunch" },
  dinner: { label: "Dinner", icon: "🌙", bgColor: "bg-meal-dinner" },
};

function normalizeMeals(meal: MealInput): MealEntry[] {
  if (!meal) return [];
  return Array.isArray(meal) ? meal : [meal];
}

function MealRow({
  mealType,
  meals,
  onOpen,
}: {
  mealType: keyof DayMeals;
  meals: MealEntry[];
  onOpen?: (meal: MealEntry) => void;
}) {
  const meta = MEAL_META[mealType];

  // Empty slot
  if (meals.length === 0) {
    return (
      <div className="mx-4 my-2.5 flex items-center justify-center rounded-xl border border-dashed border-border-subtle bg-paper-base px-4 py-4">
        <span className="text-[13px] text-text-disabled">
          {meta.icon} No {meta.label.toLowerCase()} planned
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full items-start gap-3.5 border-b border-border-subtle px-5 py-3.5 text-left last:border-b-0">
      {/* Icon wrapper */}
      <div className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl text-lg ${meta.bgColor}`}>
        {meta.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-text-secondary">
          {meta.label}
        </p>
        <div className="mt-1 flex flex-wrap items-stretch gap-2">
          {meals.map((meal, index) => (
            <div key={meal.id ?? `${mealType}-${index}`} className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => onOpen?.(meal)}
                className="flex flex-col items-start text-left transition-colors hover:text-text-primary"
              >
                <span className="max-w-[180px] truncate text-[15px] font-semibold leading-tight text-text-primary">
                  {meal.name}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {meal.estimatedTime > 0 ? `${meal.estimatedTime} min` : "—"} · {meal.servings || "—"} servings · {meal.totalCalories} cal
                </span>
              </button>
              {index < meals.length - 1 && (
                <span className="mx-1 w-px self-stretch border-l border-dashed border-border-subtle" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DailyMenuCard({ day, dateLabel, meals, onOpenMeal, onAddMeal }: DailyMenuCardProps) {
  const normalizedMeals = {
    breakfast: normalizeMeals(meals.breakfast),
    lunch: normalizeMeals(meals.lunch),
    dinner: normalizeMeals(meals.dinner),
  };

  const totalDishes = normalizedMeals.breakfast.length + normalizedMeals.lunch.length + normalizedMeals.dinner.length;
  const totalCalories = [...normalizedMeals.breakfast, ...normalizedMeals.lunch, ...normalizedMeals.dinner].reduce((sum, item) => {
    return sum + (item?.totalCalories ?? 0);
  }, 0);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-subtle bg-card-base shadow-card">
      {/* Card header */}
      <div className="relative border-b border-border-subtle bg-card-header px-5 py-5">
        <div className="pr-12">
          <div className="flex items-end gap-2">
            <p className="text-[24px] font-bold tracking-[-0.02em] text-text-primary">{day}</p>
            <p className="text-[13px] text-text-secondary">{dateLabel}</p>
          </div>
          <div className="mt-2.5 flex items-center gap-3.5 text-[12px] text-text-secondary">
            <span>🍽️ {totalDishes} {totalDishes === 1 ? "dish" : "dishes"}</span>
            <span>🔥 {totalCalories.toLocaleString()} cal</span>
          </div>
        </div>

        {/* Add meal button */}
        <button
          type="button"
          onClick={onAddMeal}
          aria-label="Add meal"
          className="absolute right-4 top-4 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-border-tag bg-white transition-colors hover:border-accent-base"
        >
          <Plus className="h-[15px] w-[15px] text-text-disabled" strokeWidth={2} />
        </button>
      </div>

      {/* Meal items */}
      <div>
        <MealRow mealType="breakfast" meals={normalizedMeals.breakfast} onOpen={(meal) => onOpenMeal("breakfast", meal)} />
        <MealRow mealType="lunch" meals={normalizedMeals.lunch} onOpen={(meal) => onOpenMeal("lunch", meal)} />
        <MealRow mealType="dinner" meals={normalizedMeals.dinner} onOpen={(meal) => onOpenMeal("dinner", meal)} />
      </div>
    </div>
  );
}
