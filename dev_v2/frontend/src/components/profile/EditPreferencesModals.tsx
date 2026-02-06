import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { DISLIKE_TAGS, PREFERENCE_TAGS } from "@/utils/constants";
import type { Difficulty } from "@/types";

// ===== Icons =====
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

// ===== Modal Wrapper =====
interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  showSaveButton?: boolean;
}

function ModalWrapper({ isOpen, onClose, title, children, onSave, showSaveButton = true }: ModalWrapperProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get the phone screen container for portal rendering
  const container = document.getElementById("phone-screen");
  if (!container) return null;

  const modalContent = (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/40"
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
    >
      <div
        className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-3xl bg-card-base shadow-2xl"
        onPointerDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-card-base px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </Button>
          <h2 className="ui-heading">{title}</h2>
          {showSaveButton && (
            <Button type="button" variant="ghost" size="sm" onClick={onSave} className="h-8 px-2 text-accent-base hover:text-accent-base/80">
              Save
            </Button>
          )}
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, container);
}

// ===== Preferred Items Modal =====
const PREFERENCE_ICON_MAP = new Map(PREFERENCE_TAGS.map(({ label, icon }) => [label, icon]));
const DISLIKE_ICON_MAP = new Map(DISLIKE_TAGS.map(({ label, icon }) => [label, icon]));
const getPreferenceIcon = (label: string) => PREFERENCE_ICON_MAP.get(label) ?? Sparkles;
const getDislikeIcon = (label: string) => DISLIKE_ICON_MAP.get(label) ?? Sparkles;

interface EditPreferredModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onSave: (items: string[]) => void;
}

export function EditPreferredModal({ isOpen, onClose, items, onSave }: EditPreferredModalProps) {
  const [selected, setSelected] = useState<string[]>(() => [...items]);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleItem = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustom = () => {
    if (customInput.trim() && customInput.length <= 40) {
      setSelected((prev) => [...prev, customInput.trim()]);
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Preferences" onSave={handleSave} showSaveButton={false}>
      <div className="flex flex-col">
        <div className="ui-stack pb-3">
          {selected.length > 0 && (
            <div>
              <p className="mb-2 ui-label-soft text-accent-base">
                Your Preferences
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((tag) => (
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
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_TAGS.filter((tag) => !selected.includes(tag.label)).map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleItem(label)}
                className={cn(
                  "rounded-full border border-border-tag bg-transparent px-2.5 py-1 ui-caption normal-case text-text-secondary transition-all",
                  "hover:border-accent-light hover:text-text-primary",
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

        <div className="sticky bottom-0 border-t border-border-subtle bg-card-base pb-4 pt-3">
          {showCustomInput ? (
            <div className="mb-4 flex items-center gap-2">
              <Input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.slice(0, 40))}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="Add a preference"
                autoFocus
                className="flex-1 h-9"
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
              <Button
                type="button"
                onClick={() => setShowCustomInput(true)}
                variant="outline"
                className="flex-1 gap-2 border-dashed border-border-tag bg-transparent text-text-secondary hover:border-accent-base hover:text-accent-base"
              >
                <PlusIcon />
                Add preference
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          )}
          {showCustomInput && (
            <Button
              onClick={handleSave}
              className="w-full"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

// ===== Disliked Items Modal =====

interface EditDislikedModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onSave: (items: string[]) => void;
}

export function EditDislikedModal({ isOpen, onClose, items, onSave }: EditDislikedModalProps) {
  const [selected, setSelected] = useState<string[]>(() => [...items]);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleItem = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustom = () => {
    if (customInput.trim() && customInput.length <= 40) {
      setSelected((prev) => [...prev, customInput.trim()]);
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Dislikes" onSave={handleSave} showSaveButton={false}>
      <div className="flex flex-col">
        <div className="ui-stack pb-3">
          {selected.length > 0 && (
            <div>
              <p className="mb-2 ui-label-soft text-accent-base">
                Your Dislikes
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((tag) => (
                  <button
                    key={`selected-${tag}`}
                    type="button"
                    onClick={() => toggleItem(tag)}
                    className="rounded-full border border-accent-base/40 bg-accent-soft px-2.5 py-1 ui-caption font-medium normal-case text-accent-base"
                  >
                    <span className="inline-flex items-center gap-1">
                      {(() => {
                        const Icon = getDislikeIcon(tag);
                        return <Icon className="h-3.5 w-3.5 ui-icon" aria-hidden />;
                      })()}
                      <span>{tag}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {DISLIKE_TAGS.filter((tag) => !selected.includes(tag.label)).map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleItem(label)}
                className={cn(
                  "rounded-full border border-border-tag bg-transparent px-2.5 py-1 ui-caption normal-case text-text-secondary transition-all",
                  "hover:border-accent-light hover:text-text-primary",
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

        <div className="sticky bottom-0 border-t border-border-subtle bg-card-base pb-4 pt-3">
          {showCustomInput ? (
            <div className="mb-4 flex items-center gap-2">
              <Input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.slice(0, 40))}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="Add a dislike"
                autoFocus
                className="flex-1 h-9"
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
              <Button
                type="button"
                onClick={() => setShowCustomInput(true)}
                variant="outline"
                className="flex-1 gap-2 border-dashed border-border-tag bg-transparent text-text-secondary hover:border-accent-base hover:text-accent-base"
              >
                <PlusIcon />
                Add dislike
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          )}
          {showCustomInput && (
            <Button
              onClick={handleSave}
              className="w-full"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

// ===== Settings Modal =====
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const BUDGET_OPTIONS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500];

interface EditSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  numPeople: number;
  budget: number;
  difficulty: Difficulty;
  onSave: (settings: { numPeople: number; budget: number; difficulty: Difficulty }) => void;
}

export function EditSettingsModal({ isOpen, onClose, numPeople, budget, difficulty, onSave }: EditSettingsModalProps) {
  const [localPeople, setLocalPeople] = useState(numPeople);
  const [localBudget, setLocalBudget] = useState(budget);
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);

  const handleSave = () => {
    onSave({ numPeople: localPeople, budget: localBudget, difficulty: localDifficulty });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Default Settings"
      onSave={handleSave}
      showSaveButton={false}
    >
      <div className="flex flex-col">
        <div className="ui-stack-lg pb-3">
          {/* People */}
          <div>
            <p className="mb-3 ui-label-soft text-text-secondary">
              Number of People
            </p>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setLocalPeople(Math.max(1, localPeople - 1))}
                className="h-10 w-10 rounded-full"
              >
                <MinusIcon />
              </Button>
              <span className="min-w-[40px] text-center ui-title-sm">{localPeople}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setLocalPeople(Math.min(10, localPeople + 1))}
                className="h-10 w-10 rounded-full"
              >
                <PlusIcon />
              </Button>
            </div>
          </div>

          {/* Budget */}
          <div>
            <p className="mb-3 ui-label-soft text-text-secondary">
              Weekly Budget
            </p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLocalBudget(opt)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[12px] font-medium transition-all",
                    opt === localBudget
                      ? "border-accent-base bg-accent-soft font-semibold text-accent-base"
                      : "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary"
                  )}
                >
                  ${opt}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="mb-3 ui-label-soft text-text-secondary">
              Cooking Difficulty
            </p>
            <div className="flex gap-3">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLocalDifficulty(level)}
                  className={cn(
                    "flex-1 rounded-full border px-4 py-2 text-[12px] font-semibold capitalize transition-all",
                    level === localDifficulty
                      ? "border-accent-base bg-accent-base text-white"
                      : "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border-subtle bg-card-base pb-4 pt-3">
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
