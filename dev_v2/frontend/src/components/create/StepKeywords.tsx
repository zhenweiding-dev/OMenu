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
  "Cooking Style": ["Quick", "Easy", "One-Pot", "Sheet Pan", "Slow Cooker", "Under 30 Min", "Meal Prep", "Weeknight"],
  "Diet & Health": ["Healthy", "Vegetarian", "Vegan", "Low-Carb", "High-Protein", "Keto", "Gluten-Free", "Dairy-Free"],
  "Cuisine": ["American", "Italian", "Mexican", "Chinese", "Japanese", "Thai", "Indian", "Korean", "Mediterranean"],
  "Other": ["Kid-Friendly", "Family-Style", "Comfort Food", "Budget-Friendly", "BBQ"],
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
    <div className="flex min-h-[calc(100vh-180px)] flex-col">
      {/* Header */}
      <div className="px-5 pb-2">
        <h2 className="text-[22px] font-semibold leading-tight text-text-primary">
          Choose some keywords for your meal plan
        </h2>
        <p className="mt-2 text-[14px] text-text-secondary">Select all that apply</p>
      </div>

      {/* Tags by category */}
      <div className="flex-1 space-y-5 px-5 pb-4">
        {Object.entries(KEYWORD_CATEGORIES).map(([category, tags]) => (
          <div key={category}>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = keywords.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleKeyword(tag)}
                    className={cn(
                      "rounded-md border px-3.5 py-2 text-[13px] transition-all",
                      isSelected
                        ? "border-border-tagSelected bg-tag-selectedBg font-medium text-accent-base"
                        : "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
              {category === "Other" && (
                <>
                  {showCustomInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value.slice(0, 20))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                        placeholder="Custom keyword"
                        autoFocus
                        className="w-32 rounded-md border border-accent-base bg-white px-3 py-2 text-[13px] outline-none"
                      />
                      <Button size="sm" onClick={handleAddCustom} className="h-9">
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowCustomInput(false)} className="h-9">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="flex items-center gap-1.5 rounded-md border border-dashed border-border-tag px-3.5 py-2 text-[13px] text-text-secondary hover:border-accent-base hover:text-accent-base"
                    >
                      <PlusIcon />
                      Add
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Back and Next */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-6 pt-4">
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 rounded-xl py-4 text-[15px] font-semibold"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 rounded-xl bg-accent-base py-4 text-[15px] font-semibold text-white hover:bg-accent-base/90"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
