import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { DayMeals, Difficulty, Ingredient } from "@/types";

const MEAL_TYPE_OPTIONS: Array<{ value: keyof DayMeals; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

interface AddMealModalProps {
  open: boolean;
  dayLabel: string;
  existingMeals: DayMeals;
  defaultServings: number;
  defaultDifficulty: Difficulty;
  onClose: () => void;
  onSubmit: (payload: {
    mealType: keyof DayMeals;
    meal: NonNullable<DayMeals[keyof DayMeals]>;
  }) => void;
}

const DEFAULT_DIFFICULTY: Difficulty = "easy";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
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

function buildManualMealId(dayLabel: string, mealType: keyof DayMeals) {
  const sanitized = dayLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `manual_${mealType}_${sanitized}_${Date.now()}`;
}

function parseIngredients(raw: string): Ingredient[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({
      name,
      quantity: 0,
      unit: "",
      category: "others",
    }));
}

export function AddMealModal({
  open,
  dayLabel,
  existingMeals,
  defaultServings,
  defaultDifficulty,
  onClose,
  onSubmit,
}: AddMealModalProps) {
  const emptyMealType = useMemo(() => {
    if (!existingMeals.breakfast) return "breakfast";
    if (!existingMeals.lunch) return "lunch";
    if (!existingMeals.dinner) return "dinner";
    return "breakfast";
  }, [existingMeals]);

  const [mealType, setMealType] = useState<keyof DayMeals>("breakfast");
  const [name, setName] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [servings, setServings] = useState("");
  const [calories, setCalories] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMealType("breakfast");
    setName("");
    setIngredientsInput("");
    setEstimatedTime("");
    setServings(defaultServings > 0 ? String(defaultServings) : "");
    setCalories("");
    setDifficulty(defaultDifficulty);
    setInstructions("");
    setNotes("");
    setIsEditingName(true);
    setIsEditingMeta(false);
    setIsEditingIngredients(false);
    setIsEditingInstructions(true);
    setIsEditingNotes(false);
  }, [emptyMealType, open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const parsedIngredients = parseIngredients(ingredientsInput);

    const newMeal = {
      id: buildManualMealId(dayLabel, mealType as keyof DayMeals),
      name: name.trim(),
      ingredients: parsedIngredients,
      instructions: instructions.trim(),
      estimatedTime: Number.parseInt(estimatedTime, 10) || 0,
      servings: Number.parseInt(servings, 10) || 0,
      difficulty: (difficulty || defaultDifficulty || DEFAULT_DIFFICULTY) as Difficulty,
      totalCalories: Number.parseInt(calories, 10) || 0,
      notes: notes.trim(),
    } as NonNullable<DayMeals[keyof DayMeals]>;

    onSubmit({ mealType, meal: newMeal });
    onClose();
  };

  const nameError = !name.trim();
  const mealTypeError = !mealType;

  if (!open) return null;
  const container = document.getElementById("phone-screen");
  if (!container) return null;

  return createPortal(
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-3xl bg-card-base">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-card-base px-5 py-4">
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-muted text-text-primary transition-colors hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={nameError || mealTypeError}>
            Save Dish
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-base">
            <span>{dayLabel.toUpperCase()}</span>
            <span>·</span>
            <div className="flex items-center gap-2">
              {MEAL_TYPE_OPTIONS.map((option) => {
                const isActive = mealType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMealType(option.value)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? "bg-accent-base text-white"
                        : "bg-paper-muted text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    {option.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2">
            {isEditingName ? (
              <>
                <Input
                  id="manual-meal-name"
                  ref={nameInputRef}
                  placeholder=" New dish name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  className="h-auto rounded-xl border border-border-subtle bg-transparent px-3 py-2 text-[22px] font-semibold leading-tight text-text-primary focus-visible:ring-0"
                />
                {nameError && <p className="mt-1 text-xs text-[#C67B7B]">Name is required.</p>}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-left text-[22px] font-semibold leading-tight text-text-primary"
              >
                {name ? (
                  name
                ) : (
                  <span className="text-text-tertiary">Tap to add dish name</span>
                )}
              </button>
            )}
          </div>

          <div className="mt-4">
            {isEditingMeta ? (
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-[13px] text-text-secondary">
                  <ClockIcon />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={estimatedTime}
                    onChange={(event) => setEstimatedTime(event.target.value)}
                    placeholder="20"
                    className="h-8 w-[70px] rounded-lg border border-border-tag bg-white px-2 text-[13px]"
                  />
                  <span>min</span>
                </label>
                <label className="flex items-center gap-2 text-[13px] text-text-secondary">
                  <UsersIcon />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={servings}
                    onChange={(event) => setServings(event.target.value)}
                    placeholder="2"
                    className="h-8 w-[60px] rounded-lg border border-border-tag bg-white px-2 text-[13px]"
                  />
                  <span>servings</span>
                </label>
                <label className="flex items-center gap-2 text-[13px] text-text-secondary">
                  <ChartIcon />
                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                    className="h-8 rounded-lg border border-border-tag bg-white px-2 text-[13px] text-text-primary"
                  >
                    <option value="">Select</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-[13px] text-text-secondary">
                  <FlameIcon />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={calories}
                    onChange={(event) => setCalories(event.target.value)}
                    placeholder="520"
                    className="h-8 w-[70px] rounded-lg border border-border-tag bg-white px-2 text-[13px]"
                  />
                  <span>cal</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(false)}
                  className="text-[12px] text-accent-base"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingMeta(true)}
                className="flex flex-wrap gap-4 text-left text-[13px] text-text-secondary"
              >
                <span className="flex items-center gap-2">
                  <ClockIcon />
                  <span>{estimatedTime ? `${estimatedTime} min` : "— min"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <UsersIcon />
                  <span>{servings ? `${servings} servings` : "— servings"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <ChartIcon />
                  <span>{difficulty ? difficulty : "—"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <FlameIcon />
                  <span>{calories ? `${calories} cal` : "— cal"}</span>
                </span>
              </button>
            )}
          </div>

          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Ingredients</h3>
            {isEditingIngredients ? (
              <Textarea
                id="manual-meal-ingredients"
                placeholder="Tomato, Basil, Olive oil"
                value={ingredientsInput}
                onChange={(event) => setIngredientsInput(event.target.value)}
                className="mt-3 min-h-[90px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingIngredients(true)}
                className="mt-3 text-[14px] text-text-tertiary"
              >
                Tap to add ingredients
              </button>
            )}
          </section>

          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Instructions</h3>
            {isEditingInstructions ? (
              <Textarea
                id="manual-meal-instructions"
                placeholder="Describe steps or cooking notes"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                className="mt-3 min-h-[120px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingInstructions(true)}
                className="mt-3 text-[14px] text-text-secondary"
              >
                {instructions ? instructions : "No instructions provided."}
              </button>
            )}
          </section>

          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Notes</h3>
            {isEditingNotes ? (
              <Textarea
                id="manual-meal-notes"
                placeholder="Add your notes here"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-3 min-h-[90px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingNotes(true)}
                className="mt-3 text-[14px] text-text-tertiary"
              >
                Tap to add notes
              </button>
            )}
          </section>
        </div>
      </div>
    </div>,
    container,
  );
}
