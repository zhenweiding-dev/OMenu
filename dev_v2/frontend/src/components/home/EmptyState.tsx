import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 py-20 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-border-subtle bg-paper-muted">
        <BookOpen className="h-10 w-10 text-accent-base ui-icon-strong" aria-hidden />
      </div>

      {/* Title */}
      <h2 className="mb-2 ui-title-sm">No menu yet</h2>

      {/* Subtitle */}
      <p className="mb-8 ui-body leading-relaxed">
        Create your first weekly menu
        <br />
        and let AI design your menu
      </p>

      {/* CTA Button */}
      <Button
        asChild
        size="lg"
        className="px-12"
      >
        <Link to="/create">Create Menu</Link>
      </Button>
    </div>
  );
}
