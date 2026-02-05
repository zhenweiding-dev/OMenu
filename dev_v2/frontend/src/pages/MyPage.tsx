import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDraftStore } from "@/stores/useDraftStore";
import { formatCurrency } from "@/utils/helpers";
import { DISLIKE_TAGS, PREFERENCE_TAGS } from "@/utils/constants";
import type { UserPreferences, Difficulty } from "@/types";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  EditPreferredModal,
  EditDislikedModal,
  EditSettingsModal,
} from "@/components/profile/EditPreferencesModals";

type EditModalType = "preferred" | "disliked" | "settings" | null;
const TAG_ICON_MAP = new Map([...PREFERENCE_TAGS, ...DISLIKE_TAGS].map(({ label, icon }) => [label, icon]));
const getTagIcon = (label: string) => TAG_ICON_MAP.get(label) ?? "✨";

export function MyPage() {
  const [activeModal, setActiveModal] = useState<EditModalType>(null);

  const draftPreferences = useDraftStore((state) => {
    const { specificPreferences, specificDisliked, numPeople, budget, difficulty, cookSchedule } = state;
    return { specificPreferences, specificDisliked, numPeople, budget, difficulty, cookSchedule } satisfies UserPreferences;
  });

  const draftActions = useDraftStore(
    useShallow((state) => ({
      setSpecificPreferences: state.setSpecificPreferences,
      setSpecificDisliked: state.setSpecificDisliked,
      setNumPeople: state.setNumPeople,
      setBudget: state.setBudget,
      setDifficulty: state.setDifficulty,
    })),
  );

  const preferences: UserPreferences = draftPreferences;

  const applyPreferenceUpdate = (updates: Partial<UserPreferences>) => {
    const nextPreferences: UserPreferences = { ...preferences, ...updates };
    draftActions.setSpecificPreferences(nextPreferences.specificPreferences);
    draftActions.setSpecificDisliked(nextPreferences.specificDisliked);
    draftActions.setNumPeople(nextPreferences.numPeople);
    draftActions.setBudget(nextPreferences.budget);
    draftActions.setDifficulty(nextPreferences.difficulty);
  };

  // Save handlers for each modal
  const handleSavePreferred = (items: string[]) => {
    applyPreferenceUpdate({ specificPreferences: items });
  };

  const handleSaveDisliked = (items: string[]) => {
    applyPreferenceUpdate({ specificDisliked: items });
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
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">{getTagIcon(item)}</span>
              <span>{item}</span>
            </span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <PageContainer className="space-y-4">
      {/* Preferences Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Preferences</h3>
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
              {renderTags(preferences.specificPreferences, "No preferences added yet.")}
            </div>
      </section>

      {/* Dislikes Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">Dislikes</h3>
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
              {renderTags(preferences.specificDisliked, "No dislikes added yet.")}
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
      <EditPreferredModal
        isOpen={activeModal === "preferred"}
        onClose={() => setActiveModal(null)}
        items={preferences.specificPreferences}
        onSave={handleSavePreferred}
      />
      <EditDislikedModal
        isOpen={activeModal === "disliked"}
        onClose={() => setActiveModal(null)}
        items={preferences.specificDisliked}
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
