import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Difficulty } from "@/types";

// ===== Icons =====
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
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
        className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-[24px] bg-card-base shadow-2xl"
        onPointerDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-card-base px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-muted text-text-primary transition-colors hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
          {showSaveButton && (
            <button
              type="button"
              onClick={onSave}
              className="text-[14px] font-semibold text-accent-base hover:opacity-80"
            >
              Save
            </button>
          )}
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-10">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, container);
}

// ===== Keywords Modal =====
const KEYWORD_CATEGORIES = {
  "Cooking Style": ["Quick", "Easy", "One-Pot", "Healthy", "Under 30 Min", "Meal Prep"],
  "Diet & Health": ["Healthy", "Vegetarian", "Vegan", "Low-Carb", "High-Protein", "Gluten-Free"],
  "Cuisine": ["Italian", "Mexican", "Japanese", "Thai", "Chinese", "Mediterranean"],
  "Other": ["Kid-Friendly", "Comfort Food", "Budget-Friendly", "BBQ"],
};

interface EditKeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: string[];
  onSave: (keywords: string[]) => void;
}

export function EditKeywordsModal({ isOpen, onClose, keywords, onSave }: EditKeywordsModalProps) {
  const [selected, setSelected] = useState<string[]>(keywords);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(keywords);
    }
  }, [isOpen, keywords]);

  const toggleKeyword = (keyword: string) => {
    setSelected((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  };

  const handleAddCustom = () => {
    if (customInput.trim() && customInput.length <= 20) {
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Keywords" onSave={handleSave} showSaveButton={false}>
      <div className="flex min-h-[60vh] flex-col">
        <div className="flex-1 space-y-4 pb-2">
          {selected.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-base">
                Your Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((tag) => (
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
            const visibleTags = tags.filter((tag) => !selected.includes(tag));
            if (visibleTags.length === 0) return null;
            return (
              <div key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleKeyword(tag)}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-[12px] transition-all",
                        "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 border-t border-border-subtle bg-card-base pb-1 pt-3">
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border-tag py-2.5 text-[13px] font-semibold text-text-secondary hover:border-accent-base hover:text-accent-base"
              >
                <PlusIcon />
                Add keyword
              </button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
              >
                Save
              </Button>
            </div>
          )}
          {showCustomInput && (
            <Button
              onClick={handleSave}
              className="w-full rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

// ===== Must-Have Items Modal =====
const ITEM_CATEGORIES = {
  Proteins: [
    { label: "Eggs", emoji: "🥚" },
    { label: "Chicken", emoji: "🍗" },
    { label: "Beef", emoji: "🥩" },
    { label: "Shrimp", emoji: "🦐" },
  ],
  "Grains & Carbs": [
    { label: "Bread", emoji: "🍞" },
    { label: "Rice", emoji: "🍚" },
    { label: "Pasta", emoji: "🍝" },
    { label: "Potatoes", emoji: "🥔" },
  ],
  Dairy: [
    { label: "Milk", emoji: "🥛" },
    { label: "Cheese", emoji: "🧀" },
    { label: "Yogurt", emoji: "🥛" },
  ],
  Vegetables: [
    { label: "Broccoli", emoji: "🥦" },
    { label: "Carrots", emoji: "🥕" },
    { label: "Salad", emoji: "🥗" },
  ],
  "Meal Types": [
    { label: "Pizza", emoji: "🍕" },
    { label: "Tacos", emoji: "🌮" },
    { label: "Burgers", emoji: "🍔" },
    { label: "Soup", emoji: "🍜" },
  ],
  Pantry: [
    { label: "Beans", emoji: "🫘" },
    { label: "Nuts", emoji: "🥜" },
  ],
};

interface EditMustHaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onSave: (items: string[]) => void;
}

export function EditMustHaveModal({ isOpen, onClose, items, onSave }: EditMustHaveModalProps) {
  const [selected, setSelected] = useState<string[]>(items);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(items);
    }
  }, [isOpen, items]);

  const toggleItem = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustom = () => {
    if (customInput.trim() && customInput.length <= 20) {
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Must-Have Items" onSave={handleSave} showSaveButton={false}>
      <div className="flex min-h-[60vh] flex-col">
        <div className="flex-1 space-y-4 pb-2">
          {selected.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-base">
                Your Must-Haves
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((tag) => (
                  <button
                    key={`selected-${tag}`}
                    type="button"
                    onClick={() => toggleItem(tag)}
                    className="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent-base"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {Object.entries(ITEM_CATEGORIES).map(([category, categoryItems]) => {
            const visibleItems = categoryItems.filter((item) => !selected.includes(item.label));
            if (visibleItems.length === 0) return null;
            return (
              <div key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleItems.map(({ label, emoji }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleItem(label)}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-[12px] transition-all",
                        "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary",
                      )}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 border-t border-border-subtle bg-card-base pb-1 pt-3">
          {showCustomInput ? (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.slice(0, 20))}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="Custom item"
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border-tag py-2.5 text-[13px] font-semibold text-text-secondary hover:border-accent-base hover:text-accent-base"
              >
                <PlusIcon />
                Add item
              </button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
              >
                Save
              </Button>
            </div>
          )}
          {showCustomInput && (
            <Button
              onClick={handleSave}
              className="w-full rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
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
const DISLIKE_CATEGORIES = {
  "Common Allergens": [
    { label: "Peanuts", emoji: "🥜" },
    { label: "Tree Nuts", emoji: "🌰" },
    { label: "Dairy/Lactose", emoji: "🥛" },
    { label: "Gluten", emoji: "🌾" },
    { label: "Eggs", emoji: "🥚" },
    { label: "Shellfish", emoji: "🦐" },
    { label: "Fish", emoji: "🐟" },
  ],
  Vegetables: [
    { label: "Onion", emoji: "🧅" },
    { label: "Garlic", emoji: "🧄" },
    { label: "Cilantro", emoji: "🌿" },
    { label: "Mushrooms", emoji: "🍄" },
    { label: "Bell Peppers", emoji: "🫑" },
    { label: "Eggplant", emoji: "🍆" },
  ],
  Meats: [
    { label: "Pork", emoji: "🐷" },
    { label: "Red Meat", emoji: "🥩" },
  ],
  "Flavors & Textures": [
    { label: "Spicy Food", emoji: "🌶️" },
    { label: "Ginger", emoji: "🫚" },
    { label: "Coconut", emoji: "🥥" },
  ],
  "Cooking Styles": [
    { label: "Fried Food", emoji: "🛢️" },
    { label: "Butter", emoji: "🧈" },
  ],
  Other: [
    { label: "Artificial Sweeteners", emoji: "🧃" },
    { label: "High Sodium", emoji: "🧂" },
  ],
};

interface EditDislikedModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onSave: (items: string[]) => void;
}

export function EditDislikedModal({ isOpen, onClose, items, onSave }: EditDislikedModalProps) {
  const [selected, setSelected] = useState<string[]>(items);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(items);
    }
  }, [isOpen, items]);

  const toggleItem = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddCustom = () => {
    if (customInput.trim() && customInput.length <= 20) {
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Disliked Items" onSave={handleSave} showSaveButton={false}>
      <div className="flex min-h-[60vh] flex-col">
        <div className="flex-1 space-y-4 pb-2">
          {selected.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-base">
                Your Dislikes
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((tag) => (
                  <button
                    key={`selected-${tag}`}
                    type="button"
                    onClick={() => toggleItem(tag)}
                    className="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent-base"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {Object.entries(DISLIKE_CATEGORIES).map(([category, categoryItems]) => {
            const visibleItems = categoryItems.filter((item) => !selected.includes(item.label));
            if (visibleItems.length === 0) return null;
            return (
              <div key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleItems.map(({ label, emoji }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleItem(label)}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-[12px] transition-all",
                        "border-border-tag bg-transparent text-text-secondary hover:border-accent-light hover:text-text-primary",
                      )}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 border-t border-border-subtle bg-card-base pb-1 pt-3">
          {showCustomInput ? (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.slice(0, 20))}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="Custom item"
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border-tag py-2.5 text-[13px] font-semibold text-text-secondary hover:border-accent-base hover:text-accent-base"
              >
                <PlusIcon />
                Add item
              </button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
              >
                Save
              </Button>
            </div>
          )}
          {showCustomInput && (
            <Button
              onClick={handleSave}
              className="w-full rounded-xl bg-accent-base py-2.5 text-[13px] font-semibold text-white hover:bg-accent-base/90"
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

  useEffect(() => {
    if (isOpen) {
      setLocalPeople(numPeople);
      setLocalBudget(budget);
      setLocalDifficulty(difficulty);
    }
  }, [isOpen, numPeople, budget, difficulty]);

  const handleSave = () => {
    onSave({ numPeople: localPeople, budget: localBudget, difficulty: localDifficulty });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Default Settings" onSave={handleSave}>
      <div className="space-y-6">
        {/* People */}
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            Number of People
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLocalPeople(Math.max(1, localPeople - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-card-base hover:bg-paper-muted"
            >
              <MinusIcon />
            </button>
            <span className="min-w-[40px] text-center text-[20px] font-semibold text-text-primary">{localPeople}</span>
            <button
              type="button"
              onClick={() => setLocalPeople(Math.min(10, localPeople + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-card-base hover:bg-paper-muted"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Budget */}
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            Weekly Budget
          </p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLocalBudget(opt)}
                className={cn(
                  "rounded-md border px-4 py-2 text-[13px] transition-all",
                  opt === localBudget
                    ? "border-accent-orange bg-accent-orangeLight font-semibold text-accent-orange"
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
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
            Cooking Difficulty
          </p>
          <div className="flex gap-3">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLocalDifficulty(level)}
                className={cn(
                  "flex-1 rounded-lg border py-3 text-[14px] font-medium capitalize transition-all",
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
    </ModalWrapper>
  );
}
