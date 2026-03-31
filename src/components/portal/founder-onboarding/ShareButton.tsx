import { FC, useState } from "react";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  batchId: string;
  userId: string;
}

const ShareButton: FC<Props> = ({ batchId, userId }) => {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    // Check for existing share
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

    const url = `${window.location.origin}/portal?onboarding-share=${token}`;
    setLink(url);
    setLoading(false);
  };

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); generateLink(); }}
        className="flex items-center gap-2 text-sm font-medium text-[#1A7EC8] hover:text-[#173660] transition-colors"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Share2 className="w-4 h-4" />
        Share with team
      </button>
    );
  }

  return (
    <div className="border border-[#CDD8E3] rounded-lg p-4 bg-[#F4F7FA] space-y-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#173660]">Share onboarding with your team</p>
        <button onClick={() => setOpen(false)} className="text-xs text-[#173660]/40 hover:text-[#173660]">
          Close
        </button>
      </div>
      <p className="text-xs text-[#173660]/60">
        Team members will authenticate with their Google account and can view and edit this onboarding form.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#173660]/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating link…
        </div>
      ) : link ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 h-9 text-xs bg-white border border-[#CDD8E3] rounded-lg px-3 text-[#173660] truncate"
          />
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 h-9 px-3 bg-[#1A7EC8] text-white text-xs font-semibold rounded-lg hover:bg-[#173660] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ShareButton;
