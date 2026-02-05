import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDraftStore } from "@/stores/useDraftStore";
import { formatCurrency } from "@/utils/helpers";
import type { UserPreferences, Difficulty } from "@/types";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  EditKeywordsModal,
  EditPreferredModal,
  EditDislikedModal,
  EditSettingsModal,
} from "@/components/profile/EditPreferencesModals";

type EditModalType = "keywords" | "preferred" | "disliked" | "settings" | null;

export function MyPage() {
  const [activeModal, setActiveModal] = useState<EditModalType>(null);

  const draftPreferences = useDraftStore((state) => {
    const { keywords, preferredItems, dislikedItems, numPeople, budget, difficulty, cookSchedule } = state;
    return { keywords, preferredItems, dislikedItems, numPeople, budget, difficulty, cookSchedule } satisfies UserPreferences;
  });

  const draftActions = useDraftStore(
    useShallow((state) => ({
      setKeywords: state.setKeywords,
      setPreferredItems: state.setPreferredItems,
      setDislikedItems: state.setDislikedItems,
      setNumPeople: state.setNumPeople,
      setBudget: state.setBudget,
      setDifficulty: state.setDifficulty,
    })),
  );

  const preferences: UserPreferences = draftPreferences;

  const applyPreferenceUpdate = (updates: Partial<UserPreferences>) => {
    const nextPreferences: UserPreferences = { ...preferences, ...updates };
    draftActions.setKeywords(nextPreferences.keywords);
    draftActions.setPreferredItems(nextPreferences.preferredItems);
    draftActions.setDislikedItems(nextPreferences.dislikedItems);
    draftActions.setNumPeople(nextPreferences.numPeople);
    draftActions.setBudget(nextPreferences.budget);
    draftActions.setDifficulty(nextPreferences.difficulty);
  };

  // Save handlers for each modal
  const handleSaveKeywords = (keywords: string[]) => {
    applyPreferenceUpdate({ keywords });
  };

  const handleSavePreferred = (items: string[]) => {
    applyPreferenceUpdate({ preferredItems: items });
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveModal("keywords")}
            className="h-8 px-2 text-accent-base hover:text-accent-base/80"
          >
            Edit
          </Button>
          </div>
        <div className="px-4 py-4">
              {renderTags(preferences.keywords, "No keywords saved yet.")}
            </div>
      </section>

      {/* Preferred Items Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Preferred Items</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveModal("preferred")}
            className="h-8 px-2 text-accent-base hover:text-accent-base/80"
          >
            Edit
          </Button>
        </div>
        <div className="px-4 py-4">
              {renderTags(preferences.preferredItems, "No preferred items saved yet.")}
            </div>
      </section>

      {/* Disliked Items Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Disliked Items</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveModal("disliked")}
            className="h-8 px-2 text-accent-base hover:text-accent-base/80"
          >
            Edit
          </Button>
        </div>
        <div className="px-4 py-4">
              {renderTags(preferences.dislikedItems, "No dislikes added yet.")}
            </div>
      </section>

      {/* Default Settings Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Default Settings</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveModal("settings")}
            className="h-8 px-2 text-accent-base hover:text-accent-base/80"
          >
            Edit
          </Button>
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
      <EditPreferredModal
        isOpen={activeModal === "preferred"}
        onClose={() => setActiveModal(null)}
        items={preferences.preferredItems}
        onSave={handleSavePreferred}
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
