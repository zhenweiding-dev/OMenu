import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatIsoDate } from "@/utils/helpers";
import type { MealPlan, ShoppingList } from "@/types";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useAppStore } from "@/stores/useAppStore";

interface StepPlanOverviewProps {
  mealPlan: MealPlan;
  shoppingList: ShoppingList;
  onPlanUpdated: (plan: MealPlan, list: ShoppingList) => void;
  onCreateAnother: () => void;
  onViewShopping: () => void;
}

export function StepPlanOverview({ mealPlan, shoppingList, onPlanUpdated, onCreateAnother, onViewShopping }: StepPlanOverviewProps) {
  const { updatePlan } = useMealPlan();
  const isGenerating = useAppStore((state) => state.isGenerating);
  const globalError = useAppStore((state) => state.error);
  const clearError = useAppStore((state) => state.clearError);

  const totalMeals = Object.values(mealPlan.days).reduce((total, day) => {
    return total + [day.breakfast, day.lunch, day.dinner].filter(Boolean).length;
  }, 0);

  const [modification, setModification] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasShoppingItems = shoppingList.items.length > 0;

  const handleModifyPlan = async () => {
    const trimmed = modification.trim();
    if (!trimmed) {
      return;
    }

    setSuccessMessage("");
    clearError();

    try {
      const result = await updatePlan(mealPlan, trimmed);
      onPlanUpdated(result.plan, result.list);
      setModification("");
      setSuccessMessage("Plan updated successfully.");
    } catch {
      // Errors piped through global store
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-[22px] font-semibold text-text-primary">Your plan is ready</h2>
        <p className="text-[13px] text-text-secondary">
          Generated on {formatIsoDate(mealPlan.createdAt)}. Review highlights below or jump straight into the home and shopping views.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly menu</CardTitle>
            <CardDescription>{totalMeals} scheduled meals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[13px] text-text-secondary">
            <p>Household size: {mealPlan.preferences.numPeople}</p>
            <p>Weekly budget: ${mealPlan.preferences.budget}</p>
            <p>Difficulty: {mealPlan.preferences.difficulty}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopping list</CardTitle>
            <CardDescription>{shoppingList.items.length} consolidated items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[13px] text-text-secondary">
            {hasShoppingItems ? (
              <>
                {shoppingList.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-[12px] text-text-disabled">
                      {item.totalQuantity} {item.unit}
                    </span>
                  </div>
                ))}
                {shoppingList.items.length > 4 && (
                  <p className="text-[12px] text-text-disabled">
                    + {shoppingList.items.length - 4} more items
                  </p>
                )}
              </>
            ) : (
              <p className="text-[12px] text-text-disabled">
                Generate the shopping list to preview consolidated grocery items here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 rounded-2xl border border-border-subtle bg-card-base p-4">
        <div className="space-y-2">
          <h3 className="text-[15px] font-semibold text-text-primary">Need adjustments?</h3>
          <p className="text-[12px] text-text-secondary">
            Describe what you&apos;d like to change and we&apos;ll regenerate the week and shopping list.
          </p>
        </div>
        <Textarea
          value={modification}
          onChange={(event) => setModification(event.target.value.slice(0, 200))}
          placeholder="Example: Swap Friday dinner for a vegetarian option."
          maxLength={200}
          className="min-h-[96px]"
          disabled={isGenerating}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-text-tertiary">{modification.length}/200 characters</p>
          <Button onClick={handleModifyPlan} disabled={isGenerating || !modification.trim()} size="sm">
            {isGenerating ? "Updating..." : "Submit modification"}
          </Button>
        </div>
        {globalError && <p className="text-[12px] text-red-500">{globalError}</p>}
        {successMessage && <p className="text-[12px] text-accent-base">{successMessage}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild className="w-full sm:w-auto" disabled={isGenerating}>
          <Link to="/">View in Home</Link>
        </Button>
        <Button className="w-full sm:w-auto" variant="outline" onClick={onViewShopping} disabled={isGenerating}>
          {hasShoppingItems ? "View Shopping List" : "Generate Shopping List"}
        </Button>
        <Button className="w-full sm:w-auto" variant="ghost" onClick={onCreateAnother} disabled={isGenerating}>
          Create another plan
        </Button>
      </div>
    </div>
  );
}
