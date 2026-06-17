import { FC, memo, startTransition, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchApprovedDomain } from "@/hooks/useApprovedDomain";
import { Loader2, ExternalLink, Copy, Check, Lock, Download, Mail, ChevronDown } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trackPortalEvent } from "@/lib/portalAnalytics";
import PartnerLogoOrBadge from "@/components/portal/PartnerLogoOrBadge";
import { prefetchPartnerships } from "@/lib/portalPrefetch";

interface Partnership {
  id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  logo_key: string | null;
  logo_url: string | null;
  logo_path: string | null;
  redemption_url: string | null;
  promo_code: string | null;
  display_order: number;
  approval_required: boolean;
  detail_pdf_url: string | null;
  applies_to: string | null;
  website_url: string | null;
  partnership_pdf_path: string | null;
}

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

// ── Mailto Redeem Button with email-provider picker ──
const parseMailto = (mailto: string) => {
  // strip "mailto:" prefix
  const raw = mailto.replace(/^mailto:/i, "");
  const [addressPart, queryPart] = raw.split("?");
  const to = decodeURIComponent(addressPart || "");
  const params = new URLSearchParams(queryPart || "");
  return {
    to,
    subject: params.get("subject") ?? "",
    body: params.get("body") ?? "",
    cc: params.get("cc") ?? "",
    bcc: params.get("bcc") ?? "",
  };
};

const MailtoRedeemButton: FC<{ mailto: string; label: string; onRedeem: () => void }> = ({ mailto, label, onRedeem }) => {
  const { to, subject, body, cc, bcc } = parseMailto(mailto);

  const open = (provider: "default" | "gmail" | "outlook") => {
    onRedeem();
    if (provider === "default") {
      window.location.href = mailto;
      return;
    }
    if (provider === "gmail") {
      const url = new URL("https://mail.google.com/mail/");
      url.searchParams.set("view", "cm");
      url.searchParams.set("fs", "1");
      url.searchParams.set("to", to);
      if (subject) url.searchParams.set("su", subject);
      if (body) url.searchParams.set("body", body);
      if (cc) url.searchParams.set("cc", cc);
      if (bcc) url.searchParams.set("bcc", bcc);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
      return;
    }
    // outlook web
    const url = new URL("https://outlook.office.com/mail/deeplink/compose");
    url.searchParams.set("to", to);
    if (subject) url.searchParams.set("subject", subject);
    if (body) url.searchParams.set("body", body);
    if (cc) url.searchParams.set("cc", cc);
    if (bcc) url.searchParams.set("bcc", bcc);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full bg-[#1A7EC8] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors"
        >
          {label} <Mail className="w-3.5 h-3.5" /> <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[12rem]">
        <DropdownMenuItem onClick={() => open("gmail")} className="cursor-pointer">Open in Gmail</DropdownMenuItem>
        <DropdownMenuItem onClick={() => open("outlook")} className="cursor-pointer">Open in Outlook</DropdownMenuItem>
        <DropdownMenuItem onClick={() => open("default")} className="cursor-pointer">Default mail app</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


const PartnershipPanel: FC<{
  partnership: Partnership;
  companyName: string;
  isApproved: boolean;
  open: boolean;
  onClose: () => void;
}> = memo(({ partnership, companyName, isApproved, open, onClose }) => {
  const [copied, setCopied] = useState(false);
  

  const copyCode = async () => {
    if (!partnership.promo_code) return;
    await navigator.clipboard.writeText(partnership.promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const locked = partnership.approval_required && !isApproved;

  const normalizeUrl = (url: string) => {
    if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
    return `https://${url}`;
  };

  const websiteHref = partnership.website_url
    ? normalizeUrl(partnership.website_url)
    : partnership.redemption_url
      ? normalizeUrl(partnership.redemption_url)
      : null;

  const websiteDomain = (() => {
    if (!websiteHref) return null;
    try {
      return new URL(websiteHref).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  // Only a real, manually-uploaded PDF is offered for download.
  // On-the-fly PDF generation was removed — no fallback is produced.
  const uploadedPdfUrl = partnership.detail_pdf_url || partnership.partnership_pdf_path || null;

  const handleDownload = () => {
    if (!uploadedPdfUrl) return;
    trackPortalEvent("partnership_download", partnership.name, partnership.id);
    window.open(uploadedPdfUrl, "_blank");
  };

  const isMailto = partnership.redemption_url ? /^mailto:/i.test(partnership.redemption_url) : false;
  const actionLabel = isMailto ? `Email ${partnership.name} to Redeem` : "Redeem Offer";

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-[#DDE4EC] shadow-xl overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="relative px-6 pt-8 pb-5 border-b border-[#DDE4EC]">
          {!locked && uploadedPdfUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="absolute top-4 right-12 text-[#5C6B7A] hover:text-[#1A7EC8] transition-colors"
              title="Download partnership details"
              aria-label="Download partnership details"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col items-start gap-3">
            <PartnerLogoOrBadge
              name={partnership.name}
              logo_path={partnership.logo_path}
              logo_url={partnership.logo_url}
              logo_key={partnership.logo_key}
              size="lg"
            />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C6B7A]" aria-label={partnership.name}>
              {partnership.name} · {partnership.category}
            </p>
          </div>
          {partnership.tagline && (
            <p className="text-base font-semibold text-[#173660] mt-3 leading-snug">{partnership.tagline}</p>
          )}
        </div>

        {locked ? (
          <div className="px-6 py-6">
            <div className="border border-[#DDE4EC] rounded-lg p-5 bg-[#F4F7FA] text-center space-y-3">
              <Lock className="w-5 h-5 text-[#5C6B7A] mx-auto" />
              <p className="text-sm text-[#5C6B7A]">Access to this partnership requires approval from the Rhino Ventures team.</p>
              <RequestAccessButton itemId={partnership.id} itemName={partnership.name} itemType="partnership" companyName={companyName} />
            </div>
          </div>
        ) : (
          <>
            {partnership.redemption_url && (
              <div className="px-6 pt-5">
                {isMailto ? (
                  <MailtoRedeemButton
                    mailto={normalizeUrl(partnership.redemption_url)}
                    label={actionLabel}
                    onRedeem={() => trackPortalEvent("partnership_redeem", partnership.name, partnership.id)}
                  />
                ) : (
                  <a
                    href={normalizeUrl(partnership.redemption_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#1A7EC8] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors"
                  >
                    {actionLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="px-6 py-6 space-y-6">
              {websiteHref && websiteDomain && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#1A7EC8] underline hover:text-[#173660] transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  {websiteDomain}
                </a>
              )}
              {partnership.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C6B7A] mb-2">Details</p>
                  <p className="text-sm text-[#173660]/80 leading-relaxed whitespace-pre-line">{partnership.description}</p>
                </div>
              )}

              {partnership.partnership_pdf_path && (
                <a
                  href={partnership.partnership_pdf_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackPortalEvent("partnership_pdf_download", partnership.name, partnership.id)}
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1A7EC8] hover:text-[#173660] transition-colors border border-[#DDE4EC] rounded-lg px-4 py-2.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Partnership Details PDF
                </a>
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
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
});
PartnershipPanel.displayName = "PartnershipPanel";

// ── Partnership Tile (memoized) ──
const PartnershipTile = memo<{ partnership: Partnership; onClick: () => void }>(
  ({ partnership, onClick }) => {
    return (
      <button
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center rounded-lg bg-white border border-[#DDE4EC] hover:border-[#1A7EC8] hover:shadow-md transition-all duration-200 w-full"
        style={{
          height: 140,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="h-[100px] w-full flex items-center justify-center px-4">
          <PartnerLogoOrBadge
            name={partnership.name}
            logo_path={partnership.logo_path}
            logo_url={partnership.logo_url}
            logo_key={partnership.logo_key}
          />
        </div>
        {partnership.approval_required && (
          <Lock className="w-3 h-3 text-[#5C6B7A]/40 absolute top-3 right-3" />
        )}
      </button>
    );
  }
);
PartnershipTile.displayName = "PartnershipTile";

// ── Coming Soon Placeholder ──
const COMING_SOON_ITEMS = [
  { name: "Outsourced Finance & Bookkeeping", category: "Finance" },
  { name: "Marketing / Brand Agency", category: "Marketing" },
  { name: "Insurance Partner", category: "Insurance" },
  { name: "Benefits Partner", category: "HR & Benefits" },
];

const ComingSoonTile: FC<{ name: string }> = ({ name }) => (
  <div
    className="relative flex flex-col items-center justify-center rounded-lg bg-[#F4F7FA] border border-dashed border-[#CDD8E3] w-full"
    style={{ height: 140, fontFamily: "'DM Sans', sans-serif" }}
  >
    <span className="text-sm font-semibold text-[#5C6B7A] text-center px-4 mb-2">{name}</span>
    <span className="text-[9px] font-bold uppercase tracking-widest text-[#5C6B7A]/60 bg-[#CDD8E3]/40 px-2 py-0.5 rounded">
      Coming soon
    </span>
  </div>
);

const GRID_CLASSES = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

// ── Skeleton placeholder (matches PartnershipTile dimensions) ──
const SkeletonTile: FC = () => (
  <div
    className="relative flex flex-col items-center justify-center rounded-lg bg-white border border-[#DDE4EC] w-full overflow-hidden"
    style={{ height: 140, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
  >
    <div className="h-9 w-28 rounded-md bg-[#E8EEF4] animate-pulse" />
  </div>
);

const PartnershipsSkeleton: FC = () => (
  <div className="space-y-8" aria-busy="true" aria-label="Loading partnerships">
    {[0, 1].map((group) => (
      <div key={group}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-[#CDD8E3]" />
          <div className="h-3 w-32 rounded bg-[#E8EEF4] animate-pulse" />
        </div>
        <div className={GRID_CLASSES}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonTile key={i} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

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
        prefetchPartnerships(),
        session
          ? supabase.from("partner_requests").select("item_id").eq("user_id", session.user.id).contains("item_type", ["partnership"]).eq("status", "approved")
          : Promise.resolve({ data: [] }),
      ]);
      setPartnerships(((partnerData as unknown) as Partnership[]) ?? []);
      setApprovedIds(new Set((approvedData ?? []).map((r: { item_id: string }) => r.item_id)));
      if (session?.user?.email) {
        const domain = session.user.email.split("@")[1];
        const domainData = await fetchApprovedDomain(domain);
        setCompanyName(domainData?.company_name ?? domain);
      }
      setLoading(false);
    };
    init();
  }, []);

  const { grouped, categories, extraComingSoonByCategory } = useMemo(() => {
    const grouped = partnerships.reduce<Record<string, Partnership[]>>((acc, p) => {
      (acc[p.category] = acc[p.category] ?? []).push(p);
      return acc;
    }, {});
    const categories = Object.keys(grouped).sort();
    const extra: Record<string, { name: string }[]> = {};
    for (const cs of COMING_SOON_ITEMS) {
      if (!categories.includes(cs.category)) {
        (extra[cs.category] = extra[cs.category] ?? []).push({ name: cs.name });
      }
    }
    return { grouped, categories, extraComingSoonByCategory: extra };
  }, [partnerships]);

  return (
    <section id="partnerships">
      <h2 className="text-xl font-black uppercase tracking-tighter text-[#173660] mb-6 pb-3 border-b border-[#DDE4EC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Partnerships
      </h2>

      {loading ? (
        <PartnershipsSkeleton />
      ) : partnerships.length === 0 ? (
        <p className="text-xs text-[#5C6B7A]">No partnerships available.</p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const items = grouped[category];
            const comingSoon = COMING_SOON_ITEMS.filter((cs) => cs.category === category);
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-[#1A7EC8]" />
                  <p className="text-sm font-bold uppercase tracking-widest text-[#173660]">{category}</p>
                </div>
                <div className={GRID_CLASSES}>
                  {items.map((p) => (
                    <PartnershipTile
                      key={p.id}
                      partnership={p}
                      onClick={() => {
                        trackPortalEvent("partnership_click", p.name, p.id);
                        // F-004: defer the state update so the click handler returns immediately
                        startTransition(() => setSelected(p));
                      }}
                    />
                  ))}
                  {comingSoon.map((cs) => (
                    <ComingSoonTile key={cs.name} name={cs.name} />
                  ))}
                </div>
              </div>
            );
          })}
          {Object.entries(extraComingSoonByCategory).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-[#1A7EC8]" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#173660]">{category}</p>
              </div>
              <div className={GRID_CLASSES}>
                {items.map((cs) => (
                  <ComingSoonTile key={cs.name} name={cs.name} />
                ))}
              </div>
            </div>
          ))}
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
