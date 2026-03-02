import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Copy, Check, FileText, X } from "lucide-react";
import { companyLogos } from "@/lib/companyLogos";

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
}

const PartnershipModal: FC<{ partnership: Partnership; onClose: () => void }> = ({ partnership, onClose }) => {
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

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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
          {partnership.description && (
            <p className="text-sm text-foreground/80 leading-relaxed">{partnership.description}</p>
          )}

          {/* Promo Code */}
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
        </div>

        {/* Footer */}
        {partnership.redemption_url && (
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

const PartnershipTile: FC<{ partnership: Partnership; onClick: () => void }> = ({ partnership, onClick }) => {
  const logoSrc = partnership.logo_key
    ? companyLogos[partnership.logo_key]
    : partnership.logo_url ?? null;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200 h-[120px] text-center w-full"
    >
      <div className="flex-1 flex items-center justify-center w-full">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={partnership.name}
            className="max-h-10 max-w-[120px] w-auto h-auto object-contain group-hover:opacity-80 transition-opacity"
          />
        ) : (
          <span className="text-sm font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
            {partnership.name}
          </span>
        )}
      </div>
      {partnership.tagline && (
        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 w-full">{partnership.tagline}</p>
      )}
    </button>
  );
};

const PartnershipsSection: FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partnership | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("partnerships")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      setPartnerships((data as Partnership[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Group by category
  const grouped = partnerships.reduce<Record<string, Partnership[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] ?? []).push(p);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

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
        <div className="space-y-10">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {grouped[category].map((p) => (
                  <PartnershipTile key={p.id} partnership={p} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <PartnershipModal partnership={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
};

export default PartnershipsSection;
