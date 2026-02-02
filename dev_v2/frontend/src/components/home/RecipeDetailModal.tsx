import { useEffect, useState } from "react";
import { BarChart3, Check, Clock, Flame, Pencil, Trash2, Users, X } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { startCaseDay } from "@/utils/helpers";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { DayMeals, MenuBook } from "@/types";

function formatDifficulty(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface ModalContentProps {
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

function RecipeDetailModalContent({ active, onClose, onSaveNotes, onDelete }: ModalContentProps) {
  const { book, day, mealType, recipe } = active;
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(() => recipe.notes ?? "");

  const dayLabel = startCaseDay(day);
  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const ingredientCount = recipe.ingredients.length;
  const instructionSteps = recipe.instructions
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step) => {
      const cleaned = step.replace(/^(?:step\s*\d+[:.-]?|\d+[).:\-\s]*|[-•\u2022]\s*)/i, "").trim();
      return cleaned.length > 0 ? cleaned : step;
    });
  const hasNotes = Boolean(recipe.notes);

  const headerSubtitle = `${dayLabel} · ${mealLabel}`;

  const handleSaveNotes = () => {
    onSaveNotes(notesDraft.trim());
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotesDraft(recipe.notes ?? "");
    setIsEditingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="relative w-full max-w-3xl rounded-[2rem] border border-border-subtle bg-card-base p-6 shadow-card">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full text-text-secondary hover:text-text-primary"
            aria-label="Close recipe"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {isEditingNotes ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleCancelNotes}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveNotes}>
                  <Check className="mr-1.5 h-4 w-4" /> Save
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setIsEditingNotes(true)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Edit notes
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const shouldDelete = window.confirm("Remove this meal from the plan?");
                if (!shouldDelete) return;
                onDelete();
              }}
              className="text-[#C67B7B] hover:text-[#a86161]"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete meal
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-base">
            {headerSubtitle}
          </p>
          <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-text-primary">
            {recipe.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {recipe.estimatedTime} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Serves {recipe.servings}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> {formatDifficulty(recipe.difficulty)}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" /> {recipe.totalCalories} kcal
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr,1fr]">
          <section className="space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Ingredients</h3>
              <ul className="mt-2 space-y-1 text-[13px] text-text-secondary">
                {recipe.ingredients.map((ingredient) => (
                  <li key={`${ingredient.name}-${ingredient.quantity}`} className="flex items-baseline gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                      {ingredient.category.replace(/_/g, " ")}
                    </span>
                    <span>
                      {ingredient.name}
                      {ingredient.quantity > 0 && ` · ${ingredient.quantity} ${ingredient.unit}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Instructions</h3>
              <ol className="mt-2 space-y-2 text-[13px] leading-relaxed text-text-secondary">
                {instructionSteps.length > 0 ? (
                  instructionSteps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle text-[12px] font-semibold text-text-secondary">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))
                ) : (
                  <li>No instructions provided.</li>
                )}
              </ol>
            </div>
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-border-subtle bg-paper-muted/60 p-4">
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-text-primary">Notes</h3>
              <p className="text-[12px] text-text-secondary">
                Personalize this recipe with tips, swaps, or reminders.
              </p>
            </div>
            {isEditingNotes ? (
              <Textarea
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Add your notes here"
                className="min-h-[160px]"
              />
            ) : hasNotes ? (
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary">{recipe.notes}</p>
            ) : (
              <p className="text-[13px] italic text-text-tertiary">No notes yet.</p>
            )}
            <div className="text-[12px] text-text-tertiary">
              {ingredientCount} ingredients • Last generated on {new Date(book.mealPlan.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
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

  return (
    <RecipeDetailModalContent
      key={`${active.book.id}-${active.recipe.id}`}
      active={active}
      onClose={clearActiveMeal}
      onSaveNotes={(notes) => updateMealNotes(active.book.id, active.day, active.mealType, notes)}
      onDelete={() => {
        clearDayMeal(active.book.id, active.day, active.mealType);
        clearActiveMeal();
      }}
    />
  );
}
