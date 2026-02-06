import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { addWeeks, startOfWeek } from "date-fns";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { BackgroundFoodIcons } from "@/components/layout/BackgroundFoodIcons";
import { HomePage } from "@/pages/HomePage";
import { CreatePlanPage } from "@/pages/CreatePlanPage";
import { ShoppingPage } from "@/pages/ShoppingPage";
import { MyPage } from "@/pages/MyPage";
import { RecipeDetailModal } from "@/components/home/RecipeDetailModal";
import { useAppStore } from "@/stores/useAppStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { fetchUserState, saveUserState } from "@/services/api";
import { useShallow } from "zustand/react/shallow";

function App() {
  const menuBooks = useAppStore((state) => state.menuBooks);
  const setMenuBooks = useAppStore((state) => state.setMenuBooks);
  const currentWeekId = useAppStore((state) => state.currentWeekId);
  const currentDayIndex = useAppStore((state) => state.currentDayIndex);
  const setCurrentDayIndex = useAppStore((state) => state.setCurrentDayIndex);
  const setCurrentWeekId = useAppStore((state) => state.setCurrentWeekId);
  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useAppStore((state) => state.setIsMenuOpen);
  const setIsMenuPickerOpen = useAppStore((state) => state.setIsMenuPickerOpen);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const [remoteStateReady, setRemoteStateReady] = useState(false);
  const [hasVisitedShopping, setHasVisitedShopping] = useState(false);

  const setDraftPreferences = useDraftStore((state) => state.setPreferences);
  const pendingResult = useDraftStore((state) => state.pendingResult);
  const setPendingResult = useDraftStore((state) => state.setPendingResult);
  const draftStep = useDraftStore((state) => state.currentStep);
  const targetWeekStart = useDraftStore((state) => state.targetWeekStart);
  const draftPreferences = useDraftStore(
    useShallow((state) => ({
      specificPreferences: state.specificPreferences,
      specificDisliked: state.specificDisliked,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
    })),
  );

  const nextWeekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
    [],
  );
  const nextWeekKey = nextWeekStart.getTime();
  const computedNextWeekBook = menuBooks.find((book) => {
    const weekKey = startOfWeek(new Date(book.createdAt), { weekStartsOn: 1 }).getTime();
    return weekKey === nextWeekKey;
  });
  const latestMenuBook = useMemo(() => {
    if (menuBooks.length === 0) return null;
    return [...menuBooks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [menuBooks]);

  const hasNextWeekBook = Boolean(computedNextWeekBook);
  const hasShoppingList =
    Boolean(computedNextWeekBook?.shoppingList?.items?.length);

  const pendingWeekKey = pendingResult
    ? startOfWeek(new Date(pendingResult.createdAt), { weekStartsOn: 1 }).getTime()
    : targetWeekStart
      ? startOfWeek(new Date(targetWeekStart), { weekStartsOn: 1 }).getTime()
      : null;
  const hasPendingNextWeek = Boolean(pendingResult) && pendingWeekKey === nextWeekKey;
  const isOnShopping = location.pathname === "/shopping";
  const isReviewStep = location.pathname === "/create" && draftStep === 7;
  const isShoppingLoadingStep = location.pathname === "/create" && draftStep === 8;

  let activeIndex = 0;
  if (!hasNextWeekBook && !hasPendingNextWeek) {
    activeIndex = 0;
  } else if (hasPendingNextWeek || isReviewStep) {
    activeIndex = 1;
  } else if (isShoppingLoadingStep || (!hasShoppingList && hasNextWeekBook)) {
    activeIndex = 2;
  } else if (hasShoppingList && isOnShopping) {
    activeIndex = 3;
  } else if (hasShoppingList && hasVisitedShopping) {
    activeIndex = 4;
  } else if (hasShoppingList) {
    activeIndex = 3;
  } else {
    activeIndex = 0;
  }

  const handlePlanNextWeek = () => {
    navigate("/create", {
      state: { startStep: 1, skipResume: true, weekStart: nextWeekStart.toISOString() },
    });
  };

  const handleViewNextWeek = () => {
    navigate("/");
    setIsMenuPickerOpen(true);
  };

  const handleReviewPlan = () => {
    navigate("/create");
  };

  const handleOpenShopping = () => {
    navigate("/shopping");
  };

  const handleGenerateList = () => {
    if (pendingResult) {
      navigate("/create", { state: { startStep: 8, skipResume: true } });
      return;
    }
    const targetBook = computedNextWeekBook ?? latestMenuBook;
    if (!targetBook) return;
    setPendingResult(targetBook);
    navigate("/create", { state: { startStep: 8, skipResume: true, weekStart: targetBook.createdAt } });
  };

  const handleViewLatestMenu = () => {
    const targetBook = computedNextWeekBook ?? latestMenuBook;
    if (!targetBook) return;
    setCurrentWeekId(targetBook.id);
    setCurrentDayIndex(0);
    navigate("/");
  };

  const pathSteps = [
    {
      id: "plan",
      title: "Plan Next Week",
      hint: hasNextWeekBook
        ? "Next week is ready — open it anytime."
        : "Start with next week's menu to stay ahead.",
      action: hasNextWeekBook ? handleViewNextWeek : handlePlanNextWeek,
      actionLabel: hasNextWeekBook ? "View" : "Start",
    },
    {
      id: "review",
      title: "Review & Adjust Menu",
      hint: "Scan meals and tweak details before finalizing.",
      action: hasPendingNextWeek || isReviewStep ? handleReviewPlan : null,
      actionLabel: "Review",
    },
    {
      id: "list",
      title: "Generate Shopping List",
      hint: "Generate a list to simplify grocery planning.",
      action: hasPendingNextWeek || isReviewStep || hasNextWeekBook ? handleGenerateList : null,
      actionLabel: "Generate",
    },
    {
      id: "open",
      title: "Open Shopping List",
      hint: "Check items off as you shop.",
      action: hasShoppingList ? handleOpenShopping : null,
      actionLabel: "Open",
    },
    {
      id: "menu",
      title: "View Menu",
      hint: "Return to the menu when your list is ready.",
      action: hasShoppingList ? handleViewLatestMenu : null,
      actionLabel: "View",
      forceAction: hasShoppingList,
    },
  ].map((step, index) => {
    const isAllDone = activeIndex >= 5;
    const status = isAllDone
      ? "done"
      : index < activeIndex
        ? "done"
        : index == activeIndex
          ? "active"
          : "upcoming";
    return { ...step, status };
  });

  useEffect(() => {
    let isMounted = true;
    const loadRemoteState = async () => {
      try {
        const remoteState = await fetchUserState();
        if (!isMounted) return;
        const hasMenuBooks = (remoteState.menuBooks ?? []).length > 0;
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
        // Backend unavailable - app will work with empty state
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
    if (isOnShopping) {
      setHasVisitedShopping(true);
    }
  }, [isOnShopping]);

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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full justify-center bg-[#E8E4DF] px-4 py-10">
      <div className="flex w-full max-w-6xl flex-col items-center gap-10 overflow-hidden lg:flex-row lg:items-start">
        <aside className="h-fit w-full max-w-xs rounded-[2rem] border border-border-subtle/80 bg-white/70 p-6 text-text-secondary shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur">
          <p className="ui-label-soft text-accent-base">Recommended Path</p>
          <p className="mt-2 ui-caption text-text-tertiary">
            Follow the steps below to finish a weekly menu and shopping list.
          </p>
          <ol className="mt-6 space-y-3">
            {pathSteps.map((step, index) => (
              <li key={step.id}>
                <div
                  className={[
                    "flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-all",
                    step.status === "active"
                      ? "border-accent-base/40 bg-white text-text-primary shadow-soft"
                      : step.status === "done"
                        ? "border-border-subtle bg-paper-muted/60 text-text-secondary"
                        : "border-border-subtle bg-white/30 text-text-tertiary",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-1 inline-flex h-2.5 w-2.5 rounded-full",
                        step.status === "done"
                          ? "bg-accent-base"
                          : step.status === "active"
                            ? "bg-accent-light"
                            : "bg-border-subtle",
                      ].join(" ")}
                      aria-hidden
                    />
                    <div className="flex flex-col">
                      <span className="ui-body-strong">
                        {index + 1}. {step.title}
                      </span>
                      <span className="mt-1 ui-caption">
                        {step.hint}
                      </span>
                    </div>
                  </div>

              {(step.status === "active" || step.forceAction) && step.action ? (
                <button
                  type="button"
                  onClick={step.action}
                  className="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1 ui-label-soft text-accent-base hover:border-accent-base"
                    >
                      {step.actionLabel}
                    </button>
                  ) : step.status === "done" ? (
                    <span className="rounded-full bg-paper-base px-2.5 py-1 ui-label-soft text-text-secondary">
                      Done
                    </span>
                  ) : (
                    <span className="rounded-full bg-paper-muted px-2.5 py-1 ui-label-soft text-text-tertiary">
                      Next
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </aside>

        <div className="relative w-full max-w-[380px]">
          <div className="mx-auto flex aspect-[375/812] w-full max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-[2.5rem] border-[8px] border-[#1A1A1A] bg-[#1A1A1A] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
            <div id="phone-screen" className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-paper-base">
              <BackgroundFoodIcons />
              <div ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create" element={<CreatePlanPage />} />
                  <Route path="/shopping" element={<ShoppingPage />} />
                  <Route path="/me" element={<MyPage />} />
                </Routes>
              </div>
              <div className="relative z-10">
                <BottomNav withinFrame />
              </div>
            </div>
          </div>
        </div>
      </div>
      <RecipeDetailModal />
    </div>
  );
}

export default App;
