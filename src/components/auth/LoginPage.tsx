import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-base px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="ui-title text-center">Welcome back</h1>
          <p className="ui-body text-center">Sign in to your OMenu account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="ui-caption text-center text-error">{error}</p>
            )}
            <div className="space-y-2">
              <label className="ui-caption" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="ui-caption" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card-base px-3 ui-caption text-text-tertiary">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await signInAnonymously();
                navigate("/", { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Anonymous sign in failed");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Continue as Guest
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="ui-caption">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent-base hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
