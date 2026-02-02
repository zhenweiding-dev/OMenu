import type { DayMeals } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DailyMenuCardProps {
  day: string;
  dateLabel: string;
  meals: DayMeals;
  onOpenMeal: (mealType: keyof DayMeals) => void;
  onAddMeal: () => void;
}

const MEAL_META: Record<keyof DayMeals, { label: string; icon: string; accent: string }> = {
  breakfast: { label: "Breakfast", icon: "🌅", accent: "bg-amber-100 text-amber-700" },
  lunch: { label: "Lunch", icon: "☀️", accent: "bg-emerald-100 text-emerald-700" },
  dinner: { label: "Dinner", icon: "🌙", accent: "bg-indigo-100 text-indigo-700" },
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

  if (!meal) {
    return (
      <div className="flex min-h-[120px] items-center gap-3 rounded-2xl border border-dashed border-border-subtle px-4 py-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${meta.accent}`} aria-hidden>
          {meta.icon}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {meta.label}
          </span>
          <span className="text-[12px] text-text-disabled">Not scheduled</span>
        </div>
        <span className="text-[12px] text-text-disabled">—</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-[120px] items-start gap-3 rounded-2xl border border-border-subtle bg-card-base/80 px-4 py-3 text-left shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${meta.accent}`} aria-hidden>
        {meta.icon}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {meta.label}
        </span>
        <div className="space-y-1">
          <p className="text-[15px] font-semibold leading-tight text-text-primary">{meal.name}</p>
          <p className="text-[12px] text-text-secondary">
            {meal.estimatedTime > 0 ? `${meal.estimatedTime} min` : "Time n/a"} · Serves {meal.servings || "n/a"}
          </p>
        </div>
        {meal.ingredients?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {meal.ingredients.slice(0, 4).map((ingredient, index) => (
              <span
                key={`${ingredient.name}-${index}`}
                className="max-w-[10rem] truncate rounded-full border border-border-tag bg-paper-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                {ingredient.name}
              </span>
            ))}
            {meal.ingredients.length > 4 && (
              <span className="rounded-full border border-border-tag px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                +{meal.ingredients.length - 4}
              </span>
            )}
          </div>
        ) : null}
      </div>
      <span className="text-[13px] font-semibold text-accent-base">{meal.totalCalories} cal</span>
    </button>
  );
}

export function DailyMenuCard({ day, dateLabel, meals, onOpenMeal, onAddMeal }: DailyMenuCardProps) {
  const scheduledMeals = [meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).length;
  const totalCalories = [meals.breakfast, meals.lunch, meals.dinner].reduce((sum, item) => {
    return sum + (item?.totalCalories ?? 0);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[24px] font-bold tracking-[-0.02em] text-text-primary">{day}</p>
            <p className="mt-1 text-[13px] text-text-secondary">{dateLabel}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onAddMeal}
            aria-label="Add meal"
            className="h-10 w-10 rounded-full border border-border-subtle text-text-secondary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-3 text-[12px] text-text-secondary">
          <span>🍽️ {scheduledMeals} {scheduledMeals === 1 ? "meal" : "meals"}</span>
          <span aria-hidden>•</span>
          <span>🔥 {totalCalories.toLocaleString()} cal</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <MealRow mealType="breakfast" meal={meals.breakfast} onOpen={() => onOpenMeal("breakfast")} />
        <MealRow mealType="lunch" meal={meals.lunch} onOpen={() => onOpenMeal("lunch")} />
        <MealRow mealType="dinner" meal={meals.dinner} onOpen={() => onOpenMeal("dinner")} />
      </CardContent>
    </Card>
  );
}
