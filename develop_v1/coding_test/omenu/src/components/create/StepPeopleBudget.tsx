import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import {
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  PEOPLE_MIN,
  PEOPLE_MAX,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
} from '@/utils/constants';
import type { Difficulty } from '@/types';

interface StepPeopleBudgetProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPeopleBudget({ onNext, onBack }: StepPeopleBudgetProps) {
  const numPeople = useDraftStore((s) => s.numPeople);
  const budget = useDraftStore((s) => s.budget);
  const difficulty = useDraftStore((s) => s.difficulty);
  const setNumPeople = useDraftStore((s) => s.setNumPeople);
  const setBudget = useDraftStore((s) => s.setBudget);
  const setDifficulty = useDraftStore((s) => s.setDifficulty);

  const handlePeopleChange = (delta: number) => {
    const newValue = numPeople + delta;
    if (newValue >= PEOPLE_MIN && newValue <= PEOPLE_MAX) {
      setNumPeople(newValue);
    }
  };

  const handleBudgetChange = (delta: number) => {
    const newValue = budget + delta;
    if (newValue >= BUDGET_MIN && newValue <= BUDGET_MAX) {
      setBudget(newValue);
    }
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
                  step === 4 ? 'bg-accent' : 'bg-divider'
                }`}
              />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <h1 className="text-h1 font-display font-semibold text-primary-text mb-1">
          Plan details
        </h1>
        <p className="text-body text-secondary-text">
          Set your household size and budget
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-32">
        {/* Number of People */}
        <div className="mb-8">
          <label className="block text-caption uppercase tracking-wider text-secondary-text mb-3">
            Number of People
          </label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handlePeopleChange(-1)}
              disabled={numPeople <= PEOPLE_MIN}
              className="w-12 h-12 rounded-full border border-divider flex items-center justify-center text-secondary-text hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-divider disabled:hover:text-secondary-text transition-colors"
            >
              <Minus size={24} />
            </button>
            <div className="w-20 text-center">
              <span className="text-4xl font-display font-semibold text-primary-text">
                {numPeople}
              </span>
            </div>
            <button
              onClick={() => handlePeopleChange(1)}
              disabled={numPeople >= PEOPLE_MAX}
              className="w-12 h-12 rounded-full border border-divider flex items-center justify-center text-secondary-text hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-divider disabled:hover:text-secondary-text transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Weekly Budget */}
        <div className="mb-8">
          <label className="block text-caption uppercase tracking-wider text-secondary-text mb-3">
            Weekly Budget
          </label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleBudgetChange(-BUDGET_STEP)}
              disabled={budget <= BUDGET_MIN}
              className="w-12 h-12 rounded-full border border-divider flex items-center justify-center text-secondary-text hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-divider disabled:hover:text-secondary-text transition-colors"
            >
              <Minus size={24} />
            </button>
            <div className="w-24 text-center">
              <span className="text-4xl font-display font-semibold text-primary-text">
                ${budget}
              </span>
            </div>
            <button
              onClick={() => handleBudgetChange(BUDGET_STEP)}
              disabled={budget >= BUDGET_MAX}
              className="w-12 h-12 rounded-full border border-divider flex items-center justify-center text-secondary-text hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-divider disabled:hover:text-secondary-text transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
          <p className="text-caption text-center text-secondary-text mt-2">
            ${BUDGET_MIN} - ${BUDGET_MAX}
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-caption uppercase tracking-wider text-secondary-text mb-3">
            Recipe Difficulty
          </label>
          <div className="flex gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d as Difficulty)}
                className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                  difficulty === d
                    ? 'bg-tag-selected-bg border-tag-selected-border text-accent font-medium'
                    : 'border-divider text-secondary-text hover:border-accent-light'
                }`}
              >
                {DIFFICULTY_LABELS[d as Difficulty]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-divider px-4 py-4 safe-bottom">
        <Button fullWidth onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
