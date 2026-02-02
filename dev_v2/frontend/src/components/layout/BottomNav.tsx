import { BookOpen, ListChecks, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const navItems = [
  { to: "/", label: "Plan", icon: BookOpen },
  { to: "/shopping", label: "List", icon: ListChecks },
  { to: "/my", label: "Me", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-paper-base/95 backdrop-blur">
      <ul className="flex items-center justify-around px-6 pb-6 pt-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  isActive ? "text-accent-base" : "text-text-disabled hover:text-text-secondary",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
