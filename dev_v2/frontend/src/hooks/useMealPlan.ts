import { useCallback } from "react";
import { generateMealPlan, generateShoppingList, modifyMealPlan } from "@/services/api";
import { useAppStore } from "@/stores/useAppStore";
import type { MealPlan, ShoppingList, UserPreferences } from "@/types";

export function useMealPlan() {
  const updateMenuBook = useAppStore((state) => state.updateMenuBook);
  const setIsGenerating = useAppStore((state) => state.setIsGenerating);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);

  const createPlan = useCallback(
    async (preferences: UserPreferences) => {
      setIsGenerating(true);
      clearError();
      try {
        const plan = await generateMealPlan(preferences);
        const placeholderList: ShoppingList = {
          id: `${plan.id}-pending`,
          mealPlanId: plan.id,
          createdAt: plan.createdAt,
          items: [],
        };
        return { plan, list: placeholderList };
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to generate meal plan");
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [clearError, setError, setIsGenerating],
  );

  const updatePlan = useCallback(
    async (plan: MealPlan, modification: string) => {
      setIsGenerating(true);
      clearError();
      try {
        const updatedPlan = await modifyMealPlan(plan.id, modification, plan);
        const updatedList = await generateShoppingList(updatedPlan.id, updatedPlan);
        const hasBook = useAppStore.getState().menuBooks.some((book) => book.id === plan.id);
        if (hasBook) {
          updateMenuBook(plan.id, { mealPlan: updatedPlan, shoppingList: updatedList });
        }
        return { plan: updatedPlan, list: updatedList };
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to modify meal plan");
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [clearError, setError, setIsGenerating, updateMenuBook],
  );

  const generateList = useCallback(
    async (plan: MealPlan) => {
      setIsGenerating(true);
      clearError();
      try {
        const list = await generateShoppingList(plan.id, plan);
        const hasBook = useAppStore.getState().menuBooks.some((book) => book.id === plan.id);
        if (hasBook) {
          updateMenuBook(plan.id, { shoppingList: list });
        }
        return list;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to generate shopping list");
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [clearError, setError, setIsGenerating, updateMenuBook],
  );

  return { createPlan, updatePlan, generateList };
}
