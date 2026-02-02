import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MAX_KEYWORDS } from "@/utils/constants";

interface StepKeywordsProps {
  keywords: string[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepKeywords({ keywords, onAddKeyword, onRemoveKeyword, onNext, onBack }: StepKeywordsProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    onAddKeyword(value.trim());
    setValue("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">What themes should we focus on?</h2>
        <p className="text-sm text-slate-500">Add keywords that describe cuisines, moods, or dietary goals. This helps the AI shape recipe suggestions.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. high-protein, vegetarian, quick dinners"
          disabled={keywords.length >= MAX_KEYWORDS}
        />
        <Button type="submit" disabled={keywords.length >= MAX_KEYWORDS}>
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <Badge key={keyword} className="flex items-center gap-2">
            {keyword}
            <button
              type="button"
              onClick={() => onRemoveKeyword(keyword)}
              className="text-xs text-brand-primary/70 hover:text-brand-primary"
            >
              remove
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && <p className="text-sm text-slate-400">No keywords yet. Add up to {MAX_KEYWORDS}.</p>}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={keywords.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
