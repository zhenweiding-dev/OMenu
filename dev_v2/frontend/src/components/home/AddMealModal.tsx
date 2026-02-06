import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Dish, Difficulty, Ingredient, Menu } from "@/types";

const MEAL_TYPE_OPTIONS: Array<{ value: keyof Menu; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];
const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];

interface AddMealModalProps {
  open: boolean;
  dayLabel: string;
  existingMenu: Menu;
  defaultServings: number;
  defaultDifficulty: Difficulty;
  onClose: () => void;
  onSubmit: (payload: { mealType: keyof Menu; dish: Dish }) => void;
}

const DEFAULT_DIFFICULTY: Difficulty = "easy";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}

function buildManualDishId(dayLabel: string, mealType: keyof Menu) {
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
  existingMenu,
  defaultServings,
  defaultDifficulty,
  onClose,
  onSubmit,
}: AddMealModalProps) {
  const [mealType, setMealType] = useState<keyof Menu>("breakfast");
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
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  const recommendedMealType = useMemo(() => {
    if (existingMenu.breakfast.length === 0) return "breakfast";
    if (existingMenu.lunch.length === 0) return "lunch";
    if (existingMenu.dinner.length === 0) return "dinner";
    return "breakfast";
  }, [existingMenu]);

  useEffect(() => {
    if (!open) return;
    setMealType(recommendedMealType);
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
  }, [defaultDifficulty, defaultServings, open, recommendedMealType]);

  useEffect(() => {
    if (!isEditingMeta) {
      setIsDifficultyOpen(false);
    }
  }, [isEditingMeta]);

  useEffect(() => {
    if (!isDifficultyOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!difficultyDropdownRef.current) return;
      if (!difficultyDropdownRef.current.contains(event.target as Node)) {
        setIsDifficultyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDifficultyOpen]);

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

    const newDish: Dish = {
      id: buildManualDishId(dayLabel, mealType),
      name: name.trim(),
      ingredients: parsedIngredients,
      instructions: instructions.trim(),
      estimatedTime: Number.parseInt(estimatedTime, 10) || 0,
      servings: Number.parseInt(servings, 10) || 0,
      difficulty: (difficulty || defaultDifficulty || DEFAULT_DIFFICULTY) as Difficulty,
      totalCalories: Number.parseInt(calories, 10) || 0,
      notes: notes.trim(),
      source: "manual",
    };

    onSubmit({ mealType, dish: newDish });
    onClose();
  };

  const nameError = !name.trim();
  const mealTypeError = !mealType;

  if (!open) return null;
  const container = document.getElementById("phone-screen");
  if (!container) return null;

  return createPortal(
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
            onPointerDown={(event) => {
              event.preventDefault();
              onClose();
            }}
            className="h-9 w-9 rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={nameError || mealTypeError}>
            Save Dish
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2 ui-label-soft text-accent-base">
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
                    className={`rounded-full px-2.5 py-1 ui-label-soft transition-colors ${
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
                  className="h-auto rounded-xl border border-border-subtle bg-transparent px-3 py-2 ui-heading focus-visible:ring-0"
                />
                {nameError && <p className="mt-1 ui-caption text-[#C67B7B]">Name is required.</p>}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-left ui-heading"
              >
                {name ? (
                  name
                ) : (
                  <span className="text-text-tertiary">Tap to add dish name</span>
                )}
              </button>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-border-subtle bg-paper-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="ui-label-soft text-text-secondary">
                Meal details
              </p>
              <button
                type="button"
                onClick={() => setIsEditingMeta((prev) => !prev)}
                className="ui-label-soft text-accent-base"
              >
                {isEditingMeta ? "Done" : "Edit"}
              </button>
            </div>

            {isEditingMeta ? (
              <div className="mt-4 grid grid-cols-2 gap-4 ui-caption">
                <label className="flex flex-col gap-1 ui-caption-soft">
                  Time (min)
                  <Input
                    value={estimatedTime}
                    onChange={(event) => setEstimatedTime(event.target.value)}
                    className="h-9 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1 ui-caption-soft">
                  Servings
                  <Input
                    value={servings}
                    onChange={(event) => setServings(event.target.value)}
                    className="h-9 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1 ui-caption-soft">
                  Difficulty
                  <div className="relative" ref={difficultyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDifficultyOpen((prev) => !prev)}
                      className="flex h-9 w-full items-center justify-between rounded-xl border border-border-subtle bg-paper-base px-3 ui-body text-text-primary hover:bg-paper-muted/50"
                    >
                      <span className="capitalize">{difficulty || "Select difficulty"}</span>
                      <ChevronDown className="h-4 w-4 text-text-tertiary ui-icon" aria-hidden />
                    </button>
                    {isDifficultyOpen && (
                      <div className="absolute left-1/2 top-full z-20 mt-2 w-full max-h-40 -translate-x-1/2 overflow-y-auto rounded-2xl border border-border-subtle bg-card-base py-2 shadow-soft">
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setDifficulty(option);
                              setIsDifficultyOpen(false);
                            }}
                            className={cn(
                              "block w-full px-6 py-2 text-center ui-body capitalize hover:bg-paper-muted",
                              option === difficulty
                                ? "bg-accent-soft font-semibold text-accent-base"
                                : "text-text-primary",
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
                <label className="flex flex-col gap-1 ui-caption-soft">
                  Calories
                  <Input
                    value={calories}
                    onChange={(event) => setCalories(event.target.value)}
                    className="h-9 rounded-xl"
                  />
                </label>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 ui-caption">
                <div className="flex items-center gap-2">
                  <ClockIcon />
                  <span>{estimatedTime || "—"} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon />
                  <span>{servings || "—"} servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChartIcon />
                  <span>{difficulty || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FlameIcon />
                  <span>{calories || "—"} cal</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-border-subtle bg-paper-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="ui-label-soft text-text-secondary">Ingredients</p>
              <button
                type="button"
                onClick={() => setIsEditingIngredients((prev) => !prev)}
                className="ui-label-soft text-accent-base"
              >
                {isEditingIngredients ? "Done" : "Edit"}
              </button>
            </div>

            {isEditingIngredients ? (
              <Textarea
                value={ingredientsInput}
                onChange={(event) => setIngredientsInput(event.target.value)}
                placeholder="Add ingredients separated by commas"
                className="mt-3 min-h-[80px]"
              />
            ) : (
              <p className="mt-3 ui-body">
                {ingredientsInput ? ingredientsInput : "Tap edit to add ingredients."}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-border-subtle bg-paper-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="ui-label-soft text-text-secondary">Instructions</p>
              <button
                type="button"
                onClick={() => setIsEditingInstructions((prev) => !prev)}
                className="ui-label-soft text-accent-base"
              >
                {isEditingInstructions ? "Done" : "Edit"}
              </button>
            </div>

            {isEditingInstructions ? (
              <Textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Add step-by-step instructions"
                className="mt-3 min-h-[100px]"
              />
            ) : (
              <p className="mt-3 ui-body">
                {instructions ? instructions : "Tap edit to add instructions."}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-border-subtle bg-paper-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="ui-label-soft text-text-secondary">Notes</p>
              <button
                type="button"
                onClick={() => setIsEditingNotes((prev) => !prev)}
                className="ui-label-soft text-accent-base"
              >
                {isEditingNotes ? "Done" : "Edit"}
              </button>
            </div>

            {isEditingNotes ? (
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add notes (optional)"
                className="mt-3 min-h-[60px]"
              />
            ) : (
              <p className="mt-3 ui-body">
                {notes ? notes : "Tap edit to add notes."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    container,
  );
}
