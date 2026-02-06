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
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
  const activeBudgetRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    if (editingField !== "budget") return;
    const id = window.setTimeout(() => {
      activeBudgetRef.current?.scrollIntoView({ block: "center" });
    }, 0);
    return () => window.clearTimeout(id);
  }, [editingField, budget]);

  return (
    <div
      className="flex flex-1 flex-col"
      ref={containerRef}
      onClick={() => setEditingField(null)}
    >
      <div className="px-5 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onBack();
          }}
          className="mb-4 h-auto px-0 py-0 ui-label-soft text-text-secondary hover:text-text-primary"
        >
          ← Back
        </Button>
      </div>

      {/* Sentence style input */}
      <div className="flex-1 px-5 py-10 flex items-center">
        <p className="ui-title-sm leading-relaxed">
          The menu is for{" "}
          <span className="relative inline-block">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-paper-muted px-2 py-1 align-middle">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  onUpdatePeople(Math.max(1, numPeople - 1));
                }}
                className="h-8 w-8 rounded-full bg-white"
              >
                <MinusIcon />
              </Button>
              <span className="min-w-[22px] text-center ui-title-sm text-accent-base">
                {numPeople}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  onUpdatePeople(Math.min(10, numPeople + 1));
                }}
                className="h-8 w-8 rounded-full bg-white"
              >
                <PlusIcon />
              </Button>
            </span>
          </span>{" "}
          people with{" "}
          <span className="relative inline-block">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setEditingField(editingField === "budget" ? null : "budget");
              }}
              className="rounded-full border border-border-subtle bg-paper-muted px-2.5 py-0.5 ui-title-sm text-accent-base hover:bg-paper-muted/70"
            >
              ${budget}
            </button>
            {editingField === "budget" && (
              <span
                className="absolute left-1/2 top-full z-20 mt-2 max-h-48 -translate-x-1/2 overflow-y-auto rounded-2xl border border-border-subtle bg-card-base py-2 shadow-soft"
                onClick={(event) => event.stopPropagation()}
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onUpdateBudget(opt);
                      setEditingField(null);
                    }}
                    className={cn(
                      "block w-full px-6 py-2 text-center ui-body hover:bg-paper-muted",
                      opt === budget ? "bg-accent-soft font-semibold text-accent-base" : "text-text-primary"
                    )}
                    ref={opt === budget ? activeBudgetRef : null}
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
              onClick={(event) => {
                event.stopPropagation();
                setEditingField(editingField === "difficulty" ? null : "difficulty");
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-paper-muted px-2.5 py-0.5 ui-title-sm text-accent-base hover:bg-paper-muted/70"
            >
              {difficulty}
              <ChevronDownIcon />
            </button>
            {editingField === "difficulty" && (
              <span
                className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-2xl border border-border-subtle bg-card-base py-2 shadow-soft"
                onClick={(event) => event.stopPropagation()}
              >
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      onUpdateDifficulty(level);
                      setEditingField(null);
                    }}
                    className={cn(
                      "block w-full px-6 py-2 text-center ui-body capitalize hover:bg-paper-muted",
                      level === difficulty ? "bg-accent-soft font-semibold text-accent-base" : "text-text-primary"
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
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-4 pt-3">
        <Button onClick={onNext} className="w-full">
          Next
        </Button>
      </div>
    </div>
  );
}
