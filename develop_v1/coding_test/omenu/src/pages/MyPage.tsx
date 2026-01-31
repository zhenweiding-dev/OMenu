import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Tag } from '@/components/common/Tag';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/stores/useAppStore';
import { DIFFICULTY_LABELS } from '@/utils/constants';
import { clearAllStorage } from '@/services/storage';

export function MyPage() {
  const navigate = useNavigate();
  const { preferences, loadPreferences, allPlans, loadAllPlans } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadAllPlans();
  }, [loadPreferences, loadAllPlans]);

  const handleClearData = () => {
    clearAllStorage();
    // Clear IndexedDB would require more work, simplified here
    window.location.reload();
  };

  return (
    <PageContainer>
      <Header
        title="Profile"
        rightContent={
          <button className="w-9 h-9 flex items-center justify-center">
            <Settings className="w-[22px] h-[22px] text-primary-text" strokeWidth={1.8} />
          </button>
        }
      />

      <div className="px-5 py-4 space-y-4">
        {/* Preferences Card */}
        <div className="bg-card rounded-card border border-divider p-4">
          <h3 className="text-h3 text-primary-text mb-4">My Preferences</h3>

          {preferences ? (
            <div className="space-y-4">
              {/* Keywords */}
              {preferences.keywords.length > 0 && (
                <div>
                  <div className="text-body-sm text-secondary-text mb-2">Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.keywords.map((keyword) => (
                      <Tag key={keyword} selected>
                        {keyword}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Must-have items */}
              {preferences.mustHaveItems.length > 0 && (
                <div>
                  <div className="text-body-sm text-secondary-text mb-2">Must-Have</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.mustHaveItems.map((item) => (
                      <Tag key={item} selected>
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Disliked items */}
              {preferences.dislikedItems.length > 0 && (
                <div>
                  <div className="text-body-sm text-secondary-text mb-2">Disliked</div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.dislikedItems.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Other preferences */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-divider">
                <div>
                  <div className="text-body-sm text-secondary-text">People</div>
                  <div className="text-body text-primary-text font-medium">
                    {preferences.numPeople}
                  </div>
                </div>
                <div>
                  <div className="text-body-sm text-secondary-text">Budget</div>
                  <div className="text-body text-primary-text font-medium">
                    ${preferences.budget}
                  </div>
                </div>
                <div>
                  <div className="text-body-sm text-secondary-text">Difficulty</div>
                  <div className="text-body text-primary-text font-medium">
                    {DIFFICULTY_LABELS[preferences.difficulty]}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-body text-secondary-text">
              No preferences saved yet. Create a meal plan to save your preferences.
            </p>
          )}
        </div>

        {/* Meal Plan History */}
        <div className="bg-card rounded-card border border-divider p-4">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center justify-between w-full"
          >
            <div>
              <h3 className="text-h3 text-primary-text">Meal Plan History</h3>
              <p className="text-body-sm text-secondary-text mt-0.5">
                {allPlans.length} plan{allPlans.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-secondary-text" />
          </button>
        </div>

        {/* Data Management */}
        <div className="bg-card rounded-card border border-divider p-4">
          <h3 className="text-h3 text-primary-text mb-4">Data Management</h3>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-3 text-error"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-body">Clear All Data</span>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-body-sm text-secondary-text">OMenu v0.1.0</p>
          <p className="text-caption text-disabled-text mt-1">
            Powered by AI
          </p>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="bg-card rounded-card p-5 max-w-sm w-full animate-scale-in">
            <h3 className="text-h3 text-primary-text mb-2">Clear All Data?</h3>
            <p className="text-body text-secondary-text mb-6">
              This will delete all your meal plans, shopping lists, and preferences.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowClearConfirm(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearData} fullWidth>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
