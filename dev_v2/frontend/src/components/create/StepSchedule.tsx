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
  onNext: () => void;
  onBack: () => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export function StepSchedule({ cookSchedule, onToggleMeal, onSelectAll, onDeselectAll, onNext, onBack }: StepScheduleProps) {
  // Calculate dates for each day
  const dayDates = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return WEEK_DAYS.reduce((acc, day, index) => {
      acc[day] = format(addDays(weekStart, index), "MMM d");
      return acc;
    }, {} as Record<string, string>);
  }, []);

  // Check if at least one meal is selected
  const hasSelectedMeals = useMemo(() => {
    return WEEK_DAYS.some((day) => MEAL_TYPES.some((meal) => cookSchedule[day][meal]));
  }, [cookSchedule]);

  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col">
      {/* Header */}
      <div className="px-5 pb-4">
        <h2 className="text-[22px] font-semibold leading-tight text-text-primary">
          Choose meals to plan
        </h2>
        <p className="mt-2 text-[14px] text-text-secondary">Select at least one meal</p>
      </div>

      {/* Quick actions */}
      <div className="mb-5 flex gap-3 px-5">
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-md border border-border-tag px-4 py-2 text-[13px] text-text-secondary hover:border-accent-base hover:text-accent-base"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={onDeselectAll}
          className="rounded-md border border-border-tag px-4 py-2 text-[13px] text-text-secondary hover:border-accent-base hover:text-accent-base"
        >
          Deselect All
        </button>
      </div>

      {/* Schedule grid */}
      <div className="flex-1 px-5 pb-4">
        {/* Grid header */}
        <div className="mb-2 grid grid-cols-[80px_repeat(3,1fr)] gap-2 px-1">
          <span></span>
          <span className="text-center text-[12px] font-semibold text-text-secondary">B</span>
          <span className="text-center text-[12px] font-semibold text-text-secondary">L</span>
          <span className="text-center text-[12px] font-semibold text-text-secondary">D</span>
        </div>

        {/* Grid rows */}
        <div className="flex flex-col gap-2">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="grid grid-cols-[80px_repeat(3,1fr)] items-center gap-2 rounded-lg border border-border-subtle bg-card-base p-3"
            >
              {/* Day label */}
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-text-primary">{DAY_LABELS[day]}</span>
                <span className="text-[11px] text-text-secondary">{dayDates[day]}</span>
              </div>

              {/* Meal cells */}
              {MEAL_TYPES.map((meal) => {
                const selected = cookSchedule[day][meal];
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => onToggleMeal(day, meal)}
                    className={cn(
                      "mx-auto h-9 w-9 rounded-full border-2 transition-all",
                      selected
                        ? "border-accent-base bg-accent-base"
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

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-6 pt-4">
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 rounded-xl border-border-subtle py-4 text-[15px] font-semibold text-text-primary hover:bg-paper-muted"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!hasSelectedMeals}
            className={cn(
              "flex-1 rounded-xl py-4 text-[15px] font-semibold text-white",
              hasSelectedMeals
                ? "bg-accent-base hover:bg-accent-base/90"
                : "cursor-not-allowed bg-text-disabled"
            )}
          >
            Generate Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
