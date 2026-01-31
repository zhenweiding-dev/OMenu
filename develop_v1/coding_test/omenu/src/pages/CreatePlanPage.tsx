import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraftStore } from '@/stores/useDraftStore';
import { useAppStore } from '@/stores/useAppStore';
import { hasMealPlanDraft } from '@/services/storage';
import { Button } from '@/components/common/Button';

// Step Components
import { StepWelcome } from '@/components/create/StepWelcome';
import { StepKeywords } from '@/components/create/StepKeywords';
import { StepMustHave } from '@/components/create/StepMustHave';
import { StepDisliked } from '@/components/create/StepDisliked';
import { StepPeopleBudget } from '@/components/create/StepPeopleBudget';
import { StepSchedule } from '@/components/create/StepSchedule';
import { StepLoading } from '@/components/create/StepLoading';
import { StepPlanOverview } from '@/components/create/StepPlanOverview';

export function CreatePlanPage() {
  const navigate = useNavigate();
  const { currentStep, loadFromStorage, resetDraft, setStep } = useDraftStore();
  const { currentPlan } = useAppStore();
  
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if there's a draft to resume
    if (hasMealPlanDraft()) {
      setShowResumePrompt(true);
    } else {
      setInitialized(true);
    }
  }, []);

  const handleContinue = () => {
    loadFromStorage();
    setShowResumePrompt(false);
    setInitialized(true);
  };

  const handleStartFresh = () => {
    resetDraft();
    setShowResumePrompt(false);
    setInitialized(true);
  };

  // Resume prompt
  if (showResumePrompt) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-5">
        <div className="bg-card rounded-card p-6 max-w-sm w-full text-center border border-divider">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-h2 text-primary-text mb-2">
            You have an unfinished plan
          </h2>
          <p className="text-body text-secondary-text mb-6">
            Continue where you left off?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleStartFresh} fullWidth>
              Start Fresh
            </Button>
            <Button onClick={handleContinue} fullWidth>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return null;
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepWelcome onNext={() => setStep(2)} />;
      case 2:
        return <StepKeywords onNext={() => setStep(3)} onBack={() => navigate('/')} />;
      case 3:
        return <StepMustHave onNext={() => setStep(4)} onBack={() => setStep(2)} />;
      case 4:
        return <StepDisliked onNext={() => setStep(5)} onBack={() => setStep(3)} />;
      case 5:
        return <StepPeopleBudget onNext={() => setStep(6)} onBack={() => setStep(4)} />;
      case 6:
        return <StepSchedule onNext={() => setStep(7)} onBack={() => setStep(5)} />;
      case 7:
        return (
          <StepLoading
            onComplete={() => setStep(8)}
            onError={() => setStep(6)}
            onGoHome={() => navigate('/')}
          />
        );
      case 8:
        return (
          <StepPlanOverview
            onComplete={() => navigate('/shopping')}
            onBack={() => navigate('/')}
          />
        );
      default:
        return <StepWelcome onNext={() => setStep(2)} />;
    }
  };

  return <div className="min-h-screen bg-paper">{renderStep()}</div>;
}
