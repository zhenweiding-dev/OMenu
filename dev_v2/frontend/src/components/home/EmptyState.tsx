import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 py-20 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-border-subtle bg-paper-muted">
        <span className="text-[44px]" aria-hidden>📖</span>
      </div>

      {/* Title */}
      <h2 className="mb-2 text-[20px] font-semibold text-text-primary">No menu yet</h2>

      {/* Subtitle */}
      <p className="mb-8 text-[14px] leading-relaxed text-text-secondary">
        Create your first weekly menu
        <br />
        and let AI plan your meals
      </p>

      {/* CTA Button */}
      <Button
        asChild
        className="rounded-xl bg-accent-base px-12 py-4 text-[15px] font-semibold text-white hover:bg-accent-base/90"
      >
        <Link to="/create">Create Menu</Link>
      </Button>
    </div>
  );
}
