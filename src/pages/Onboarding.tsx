import { FC, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, CheckCircle2, Plus, Trash2, Upload, X,
  BookOpen, Calendar, Users, Mail, ArrowRight, Copy, Check, Send, Link2
} from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TeamMember {
  name: string;
  title: string;
  email: string;
}

const NEEDS_OPTIONS = [
  { value: "Hiring", label: "Hiring" },
  { value: "Legal intro", label: "Legal intro" },
  { value: "Customer intros", label: "Customer intros" },
  { value: "Finance/accounting", label: "Finance / Accounting" },
  { value: "PR/marketing", label: "PR / Marketing" },
  { value: "Other", label: "Other" },
];

const emptyMember = (): TeamMember => ({ name: "", title: "", email: "" });

// ── Welcome / Portal Overview ─────────────────────────────────────────────────
const WelcomeOverview: FC = () => (
  <div className="mb-10 pb-10 border-b border-border">
    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Partner Portal</p>
    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4 leading-tight">
      Welcome to Rhino
    </h1>
    <p className="text-sm text-muted-foreground mb-8 max-w-xl leading-relaxed">
      We're glad you're here. This portal is your home base for everything Rhino has to offer its portfolio companies. Complete the intake form below so we can get to know you better and hit the ground running.
    </p>
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="border border-border rounded-xl p-5 bg-secondary/20">
        <BookOpen className="w-5 h-5 text-primary mb-3" />
        <p className="text-xs font-black uppercase tracking-widest text-foreground mb-1">Resources</p>
        <p className="text-xs text-muted-foreground leading-relaxed">Templates, guides, and vendor recommendations curated by Rhino — from legal docs to hiring frameworks.</p>
      </div>
      <div className="border border-border rounded-xl p-5 bg-secondary/20">
        <Calendar className="w-5 h-5 text-primary mb-3" />
        <p className="text-xs font-black uppercase tracking-widest text-foreground mb-1">Events</p>
        <p className="text-xs text-muted-foreground leading-relaxed">Upcoming founder dinners, workshops, and portfolio gatherings. Stay in the loop and connect with your peers.</p>
      </div>
      <div className="border border-border rounded-xl p-5 bg-secondary/20">
        <Mail className="w-5 h-5 text-primary mb-3" />
        <p className="text-xs font-black uppercase tracking-widest text-foreground mb-1">Reach Rhino</p>
        <p className="text-xs text-muted-foreground leading-relaxed">Need an intro, a sounding board, or just want to say hi? Email us at <a href="mailto:team@rhinovc.com" className="text-primary font-semibold hover:underline">team@rhinovc.com</a> — we respond fast.</p>
      </div>
    </div>
  </div>
);

// ── Share Portal Access ────────────────────────────────────────────────────────
const SharePortalAccess: FC<{ companyName: string; userEmail: string }> = ({ companyName, userEmail }) => {
  const portalUrl = `${window.location.origin}/partner-login`;
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<{ email: string; success: boolean }[] | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvites = async () => {
    const emails = emailInput.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setSending(true); setSendError(null); setSendResults(null);

    const { data, error } = await supabase.functions.invoke("send-portal-invite", {
      body: {
        emails,
        senderName: userEmail,
        companyName,
        portalUrl,
      },
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
    <div className="mt-10 border border-border rounded-xl p-6 bg-secondary/10">
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="w-4 h-4 text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-foreground">Share Portal Access</p>
      </div>
      <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
        Your team can access the portal using their <strong>{userEmail.split("@")[1]}</strong> work email. Share the link directly or send invites below.
      </p>

      {/* Copyable link */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground truncate">
          {portalUrl}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-2 rounded hover:opacity-90 transition-opacity flex-shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Email invite */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
          Or send an email invite
        </label>
        <textarea
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          rows={3}
          placeholder={"colleague@yourcompany.com\nanother@yourcompany.com"}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono mb-3"
        />
        <p className="text-[10px] text-muted-foreground mb-3">Separate multiple emails by new line, comma, or semicolon.</p>
        <button
          onClick={handleSendInvites}
          disabled={sending || !emailInput.trim()}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {sending ? "Sending…" : "Send Invites"}
        </button>

        {sendError && <p className="text-xs text-destructive mt-2">{sendError}</p>}
        {sendResults && (
          <div className="mt-3 space-y-1">
            {sendResults.map((r) => (
              <div key={r.email} className={`flex items-center gap-2 text-xs ${r.success ? "text-green-600" : "text-destructive"}`}>
                {r.success ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="font-mono">{r.email}</span>
                {r.success && <span className="text-muted-foreground">— invite sent</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Thank You Screen ───────────────────────────────────────────────────────────
const ThankYou: FC<{ companyName: string; userEmail: string }> = ({ companyName, userEmail }) => (
  <div className="py-12">
    <div className="text-center mb-10">
      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
      <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-3">
        You're all set!
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        Thanks for completing your intake form. The Rhino team will review your submission and reach out shortly. In the meantime, explore the portal.
      </p>
      <Link
        to="/portal"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity"
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([emptyMember()]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [needsOther, setNeedsOther] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

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

    // Validate at least one team member has a name
    const validMembers = teamMembers.filter((m) => m.name.trim());
    if (validMembers.length === 0) {
      setError("Please add at least one team member.");
      return;
    }

    setSubmitting(true);

    try {
      // Upload logo if provided
      let logoPath: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${userId}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(path, logoFile, { upsert: true });
        if (uploadError) throw new Error(`Logo upload failed: ${uploadError.message}`);
        logoPath = path;
      }

      // Build final needs array (replace "Other" placeholder with actual text if provided)
      const finalNeeds = needs.filter((n) => n !== "Other");
      if (needs.includes("Other") && needsOther.trim()) {
        finalNeeds.push(`Other: ${needsOther.trim()}`);
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
        needs_other: needsOther.trim() || null,
        additional_notes: additionalNotes.trim() || null,
      });

      if (insertError) throw new Error(insertError.message);

      // Send notification email
      await supabase.functions.invoke("send-onboarding-submission", {
        body: {
          companyName,
          userEmail,
          teamMembers: validMembers,
          needs: finalNeeds,
          additionalNotes: additionalNotes.trim() || null,
        },
      }).catch(() => { /* best-effort — don't block on email failure */ });

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
          </Link>
          <Link
            to="/portal"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
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
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Intake Form</p>
                <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
                  Tell us about {companyName}
                </h2>
              </div>

              <div className="space-y-10">
                {/* Company Logo */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-foreground mb-3">
                    Company Logo
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">Upload your company logo so we can feature you properly across our materials.</p>
                  {logoPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={logoPreview} alt="Logo preview" className="h-16 w-auto object-contain border border-border rounded-lg p-2 bg-white" />
                      <button
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 border border-dashed border-border rounded-xl px-6 py-5 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest">Upload Logo (PNG, SVG, JPG)</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-foreground mb-1">
                    Key Team Members
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">Who should Rhino be in touch with? Add founders and key team leads.</p>
                  <div className="space-y-3">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="border border-border rounded-xl p-4 bg-secondary/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Team Member {idx + 1}
                            </span>
                          </div>
                          {teamMembers.length > 1 && (
                            <button onClick={() => removeMember(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Name *</label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateMember(idx, "name", e.target.value)}
                              placeholder="Jane Smith"
                              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Title</label>
                            <input
                              type="text"
                              value={member.title}
                              onChange={(e) => updateMember(idx, "title", e.target.value)}
                              placeholder="CEO"
                              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Email</label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateMember(idx, "email", e.target.value)}
                              placeholder="jane@company.com"
                              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addMember}
                    className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Member
                  </button>
                </div>

                {/* Short-term Needs */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-foreground mb-1">
                    Short-term Needs
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">What's top of mind right now? Select all that apply.</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {NEEDS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleNeed(opt.value)}
                        className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
                          needs.includes(opt.value)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {needs.includes("Other") && (
                    <input
                      type="text"
                      value={needsOther}
                      onChange={(e) => setNeedsOther(e.target.value)}
                      placeholder="Please describe…"
                      className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-2"
                    />
                  )}
                </div>

                {/* Anything Else */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-foreground mb-1">
                    Anything else you'd like Rhino to know?
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">Context about your business, current challenges, or how we can be most helpful.</p>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                    placeholder="We're currently focused on… Our biggest challenge right now is…"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest px-8 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {submitting ? "Submitting…" : "Submit Intake Form"}
                </button>

                {/* Share portal access — available before submission too */}
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
