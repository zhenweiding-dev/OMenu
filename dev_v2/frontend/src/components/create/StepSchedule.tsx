import { Button } from "@/components/ui/button";
import { WEEK_DAYS, MEAL_TYPES } from "@/utils/constants";
import type { CookSchedule } from "@/types";

interface StepScheduleProps {
  cookSchedule: CookSchedule;
  onToggleMeal: (day: (typeof WEEK_DAYS)[number], meal: (typeof MEAL_TYPES)[number]) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSchedule({ cookSchedule, onToggleMeal, onSelectAll, onDeselectAll, onNext, onBack }: StepScheduleProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Cooking schedule</h2>
        <p className="text-sm text-slate-500">Select the meals you plan to cook each day. We&apos;ll only generate recipes for the selected slots.</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onSelectAll}>
          Select all
        </Button>
        <Button variant="ghost" onClick={onDeselectAll}>
          Clear
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold capitalize text-slate-700">{day}</h3>
            <div className="flex gap-2">
              {MEAL_TYPES.map((meal) => {
                const selected = cookSchedule[day][meal];
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => onToggleMeal(day, meal)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize ${
                      selected ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {meal}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Review & Generate</Button>
      </div>
    </div>
  );
}
