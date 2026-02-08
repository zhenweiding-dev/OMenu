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
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoginPage } from "@/components/auth/LoginPage";
import { SignUpPage } from "@/components/auth/SignUpPage";
import { AuthCallback } from "@/components/auth/AuthCallback";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { fetchProfile, fetchMenuBooks, updateProfile, upsertMenuBook, deleteMenuBook as deleteMenuBookRemote } from "@/services/supabase-data";
import { useShallow } from "zustand/react/shallow";

function AppShell() {
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
  const profileSyncRef = useRef<number | null>(null);
  const [remoteStateReady, setRemoteStateReady] = useState(false);
  const [hasVisitedShopping, setHasVisitedShopping] = useState(false);
  const prevMenuBooksRef = useRef<string>("");

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
  } else if (isShoppingLoadingStep) {
    // Prioritize shopping list generation state over pending review.
    activeIndex = 2;
  } else if (hasPendingNextWeek || isReviewStep) {
    activeIndex = 1;
  } else if (!hasShoppingList && hasNextWeekBook) {
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

  // Load profile + menu books from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [profile, books] = await Promise.all([
          fetchProfile(),
          fetchMenuBooks(),
        ]);
        if (!isMounted) return;

        if (books.length > 0) {
          setMenuBooks(books, profile?.current_week_id ?? null);
        }
        if (profile) {
          if (typeof profile.current_day_index === "number") {
            setCurrentDayIndex(profile.current_day_index);
          }
          if (typeof profile.is_menu_open === "boolean") {
            setIsMenuOpen(profile.is_menu_open);
          }
          if (profile.preferences) {
            setDraftPreferences(profile.preferences);
          }
        }
      } catch {
        // Supabase unavailable — app works with empty state
      } finally {
        if (isMounted) {
          setRemoteStateReady(true);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [setCurrentDayIndex, setDraftPreferences, setIsMenuOpen, setMenuBooks]);

  useEffect(() => {
    if (isOnShopping) {
      setHasVisitedShopping(true);
    }
  }, [isOnShopping]);

  // Debounced profile sync to Supabase
  useEffect(() => {
    if (!remoteStateReady) return;
    if (profileSyncRef.current) {
      window.clearTimeout(profileSyncRef.current);
    }
    profileSyncRef.current = window.setTimeout(() => {
      updateProfile({
        preferences: draftPreferences as never,
        current_week_id: currentWeekId,
        current_day_index: currentDayIndex,
        is_menu_open: isMenuOpen,
      }).catch(() => {});
    }, 600);

    return () => {
      if (profileSyncRef.current) {
        window.clearTimeout(profileSyncRef.current);
      }
    };
  }, [currentDayIndex, currentWeekId, draftPreferences, isMenuOpen, remoteStateReady]);

  // Sync menu book changes to Supabase
  useEffect(() => {
    if (!remoteStateReady) return;
    const currentSnapshot = JSON.stringify(menuBooks.map((b) => ({ id: b.id, s: b.status, sl: b.shoppingList?.items?.length ?? 0, m: Object.keys(b.menus).length })));
    if (prevMenuBooksRef.current === currentSnapshot) return;
    const prevIds = new Set<string>(
      prevMenuBooksRef.current ? JSON.parse(prevMenuBooksRef.current).map((b: { id: string }) => b.id) : [],
    );
    prevMenuBooksRef.current = currentSnapshot;

    // Upsert new/changed books
    for (const book of menuBooks) {
      upsertMenuBook(book).catch(() => {});
    }
    // Delete removed books
    const currentIds = new Set(menuBooks.map((b) => b.id));
    for (const prevId of prevIds) {
      if (!currentIds.has(prevId)) {
        deleteMenuBookRemote(prevId).catch(() => {});
      }
    }
  }, [menuBooks, remoteStateReady]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-[var(--app-vh)] w-full bg-paper-base lg:justify-center lg:bg-[#E8E4DF] lg:px-4 lg:py-10">
      <div className="flex w-full max-w-none flex-col items-stretch gap-0 overflow-hidden lg:max-w-6xl lg:flex-row lg:items-start lg:gap-10">
        <aside className="hidden h-fit w-full max-w-xs rounded-[2rem] border border-border-subtle/80 bg-white/70 p-6 text-text-secondary shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur lg:block">
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
                        "mt-1 inline-flex h-3.5 w-1.5 flex-shrink-0 rounded-full",
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

        <div className="relative w-full lg:max-w-[380px]">
          <div className="flex w-full flex-1 flex-col overflow-hidden bg-paper-base lg:mx-auto lg:aspect-[375/812] lg:max-h-[calc(100vh-80px)] lg:rounded-[2.5rem] lg:border-[8px] lg:border-[#1A1A1A] lg:bg-[#1A1A1A] lg:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
            <div id="phone-screen" className="relative flex h-[var(--app-vh)] flex-col overflow-hidden bg-paper-base lg:h-full lg:rounded-[2rem]">
              <BackgroundFoodIcons />
              <div
                ref={scrollContainerRef}
                className="relative z-10 flex flex-1 min-h-0 flex-col overflow-y-auto pb-0 touch-pan-y overscroll-y-contain scroll-touch"
              >
                <div className="flex min-h-full flex-col">
                  <Header />
                  <div className="flex-1 min-h-0">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/create" element={<CreatePlanPage />} />
                      <Route path="/shopping" element={<ShoppingPage />} />
                      <Route path="/me" element={<MyPage />} />
                    </Routes>
                  </div>
                </div>
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

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const setAppHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-vh", `${height}px`);
    };

    setAppHeight();
    window.addEventListener("resize", setAppHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setAppHeight);
      window.visualViewport.addEventListener("scroll", setAppHeight);
    }

    return () => {
      window.removeEventListener("resize", setAppHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setAppHeight);
        window.visualViewport.removeEventListener("scroll", setAppHeight);
      }
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default App;
