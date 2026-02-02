import type { DayMeals } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DailyMenuCardProps {
  day: string;
  dateLabel: string;
  meals: DayMeals;
  onOpenMeal: (mealType: keyof DayMeals) => void;
}

function MealRow({
  label,
  meal,
  onOpen,
}: {
  label: string;
  meal: DayMeals[keyof DayMeals];
  onOpen?: () => void;
}) {
  if (!meal) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-border-subtle px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {label}
        </span>
        <span className="text-[12px] text-text-disabled">Not scheduled</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-card-base/80 px-5 py-4 text-left shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {label}
        </span>
        <Badge className="bg-transparent px-0 py-0 text-[11px] font-medium normal-case tracking-normal text-text-secondary">
          {meal.estimatedTime} min • Serves {meal.servings}
        </Badge>
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold leading-tight text-text-primary">{meal.name}</p>
        <p className="text-[12px] text-text-secondary">
          {meal.ingredients.length} ingredients • {meal.totalCalories} kcal
        </p>
      </div>
    </button>
  );
}

export function DailyMenuCard({ day, dateLabel, meals, onOpenMeal }: DailyMenuCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-text-primary">
          {day}
        </CardTitle>
        <p className="text-[13px] text-text-secondary">{dateLabel}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <MealRow label="Breakfast" meal={meals.breakfast} onOpen={() => onOpenMeal("breakfast")} />
        <MealRow label="Lunch" meal={meals.lunch} onOpen={() => onOpenMeal("lunch")} />
        <MealRow label="Dinner" meal={meals.dinner} onOpen={() => onOpenMeal("dinner")} />
      </CardContent>
    </Card>
  );
}
