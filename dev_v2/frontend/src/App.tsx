import { useEffect, useRef, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { CreatePlanPage } from "@/pages/CreatePlanPage";
import { ShoppingPage } from "@/pages/ShoppingPage";
import { MyPage } from "@/pages/MyPage";
import { RecipeDetailModal } from "@/components/home/RecipeDetailModal";
import { useAppStore } from "@/stores/useAppStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { SAMPLE_MENU_BOOK } from "@/data/sampleMenuBook";
import { startOfWeek } from "date-fns";
import { fetchUserState, saveUserState } from "@/services/api";
import { useShallow } from "zustand/react/shallow";

function App() {
  const menuCount = useAppStore((state) => state.menuBooks.length);
  const menuBooks = useAppStore((state) => state.menuBooks);
  const addMenuBook = useAppStore((state) => state.addMenuBook);
  const updateMenuBook = useAppStore((state) => state.updateMenuBook);
  const setMenuBooks = useAppStore((state) => state.setMenuBooks);
  const currentWeekId = useAppStore((state) => state.currentWeekId);
  const currentDayIndex = useAppStore((state) => state.currentDayIndex);
  const setCurrentDayIndex = useAppStore((state) => state.setCurrentDayIndex);
  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useAppStore((state) => state.setIsMenuOpen);
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const [remoteStateReady, setRemoteStateReady] = useState(false);
  const [hasRemoteState, setHasRemoteState] = useState(false);

  const setDraftPreferences = useDraftStore((state) => state.setPreferences);
  const draftPreferences = useDraftStore(
    useShallow((state) => ({
      keywords: state.keywords,
      mustHaveItems: state.mustHaveItems,
      dislikedItems: state.dislikedItems,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
    })),
  );

  const outlineItems = [
    { to: "/", label: "Plan", description: "Weekly overview" },
    { to: "/shopping", label: "Shopping", description: "List & groceries" },
    { to: "/create", label: "Create", description: "New weekly menu" },
    { to: "/me", label: "Profile", description: "Account & settings" },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadRemoteState = async () => {
      try {
        const remoteState = await fetchUserState();
        if (!isMounted) return;
        const hasMenuBooks = (remoteState.menuBooks ?? []).length > 0;
        const hasPreferences = Boolean(remoteState.preferences);
        setHasRemoteState(hasMenuBooks || hasPreferences);

        if (hasMenuBooks) {
          setMenuBooks(remoteState.menuBooks, remoteState.currentWeekId ?? null);
        }
        if (typeof remoteState.currentDayIndex === "number") {
          setCurrentDayIndex(remoteState.currentDayIndex);
        }
        if (typeof remoteState.isMenuOpen === "boolean") {
          setIsMenuOpen(remoteState.isMenuOpen);
        }
        if (remoteState.preferences) {
          setDraftPreferences(remoteState.preferences);
        }
      } catch {
        setHasRemoteState(false);
      } finally {
        if (isMounted) {
          setRemoteStateReady(true);
        }
      }
    };

    loadRemoteState();
    return () => {
      isMounted = false;
    };
  }, [setCurrentDayIndex, setDraftPreferences, setIsMenuOpen, setMenuBooks]);

  useEffect(() => {
    if (!remoteStateReady) return;
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = window.setTimeout(() => {
      saveUserState({
        preferences: draftPreferences,
        menuBooks,
        currentWeekId,
        currentDayIndex,
        isMenuOpen,
      }).catch(() => {});
    }, 600);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [currentDayIndex, currentWeekId, draftPreferences, isMenuOpen, menuBooks, remoteStateReady]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!remoteStateReady || hasRemoteState) return;
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
  }, [addMenuBook, hasRemoteState, menuCount, remoteStateReady, updateMenuBook]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full justify-center bg-[#E8E4DF] px-4 py-10">
      <div className="flex w-full max-w-6xl flex-col items-center gap-10 overflow-hidden lg:flex-row lg:items-stretch">
        <aside className="w-full max-w-xs rounded-[2rem] border border-border-subtle/80 bg-white/70 p-6 text-text-secondary shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-base">Page Outline</p>
          <ul className="mt-6 space-y-3">
            {outlineItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    [
                      "flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all",
                      isActive
                        ? "border-accent-base/40 bg-white text-text-primary shadow-soft"
                        : "border-transparent bg-white/30 hover:border-border-subtle hover:bg-white/60",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "mt-1 inline-flex h-2.5 w-2.5 rounded-full",
                          isActive ? "bg-accent-base" : "bg-border-subtle",
                        ].join(" ")}
                        aria-hidden
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                        <span className="text-[12px] text-text-secondary">{item.description}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <div className="relative w-full max-w-[420px]">
          <div className="mx-auto flex aspect-[375/812] w-full max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-[2.5rem] border-[9px] border-[#1A1A1A] bg-[#1A1A1A] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]">
            <div id="phone-screen" className="relative flex h-full flex-col overflow-hidden rounded-[1.9rem] bg-paper-base">
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create" element={<CreatePlanPage />} />
                  <Route path="/shopping" element={<ShoppingPage />} />
                  <Route path="/me" element={<MyPage />} />
                </Routes>
              </div>
              <BottomNav withinFrame />
            </div>
          </div>
        </div>
      </div>
      <RecipeDetailModal />
    </div>
  );
}

export default App;
