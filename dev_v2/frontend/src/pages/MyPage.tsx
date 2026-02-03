import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppStore } from "@/stores/useAppStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { formatCurrency } from "@/utils/helpers";
import type { MenuBook, UserPreferences, Difficulty } from "@/types";
import { useShallow } from "zustand/react/shallow";
import {
  EditKeywordsModal,
  EditMustHaveModal,
  EditDislikedModal,
  EditSettingsModal,
} from "@/components/profile/EditPreferencesModals";

type EditModalType = "keywords" | "mustHave" | "disliked" | "settings" | null;

export function MyPage() {
  const [activeModal, setActiveModal] = useState<EditModalType>(null);

  const menuBooks = useAppStore((state) => state.menuBooks);
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const updateMenuBook = useAppStore((state) => state.updateMenuBook);

  const draftPreferences = useDraftStore((state) => {
    const { keywords, mustHaveItems, dislikedItems, numPeople, budget, difficulty, cookSchedule } = state;
    return { keywords, mustHaveItems, dislikedItems, numPeople, budget, difficulty, cookSchedule } satisfies UserPreferences;
  });

  const draftActions = useDraftStore(
    useShallow((state) => ({
      setKeywords: state.setKeywords,
      setMustHaveItems: state.setMustHaveItems,
      setDislikedItems: state.setDislikedItems,
      setNumPeople: state.setNumPeople,
      setBudget: state.setBudget,
      setDifficulty: state.setDifficulty,
    })),
  );

  const latestBook = useMemo<MenuBook | null>(() => {
    if (menuBooks.length === 0) return null;
    return [...menuBooks].sort((a, b) => (a.mealPlan.createdAt < b.mealPlan.createdAt ? 1 : -1))[0];
  }, [menuBooks]);

  const sourcePlan = latestBook ?? currentBook;
  const preferences: UserPreferences = sourcePlan?.mealPlan.preferences ?? draftPreferences;

  const applyPreferenceUpdate = (updates: Partial<UserPreferences>) => {
    const nextPreferences: UserPreferences = { ...preferences, ...updates };
    draftActions.setKeywords(nextPreferences.keywords);
    draftActions.setMustHaveItems(nextPreferences.mustHaveItems);
    draftActions.setDislikedItems(nextPreferences.dislikedItems);
    draftActions.setNumPeople(nextPreferences.numPeople);
    draftActions.setBudget(nextPreferences.budget);
    draftActions.setDifficulty(nextPreferences.difficulty);

    if (sourcePlan) {
      updateMenuBook(sourcePlan.id, {
        mealPlan: {
          ...sourcePlan.mealPlan,
          preferences: nextPreferences,
        },
      });
    }
  };

  // Save handlers for each modal
  const handleSaveKeywords = (keywords: string[]) => {
    applyPreferenceUpdate({ keywords });
  };

  const handleSaveMustHave = (items: string[]) => {
    applyPreferenceUpdate({ mustHaveItems: items });
  };

  const handleSaveDisliked = (items: string[]) => {
    applyPreferenceUpdate({ dislikedItems: items });
  };

  const handleSaveSettings = (settings: { numPeople: number; budget: number; difficulty: Difficulty }) => {
    applyPreferenceUpdate(settings);
  };

  const renderTags = (items: string[], placeholder: string) => {
    if (items.length === 0) {
      return <p className="text-[13px] text-text-secondary">{placeholder}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent-base"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <PageContainer className="space-y-4">
      {/* Keywords Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Keywords</h3>
          <button
            type="button"
            onClick={() => setActiveModal("keywords")}
            className="text-[13px] font-medium text-accent-base hover:opacity-80"
          >
            Edit
          </button>
          </div>
        <div className="px-4 py-4">
              {renderTags(preferences.keywords, "No keywords saved yet.")}
            </div>
      </section>

      {/* Must-Have Items Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Must-Have Items</h3>
          <button
            type="button"
            onClick={() => setActiveModal("mustHave")}
            className="text-[13px] font-medium text-accent-base hover:opacity-80"
          >
            Edit
          </button>
        </div>
        <div className="px-4 py-4">
              {renderTags(preferences.mustHaveItems, "No must-have items saved yet.")}
            </div>
      </section>

      {/* Disliked Items Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Disliked Items</h3>
          <button
            type="button"
            onClick={() => setActiveModal("disliked")}
            className="text-[13px] font-medium text-accent-base hover:opacity-80"
          >
            Edit
          </button>
        </div>
        <div className="px-4 py-4">
              {renderTags(preferences.dislikedItems, "No dislikes added yet.")}
            </div>
      </section>

      {/* Default Settings Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Default Settings</h3>
          <button
            type="button"
            onClick={() => setActiveModal("settings")}
            className="text-[13px] font-medium text-accent-base hover:opacity-80"
          >
            Edit
          </button>
            </div>
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-text-secondary">People</span>
            <span className="text-[15px] font-medium text-text-primary">{preferences.numPeople}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-text-secondary">Budget</span>
            <span className="text-[15px] font-medium text-text-primary">{formatCurrency(preferences.budget)}</span>
            </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-text-secondary">Difficulty</span>
            <span className="text-[15px] font-medium text-text-primary">
              {preferences.difficulty.charAt(0).toUpperCase() + preferences.difficulty.slice(1)}
            </span>
            </div>
            </div>
      </section>

      {/* Edit Modals */}
      <EditKeywordsModal
        isOpen={activeModal === "keywords"}
        onClose={() => setActiveModal(null)}
        keywords={preferences.keywords}
        onSave={handleSaveKeywords}
      />
      <EditMustHaveModal
        isOpen={activeModal === "mustHave"}
        onClose={() => setActiveModal(null)}
        items={preferences.mustHaveItems}
        onSave={handleSaveMustHave}
      />
      <EditDislikedModal
        isOpen={activeModal === "disliked"}
        onClose={() => setActiveModal(null)}
        items={preferences.dislikedItems}
        onSave={handleSaveDisliked}
      />
      <EditSettingsModal
        isOpen={activeModal === "settings"}
        onClose={() => setActiveModal(null)}
        numPeople={preferences.numPeople}
        budget={preferences.budget}
        difficulty={preferences.difficulty}
        onSave={handleSaveSettings}
      />
    </PageContainer>
  );
}
