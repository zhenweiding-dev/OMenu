import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 rounded-[1.5rem] border border-border-subtle bg-paper-muted/70 p-10 text-center shadow-soft">
      <h2 className="text-[20px] font-semibold text-text-primary">No meal plans yet</h2>
      <p className="text-[13px] text-text-secondary">
        Create your first weekly menu to see tailored recipes and shopping lists here.
      </p>
      <Button asChild className="px-6">
        <Link to="/create">Start Planning</Link>
      </Button>
    </div>
  );
}
