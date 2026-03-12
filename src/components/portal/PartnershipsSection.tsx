import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Copy, Check, Lock } from "lucide-react";
import { companyLogos } from "@/lib/companyLogos";
import { X } from "lucide-react";

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
}

// ── Request Access Button ──────────────────────────────────────────────────────
const RequestAccessButton: FC<{
  itemId: string;
  itemName: string;
  itemType: "partnership" | "resource";
  companyName: string;
}> = ({ itemId, itemName, itemType, companyName }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "requested" | "error">("idle");

  useEffect(() => {
    // Check if already requested
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

    if (res.error || res.data?.error === "already_requested") {
      setStatus("requested");
    } else if (res.data?.success) {
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
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
      Request Access
    </button>
  );
};

// ── Partnership Modal ──────────────────────────────────────────────────────────
const PartnershipModal: FC<{
  partnership: Partnership;
  companyName: string;
  isApproved: boolean;
  onClose: () => void;
}> = ({ partnership, companyName, isApproved, onClose }) => {
  const [copied, setCopied] = useState(false);

  const logoSrc = partnership.logo_key
    ? companyLogos[partnership.logo_key]
    : partnership.logo_url ?? null;

  const copyCode = async () => {
    if (!partnership.promo_code) return;
    await navigator.clipboard.writeText(partnership.promo_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const locked = partnership.approval_required && !isApproved;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            {logoSrc ? (
              <div className="w-14 h-14 border border-border rounded-lg flex items-center justify-center p-2 bg-secondary/10 flex-shrink-0">
                <img src={logoSrc} alt={partnership.name} className="max-h-10 max-w-[96px] w-auto h-auto object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 border border-border rounded-lg flex items-center justify-center bg-secondary/10 flex-shrink-0">
                <span className="text-xs font-black uppercase tracking-tight text-foreground text-center leading-tight px-1">{partnership.name}</span>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">{partnership.category}</p>
              <h3 className="text-lg font-black uppercase tracking-tighter text-foreground leading-tight">{partnership.name}</h3>
              {partnership.tagline && (
                <p className="text-xs text-muted-foreground mt-0.5">{partnership.tagline}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {locked ? (
            <div className="border border-border rounded-lg p-4 bg-secondary/20 text-center space-y-3">
              <Lock className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Access to this partnership requires approval from the Rhino Ventures team.</p>
              <RequestAccessButton
                itemId={partnership.id}
                itemName={partnership.name}
                itemType="partnership"
                companyName={companyName}
              />
            </div>
          ) : (
            <>
              {partnership.description && (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{partnership.description}</p>
              )}
              {partnership.promo_code && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Promo Code</p>
                  <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-3 bg-secondary/20">
                    <code className="text-sm font-bold text-primary tracking-wider flex-1">{partnership.promo_code}</code>
                    <button
                      onClick={copyCode}
                      className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      title="Copy code"
                    >
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!locked && partnership.redemption_url && (
          <div className="px-6 py-4 border-t border-border">
            <a
              href={partnership.redemption_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Redeem Offer
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Partnership Tile ───────────────────────────────────────────────────────────
const PartnershipTile: FC<{ partnership: Partnership; onClick: () => void }> = ({ partnership, onClick }) => {
  const logoSrc = partnership.logo_key
    ? companyLogos[partnership.logo_key]
    : partnership.logo_url ?? null;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start gap-2.5 p-4 border border-border rounded-lg bg-card hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200 text-left w-full"
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
          {partnership.category}
        </span>
        {partnership.approval_required && (
          <Lock className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-3 w-full">
        {logoSrc ? (
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <img
              src={logoSrc}
              alt={partnership.name}
              className="max-h-8 max-w-[64px] w-auto h-auto object-contain group-hover:opacity-80 transition-opacity"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors leading-tight">
            {partnership.name}
          </p>
          {partnership.tagline && (
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 mt-0.5">{partnership.tagline}</p>
          )}
        </div>
      </div>
    </button>
  );
};

// ── Main Section ───────────────────────────────────────────────────────────────
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
        supabase
          .from("partnerships")
          .select("*")
          .order("display_order", { ascending: true })
          .order("name", { ascending: true }),
        session
          ? supabase
              .from("partner_requests")
              .select("item_id")
              .eq("user_id", session.user.id)
              .eq("item_type", "partnership")
              .eq("status", "approved")
          : Promise.resolve({ data: [] }),
      ]);

      setPartnerships((partnerData as Partnership[]) ?? []);
      setApprovedIds(new Set((approvedData ?? []).map((r: { item_id: string }) => r.item_id)));

      if (session?.user?.email) {
        const domain = session.user.email.split("@")[1];
        const { data: domainData } = await supabase
          .from("approved_domains")
          .select("company_name")
          .eq("domain", domain)
          .maybeSingle();
        setCompanyName(domainData?.company_name ?? domain);
      }

      setLoading(false);
    };
    init();
  }, []);

  return (
    <section id="partnerships">
      <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6 pb-3 border-b border-border">
        Partnerships
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading partnerships…</span>
        </div>
      ) : partnerships.length === 0 ? (
        <p className="text-xs text-muted-foreground">Partnership deals coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {partnerships.map((p) => (
            <PartnershipTile key={p.id} partnership={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {selected && (
        <PartnershipModal
          partnership={selected}
          companyName={companyName}
          isApproved={approvedIds.has(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
};

export default PartnershipsSection;
