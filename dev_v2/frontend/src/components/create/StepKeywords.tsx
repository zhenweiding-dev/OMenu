import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface StepKeywordsProps {
  keywords: string[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const KEYWORD_CATEGORIES = {
  "Cooking Style": ["Quick", "Easy", "One-Pot", "Healthy", "Under 30 Min", "Meal Prep"],
  "Diet & Health": ["Healthy", "Vegetarian", "Vegan", "Low-Carb", "High-Protein", "Gluten-Free"],
  "Cuisine": ["Italian", "Mexican", "Japanese", "Thai", "Chinese", "Mediterranean"],
  "Other": ["Kid-Friendly", "Comfort Food", "Budget-Friendly", "BBQ"],
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function StepKeywords({ keywords, onAddKeyword, onRemoveKeyword, onNext, onBack }: StepKeywordsProps) {
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleKeyword = (keyword: string) => {
    if (keywords.includes(keyword)) {
      onRemoveKeyword(keyword);
    } else {
      onAddKeyword(keyword);
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim() && customInput.length <= 20) {
      onAddKeyword(customInput.trim());
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-text-secondary hover:text-text-primary"
        >
          ← Back
        </button>
        <h2 className="text-[22px] font-semibold leading-tight text-text-primary">
          Choose some keywords for your meal plan
        </h2>
      </div>

      {/* Tags by category */}
      <div className="flex-1 space-y-4 px-5 pb-2">
        {keywords.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-base">
              Your Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((tag) => (
                <button
                  key={`selected-${tag}`}
                  type="button"
                  onClick={() => toggleKeyword(tag)}
                  className="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent-base"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        {Object.entries(KEYWORD_CATEGORIES).map(([category, tags]) => {
          const visibleTags = tags.filter((tag) => !keywords.includes(tag));
          if (visibleTags.length === 0) return null;
          return (
          <div key={category}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag) => {
                const isSelected = keywords.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleKeyword(tag)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-[12px] transition-all",
                      isSelected
                        ? "border-border-tagSelected bg-tag-selectedBg font-medium text-accent-base"
                        : "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        );
        })}
      </div>

      {/* Footer with Back and Next */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-1 pt-3">
        {showCustomInput ? (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.slice(0, 20))}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
              placeholder="Custom keyword"
              autoFocus
              className="flex-1 rounded-md border border-accent-base bg-white px-3 py-2 text-[13px] outline-none"
            />
            <Button size="sm" onClick={handleAddCustom} className="h-9">
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCustomInput(false)} className="h-9">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="mb-4 flex gap-3">
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-tag py-2.5 text-[13px] font-semibold text-text-secondary hover:border-accent-base hover:text-accent-base"
            >
              <PlusIcon />
              Add keyword
            </button>
            <Button
              onClick={onNext}
              className="flex-1 rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
            >
              Next
            </Button>
          </div>
        )}
        {showCustomInput && (
          <Button
            onClick={onNext}
            className="w-full rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
