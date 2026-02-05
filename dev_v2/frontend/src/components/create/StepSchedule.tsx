import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { WEEK_DAYS, MEAL_TYPES } from "@/utils/constants";
import type { CookSchedule } from "@/types";
import { cn } from "@/utils/cn";
import { startOfWeek, addDays, format } from "date-fns";

interface StepScheduleProps {
  cookSchedule: CookSchedule;
  onToggleMeal: (day: (typeof WEEK_DAYS)[number], meal: (typeof MEAL_TYPES)[number]) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  weekStart?: string;
  onNext: () => void;
  onBack: () => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function StepSchedule({ cookSchedule, onToggleMeal, onSelectAll, onDeselectAll, weekStart, onNext, onBack }: StepScheduleProps) {
  // Calculate dates for each day
  const dayDates = useMemo(() => {
    const baseDate = weekStart ? new Date(weekStart) : new Date();
    const weekStartDate = startOfWeek(baseDate, { weekStartsOn: 1 });
    return WEEK_DAYS.reduce((acc, day, index) => {
      acc[day] = format(addDays(weekStartDate, index), "MMM d");
      return acc;
    }, {} as Record<string, string>);
  }, [weekStart]);

  // Check if at least one meal is selected
  const hasSelectedMeals = useMemo(() => {
    return WEEK_DAYS.some((day) => MEAL_TYPES.some((meal) => cookSchedule[day][meal]));
  }, [cookSchedule]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-5 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 h-auto px-0 py-0 text-[12px] uppercase tracking-[0.18em] text-text-secondary hover:text-text-primary"
        >
          ← Back
        </Button>
        <h2 className="text-[22px] font-semibold leading-tight text-text-primary">
          Choose meals to include
        </h2>
      </div>

      {/* Quick actions */}
      <div className="mb-4 flex gap-3 px-5">
        <Button
          type="button"
          onClick={onSelectAll}
          variant="outline"
          size="sm"
          className="flex-1 border-border-tag text-text-secondary hover:border-accent-base hover:text-accent-base"
        >
          Select All
        </Button>
        <Button
          type="button"
          onClick={onDeselectAll}
          variant="outline"
          size="sm"
          className="flex-1 border-border-tag text-text-secondary hover:border-accent-base hover:text-accent-base"
        >
          Deselect All
        </Button>
      </div>

      {/* Schedule grid */}
      <div className="flex-1 px-5 pb-2">
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
          <div className="grid grid-cols-[95px_repeat(3,1fr)] items-center border-b border-border-subtle bg-paper-muted px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            <span></span>
            <span className="text-center text-[10px]">Breakfast</span>
            <span className="text-center text-[10px]">Lunch</span>
            <span className="text-center text-[10px]">Dinner</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="grid grid-cols-[95px_repeat(3,1fr)] items-center px-3 py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-text-primary">{DAY_LABELS[day]}</span>
                  <span className="text-[10px] text-text-secondary">{dayDates[day]}</span>
                </div>
                {MEAL_TYPES.map((meal) => {
                  const selected = cookSchedule[day][meal];
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => onToggleMeal(day, meal)}
                      className={cn(
                        "mx-auto h-8 w-8 rounded-xl border transition-all",
                        selected
                          ? "border-accent-base bg-accent-soft"
                          : "border-border-subtle bg-transparent hover:border-accent-light"
                      )}
                      aria-label={`${meal} on ${day}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-4 pt-3">
        <Button onClick={onNext} disabled={!hasSelectedMeals} className="w-full">
          Generate Menu
        </Button>
      </div>
    </div>
  );
}
