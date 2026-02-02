import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Difficulty } from "@/types";
import { cn } from "@/utils/cn";

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

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const BUDGET_OPTIONS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500];

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

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
  const [editingField, setEditingField] = useState<"people" | "budget" | "difficulty" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditingField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col" ref={containerRef}>
      {/* Header */}
      <div className="px-5 pb-2">
        <h2 className="text-[22px] font-semibold leading-tight text-text-primary">
          Set your preferences
        </h2>
        <p className="mt-2 text-[14px] text-text-secondary">Tap the orange values to edit</p>
      </div>

      {/* Sentence style input */}
      <div className="flex-1 px-5 py-10">
        <p className="text-[24px] font-medium leading-relaxed text-text-primary">
          The meal plan is for{" "}
          <span className="relative inline-block">
            <button
              type="button"
              onClick={() => setEditingField(editingField === "people" ? null : "people")}
              className="border-b-2 border-dashed border-accent-orange pb-0.5 font-semibold text-accent-orange hover:opacity-80"
            >
              {numPeople}
            </button>
            {editingField === "people" && (
              <span className="absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border-subtle bg-white p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => onUpdatePeople(Math.max(1, numPeople - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle hover:bg-paper-muted"
                >
                  <MinusIcon />
                </button>
                <span className="w-8 text-center text-lg font-semibold">{numPeople}</span>
                <button
                  type="button"
                  onClick={() => onUpdatePeople(Math.min(10, numPeople + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle hover:bg-paper-muted"
                >
                  <PlusIcon />
                </button>
              </span>
            )}
          </span>{" "}
          people with{" "}
          <span className="relative inline-block">
            <button
              type="button"
              onClick={() => setEditingField(editingField === "budget" ? null : "budget")}
              className="border-b-2 border-dashed border-accent-orange pb-0.5 font-semibold text-accent-orange hover:opacity-80"
            >
              ${budget}
            </button>
            {editingField === "budget" && (
              <span className="absolute left-1/2 top-full z-20 mt-2 max-h-48 -translate-x-1/2 overflow-y-auto rounded-lg border border-border-subtle bg-white py-1 shadow-lg">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onUpdateBudget(opt);
                      setEditingField(null);
                    }}
                    className={cn(
                      "block w-full px-6 py-2 text-center text-sm hover:bg-paper-muted",
                      opt === budget ? "bg-accent-orangeLight font-semibold text-accent-orange" : "text-text-primary"
                    )}
                  >
                    ${opt}
                  </button>
                ))}
              </span>
            )}
          </span>{" "}
          budget and{" "}
          <span className="relative inline-block">
            <button
              type="button"
              onClick={() => setEditingField(editingField === "difficulty" ? null : "difficulty")}
              className="inline-flex items-center gap-1 border-b-2 border-dashed border-accent-orange pb-0.5 font-semibold text-accent-orange hover:opacity-80"
            >
              {difficulty}
              <ChevronDownIcon />
            </button>
            {editingField === "difficulty" && (
              <span className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-lg border border-border-subtle bg-white py-1 shadow-lg">
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      onUpdateDifficulty(level);
                      setEditingField(null);
                    }}
                    className={cn(
                      "block w-full px-6 py-2 text-center text-sm capitalize hover:bg-paper-muted",
                      level === difficulty ? "bg-accent-orangeLight font-semibold text-accent-orange" : "text-text-primary"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </span>
            )}
          </span>{" "}
          difficulty to cook.
        </p>
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
            className="flex-1 rounded-xl bg-accent-base py-4 text-[15px] font-semibold text-white hover:bg-accent-base/90"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
