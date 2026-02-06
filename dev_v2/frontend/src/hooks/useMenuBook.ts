import { useCallback } from "react";
import { generateMenuBook, generateShoppingList, modifyMenuBook } from "@/services/api";
import { useAppStore } from "@/stores/useAppStore";
import type { MenuBook, UserPreferences, WeekMenus } from "@/types";

function buildAiMenus(menus: WeekMenus): WeekMenus {
  return Object.fromEntries(
    Object.entries(menus).map(([day, menu]) => [
      day,
      {
        breakfast: menu.breakfast.filter((dish) => dish.source === "ai"),
        lunch: menu.lunch.filter((dish) => dish.source === "ai"),
        dinner: menu.dinner.filter((dish) => dish.source === "ai"),
      },
    ]),
  ) as WeekMenus;
}

function mergeMenus(aiMenus: WeekMenus, currentMenus: WeekMenus): WeekMenus {
  return Object.fromEntries(
    Object.entries(aiMenus).map(([day, menu]) => {
      const current = currentMenus[day as keyof WeekMenus];
      const manual = {
        breakfast: current.breakfast.filter((dish) => dish.source === "manual"),
        lunch: current.lunch.filter((dish) => dish.source === "manual"),
        dinner: current.dinner.filter((dish) => dish.source === "manual"),
      };
      const normalizedAi = {
        breakfast: menu.breakfast.map((dish) => ({ ...dish, source: "ai" as const })),
        lunch: menu.lunch.map((dish) => ({ ...dish, source: "ai" as const })),
        dinner: menu.dinner.map((dish) => ({ ...dish, source: "ai" as const })),
      };
      return [
        day,
        {
          breakfast: [...manual.breakfast, ...normalizedAi.breakfast],
          lunch: [...manual.lunch, ...normalizedAi.lunch],
          dinner: [...manual.dinner, ...normalizedAi.dinner],
        },
      ];
    }),
  ) as WeekMenus;
}

export function useMenuBook() {
  const updateMenuBook = useAppStore((state) => state.updateMenuBook);
  const setIsGenerating = useAppStore((state) => state.setIsGenerating);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);

  const createMenu = useCallback(
    async (preferences: UserPreferences) => {
      setIsGenerating(true);
      clearError();
      try {
        const menuBook = await generateMenuBook(preferences);
        return menuBook;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to generate menu");
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [clearError, setError, setIsGenerating],
  );

  const updateMenu = useCallback(
    async (menuBook: MenuBook, modification: string) => {
      setIsGenerating(true);
      clearError();
      try {
        const aiMenus = buildAiMenus(menuBook.menus);
        const aiPayload: MenuBook = { ...menuBook, menus: aiMenus };
        const updated = await modifyMenuBook(menuBook.id, modification, aiPayload);
        const merged = {
          ...updated,
          menus: mergeMenus(updated.menus, menuBook.menus),
        };
        const hasBook = useAppStore.getState().menuBooks.some((book) => book.id === menuBook.id);
        if (hasBook) {
          updateMenuBook(menuBook.id, merged);
        }
        return merged;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to modify menu");
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [clearError, setError, setIsGenerating, updateMenuBook],
  );

  const generateList = useCallback(
    async (menuBook: MenuBook) => {
      setIsGenerating(true);
      clearError();
      try {
        const aiMenus = buildAiMenus(menuBook.menus);
        const list = await generateShoppingList(menuBook.id, aiMenus);
        const hasBook = useAppStore.getState().menuBooks.some((book) => book.id === menuBook.id);
        if (hasBook) {
          updateMenuBook(menuBook.id, { shoppingList: list });
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

  return { createMenu, updateMenu, generateList };
}
