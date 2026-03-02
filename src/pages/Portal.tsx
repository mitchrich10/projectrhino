import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Portal: FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Listen for auth state first (handles magic link callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setChecking(false);
        // Portal is ready — stay on this page
      } else if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        navigate("/partner-login");
      }
    });

    // Also check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setChecking(false);
      } else {
        // Wait briefly for magic link to resolve before redirecting
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate("/partner-login");
            else setChecking(false);
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-3">
          Partner Portal
        </h1>
        <p className="text-muted-foreground text-sm">Coming soon.</p>
      </div>
    </div>
  );
};

export default Portal;
