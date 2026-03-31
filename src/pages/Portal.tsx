import { FC, useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Menu, X, BookOpen, Calendar, Handshake } from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
import rhinoIconBlack from "@/assets/rhino-icon-black.png";
import { companyLogos } from "@/lib/companyLogos";
import ResourcesSection from "@/components/portal/ResourcesSection";
import EventsSection from "@/components/portal/EventsSection";
import PartnershipsSection from "@/components/portal/PartnershipsSection";
import { NotificationOptIn } from "@/components/portal/OnboardingSection";
import RequestsSection from "@/components/portal/RequestsSection";
import FounderOnboardingWizard from "@/components/portal/founder-onboarding/FounderOnboardingWizard";

interface CompanyInfo {
  company_name: string;
  logo_key: string | null;
}

const Portal: FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [shareTargetStep, setShareTargetStep] = useState<number | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        navigate("/partner-login");
      }
    });

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        navigate("/partner-login");
        return;
      }

      const email = session.user.email;
      const domain = email.split("@")[1]?.toLowerCase();
      const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";

      const shareToken = searchParams.get("onboarding-share");
      if (shareToken) {
        try {
          const { data: redeemResult } = await supabase.functions.invoke("redeem-onboarding-share", {
            body: { token: shareToken, email },
          });
          if (redeemResult?.target_step) {
            setShareTargetStep(redeemResult.target_step);
          }
        } catch (e) {
          console.error("Share token redemption failed", e);
        }
        searchParams.delete("onboarding-share");
        setSearchParams(searchParams, { replace: true });
      }

      const [{ data: domainData }, { data: inviteData }] = await Promise.all([
        supabase.from("approved_domains").select("company_name, logo_key").eq("domain", domain).maybeSingle(),
        supabase.from("onboarding_invites").select("batch_id").eq("email", email.toLowerCase()).maybeSingle(),
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
      setUserName(fullName);
      setBatchId((inviteData as { batch_id?: string } | null)?.batch_id ?? null);
      setLoading(false);
    };

    init();
    return () => subscription.unsubscribe();
  }, [navigate, searchParams, setSearchParams]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/partner-login");
  };

  const logoSrc = company?.logo_key ? companyLogos[company.logo_key] : null;
  const effectiveBatchId = batchId ?? userId ?? "00000000-0000-0000-0000-000000000001";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A7EC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-foreground flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#CDD8E3]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {logoSrc ? (
              <img src={logoSrc} alt={company?.company_name} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">{company?.company_name}</span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            {isAdmin && (
              <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8] hover:opacity-70 transition-opacity">
                Admin
              </Link>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#CDD8E3] bg-white px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#CDD8E3]">
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
            {isAdmin && <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8]">Admin</Link>}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">
        {/* Hero — Navy background */}
        <div className="bg-[#173660] px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-6">
              <div>
                <img src={rhinoIconBlack} alt="Rhino logo" className="h-8 w-auto mb-6 invert" />
                <h1 className="text-3xl font-bold text-white mb-3">Welcome to the Crash</h1>
                <p className="text-sm text-white/60 max-w-xl leading-relaxed">
                  Your team's home base for Rhino partnerships, resources, and events. Get set up below so we can make sure you're plugged into everything that's relevant to you.
                </p>
              </div>
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={company?.company_name}
                  className="h-10 w-auto object-contain hidden sm:block brightness-0 invert opacity-60"
                />
              )}
            </div>

            {/* Nav cards */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <a
                href="#partnerships"
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/15 transition-all hover:shadow-lg group"
              >
                <Handshake className="w-5 h-5 text-[#1A7EC8] mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">Partnerships</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Discounts, credits, and tools available to Crash companies — from cloud infrastructure to hiring platforms.
                </p>
              </a>
              <a
                href="#resources"
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/15 transition-all hover:shadow-lg group"
              >
                <BookOpen className="w-5 h-5 text-[#1A7EC8] mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">Resources</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Templates, guides, and vendor recommendations curated by Rhino — from legal docs to hiring frameworks.
                </p>
              </a>
              <a
                href="#events"
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/15 transition-all hover:shadow-lg group"
              >
                <Calendar className="w-5 h-5 text-[#1A7EC8] mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">Events</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Upcoming founder dinners, workshops, and portfolio gatherings. Stay in the loop and connect with your peers.
                </p>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
          {userId && (
            <section id="onboarding" className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Onboarding</p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#173660]">Get set up</h2>
              </div>
              <FounderOnboardingWizard
                userId={userId}
                userEmail={userEmail}
                userName={userName}
                batchId={effectiveBatchId}
                companyName={company?.company_name ?? "Your Company"}
                targetStep={shareTargetStep}
              />
            </section>
          )}

          <div id="partnerships">
            <PartnershipsSection />
          </div>
          <div id="resources">
            <ResourcesSection />
          </div>
          <div id="events">
            <EventsSection />
          </div>
          {userId && <RequestsSection userId={userId} userEmail={userEmail} companyName={company?.company_name ?? ""} />}

          {/* Notifications */}
          {userId && (
            <section id="notifications">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8]">Settings</p>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6 pb-3 border-b border-border">
                Notifications
              </h2>
              <NotificationOptIn userId={userId} email={userEmail} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portal;
