import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation, Logo } from "@/components/Navigation";
import { RhinoButton } from "@/components/RhinoButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type Step = "email" | "sent";

const PartnerLogin: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
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
                  Enter your work email and we'll send you a magic link to sign in — no password required.
                </p>
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
