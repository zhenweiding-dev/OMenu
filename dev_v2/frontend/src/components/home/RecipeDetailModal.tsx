import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/stores/useAppStore";
import { startCaseDay } from "@/utils/helpers";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { DayMeals, MenuBook } from "@/types";

function formatDifficulty(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface ModalContentProps {
  active: {
    book: MenuBook;
    day: keyof MenuBook["mealPlan"]["days"];
    mealType: keyof DayMeals;
    recipe: NonNullable<DayMeals[keyof DayMeals]>;
  };
  onClose: () => void;
  onSaveNotes: (notes: string) => void;
  onDelete: () => void;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}

export function RecipeDetailSheet({ active, onClose, onSaveNotes, onDelete }: ModalContentProps) {
  const { book, day, mealType, recipe } = active;
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(() => recipe.notes ?? "");

  const ingredientsList = recipe.ingredients.map((ing) => {
    if (ing.quantity > 0) {
      return `${ing.quantity} ${ing.unit} ${ing.name}`.trim();
    }
    return ing.name;
  });

  const instructionSteps = recipe.instructions
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step) => {
      const cleaned = step.replace(/^(?:step\s*\d+[:.-]?|\d+[).:\-\s]*|[-•\u2022]\s*)/i, "").trim();
      return cleaned.length > 0 ? cleaned : step;
    });

  const hasNotes = Boolean(recipe.notes);

  const handleSaveNotes = () => {
    onSaveNotes(notesDraft.trim());
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    const shouldDelete = window.confirm("Remove this meal from the plan?");
    if (shouldDelete) {
      onDelete();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-3xl bg-card-base">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-card-base px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-muted text-text-primary transition-colors hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingNotes(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-muted text-text-primary transition-colors hover:bg-paper-dark"
              aria-label="Edit notes"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-muted text-error transition-colors hover:bg-paper-dark"
              aria-label="Delete meal"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Recipe Title */}
          <h2 className="text-[22px] font-semibold leading-tight text-text-primary">
            {recipe.name}
          </h2>

          {/* Recipe Meta */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <ClockIcon />
              <span>{recipe.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <UsersIcon />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <ChartIcon />
              <span>{formatDifficulty(recipe.difficulty)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <FlameIcon />
              <span>{recipe.totalCalories} cal</span>
          </div>
        </div>

          {/* Ingredients Section */}
          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Ingredients</h3>
            <ul className="mt-3">
              {ingredientsList.map((item, index) => (
                <li
                  key={index}
                  className="border-b border-border-subtle py-2 text-[14px] text-text-primary last:border-b-0"
                >
                  • {item}
                  </li>
                ))}
              </ul>
          </section>

          {/* Instructions Section */}
          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Instructions</h3>
            <ol className="mt-3">
                {instructionSteps.length > 0 ? (
                  instructionSteps.map((step, index) => (
                  <li
                    key={index}
                    className="relative border-b border-border-subtle py-3 pl-7 text-[14px] leading-relaxed text-text-primary last:border-b-0"
                  >
                    <span className="absolute left-0 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-paper-muted text-[11px] font-semibold text-accent-base">
                        {index + 1}
                      </span>
                    {step}
                    </li>
                  ))
                ) : (
                <li className="py-2 text-[14px] text-text-secondary">No instructions provided.</li>
                )}
              </ol>
          </section>

          {/* Notes Section */}
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-text-primary">Notes</h3>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[13px] text-accent-base hover:opacity-80"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="mt-3 space-y-3">
              <Textarea
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Add your notes here"
                  className="min-h-[100px]"
              />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNotesDraft(recipe.notes ?? "");
                      setIsEditingNotes(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save
                  </Button>
                </div>
              </div>
            ) : hasNotes ? (
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
                {recipe.notes}
              </p>
            ) : (
              <p className="mt-3 text-[14px] italic text-text-tertiary">
                Add a pinch of sugar for better taste.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function RecipeDetailModal() {
  const active = useAppStore((state) => state.getActiveMeal());
  const clearActiveMeal = useAppStore((state) => state.clearActiveMeal);
  const updateMealNotes = useAppStore((state) => state.updateMealNotes);
  const clearDayMeal = useAppStore((state) => state.clearDayMeal);

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearActiveMeal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, clearActiveMeal]);

  if (!active) {
    return null;
  }

  const container = document.getElementById("phone-screen");
  if (!container) return null;

  return createPortal(
    <RecipeDetailSheet
      key={`${active.book.id}-${active.recipe.id}`}
      active={active}
      onClose={clearActiveMeal}
      onSaveNotes={(notes) => updateMealNotes(active.book.id, active.day, active.mealType, notes)}
      onDelete={() => {
        clearDayMeal(active.book.id, active.day, active.mealType);
        clearActiveMeal();
      }}
    />,
    container,
  );
}
