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

function App() {
  const menuCount = useAppStore((state) => state.menuBooks.length);
  const addMenuBook = useAppStore((state) => state.addMenuBook);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const storage = typeof window !== "undefined" ? window.localStorage : null;
    const SEED_FLAG_KEY = "omenu_dev_seeded";
    const markSeeded = () => storage?.setItem(SEED_FLAG_KEY, "true");

    if (menuCount > 0) {
      markSeeded();
      return;
    }

    if (storage?.getItem(SEED_FLAG_KEY)) {
      return;
    }

    if (useAppStore.persist.hasHydrated()) {
      addMenuBook(SAMPLE_MENU_BOOK);
      markSeeded();
      return;
    }

    const unsub = useAppStore.persist.onFinishHydration?.((state) => {
      if (state.menuBooks.length === 0 && !storage?.getItem(SEED_FLAG_KEY)) {
        addMenuBook(SAMPLE_MENU_BOOK);
        markSeeded();
      }
    });

    return () => {
      unsub?.();
    };
  }, [menuCount, addMenuBook]);

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
