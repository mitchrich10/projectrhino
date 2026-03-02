import { FC, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Menu, X } from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
import { companyLogos } from "@/lib/companyLogos";
import ResourcesSection from "@/components/portal/ResourcesSection";
import EventsSection from "@/components/portal/EventsSection";
import PartnershipsSection from "@/components/portal/PartnershipsSection";
import OnboardingSection from "@/components/portal/OnboardingSection";
import RequestsSection from "@/components/portal/RequestsSection";

interface CompanyInfo {
  company_name: string;
  logo_key: string | null;
}

const Portal: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isInvited, setIsInvited] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        navigate("/partner-login");
      }
    });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        navigate("/partner-login");
        return;
      }

      const email = session.user.email;
      const domain = email.split("@")[1]?.toLowerCase();

      const [{ data: domainData }, { data: inviteData }] = await Promise.all([
        supabase.from("approved_domains").select("company_name, logo_key").eq("domain", domain).maybeSingle(),
        supabase.from("onboarding_invites").select("id").eq("email", email.toLowerCase()).maybeSingle(),
      ]);

      setCompany(domainData ?? { company_name: "Partner", logo_key: null });

      if (!domainData && !email.endsWith("@rhinovc.com")) {
        await supabase.auth.signOut();
        navigate("/partner-login");
        return;
      }

      setIsAdmin(email.endsWith("@rhinovc.com"));
      setUserId(session.user.id);
      setUserEmail(email);
      setIsInvited(!!inviteData || email.endsWith("@rhinovc.com"));
      setLoading(false);
    };

    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/partner-login");
  };

  const logoSrc = company?.logo_key ? companyLogos[company.logo_key] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {logoSrc ? (
              <img src={logoSrc} alt={company?.company_name} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                {company?.company_name}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
              >
                Admin
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              {logoSrc ? (
                <img src={logoSrc} alt={company?.company_name} className="h-6 w-auto object-contain" />
              ) : (
                <span className="text-xs font-bold uppercase tracking-widest">{company?.company_name}</span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            {isAdmin && (
              <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-primary">Admin</Link>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">
        <div className="border-b border-border bg-secondary/30 px-6 py-8">
          <div className="max-w-6xl mx-auto flex items-center gap-5">
            {logoSrc && (
              <img
                src={logoSrc}
                alt={company?.company_name}
                className="h-10 w-auto object-contain hidden sm:block"
              />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                Partner Portal
              </p>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                Welcome, {company?.company_name}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
          {userId && (
            <OnboardingSection
              userId={userId}
              userEmail={userEmail}
              isInvited={isInvited}
            />
          )}

          <PartnershipsSection />
          <ResourcesSection />
          <EventsSection />
          {userId && (
            <RequestsSection
              userId={userId}
              userEmail={userEmail}
              companyName={company?.company_name ?? ""}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Portal;
