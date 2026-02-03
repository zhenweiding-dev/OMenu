import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
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
  onClose: () => void;
  onSubmit: (payload: {
    mealType: keyof DayMeals;
    meal: NonNullable<DayMeals[keyof DayMeals]>;
  }) => void;
}

const DEFAULT_DIFFICULTY: Difficulty = "easy";

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

export function AddMealModal({ open, dayLabel, existingMeals, onClose, onSubmit }: AddMealModalProps) {
  const emptyMealType = useMemo(() => {
    if (!existingMeals.breakfast) return "breakfast";
    if (!existingMeals.lunch) return "lunch";
    if (!existingMeals.dinner) return "dinner";
    return "breakfast";
  }, [existingMeals]);

  const [mealType, setMealType] = useState<keyof DayMeals>(emptyMealType);
  const [name, setName] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [servings, setServings] = useState("");
  const [calories, setCalories] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [instructions, setInstructions] = useState("");

  const replacingMeal = existingMeals[mealType];

  const handleSubmit = () => {
    if (!name.trim()) return;

    const parsedIngredients = parseIngredients(ingredientsInput);

    const newMeal = {
      id: buildManualMealId(dayLabel, mealType),
      name: name.trim(),
      ingredients: parsedIngredients,
      instructions: instructions.trim(),
      estimatedTime: Number.parseInt(estimatedTime, 10) || 0,
      servings: Number.parseInt(servings, 10) || 0,
      difficulty,
      totalCalories: Number.parseInt(calories, 10) || 0,
      notes: "",
    } as NonNullable<DayMeals[keyof DayMeals]>;

    onSubmit({ mealType, meal: newMeal });
    onClose();
  };

  const nameError = !name.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      title={`Add meal for ${dayLabel}`}
      className="max-w-xl"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-text-primary">
            Meal slot
            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value as keyof DayMeals)}
              className="h-11 w-full rounded-lg border border-border-tag bg-white px-4 text-[15px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base focus:ring-offset-2 focus:ring-offset-paper-base"
            >
              {MEAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {replacingMeal ? (
              <p className="text-xs text-text-secondary">
                Replaces <span className="font-medium text-text-primary">{replacingMeal.name}</span> in this slot.
              </p>
            ) : (
              <p className="text-xs text-text-secondary">Adds a new recipe to this slot.</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-primary">
            Difficulty
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              className="h-11 w-full rounded-lg border border-border-tag bg-white px-4 text-[15px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base focus:ring-offset-2 focus:ring-offset-paper-base"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="manual-meal-name">
            Meal name <span className="text-[#C67B7B]">*</span>
          </label>
          <Input
            id="manual-meal-name"
            placeholder="Homemade grain bowl"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {nameError && <p className="text-xs text-[#C67B7B]">Name is required.</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="manual-meal-ingredients">
            Ingredients (comma separated)
          </label>
          <Textarea
            id="manual-meal-ingredients"
            placeholder="Quinoa, Chickpeas, Arugula"
            value={ingredientsInput}
            onChange={(event) => setIngredientsInput(event.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-xs text-text-secondary">Used to display ingredient tags for this meal.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-text-primary">
            Time (min)
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={estimatedTime}
              onChange={(event) => setEstimatedTime(event.target.value)}
              placeholder="20"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-primary">
            Servings
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={servings}
              onChange={(event) => setServings(event.target.value)}
              placeholder="2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-primary">
            Calories
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={calories}
              onChange={(event) => setCalories(event.target.value)}
              placeholder="520"
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="manual-meal-instructions">
            Instructions (optional)
          </label>
          <Textarea
            id="manual-meal-instructions"
            placeholder="Describe steps or cooking notes"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={nameError}>
            Save meal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
