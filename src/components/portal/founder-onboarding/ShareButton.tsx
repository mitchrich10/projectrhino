import { FC, useState } from "react";
import { UserPlus, Link2, Copy, Check, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  batchId: string;
  userId: string;
  userEmail: string;
  companyName: string;
}

const ShareButton: FC<Props> = ({ batchId, userId, userEmail, companyName }) => {
  const [openPanel, setOpenPanel] = useState<"onboarding" | "portal" | null>(null);
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [copiedOnboarding, setCopiedOnboarding] = useState(false);
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<{ email: string; success: boolean }[] | null>(null);

  const portalUrl = `${window.location.origin}/partner-login`;

  const generateOnboardingLink = async () => {
    setLoadingOnboarding(true);
    const { data: existing } = await supabase
      .from("founder_onboarding_shares" as any)
      .select("token")
      .eq("batch_id", batchId)
      .is("target_step", null)
      .maybeSingle();

    let token = (existing as any)?.token;
    if (!token) {
      const { data: created } = await supabase
        .from("founder_onboarding_shares" as any)
        .insert({ batch_id: batchId, created_by: userId } as any)
        .select("token")
        .single();
      token = (created as any)?.token;
    }

    setOnboardingLink(`${window.location.origin}/portal?onboarding-share=${token}`);
    setLoadingOnboarding(false);
  };

  const copyOnboarding = async () => {
    if (!onboardingLink) return;
    await navigator.clipboard.writeText(onboardingLink);
    setCopiedOnboarding(true);
    setTimeout(() => setCopiedOnboarding(false), 2000);
  };

  const copyPortal = async () => {
    await navigator.clipboard.writeText(portalUrl);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  const handleSendInvites = async () => {
    const emails = emailInput.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setSending(true);
    setSendResults(null);

    const { data, error } = await supabase.functions.invoke("send-portal-invite", {
      body: { emails, senderName: userEmail, companyName, portalUrl },
    });

    if (!error && data?.results) {
      setSendResults(data.results);
      setEmailInput("");
    }
    setSending(false);
  };

  return (
    <div className="space-y-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Two buttons side by side */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setOpenPanel(openPanel === "onboarding" ? null : "onboarding");
            if (!onboardingLink) generateOnboardingLink();
          }}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            openPanel === "onboarding" ? "text-[#173660]" : "text-[#1A7EC8] hover:text-[#173660]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Invite to onboarding
        </button>
        <span className="text-[#CDD8E3]">|</span>
        <button
          onClick={() => setOpenPanel(openPanel === "portal" ? null : "portal")}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            openPanel === "portal" ? "text-[#173660]" : "text-[#1A7EC8] hover:text-[#173660]"
          }`}
        >
          <Link2 className="w-4 h-4" />
          Share portal with your team
        </button>
      </div>

      {/* Onboarding invite panel */}
      {openPanel === "onboarding" && (
        <div className="border border-[#CDD8E3] rounded-lg p-4 bg-[#F4F7FA] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#173660]">Invite to onboarding</p>
            <button onClick={() => setOpenPanel(null)} className="text-xs text-[#173660]/40 hover:text-[#173660]">Close</button>
          </div>
          <p className="text-xs text-[#173660]/60">
            Share this link with team members who need to help complete onboarding steps (e.g., your marketing manager for brand assets, your CFO for tech stack details). They'll authenticate with their Google account and land directly in the onboarding flow.
          </p>
          {loadingOnboarding ? (
            <div className="flex items-center gap-2 text-sm text-[#173660]/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Generating link…
            </div>
          ) : onboardingLink ? (
            <div className="flex items-center gap-2">
              <input readOnly value={onboardingLink} className="flex-1 h-9 text-xs bg-white border border-[#CDD8E3] rounded-lg px-3 text-[#173660] truncate" />
              <button onClick={copyOnboarding} className="flex items-center gap-1.5 h-9 px-3 bg-[#1A7EC8] text-white text-xs font-semibold rounded-lg hover:bg-[#173660] transition-colors">
                {copiedOnboarding ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedOnboarding ? "Copied" : "Copy"}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Portal share panel */}
      {openPanel === "portal" && (
        <div className="border border-[#CDD8E3] rounded-lg p-4 bg-[#F4F7FA] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#173660]">Share portal with your team</p>
            <button onClick={() => setOpenPanel(null)} className="text-xs text-[#173660]/40 hover:text-[#173660]">Close</button>
          </div>
          <p className="text-xs text-[#173660]/60">
            Anyone on your company's Google domain can access the full portal — partnerships, resources, and events. They won't see the onboarding flow unless specifically invited above.
          </p>

          {/* Copy link */}
          <div className="flex items-center gap-2">
            <input readOnly value={portalUrl} className="flex-1 h-9 text-xs bg-white border border-[#CDD8E3] rounded-lg px-3 text-[#173660] truncate" />
            <button onClick={copyPortal} className="flex items-center gap-1.5 h-9 px-3 bg-[#1A7EC8] text-white text-xs font-semibold rounded-lg hover:bg-[#173660] transition-colors">
              {copiedPortal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPortal ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Email invites */}
          <div className="border-t border-[#CDD8E3] pt-3">
            <label className="block text-xs font-medium text-[#173660]/70 mb-2">Or send an email invite</label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              rows={2}
              placeholder={"colleague@yourcompany.com"}
              className="w-full bg-white border border-[#CDD8E3] rounded-lg px-3 py-2 text-sm text-[#173660] placeholder:text-[#173660]/30 resize-none mb-2"
            />
            <button
              onClick={handleSendInvites}
              disabled={sending || !emailInput.trim()}
              className="flex items-center gap-2 h-9 px-4 bg-[#1A7EC8] text-white text-xs font-semibold rounded-lg hover:bg-[#173660] transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Sending…" : "Send Invites"}
            </button>
            {sendResults && (
              <div className="mt-2 space-y-1">
                {sendResults.map((r) => (
                  <div key={r.email} className={`flex items-center gap-2 text-xs ${r.success ? "text-[#a3d7c2]" : "text-red-500"}`}>
                    {r.success ? <Check className="w-3 h-3" /> : "✗"} {r.email}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
