import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

export function WelcomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously);
  const navigate = useNavigate();

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-base px-6">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft">
          <ChefHat className="h-8 w-8 text-accent-base" />
        </div>

        <h1 className="ui-title text-center text-[22px]">OMenu</h1>
        <p className="mt-2 ui-body text-center text-text-secondary">
          AI-powered weekly meal planning & smart shopping lists
        </p>

        {error && (
          <p className="mt-4 ui-caption text-center text-error">{error}</p>
        )}

        <div className="mt-10 flex w-full flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleGuest}
            disabled={loading}
          >
            {loading ? "Setting up..." : "Continue as Guest"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Sign in with Account
          </Button>
        </div>

        <p className="mt-6 ui-caption text-center text-text-tertiary">
          No sign-up required — try OMenu instantly as a guest.
        </p>
      </div>
    </div>
  );
}
