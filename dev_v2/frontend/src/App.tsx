import { useEffect, useRef } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { CreatePlanPage } from "@/pages/CreatePlanPage";
import { ShoppingPage } from "@/pages/ShoppingPage";
import { MyPage } from "@/pages/MyPage";
import { RecipeDetailModal } from "@/components/home/RecipeDetailModal";
import { useBackendSync } from "@/hooks/useBackendSync";

function App() {
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use the centralized backend sync hook - all data comes from backend
  useBackendSync();

  // Scroll to top on route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const outlineItems = [
    { to: "/create", label: "Create", description: "Start a new menu" },
    { to: "/", label: "Menu", description: "Weekly menus" },
    { to: "/shopping", label: "Shopping", description: "List & groceries" },
    { to: "/me", label: "Profile", description: "Account & settings" },
  ];

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

        <div className="relative w-full max-w-[380px]">
          <div className="mx-auto flex aspect-[375/812] w-full max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-[2.5rem] border-[8px] border-[#1A1A1A] bg-[#1A1A1A] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
            <div id="phone-screen" className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-paper-base">
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
