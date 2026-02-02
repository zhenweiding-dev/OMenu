import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { CreatePlanPage } from "@/pages/CreatePlanPage";
import { ShoppingPage } from "@/pages/ShoppingPage";
import { MyPage } from "@/pages/MyPage";
import { RecipeDetailModal } from "@/components/home/RecipeDetailModal";
import { useAppStore } from "@/stores/useAppStore";
import { SAMPLE_MENU_BOOK } from "@/data/sampleMenuBook";
import { startOfWeek } from "date-fns";

function App() {
  const menuCount = useAppStore((state) => state.menuBooks.length);
  const addMenuBook = useAppStore((state) => state.addMenuBook);
  const updateMenuBook = useAppStore((state) => state.updateMenuBook);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const storage = typeof window !== "undefined" ? window.localStorage : null;
    const SEED_FLAG_KEY = "omenu_dev_seeded";
    const markSeeded = () => storage?.setItem(SEED_FLAG_KEY, "true");

    const buildSeedMenu = () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const isoWeekStart = weekStart.toISOString();
      const idSuffix = isoWeekStart.slice(0, 10).replace(/-/g, "");
      const mealPlanId = `mealplan_demo_${idSuffix}`;
      const shoppingListId = `shopping_demo_${idSuffix}`;

      return {
        ...SAMPLE_MENU_BOOK,
        id: `demo_week_${idSuffix}`,
        mealPlan: {
          ...SAMPLE_MENU_BOOK.mealPlan,
          id: mealPlanId,
          createdAt: isoWeekStart,
        },
        shoppingList: {
          ...SAMPLE_MENU_BOOK.shoppingList,
          id: shoppingListId,
          mealPlanId,
          createdAt: new Date().toISOString(),
        },
      };
    };

    if (menuCount > 0) {
      const existingDemo = useAppStore.getState().menuBooks.find((book) => book.id.startsWith("demo_week_"));
      if (existingDemo) {
        const refreshed = buildSeedMenu();
        updateMenuBook(existingDemo.id, {
          mealPlan: refreshed.mealPlan,
          shoppingList: refreshed.shoppingList,
        });
      }
      markSeeded();
      return;
    }

    if (storage?.getItem(SEED_FLAG_KEY)) {
      return;
    }

    if (useAppStore.persist.hasHydrated()) {
      addMenuBook(buildSeedMenu());
      markSeeded();
      return;
    }

    const unsub = useAppStore.persist.onFinishHydration?.((state) => {
      if (state.menuBooks.length === 0 && !storage?.getItem(SEED_FLAG_KEY)) {
        addMenuBook(buildSeedMenu());
        markSeeded();
      }
    });

    return () => {
      unsub?.();
    };
  }, [menuCount, addMenuBook, updateMenuBook]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-muted">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePlanPage />} />
        <Route path="/shopping" element={<ShoppingPage />} />
        <Route path="/my" element={<MyPage />} />
      </Routes>
      <BottomNav />
      <RecipeDetailModal />
    </div>
  );
}

export default App;
