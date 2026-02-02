import { Loader2 } from "lucide-react";

export function StepLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Generating your plan</h2>
        <p className="text-sm text-slate-500">We&apos;re crafting recipes and a shopping list. This usually takes less than a minute.</p>
      </div>
    </div>
  );
}
