import { FC, useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Menu, X, BookOpen, Handshake, Link2, Copy, Check, ChevronDown } from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
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
  const [isInvited, setIsInvited] = useState(false);
  const [shareTargetStep, setShareTargetStep] = useState<number | null>(null);
  const [hasEvents, setHasEvents] = useState(false);
  const [copiedPortal, setCopiedPortal] = useState(false);

  // Admin preview
  const [previewCompanies, setPreviewCompanies] = useState<{ domain: string; company_name: string }[]>([]);
  const [previewAs, setPreviewAs] = useState<string | null>(null);
  const [previewDropdownOpen, setPreviewDropdownOpen] = useState(false);

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

      const [{ data: domainData }, { data: inviteData }, { data: eventsData }] = await Promise.all([
        supabase.from("approved_domains").select("company_name, logo_key").eq("domain", domain).maybeSingle(),
        supabase.from("onboarding_invites").select("batch_id").eq("email", email.toLowerCase()).maybeSingle(),
        supabase.from("events").select("id").gte("event_date", new Date().toISOString()).limit(1),
      ]);

      setCompany(domainData ?? { company_name: "Partner", logo_key: null });
      setHasEvents((eventsData?.length ?? 0) > 0);

      if (!domainData && !email.endsWith("@rhinovc.com")) {
        await supabase.auth.signOut();
        navigate("/partner-login");
        return;
      }

      const adminUser = email.endsWith("@rhinovc.com");
      setIsAdmin(adminUser);
      setUserId(session.user.id);
      setUserEmail(email);
      setUserName(fullName);

      const hasInvite = !!(inviteData as { batch_id?: string } | null)?.batch_id;
      setIsInvited(hasInvite);
      setBatchId((inviteData as { batch_id?: string } | null)?.batch_id ?? null);

      // Load admin preview companies
      if (adminUser) {
        const { data: allDomains } = await supabase
          .from("approved_domains")
          .select("domain, company_name")
          .order("company_name");
        setPreviewCompanies((allDomains ?? []) as { domain: string; company_name: string }[]);
      }

      setLoading(false);
    };

    init();
    return () => subscription.unsubscribe();
  }, [navigate, searchParams, setSearchParams]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/partner-login");
  };

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/partner-login`);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  // Determine display company name (preview override or actual)
  const displayCompanyName = previewAs
    ? previewCompanies.find((c) => c.domain === previewAs)?.company_name ?? company?.company_name
    : company?.company_name;

  const logoSrc = company?.logo_key ? companyLogos[company.logo_key] : null;

  // Onboarding visibility: only for invited users or admins
  const showOnboarding = (isInvited && batchId) || isAdmin;

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
        <div className="bg-[#173660] px-6 py-12 relative">
          {/* Admin Preview Dropdown */}
          {isAdmin && previewCompanies.length > 0 && (
            <div className="absolute top-4 right-6 z-10">
              <div className="relative">
                <button
                  onClick={() => setPreviewDropdownOpen(!previewDropdownOpen)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Preview as {previewAs ? previewCompanies.find(c => c.domain === previewAs)?.company_name : "—"}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {previewDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#CDD8E3] max-h-64 overflow-y-auto z-20">
                    <button
                      onClick={() => { setPreviewAs(null); setPreviewDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F4F7FA] transition-colors ${!previewAs ? "font-bold text-[#1A7EC8]" : "text-[#173660]"}`}
                    >
                      Default (my view)
                    </button>
                    {previewCompanies.map((c) => (
                      <button
                        key={c.domain}
                        onClick={() => { setPreviewAs(c.domain); setPreviewDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F4F7FA] transition-colors ${previewAs === c.domain ? "font-bold text-[#1A7EC8]" : "text-[#173660]"}`}
                      >
                        {c.company_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  Welcome to the Crash{displayCompanyName && displayCompanyName !== "Partner" ? `, ${displayCompanyName}` : ""}
                </h1>
                <p className="text-sm text-white/60 max-w-xl leading-relaxed">
                  Your team's home base for Rhino partnerships, resources, and events. Get set up below so we can make sure you're plugged into everything that's relevant to you.
                </p>
                {/* Share with your team button */}
                <button
                  onClick={handleCopyPortalLink}
                  className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/50 border border-white/20 rounded-lg px-4 py-2 hover:text-white hover:border-white/40 transition-colors"
                >
                  {copiedPortal ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copiedPortal ? "Link copied!" : "Share with your team"}
                </button>
              </div>
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={company?.company_name}
                  className="h-10 w-auto object-contain hidden sm:block brightness-0 invert opacity-60"
                />
              )}
            </div>

            {/* Nav cards — only Partnerships and Resources */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
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
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
          {/* Onboarding — only for invited users or admins */}
          {showOnboarding && userId && (
            <FounderOnboardingWizard
              userId={userId}
              userEmail={userEmail}
              userName={userName}
              batchId={batchId ?? userId}
              companyName={displayCompanyName ?? "Your Company"}
              targetStep={shareTargetStep}
            />
          )}

          <div id="partnerships">
            <PartnershipsSection />
          </div>
          <div id="resources">
            <ResourcesSection />
          </div>
          {/* Events — only render if events exist */}
          {hasEvents && (
            <div id="events">
              <EventsSection />
            </div>
          )}
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
