import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/stores/useAppStore";
import { startCaseDay } from "@/utils/helpers";
import { INGREDIENT_CATEGORIES } from "@/utils/constants";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Dish, Menu, MenuBook } from "@/types";

function formatDifficulty(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMealType(mealType: string) {
  return mealType.toUpperCase();
}

export interface ModalContentProps {
  active: {
    book: MenuBook;
    day: keyof MenuBook["menus"];
    mealType: keyof Menu;
    dish: Dish;
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
  const { book, day, mealType, dish } = active;
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(() => dish.notes ?? "");
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);

  const groupedIngredients = useMemo(() => {
    return INGREDIENT_CATEGORIES.map((category) => ({
      category,
      items: dish.ingredients.filter((ingredient) => ingredient.category === category),
    })).filter((group) => group.items.length > 0);
  }, [dish.ingredients]);

  const instructionSteps = dish.instructions
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step) => {
      const cleaned = step.replace(/^(?:step\s*\d+[:.-]?|\d+[).:\-\s]*|[-•\u2022]\s*)/i, "").trim();
      return cleaned.length > 0 ? cleaned : step;
    });

  const hasNotes = Boolean(dish.notes);

  useEffect(() => {
    if (!isEditingNotes) return;
    const focusNotes = () => {
      notesRef.current?.focus();
      notesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const id = window.setTimeout(focusNotes, 0);
    return () => window.clearTimeout(id);
  }, [isEditingNotes]);

  const handleSaveNotes = () => {
    onSaveNotes(notesDraft.trim());
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    const shouldDelete = window.confirm("Remove this dish from the menu?");
    if (shouldDelete) {
      onDelete();
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/40"
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
    >
      <div
        className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-3xl bg-card-base"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-card-base px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setIsEditingNotes(true)}
              variant="ghost"
              size="sm"
              className="gap-1 rounded-full bg-paper-muted px-3 text-text-primary hover:bg-paper-dark"
              aria-label="Edit notes"
            >
              <EditIcon />
              <span>Edit Notes</span>
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              variant="ghost"
              size="sm"
              className="gap-1 rounded-full bg-paper-muted px-3 text-error hover:bg-paper-dark"
              aria-label="Delete dish"
            >
              <DeleteIcon />
              <span>Delete Dish</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-base">
            {startCaseDay(day).toUpperCase()} · {formatMealType(mealType)}
          </p>
          <h2 className="mt-2 text-[22px] font-semibold leading-tight text-text-primary">
            {dish.name}
          </h2>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <ClockIcon />
              <span>{dish.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <UsersIcon />
              <span>{dish.servings} servings</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <ChartIcon />
              <span>{formatDifficulty(dish.difficulty)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
              <FlameIcon />
              <span>{dish.totalCalories} cal</span>
            </div>
          </div>

          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Ingredients</h3>
            <div className="mt-3 space-y-3">
              {groupedIngredients.map((group) => {
                const itemsText = group.items
                  .map((ingredient) => {
                    if (ingredient.quantity <= 0) return ingredient.name;
                    if (ingredient.category === "seasonings") {
                      return `${ingredient.name} ${ingredient.quantity}`.trim();
                    }
                    return `${ingredient.name} ${ingredient.quantity}${ingredient.unit ? ` ${ingredient.unit}` : ""}`.trim();
                  })
                  .join(" · ");
                return (
                  <div key={group.category} className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                      {group.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[13px] text-text-secondary">{itemsText}</span>
                  </div>
                );
              })}
            </div>
          </section>

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
                <p className="text-[13px] italic text-text-tertiary">No instructions available.</p>
              )}
            </ol>
          </section>

          <section className="mt-6" ref={notesSectionRef}>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-text-primary">Notes</h3>
              {isEditingNotes && (
                <Button size="sm" onClick={handleSaveNotes}>
                  Save
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <Textarea
                ref={notesRef}
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                className="mt-3 min-h-[80px]"
              />
            ) : hasNotes ? (
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
                {dish.notes}
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
  const active = useAppStore((state) => state.getActiveDish());
  const clearActiveDish = useAppStore((state) => state.clearActiveDish);
  const updateDishNotes = useAppStore((state) => state.updateDishNotes);
  const removeDish = useAppStore((state) => state.removeDish);

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearActiveDish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, clearActiveDish]);

  if (!active) {
    return null;
  }

  const container = document.getElementById("phone-screen");
  if (!container) return null;

  return createPortal(
    <RecipeDetailSheet
      key={`${active.book.id}-${active.dish.id}`}
      active={active}
      onClose={clearActiveDish}
      onSaveNotes={(notes) => updateDishNotes(active.book.id, active.day, active.mealType, active.dish.id, notes)}
      onDelete={() => {
        removeDish(active.book.id, active.day, active.mealType, active.dish.id);
        clearActiveDish();
      }}
    />,
    container,
  );
}
