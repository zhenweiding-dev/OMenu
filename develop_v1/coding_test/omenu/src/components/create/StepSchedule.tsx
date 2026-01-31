import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import { DAYS, MEALS, DAY_LABELS, MEAL_LABELS } from '@/utils/constants';
import { countSelectedMeals, hasAnyMealSelected } from '@/utils/helpers';
import type { DayOfWeek, MealType } from '@/types';

interface StepScheduleProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepSchedule({ onNext, onBack }: StepScheduleProps) {
  const cookSchedule = useDraftStore((s) => s.cookSchedule);
  const toggleMeal = useDraftStore((s) => s.toggleMeal);

  const totalMeals = countSelectedMeals(cookSchedule);
  const canProceed = hasAnyMealSelected(cookSchedule);

  const handleToggleAll = (day: DayOfWeek) => {
    const dayMeals = cookSchedule[day];
    const allSelected = dayMeals.breakfast && dayMeals.lunch && dayMeals.dinner;

    // Toggle all meals for this day
    MEALS.forEach((meal) => {
      if (allSelected) {
        // Deselect all
        if (dayMeals[meal]) {
          toggleMeal(day, meal);
        }
      } else {
        // Select all
        if (!dayMeals[meal]) {
          toggleMeal(day, meal);
        }
      }
    });
  };

  const handleToggleMealColumn = (meal: MealType) => {
    const allSelected = DAYS.every((day) => cookSchedule[day][meal]);

    DAYS.forEach((day) => {
      if (allSelected) {
        if (cookSchedule[day][meal]) {
          toggleMeal(day, meal);
        }
      } else {
        if (!cookSchedule[day][meal]) {
          toggleMeal(day, meal);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <div className="pt-14 px-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-secondary-text hover:text-primary-text"
          >
            <ChevronLeft size={24} />
          </button>
          {/* Progress dots */}
          <div className="flex-1 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step === 5 ? 'bg-accent' : 'bg-divider'
                }`}
              />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <h1 className="text-h1 font-display font-semibold text-primary-text mb-1">
          When will you cook?
        </h1>
        <p className="text-body text-secondary-text">
          Select the meals you want to plan
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-32">
        {/* Grid */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr>
                <th className="p-2 text-left">
                  <span className="text-caption uppercase tracking-wider text-secondary-text">
                    Day
                  </span>
                </th>
                {MEALS.map((meal) => (
                  <th key={meal} className="p-2 text-center">
                    <button
                      onClick={() => handleToggleMealColumn(meal)}
                      className="text-caption uppercase tracking-wider text-secondary-text hover:text-accent transition-colors"
                    >
                      {MEAL_LABELS[meal].slice(0, 1)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const dayMeals = cookSchedule[day];
                const allSelected =
                  dayMeals.breakfast && dayMeals.lunch && dayMeals.dinner;

                return (
                  <tr key={day} className="border-t border-divider">
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleToggleAll(day)}
                        className={`text-body font-medium transition-colors ${
                          allSelected ? 'text-accent' : 'text-primary-text'
                        } hover:text-accent`}
                      >
                        {DAY_LABELS[day].slice(0, 3)}
                      </button>
                    </td>
                    {MEALS.map((meal) => (
                      <td key={meal} className="py-3 px-2 text-center">
                        <button
                          onClick={() => toggleMeal(day, meal)}
                          className={`w-10 h-10 rounded-lg border transition-all ${
                            cookSchedule[day][meal]
                              ? 'bg-accent border-accent text-white'
                              : 'border-divider text-transparent hover:border-accent-light'
                          }`}
                        >
                          <Check
                            size={20}
                            className="mx-auto"
                            strokeWidth={2.5}
                          />
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 text-center">
          <span className="text-body text-secondary-text">
            {totalMeals} meal{totalMeals !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-divider px-4 py-4 safe-bottom">
        <Button fullWidth onClick={onNext} disabled={!canProceed}>
          Generate Meal Plan
        </Button>
        {!canProceed && (
          <p className="text-caption text-center text-secondary-text mt-2">
            Select at least one meal to continue
          </p>
        )}
      </div>
    </div>
  );
}
