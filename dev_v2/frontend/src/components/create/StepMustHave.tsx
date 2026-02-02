import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MAX_MUST_HAVE_ITEMS } from "@/utils/constants";

interface StepMustHaveProps {
  mustHaveItems: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepMustHave({ mustHaveItems, onAddItem, onRemoveItem, onNext, onBack }: StepMustHaveProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    onAddItem(value.trim());
    setValue("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Must-have ingredients</h2>
        <p className="text-sm text-slate-500">List ingredients or dishes you definitely want included this week.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. chicken breast, salmon, tofu"
          disabled={mustHaveItems.length >= MAX_MUST_HAVE_ITEMS}
        />
        <Button type="submit" disabled={mustHaveItems.length >= MAX_MUST_HAVE_ITEMS}>
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {mustHaveItems.map((item) => (
          <Badge key={item} className="flex items-center gap-2">
            {item}
            <button
              type="button"
              onClick={() => onRemoveItem(item)}
              className="text-xs text-brand-primary/70 hover:text-brand-primary"
            >
              remove
            </button>
          </Badge>
        ))}
        {mustHaveItems.length === 0 && <p className="text-sm text-slate-400">Optional: add up to {MAX_MUST_HAVE_ITEMS} items.</p>}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
