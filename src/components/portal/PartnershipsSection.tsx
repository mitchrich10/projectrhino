import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Copy, Check, Lock, Download } from "lucide-react";
import { companyLogos } from "@/lib/companyLogos";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { generatePartnershipPdf } from "@/lib/generatePartnershipPdf";

import logoAws from "@/assets/logo-aws.png";
import logoMicrosoftStartups from "@/assets/logo-microsoft-startups.png";
import logoGoogleCloud from "@/assets/logo-google-cloud.webp";
import logoCarta from "@/assets/logo-carta.png";
import logoFloat from "@/assets/logo-float.png";
import logoNotion from "@/assets/logo-notion.png";
import logoDocsend from "@/assets/logo-docsend.png";
import logoBoldhouse from "@/assets/logo-boldhouse.jpg";
import logoPromosapien from "@/assets/logo-promosapien.jpg";
import logoCmg from "@/assets/logo-cmg.webp";
import logoStripe from "@/assets/logo-stripe.png";

interface Partnership {
  id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  logo_key: string | null;
  logo_url: string | null;
  redemption_url: string | null;
  promo_code: string | null;
  display_order: number;
  approval_required: boolean;
  detail_pdf_url: string | null;
  applies_to: string | null;
  website_url: string | null;
}

const PARTNER_LOGOS: Record<string, string> = {
  "AWS Activate": logoAws,
  "Microsoft for Startups": logoMicrosoftStartups,
  "Google Cloud": logoGoogleCloud,
  Stripe: logoStripe,
  Carta: logoCarta,
  Float: logoFloat,
  Notion: logoNotion,
  DocSend: logoDocsend,
  BoldHouse: logoBoldhouse,
  Promosapien: logoPromosapien,
  "CMG Inc.": logoCmg,
  "Stem Health": companyLogos["stem-health"],
  Article: companyLogos["article"],
  "Twig Fertility": companyLogos["twig"],
};

// ── Logo renderer ──
const PartnerLogo: FC<{
  name: string;
  logoKey?: string | null;
  size?: "sm" | "lg";
  onError?: () => void;
}> = ({ name, logoKey, size = "sm", onError }) => {
  const localLogo = logoKey ? companyLogos[logoKey] : null;
  const partnerLogo = PARTNER_LOGOS[name];
  const logoSrc = localLogo || partnerLogo;

  if (logoSrc) {
    const isCloudPartner = ["AWS Activate", "Microsoft for Startups", "Google Cloud"].includes(name);

    return (
      <img
        src={logoSrc}
        alt={name}
        className="object-contain block mx-auto"
        style={{
          width: "100%",
          height: size === "lg" ? "56px" : "48px",
          objectFit: "contain",
        }}
        onLoad={(event) => {
          if (!isCloudPartner) return;
          const img = event.currentTarget;
          const rendered = img.getBoundingClientRect();
          console.log("[PartnershipLogoMetrics]", {
            partner: name,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            renderedWidth: Math.round(rendered.width),
            renderedHeight: Math.round(rendered.height),
          });
        }}
        onError={onError}
      />
    );
  }
  return null;
};

// ── Request Access Button ──
const RequestAccessButton: FC<{
  itemId: string;
  itemName: string;
  itemType: "partnership" | "resource";
  companyName: string;
}> = ({ itemId, itemName, itemType, companyName }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "requested" | "error">("idle");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("partner_requests")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("item_id", itemId)
        .maybeSingle();
      if (data) setStatus("requested");
    };
    check();
  }, [itemId]);

  const handleRequest = async () => {
    setStatus("loading");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus("error"); return; }
    const res = await supabase.functions.invoke("request-access", {
      body: { item_type: itemType, item_id: itemId, item_name: itemName, company_name: companyName },
    });
    if (res.error || res.data?.error === "already_requested" || res.data?.success) {
      setStatus("requested");
    } else {
      setStatus("error");
    }
  };

  if (status === "requested") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border rounded px-2 py-1">
        Requested ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={status === "loading"}
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#1A7EC8] text-white px-2.5 py-1.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
      Request Access
    </button>
  );
};

// ── Slide-over Panel ──
const PartnershipPanel: FC<{
  partnership: Partnership;
  companyName: string;
  isApproved: boolean;
  open: boolean;
  onClose: () => void;
}> = ({ partnership, companyName, isApproved, open, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!partnership.promo_code) return;
    await navigator.clipboard.writeText(partnership.promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const locked = partnership.approval_required && !isApproved;

  const redemptionDomain = (() => {
    if (!partnership.redemption_url) return null;

    const normalizedUrl = /^https?:\/\//i.test(partnership.redemption_url)
      ? partnership.redemption_url
      : `https://${partnership.redemption_url}`;

    try {
      return new URL(normalizedUrl).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  const handleDownload = () => {
    if (partnership.detail_pdf_url) {
      window.open(partnership.detail_pdf_url, "_blank");
    } else {
      generatePartnershipPdf(partnership);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-[#DDE4EC] shadow-xl overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="relative px-6 pt-8 pb-5 border-b border-[#DDE4EC]">
          {!locked && (
            <button
              type="button"
              onClick={handleDownload}
              className="absolute top-4 right-12 text-[#5C6B7A] hover:text-[#1A7EC8] transition-colors"
              title="Download details"
              aria-label="Download details"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col items-start gap-3">
            <PartnerLogo name={partnership.name} logoKey={partnership.logo_key} size="lg" />
            {/* Show name only if no logo */}
            {!PARTNER_LOGOS[partnership.name] && !(partnership.logo_key && companyLogos[partnership.logo_key]) && (
              <h2 className="text-xl font-semibold text-[#173660]">{partnership.name}</h2>
            )}
            {redemptionDomain && partnership.redemption_url && (
              <a
                href={/^https?:\/\//i.test(partnership.redemption_url) ? partnership.redemption_url : `https://${partnership.redemption_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A7EC8] underline"
                style={{ fontSize: "13px" }}
              >
                {redemptionDomain}
              </a>
            )}
            <Badge className="bg-[#1A7EC8] text-white border-0 text-[10px] uppercase tracking-wider font-semibold">
              {partnership.category}
            </Badge>
          </div>
          {partnership.tagline && (
            <p className="text-sm text-[#5C6B7A] mt-3">{partnership.tagline}</p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {locked ? (
            <div className="border border-[#DDE4EC] rounded-lg p-5 bg-[#F4F7FA] text-center space-y-3">
              <Lock className="w-5 h-5 text-[#5C6B7A] mx-auto" />
              <p className="text-sm text-[#5C6B7A]">Access to this partnership requires approval from the Rhino Ventures team.</p>
              <RequestAccessButton itemId={partnership.id} itemName={partnership.name} itemType="partnership" companyName={companyName} />
            </div>
          ) : (
            <>
              {partnership.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C6B7A] mb-2">Details</p>
                  <p className="text-sm text-[#173660]/80 leading-relaxed whitespace-pre-line">{partnership.description}</p>
                </div>
              )}

              {partnership.promo_code && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C6B7A] mb-2">Promo Code</p>
                  <div className="flex items-center gap-2 border border-[#DDE4EC] rounded-lg px-4 py-3 bg-[#F4F7FA]">
                    <code className="text-sm font-bold text-[#1A7EC8] tracking-wider flex-1">{partnership.promo_code}</code>
                    <button onClick={copyCode} className="text-[#5C6B7A] hover:text-[#1A7EC8] transition-colors flex-shrink-0" title="Copy code">
                      {copied ? <Check className="w-4 h-4 text-[#1A7EC8]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!locked && (
          <div className="px-6 py-5 border-t border-[#DDE4EC]">
            {partnership.redemption_url && (
              <a
                href={partnership.redemption_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#1A7EC8] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors"
              >
                Redeem Offer <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ── Partnership Tile ──
const PartnershipTile: FC<{ partnership: Partnership; onClick: () => void }> = ({ partnership, onClick }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const hasLogo = !!(
    (partnership.logo_key && companyLogos[partnership.logo_key]) ||
    PARTNER_LOGOS[partnership.name]
  );

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center rounded-lg bg-white border border-[#DDE4EC] hover:border-[#1A7EC8] transition-all duration-200 w-full"
      style={{
        height: "140px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; }}
    >
      <div className="h-[100px] w-full flex items-center justify-center px-4">
        {hasLogo && !logoFailed ? (
          <PartnerLogo
            name={partnership.name}
            logoKey={partnership.logo_key}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="text-base font-semibold text-[#173660]">{partnership.name}</span>
        )}
      </div>

      {partnership.approval_required && (
        <Lock className="w-3 h-3 text-[#5C6B7A]/40 absolute top-3 right-3" />
      )}
    </button>
  );
};

// ── Grid helper ──
const GRID_CLASSES = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

// ── Main Section ──
const PartnershipsSection: FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partnership | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const [{ data: partnerData }, { data: approvedData }] = await Promise.all([
        supabase.from("partnerships").select("*").order("display_order", { ascending: true }).order("name", { ascending: true }),
        session
          ? supabase.from("partner_requests").select("item_id").eq("user_id", session.user.id).eq("item_type", "partnership").eq("status", "approved")
          : Promise.resolve({ data: [] }),
      ]);
      setPartnerships((partnerData as Partnership[]) ?? []);
      setApprovedIds(new Set((approvedData ?? []).map((r: { item_id: string }) => r.item_id)));
      if (session?.user?.email) {
        const domain = session.user.email.split("@")[1];
        const { data: domainData } = await supabase.from("approved_domains").select("company_name").eq("domain", domain).maybeSingle();
        setCompanyName(domainData?.company_name ?? domain);
      }
      setLoading(false);
    };
    init();
  }, []);

  const grouped = partnerships.reduce<Record<string, Partnership[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] ?? []).push(p);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  return (
    <section id="partnerships">
      <h2 className="text-xl font-black uppercase tracking-tighter text-[#173660] mb-6 pb-3 border-b border-[#DDE4EC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Partnerships
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5C6B7A]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading partnerships…</span>
        </div>
      ) : partnerships.length === 0 ? (
        <p className="text-xs text-[#5C6B7A]">No partnerships available.</p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const items = grouped[category];
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-[#1A7EC8]" />
                  <p className="text-sm font-bold uppercase tracking-widest text-[#173660]">{category}</p>
                </div>
                <div className={GRID_CLASSES}>
                  {items.map((p) => (
                    <PartnershipTile key={p.id} partnership={p} onClick={() => setSelected(p)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <PartnershipPanel
          partnership={selected}
          companyName={companyName}
          isApproved={approvedIds.has(selected.id)}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
};

export default PartnershipsSection;
