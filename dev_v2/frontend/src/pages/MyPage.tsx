import { useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDraftStore } from "@/stores/useDraftStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatCurrency } from "@/utils/helpers";
import { DISLIKE_TAGS, PREFERENCE_TAGS } from "@/utils/constants";
import type { UserPreferences, Difficulty } from "@/types";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  EditPreferredModal,
  EditDislikedModal,
  EditSettingsModal,
} from "@/components/profile/EditPreferencesModals";

type EditModalType = "preferred" | "disliked" | "settings" | null;
const TAG_ICON_MAP = new Map([...PREFERENCE_TAGS, ...DISLIKE_TAGS].map(({ label, icon }) => [label, icon]));
const getTagIcon = (label: string) => TAG_ICON_MAP.get(label) ?? Sparkles;

export function MyPage() {
  const [activeModal, setActiveModal] = useState<EditModalType>(null);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome", { replace: true });
  };

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
      return <p className="ui-body">{placeholder}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-accent-base/40 bg-accent-soft px-3 py-1.5 ui-label-soft normal-case text-accent-base"
          >
            <span className="inline-flex items-center gap-1">
              {(() => {
                const Icon = getTagIcon(item);
                return <Icon className="h-3.5 w-3.5 ui-icon" aria-hidden />;
              })()}
              <span>{item}</span>
            </span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <PageContainer className="ui-stack">
      {/* Preferences Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="ui-heading-sm">Preferences</h3>
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
        <div className="px-4 py-4">{renderTags(preferences.specificPreferences, "No preferences added yet.")}</div>
      </section>

      {/* Dislikes Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="ui-heading-sm">Dislikes</h3>
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
        <div className="px-4 py-4">{renderTags(preferences.specificDisliked, "No dislikes added yet.")}</div>
      </section>

      {/* Default Settings Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <h3 className="ui-heading-sm">Default Settings</h3>
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
            <span className="ui-body">People</span>
            <span className="ui-body-strong">{preferences.numPeople}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="ui-body">Budget</span>
            <span className="ui-body-strong">{formatCurrency(preferences.budget)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="ui-body">Difficulty</span>
            <span className="ui-body-strong">
              {preferences.difficulty.charAt(0).toUpperCase() + preferences.difficulty.slice(1)}
            </span>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
        <div className="flex flex-col gap-3 px-4 py-4">
          {user?.email && (
            <div className="flex items-center justify-between">
              <span className="ui-body">Account</span>
              <span className="ui-caption text-text-tertiary">{user.email}</span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-9 w-full justify-start gap-2 text-ink-light hover:bg-accent-base/5 hover:text-accent-base"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </section>

      {/* Edit Modals */}
      {activeModal === "preferred" && (
        <EditPreferredModal
          isOpen
          onClose={() => setActiveModal(null)}
          items={preferences.specificPreferences}
          onSave={handleSavePreferred}
        />
      )}
      {activeModal === "disliked" && (
        <EditDislikedModal
          isOpen
          onClose={() => setActiveModal(null)}
          items={preferences.specificDisliked}
          onSave={handleSaveDisliked}
        />
      )}
      {activeModal === "settings" && (
        <EditSettingsModal
          isOpen
          onClose={() => setActiveModal(null)}
          numPeople={preferences.numPeople}
          budget={preferences.budget}
          difficulty={preferences.difficulty}
          onSave={handleSaveSettings}
        />
      )}

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setIsCreditsOpen(true)}
          className="ui-caption text-text-tertiary hover:text-text-secondary"
        >
          © OMenu
        </button>
        <p className="mt-1 ui-caption text-text-tertiary">
          Gemini 3 · Lucide
        </p>
      </div>

      <Modal
        open={isCreditsOpen}
        title="Credits"
        description="Attribution for third-party services."
        onClose={() => setIsCreditsOpen(false)}
        className="max-w-sm"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-border-subtle bg-paper-muted/60 px-4 py-3">
            <p className="ui-body-strong">Gemini 3 API</p>
            <p className="ui-caption">
              Menu planning and shopping list generation are powered by Gemini 3.
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-paper-muted/60 px-4 py-3">
            <p className="ui-body-strong">Lucide</p>
            <p className="ui-caption">
              Interface icons are provided by the Lucide open-source icon set.
            </p>
          </div>
          <p className="ui-caption text-text-tertiary">
            © {new Date().getFullYear()} OMenu. All rights reserved. Third-party trademarks
            are owned by their respective owners.
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}
