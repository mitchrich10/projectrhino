import { FC, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, CheckCircle2, Plus, Trash2, Upload, X,
  BookOpen, Calendar, Handshake, ArrowRight, Copy, Check, Send, Link2, UserPlus, Users
} from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
import rhinoLogoWhite from "@/assets/rhino-logo-white.png";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TeamMember {
  name: string;
  title: string;
  email: string;
}

const NEEDS_OPTIONS = [
  { value: "Hiring key roles", label: "Hiring key roles", contextPrompt: "What roles are you looking to fill?" },
  { value: "Setting up or improving board reporting", label: "Board reporting", contextPrompt: "Where are you at today? (e.g., no current reporting, informal updates, looking to formalize)" },
  { value: "Exploring cloud/AI credits", label: "Cloud / AI credits", contextPrompt: "Which platforms are you most interested in? (e.g., AWS, GCP, Azure, OpenAI)" },
  { value: "Financial modelling or forecasting", label: "Financial modelling", contextPrompt: "What are you trying to model? (e.g., unit economics, fundraising projections, pricing)" },
  { value: "Fundraising prep (next round)", label: "Fundraising prep", contextPrompt: "What stage and timeline are you thinking? (e.g., Series A in 12 months)" },
  { value: "Legal/compliance structuring", label: "Legal / compliance", contextPrompt: "What's the focus? (e.g., corporate restructuring, employment law, IP protection)" },
  { value: "Sales/marketing infrastructure", label: "Sales / marketing", contextPrompt: "What are you looking to build or improve? (e.g., CRM setup, demand gen, brand strategy)" },
  { value: "Other", label: "Other", contextPrompt: "Please describe…" },
];

const emptyMember = (): TeamMember => ({ name: "", title: "", email: "" });

// ── Welcome / Portal Overview ─────────────────────────────────────────────────
const WelcomeOverview: FC = () => (
  <div className="mb-10">
    {/* Navy hero */}
    <div className="bg-[#173660] rounded-xl px-8 py-10 mb-8 -mx-2">
      <div className="flex items-center gap-4 mb-4">
        <img src={rhinoLogoWhite} alt="Rhino" className="h-8 w-auto opacity-80" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-2">
        The Crash
      </p>
      <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
        Welcome to the Crash
      </h1>
      <p className="text-sm text-white/60 max-w-xl leading-relaxed">
        Your team's home base for Rhino partnerships, resources, and events. Get set up below so we can make sure you're plugged into everything that's relevant to you.
      </p>
    </div>

    {/* Nav cards */}
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-white border border-[#CDD8E3] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
        <Handshake className="w-5 h-5 text-[#1A7EC8] mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#173660] mb-1">Partnerships</p>
        <p className="text-xs text-[#173660]/50 leading-relaxed">Discounts, credits, and tools available to Crash companies — from cloud infrastructure to hiring platforms.</p>
      </div>
      <div className="bg-white border border-[#CDD8E3] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
        <BookOpen className="w-5 h-5 text-[#1A7EC8] mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#173660] mb-1">Resources</p>
        <p className="text-xs text-[#173660]/50 leading-relaxed">Templates, guides, and vendor recommendations curated by Rhino — from legal docs to hiring frameworks.</p>
      </div>
      <div className="bg-white border border-[#CDD8E3] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
        <Calendar className="w-5 h-5 text-[#1A7EC8] mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#173660] mb-1">Events</p>
        <p className="text-xs text-[#173660]/50 leading-relaxed">Upcoming founder dinners, workshops, and portfolio gatherings. Stay in the loop and connect with your peers.</p>
      </div>
    </div>
  </div>
);

// ── Share Portal Access — two mechanisms ─────────────────────────────────────
const SharePortalAccess: FC<{ companyName: string; userEmail: string }> = ({ companyName, userEmail }) => {
  const portalUrl = `${window.location.origin}/partner-login`;
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<{ email: string; success: boolean }[] | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  const handleSendInvites = async () => {
    const emails = emailInput.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setSending(true); setSendError(null); setSendResults(null);

    const { data, error } = await supabase.functions.invoke("send-portal-invite", {
      body: { emails, senderName: userEmail, companyName, portalUrl },
    });

    if (error) {
      setSendError("Failed to send invites. Please try again.");
    } else {
      setSendResults(data.results);
      setEmailInput("");
    }
    setSending(false);
  };

  return (
    <div className="mt-10 space-y-4">
      {/* Share portal with team */}
      <div className="border border-[#CDD8E3] rounded-xl p-6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="w-4 h-4 text-[#1A7EC8]" />
          <p className="text-sm font-bold text-[#173660]">Share portal with your team</p>
        </div>
        <p className="text-xs text-[#173660]/50 mb-4 leading-relaxed">
          Anyone on your company's Google domain can access the full portal — partnerships, resources, and events. Share the link directly or send invites below.
        </p>

        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 bg-[#F4F7FA] border border-[#CDD8E3] rounded-lg px-3 py-2 text-xs font-mono text-[#173660]/60 truncate">
            {portalUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#1A7EC8] text-white text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-[#173660] transition-colors flex-shrink-0"
          >
            {copiedPortal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPortal ? "Copied!" : "Copy"}
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#173660]/50 mb-2">
            Or send an email invite
          </label>
          <textarea
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            rows={2}
            placeholder={"colleague@yourcompany.com"}
            className="w-full bg-[#F4F7FA] border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm text-[#173660] placeholder:text-[#173660]/30 resize-none mb-2"
          />
          <button
            onClick={handleSendInvites}
            disabled={sending || !emailInput.trim()}
            className="flex items-center gap-2 bg-[#1A7EC8] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#173660] transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? "Sending…" : "Send Invites"}
          </button>

          {sendError && <p className="text-xs text-destructive mt-2">{sendError}</p>}
          {sendResults && (
            <div className="mt-3 space-y-1">
              {sendResults.map((r) => (
                <div key={r.email} className={`flex items-center gap-2 text-xs ${r.success ? "text-[#a3d7c2]" : "text-destructive"}`}>
                  {r.success ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="font-mono">{r.email}</span>
                  {r.success && <span className="text-[#173660]/40">— invite sent</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Thank You Screen ───────────────────────────────────────────────────────────
const ThankYou: FC<{ companyName: string; userEmail: string }> = ({ companyName, userEmail }) => (
  <div className="py-12">
    <div className="text-center mb-10">
      <CheckCircle2 className="w-16 h-16 text-[#a3d7c2] mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-[#173660] mb-3">
        You're all set!
      </h2>
      <p className="text-sm text-[#173660]/60 mb-8 max-w-md mx-auto leading-relaxed">
        Thanks for getting set up. The Rhino team will review and reach out shortly. In the meantime, explore the portal.
      </p>
      <Link
        to="/portal"
        className="inline-flex items-center gap-2 bg-[#1A7EC8] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-[#173660] transition-colors"
      >
        Go to Portal <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
    <SharePortalAccess companyName={companyName} userEmail={userEmail} />
  </div>
);

// ── Main Onboarding Page ───────────────────────────────────────────────────────
const OnboardingPage: FC = () => {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Form state
  const [brandAssets, setBrandAssets] = useState<File[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([emptyMember()]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [needsContext, setNeedsContext] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [logoPermission, setLogoPermission] = useState<boolean | null>(null);
  const [announcingRaise, setAnnouncingRaise] = useState<string | null>(null);
  const [wantsRhinoAssistance, setWantsRhinoAssistance] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/partner-login");
        return;
      }

      const email = session.user.email ?? "";
      const domain = email.split("@")[1]?.toLowerCase();
      setUserId(session.user.id);
      setUserEmail(email);

      const [{ data: domainData }, { data: existingSubmission }] = await Promise.all([
        supabase.from("approved_domains").select("company_name").eq("domain", domain).maybeSingle(),
        supabase.from("onboarding_submissions").select("id").eq("user_id", session.user.id).maybeSingle(),
      ]);

      setCompanyName(domainData?.company_name ?? "Your Company");
      if (existingSubmission) setAlreadySubmitted(true);
      setAuthLoading(false);
    };

    init();
  }, [navigate]);

  const handleBrandAssetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBrandAssets((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...files.filter((f) => !names.has(f.name))];
    });
    e.target.value = "";
  };

  const removeBrandAsset = (name: string) =>
    setBrandAssets((prev) => prev.filter((f) => f.name !== name));

  const updateMember = (idx: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const addMember = () => setTeamMembers((prev) => [...prev, emptyMember()]);

  const removeMember = (idx: number) => {
    if (teamMembers.length === 1) return;
    setTeamMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleNeed = (value: string) => {
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setError(null);

    const validMembers = teamMembers.filter((m) => m.name.trim());
    if (validMembers.length === 0) {
      setError("Please add at least one team member.");
      return;
    }

    setSubmitting(true);

    try {
      let logoPath: string | null = null;
      for (const asset of brandAssets) {
        const ext = asset.name.split(".").pop();
        const path = `${userId}-${Date.now()}-${asset.name.replace(/[^a-zA-Z0-9._-]/g, "_")}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(path, asset, { upsert: true });
        if (uploadError) throw new Error(`Asset upload failed: ${uploadError.message}`);
        if (!logoPath) logoPath = path;
      }

      const finalNeeds = needs.filter((n) => n !== "Other");
      const otherContext = needsContext["Other"];
      if (needs.includes("Other") && otherContext?.trim()) {
        finalNeeds.push(`Other: ${otherContext.trim()}`);
      } else if (needs.includes("Other")) {
        finalNeeds.push("Other");
      }

      const { error: insertError } = await supabase.from("onboarding_submissions").insert({
        user_id: userId,
        user_email: userEmail,
        company_name: companyName,
        logo_path: logoPath,
        team_members: validMembers as unknown as never,
        needs: finalNeeds,
        needs_other: otherContext?.trim() || null,
        additional_notes: additionalNotes.trim() || null,
      } as never);

      if (insertError) throw new Error(insertError.message);

      await supabase.functions.invoke("send-onboarding-submission", {
        body: {
          companyName,
          userEmail,
          teamMembers: validMembers,
          needs: finalNeeds,
          additionalNotes: additionalNotes.trim() || null,
          logoPermission,
          announcingRaise,
          wantsRhinoSupport: wantsRhinoAssistance,
        },
      }).catch(() => {});

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A7EC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-foreground flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#CDD8E3]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
          </Link>
          <Link
            to="/portal"
            className="text-xs font-bold uppercase tracking-widest text-[#173660]/50 hover:text-[#173660] transition-colors"
          >
            Back to Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-20">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <WelcomeOverview />

          {submitted || alreadySubmitted ? (
            <ThankYou companyName={companyName} userEmail={userEmail} />
          ) : (
            <>
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Get set up</p>
                <h2 className="text-xl font-bold text-[#173660]">
                  Tell us about {companyName}
                </h2>
              </div>

              <div className="space-y-10">
                {/* Brand Assets */}
                <div className="bg-white border border-[#CDD8E3] border-l-4 border-l-[#1A7EC8] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Branding</p>
                  <label className="block text-sm font-bold text-[#173660] mb-1">
                    Brand Assets
                  </label>
                  <p className="text-xs text-[#173660]/50 mb-4">Upload your logo, brand kit, or any other brand assets (PNG, SVG, JPG, PDF, ZIP — up to 50 MB each).</p>
                  {brandAssets.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {brandAssets.map((file) => (
                        <div key={file.name} className="flex items-center gap-3 border border-[#CDD8E3] rounded-lg px-3 py-2 bg-[#F4F7FA]">
                          {file.type.startsWith("image/") ? (
                            <img src={URL.createObjectURL(file)} alt={file.name} className="h-8 w-8 object-contain rounded bg-white flex-shrink-0" />
                          ) : (
                            <div className="h-8 w-8 flex items-center justify-center bg-[#CDD8E3]/30 rounded flex-shrink-0">
                              <Upload className="w-3.5 h-3.5 text-[#173660]/40" />
                            </div>
                          )}
                          <span className="text-xs text-[#173660] flex-1 truncate">{file.name}</span>
                          <span className="text-[10px] text-[#173660]/40 flex-shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                          <button onClick={() => removeBrandAsset(file.name)} className="text-[#173660]/30 hover:text-red-500 transition-colors flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 border-2 border-dashed border-[#CDD8E3] rounded-xl px-6 py-5 text-sm text-[#173660]/50 hover:text-[#173660] hover:border-[#1A7EC8] transition-colors w-full sm:w-auto"
                  >
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {brandAssets.length > 0 ? "Add More Files" : "Upload Brand Assets"}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf,application/zip,application/x-zip-compressed,.zip"
                    multiple
                    onChange={handleBrandAssetsChange}
                    className="hidden"
                  />
                </div>

                {/* Team Members */}
                <div className="bg-white border border-[#CDD8E3] border-l-4 border-l-[#1A7EC8] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Your team</p>
                  <label className="block text-sm font-bold text-[#173660] mb-1">
                    Key Team Members
                  </label>
                  <p className="text-xs text-[#173660]/50 mb-4">Who should we loop in? Add the people on your team we should reach out to for events, operational discussions, finance check-ins, and portfolio updates.</p>
                  <div className="space-y-3">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="border border-[#CDD8E3] rounded-xl p-4 bg-[#F4F7FA]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#1A7EC8]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#173660]/50">
                              Team Member {idx + 1}
                            </span>
                          </div>
                          {teamMembers.length > 1 && (
                            <button onClick={() => removeMember(idx)} className="text-[#173660]/30 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#173660]/40 mb-1">Name</label>
                            <input type="text" value={member.name} onChange={(e) => updateMember(idx, "name", e.target.value)} placeholder="Jane Smith" className="w-full bg-white border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm text-[#173660] placeholder:text-[#173660]/30 focus:outline-none focus:ring-1 focus:ring-[#1A7EC8]" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#173660]/40 mb-1">Title</label>
                            <input type="text" value={member.title} onChange={(e) => updateMember(idx, "title", e.target.value)} placeholder="CEO" className="w-full bg-white border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm text-[#173660] placeholder:text-[#173660]/30 focus:outline-none focus:ring-1 focus:ring-[#1A7EC8]" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#173660]/40 mb-1">Email</label>
                            <input type="email" value={member.email} onChange={(e) => updateMember(idx, "email", e.target.value)} placeholder="jane@company.com" className="w-full bg-white border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm text-[#173660] placeholder:text-[#173660]/30 focus:outline-none focus:ring-1 focus:ring-[#1A7EC8]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={addMember} className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A7EC8] hover:text-[#173660] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Another Member
                  </button>
                </div>

                {/* Short-term Needs with expandable context */}
                <div className="bg-white border border-[#CDD8E3] border-l-4 border-l-[#1A7EC8] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Priorities</p>
                  <label className="block text-sm font-bold text-[#173660] mb-1">
                    Short-term Needs
                  </label>
                  <p className="text-xs text-[#173660]/50 mb-4">What's top of mind right now? Select all that apply.</p>
                  <div className="space-y-2">
                    {NEEDS_OPTIONS.map((opt) => {
                      const isSelected = needs.includes(opt.value);
                      return (
                        <div key={opt.value}>
                          <button
                            onClick={() => toggleNeed(opt.value)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-[#1A7EC8]/5 border-[#1A7EC8] text-[#173660]"
                                : "bg-[#F4F7FA] text-[#173660]/70 border-[#CDD8E3] hover:border-[#1A7EC8]/50"
                            }`}
                          >
                            {opt.label}
                          </button>
                          {isSelected && (
                            <div className="ml-4 mt-2 mb-3">
                              <input
                                type="text"
                                value={needsContext[opt.value] ?? ""}
                                onChange={(e) => setNeedsContext((p) => ({ ...p, [opt.value]: e.target.value }))}
                                placeholder={opt.contextPrompt}
                                className="w-full h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-[#F4F7FA] text-[#173660] placeholder:text-[#173660]/40 focus:outline-none focus:ring-1 focus:ring-[#1A7EC8]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rhino assistance */}
                  <div className="mt-6 pt-6 border-t border-[#CDD8E3]">
                    <label className="block text-sm font-semibold text-[#173660] mb-3">
                      Would you like Rhino's assistance with any of your short-term needs?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                        { label: "Not sure", value: "not_sure" },
                      ].map(({ label, value }) => (
                        <button
                          key={value}
                          onClick={() => setWantsRhinoAssistance(value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            wantsRhinoAssistance === value
                              ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                              : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logo Permission + Announcing Raise */}
                <div className="bg-white border border-[#CDD8E3] border-l-4 border-l-[#1A7EC8] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Quick questions</p>
                    <label className="block text-sm font-semibold text-[#173660] mb-3">
                      Can we feature your company on the Rhino site?
                    </label>
                    <div className="flex gap-3">
                      {[{ label: "Yes, go for it", value: true }, { label: "Not yet", value: false }].map(({ label, value }) => (
                        <button
                          key={String(value)}
                          type="button"
                          onClick={() => setLogoPermission(value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            logoPermission === value
                              ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                              : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#CDD8E3] pt-6">
                    <label className="block text-sm font-semibold text-[#173660] mb-3">
                      Are you planning to announce your raise?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                        { label: "Not yet decided", value: "not_yet" },
                      ].map(({ label, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAnnouncingRaise(value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            announcingRaise === value
                              ? "bg-[#1A7EC8] text-white border-[#1A7EC8]"
                              : "bg-white text-[#173660] border-[#CDD8E3] hover:border-[#1A7EC8]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Anything Else */}
                <div className="bg-white border border-[#CDD8E3] border-l-4 border-l-[#1A7EC8] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                  <label className="block text-sm font-semibold text-[#173660] mb-2">
                    Anything else you'd like Rhino to know?
                  </label>
                  <p className="text-xs text-[#173660]/50 mb-3">Context about your business, current challenges, or how we can be most helpful.</p>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                    placeholder="We're currently focused on… Our biggest challenge right now is…"
                    className="w-full bg-[#F4F7FA] border border-[#CDD8E3] rounded-xl px-4 py-3 text-sm text-[#173660] placeholder:text-[#173660]/30 focus:outline-none focus:ring-1 focus:ring-[#1A7EC8] resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#1A7EC8] text-white text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-lg hover:bg-[#173660] transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {submitting ? "Submitting…" : "Submit"}
                </button>

                <SharePortalAccess companyName={companyName} userEmail={userEmail} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
