import type { DayMeals } from "@/types";
import { Plus } from "lucide-react";

interface DailyMenuCardProps {
  day: string;
  dateLabel: string;
  meals: DayMeals;
  onOpenMeal: (mealType: keyof DayMeals) => void;
  onAddMeal: () => void;
}

const MEAL_META: Record<keyof DayMeals, { label: string; icon: string; bgColor: string }> = {
  breakfast: { label: "Breakfast", icon: "🌅", bgColor: "bg-meal-breakfast" },
  lunch: { label: "Lunch", icon: "☀️", bgColor: "bg-meal-lunch" },
  dinner: { label: "Dinner", icon: "🌙", bgColor: "bg-meal-dinner" },
};

function MealRow({
  mealType,
  meal,
  onOpen,
}: {
  mealType: keyof DayMeals;
  meal: DayMeals[keyof DayMeals];
  onOpen?: () => void;
}) {
  const meta = MEAL_META[mealType];

  // Empty slot
  if (!meal) {
    return (
      <div className="mx-4 my-2.5 flex items-center justify-center rounded-xl border border-dashed border-border-subtle bg-paper-base px-4 py-4">
        <span className="text-[13px] text-text-disabled">
          {meta.icon} No {meta.label.toLowerCase()} planned
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 border-b border-border-subtle px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-paper-muted/50"
    >
      {/* Icon wrapper */}
      <div className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl text-lg ${meta.bgColor}`}>
        {meta.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {meta.label}
        </p>
        <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-text-primary">
          {meal.name}
        </p>
        <p className="mt-1 text-[11px] text-text-secondary">
          {meal.estimatedTime > 0 ? `${meal.estimatedTime} min` : "—"} · {meal.servings || "—"} servings
        </p>
      </div>

      {/* Calories */}
      <span className="flex-shrink-0 text-[13px] font-semibold text-accent-base">
        {meal.totalCalories}
      </span>
    </button>
  );
}

export function DailyMenuCard({ day, dateLabel, meals, onOpenMeal, onAddMeal }: DailyMenuCardProps) {
  const scheduledMeals = [meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).length;
  const totalCalories = [meals.breakfast, meals.lunch, meals.dinner].reduce((sum, item) => {
    return sum + (item?.totalCalories ?? 0);
  }, 0);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-subtle bg-card-base shadow-card">
      {/* Card header */}
      <div className="relative border-b border-border-subtle bg-card-header px-5 py-5">
        <div className="pr-12">
          <p className="text-[24px] font-bold tracking-tight text-text-primary">{day}</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">{dateLabel}</p>
          <div className="mt-2.5 flex items-center gap-3.5 text-[12px] text-text-secondary">
            <span>🍽️ {scheduledMeals} {scheduledMeals === 1 ? "meal" : "meals"}</span>
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
        <MealRow mealType="breakfast" meal={meals.breakfast} onOpen={() => onOpenMeal("breakfast")} />
        <MealRow mealType="lunch" meal={meals.lunch} onOpen={() => onOpenMeal("lunch")} />
        <MealRow mealType="dinner" meal={meals.dinner} onOpen={() => onOpenMeal("dinner")} />
      </div>
    </div>
  );
}
