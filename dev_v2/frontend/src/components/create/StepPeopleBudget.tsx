import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Difficulty } from "@/types";

interface StepPeopleBudgetProps {
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  onUpdatePeople: (count: number) => void;
  onUpdateBudget: (budget: number) => void;
  onUpdateDifficulty: (difficulty: Difficulty) => void;
  onNext: () => void;
  onBack: () => void;
}

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export function StepPeopleBudget({
  numPeople,
  budget,
  difficulty,
  onUpdatePeople,
  onUpdateBudget,
  onUpdateDifficulty,
  onNext,
  onBack,
}: StepPeopleBudgetProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Serving preferences</h2>
        <p className="text-sm text-slate-500">Tell us how many people you&apos;re cooking for, your weekly grocery budget, and preferred difficulty.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-600">Household size</span>
          <Input
            type="number"
            min={1}
            max={10}
            value={numPeople}
            onChange={(event) => onUpdatePeople(Number(event.target.value) || 1)}
          />
        </label>

        <label className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-600">Weekly budget (USD)</span>
          <Input
            type="number"
            min={50}
            max={500}
            step={10}
            value={budget}
            onChange={(event) => onUpdateBudget(Number(event.target.value) || 50)}
          />
        </label>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-medium text-slate-600">Difficulty</span>
          <div className="flex gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onUpdateDifficulty(level)}
                className={`w-full rounded-lg border px-3 py-2 text-sm capitalize ${
                  difficulty === level ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-slate-200 text-slate-500"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
