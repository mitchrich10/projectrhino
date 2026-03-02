import { FC, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Navigation } from "@/components/Navigation";
import { RhinoButton } from "@/components/RhinoButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

type Step = "email" | "sent";

const PartnerLogin: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to portal
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/portal");
    });

    // Listen for magic link callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/portal");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result?.error) {
      setError("Google sign-in failed. Please try again or use a magic link.");
      setGoogleLoading(false);
    }
    // On success the auth state change listener will redirect to /portal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Validate domain
      const { data: validationData, error: fnError } = await supabase.functions.invoke(
        "validate-domain-signup",
        { body: { email } }
      );

      if (fnError) throw new Error("Unable to verify your email. Please try again.");

      if (!validationData?.allowed) {
        setError(
          validationData?.error ||
            "Your company isn't registered yet. Please contact Rhino Ventures."
        );
        setIsLoading(false);
        return;
      }

      // Step 2: Send magic link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
        },
      });

      if (authError) throw authError;

      setStep("sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation variant="light" />

      <main className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-md">
          {step === "email" ? (
            <>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                  Partner Portal
                </p>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-tight">
                  Sign In
                </h1>
                <p className="text-muted-foreground mt-3 text-sm">
                  Use your work Google account or enter your email for a magic link.
                </p>
              </div>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-border rounded-lg px-4 py-3 bg-white hover:bg-secondary/30 transition-colors text-sm font-semibold text-foreground disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? "Signing in…" : "Continue with Google"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">
                    Work Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="you@yourcompany.com"
                    required
                    disabled={isLoading}
                    className="bg-white border-border focus:border-primary"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <RhinoButton type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    "Send Magic Link"
                  )}
                </RhinoButton>
              </form>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Not a portfolio company?{" "}
                  <Link to="/contact" className="text-primary font-semibold hover:underline">
                    Contact us
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-3">
                Check Your Email
              </h1>
              <p className="text-muted-foreground text-sm mb-2">
                We sent a magic link to
              </p>
              <p className="font-bold text-foreground mb-6">{email}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Click the link in the email to sign in. It expires in 1 hour.
              </p>
              <button
                onClick={() => { setStep("email"); setError(null); }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="w-3 h-3" />
                Use a different email
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PartnerLogin;
