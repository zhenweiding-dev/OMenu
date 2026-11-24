import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { DISLIKE_TAGS, PREFERENCE_TAGS } from "@/utils/constants";

interface StepTagPickerProps {
  title: ReactNode;
  subtitle: ReactNode;
  placeholder: string;
  selectedLabel: string;
  tags: Array<{ label: string; icon: LucideIcon }>;
  footnote?: ReactNode;
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function StepTagPicker({
  title,
  subtitle,
  placeholder,
  selectedLabel,
  tags,
  footnote,
  items,
  onAddItem,
  onRemoveItem,
  onNext,
  onBack,
}: StepTagPickerProps) {
  const [customInput, setCustomInput] = useState("");
  const iconFor = (label: string) => tags.find((tag) => tag.label === label)?.icon ?? Sparkles;

  const toggleItem = (item: string) => {
    if (items.includes(item)) {
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
          {title}
        </h2>
        <p className="mt-2 ui-body">
          {subtitle}
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
            placeholder={placeholder}
            className="flex-1 h-10"
          />
          <Button size="sm" onClick={handleAddCustom} className="h-10 px-4">
            ADD
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex-1 ui-stack px-5 pb-2">
        {items.length > 0 && (
          <div>
            <p className="mb-2 ui-label-soft text-accent-base">
              {selectedLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((tag) => {
                const Icon = iconFor(tag);
                return (
                  <button
                    key={`selected-${tag}`}
                    type="button"
                    onClick={() => toggleItem(tag)}
                    className="rounded-full border border-accent-base/40 bg-accent-soft px-2.5 py-1 ui-caption font-medium normal-case text-accent-base"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Icon className="h-3.5 w-3.5 ui-icon" aria-hidden />
                      <span>{tag}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <div className="flex flex-wrap gap-2">
            {tags.filter((tag) => !items.includes(tag.label)).map(({ label, icon: Icon }) => (
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

      {footnote}

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-paper-base px-5 pb-4 pt-3">
        <Button onClick={onNext} className="w-full">
          Next
        </Button>
      </div>
    </div>
  );
}

type StepItemsProps = Pick<StepTagPickerProps, "onAddItem" | "onRemoveItem" | "onNext" | "onBack">;

export function StepPreferred({ specificPreferences, ...props }: StepItemsProps & { specificPreferences: string[] }) {
  return (
    <StepTagPicker
      {...props}
      items={specificPreferences}
      title="I want my meals to be:"
      subtitle="Type anything! We'll handle the rest."
      placeholder="Add a preference"
      selectedLabel="Your Preferences"
      tags={PREFERENCE_TAGS}
    />
  );
}

export function StepDisliked({ specificDisliked, ...props }: StepItemsProps & { specificDisliked: string[] }) {
  return (
    <StepTagPicker
      {...props}
      items={specificDisliked}
      title="Don't include"
      subtitle="Ingredients, flavors, or anything you're just not a fan of."
      placeholder="Add something to avoid"
      selectedLabel="Your Dislikes"
      tags={DISLIKE_TAGS}
      footnote={
        <p className="px-5 pb-4 ui-caption">
          Have a severe allergy? Please make sure to double-check every recipe&apos;s ingredient list.
        </p>
      }
    />
  );
}
