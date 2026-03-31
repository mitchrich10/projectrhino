import { FC, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Download, ExternalLink, FileText, Loader2, Lock, Calculator, BookOpen } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  category: string;
  approval_required: boolean;
}

// ── Download Button (blob fetch to force download cross-origin) ────────────────
const DownloadButton: FC<{ href: string; filename: string }> = ({ href, filename }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(href);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }, [href, filename]);

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
      Download
    </button>
  );
};

// ── Request Access Button ──────────────────────────────────────────────────────
const RequestAccessButton: FC<{
  itemId: string;
  itemName: string;
  companyName: string;
}> = ({ itemId, itemName, companyName }) => {
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
      body: { item_type: "resource", item_id: itemId, item_name: itemName, company_name: companyName },
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
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Requested ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={status === "loading"}
      className="flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
      Request Access
    </button>
  );
};

// ── Interactive Tool Cards ─────────────────────────────────────────────────────
// CommissionCalculatorCard removed
      </span>
    </div>
  </Link>
);

const OptionModellerCard: FC = () => (
  <Link
    to="/option-modeller"
    className="group border border-border rounded-lg p-5 bg-secondary/20 flex flex-col gap-2 transition-colors hover:border-primary/50 hover:bg-secondary/40"
  >
    <div className="flex items-start justify-between gap-2">
      <h4 className="font-bold text-sm text-foreground leading-tight">Option Modeller</h4>
      <Calculator className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">
      Interactive tool to model the value of your stock option grant across exit scenarios. Enter your grant details and explore conservative through exceptional outcomes.
    </p>
    <div className="flex items-center gap-1.5 mt-auto pt-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-primary group-hover:opacity-70 transition-opacity flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> Open Tool
      </span>
    </div>
  </Link>
);

const FinancingGuideCard: FC = () => (
  <Link
    to="/portal/financing-guide"
    className="group border border-border rounded-lg p-5 bg-secondary/20 flex flex-col gap-2 transition-colors hover:border-primary/50 hover:bg-secondary/40"
  >
    <div className="flex items-start justify-between gap-2">
      <h4 className="font-bold text-sm text-foreground leading-tight">Financing Process Guide</h4>
      <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">
      A curated package of 5 frameworks, templates, and tools for founders preparing for a Series A or growth-stage financing round.
    </p>
    <div className="flex items-center gap-1.5 mt-auto pt-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-primary group-hover:opacity-70 transition-opacity flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> View Guide
      </span>
    </div>
  </Link>
);

// ── Main Section ───────────────────────────────────────────────────────────────
const ResourcesSection: FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const [{ data }, { data: approvedData }] = await Promise.all([
        supabase
          .from("resources")
          .select("id, title, description, url, file_path, category, approval_required")
          .order("category")
          .order("title"),
        session
          ? supabase
              .from("partner_requests")
              .select("item_id")
              .eq("user_id", session.user.id)
              .eq("item_type", "resource")
              .eq("status", "approved")
          : Promise.resolve({ data: [] }),
      ]);

      setResources(data ?? []);
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

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("resources").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    (acc[r.category] = acc[r.category] ?? []).push(r);
    return acc;
  }, {});

  return (
    <section id="resources">
      <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6 pb-3 border-b border-border">
        Resources
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading resources…</span>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Always render Equity section with Option Modeller tool */}
          {!grouped["Equity"] && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Equity</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <OptionModellerCard />
              </div>
            </div>
          )}
          {/* Compensation section removed */}
          {Object.entries(grouped).sort().map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">
                {category}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category === "Equity" && <OptionModellerCard />}
                {category === "Compensation" && <CommissionCalculatorCard />}
                {category === "Financing Guide" && <FinancingGuideCard />}
                {category === "Financing Guide" ? null : items.map((r) => {
                  const isApproved = approvedIds.has(r.id);

                  if (r.approval_required && !isApproved) {
                    return (
                      <div
                        key={r.id}
                        className="border border-border rounded-lg p-5 bg-secondary/20 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground leading-tight">{r.title}</h4>
                          <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        </div>
                        {r.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                        )}
                        <RequestAccessButton
                          itemId={r.id}
                          itemName={r.title}
                          companyName={companyName}
                        />
                      </div>
                    );
                  }

                  const href = r.file_path ? getFileUrl(r.file_path) : r.url;
                  const isFile = !!r.file_path;
                  return (
                    <div
                      key={r.id}
                      className={`group border border-border rounded-lg p-5 bg-secondary/20 flex flex-col gap-2 transition-colors ${href ? "hover:border-primary/50 hover:bg-secondary/40" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-foreground leading-tight">{r.title}</h4>
                        {href && (
                          isFile
                            ? <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            : <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      )}
                      {href && (
                        <div className="flex items-center gap-2 mt-auto pt-1">
                          {isFile ? (
                            <>
                              <DownloadButton href={href} filename={r.file_path!.split("/").pop()!} />
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" /> View
                              </a>
                            </>
                          ) : (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                            >
                              <ExternalLink className="w-3 h-3" /> Open Link
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ResourcesSection;
