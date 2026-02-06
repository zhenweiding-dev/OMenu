import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { Sparkles } from "lucide-react";
import { PREFERENCE_TAGS } from "@/utils/constants";

interface StepPreferredProps {
  specificPreferences: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PREFERENCE_ICON_MAP = new Map(PREFERENCE_TAGS.map(({ label, icon }) => [label, icon]));
const getPreferenceIcon = (label: string) => PREFERENCE_ICON_MAP.get(label) ?? Sparkles;

export function StepPreferred({ specificPreferences, onAddItem, onRemoveItem, onNext, onBack }: StepPreferredProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleItem = (item: string) => {
    if (specificPreferences.includes(item)) {
      onRemoveItem(item);
    } else {
      onAddItem(item);
    }
  };

  const handleAddCustom = () => {
    const value = customInput.trim();
    if (value && value.length <= 40) {
      onAddItem(value);
      setCustomInput("");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-5 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 h-auto px-0 py-0 ui-label-soft text-text-secondary hover:text-text-primary"
        >
          ← Back
        </Button>
        <h2 className="ui-title">
          I want my meals to be:
        </h2>
        <p className="mt-2 ui-body">
          Type anything! We&apos;ll handle the rest.
        </p>
      </div>

      {/* Input */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value.slice(0, 40))}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            placeholder="Add a preference"
            className="flex-1 h-10"
          />
          <Button size="sm" onClick={handleAddCustom} className="h-10 px-4">
            ADD
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex-1 ui-stack px-5 pb-2">
        {specificPreferences.length > 0 && (
          <div>
            <p className="mb-2 ui-label-soft text-accent-base">
              Your Preferences
            </p>
            <div className="flex flex-wrap gap-2">
              {specificPreferences.map((tag) => (
                <button
                  key={`selected-${tag}`}
                  type="button"
                  onClick={() => toggleItem(tag)}
                  className="rounded-full border border-accent-base/40 bg-accent-soft px-2.5 py-1 ui-caption font-medium normal-case text-accent-base"
                >
                  <span className="inline-flex items-center gap-1">
                    {(() => {
                      const Icon = getPreferenceIcon(tag);
                      return <Icon className="h-3.5 w-3.5 ui-icon" aria-hidden />;
                    })()}
                    <span>{tag}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_TAGS.filter((tag) => !specificPreferences.includes(tag.label)).map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleItem(label)}
                className={cn(
                  "rounded-full border border-border-tag bg-transparent px-2.5 py-1 ui-caption normal-case text-text-secondary transition-all",
                  "hover:border-accent-light hover:text-text-primary"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <Icon className="h-3.5 w-3.5 ui-icon" aria-hidden />
                  <span>{label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with Back and Next */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-4 pt-3">
        <Button onClick={onNext} className="w-full">
          Next
        </Button>
      </div>
    </div>
  );
}
