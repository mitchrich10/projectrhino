import { FC, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Download, ExternalLink, FileText, Loader2, Lock,
  Calculator, BookOpen, FileSpreadsheet, Presentation,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { trackPortalEvent } from "@/lib/portalAnalytics";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  category: string;
  approval_required: boolean;
}

/* ── Category display order ─────────────────────────────────────────────── */
const CATEGORY_ORDER = ["Fundraising", "Governance", "Compensation & Equity", "Hiring"];

/* ── Icon resolver ──────────────────────────────────────────────────────── */
const getResourceIcon = (title: string, filePath: string | null) => {
  const t = title.toLowerCase();
  if (t.includes("financing") || t.includes("fundrais")) return BookOpen;
  if (t.includes("option modeller") || t.includes("calculator")) return Calculator;
  if (t.includes("spreadsheet") || t.includes("tracker") || t.includes("data room") || t.includes("co-investor"))
    return FileSpreadsheet;
  if (filePath?.endsWith(".pptx") || filePath?.endsWith(".ppt") || t.includes("presentation") || t.includes("hiring"))
    return Presentation;
  return FileText;
};

/* ── File type label ────────────────────────────────────────────────────── */
const getFileTypeBadge = (resource: Resource, isSpecial?: boolean): string => {
  if (isSpecial) return "Interactive Tool";
  if (!resource.file_path && resource.url) return "External Link";
  const fp = resource.file_path?.toLowerCase() ?? "";
  if (fp.endsWith(".pdf")) return "PDF";
  if (fp.endsWith(".xlsx") || fp.endsWith(".xls")) return "Excel";
  if (fp.endsWith(".pptx") || fp.endsWith(".ppt")) return "Presentation";
  if (fp.endsWith(".docx") || fp.endsWith(".doc")) return "Document";
  return "File";
};

/* ── Download helper ────────────────────────────────────────────────────── */
const useBlobDownload = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const download = useCallback(async (id: string, href: string, filename: string) => {
    setLoadingId(id);
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
      setLoadingId(null);
    }
  }, []);

  return { loadingId, download };
};

/* ── Request Access Button ──────────────────────────────────────────────── */
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

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("loading");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus("error"); return; }

    const res = await supabase.functions.invoke("request-access", {
      body: { item_type: "resource", item_id: itemId, item_name: itemName, company_name: companyName },
    });

    setStatus(res.error || res.data?.error === "already_requested" || res.data?.success ? "requested" : "error");
  };

  if (status === "requested") {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#5C6B7A]">
        Requested ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={status === "loading"}
      className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#1A7EC8] hover:opacity-70 transition-opacity disabled:opacity-50"
    >
      {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
      Request Access
    </button>
  );
};

/* ── Comp benchmarks description ────────────────────────────────────────── */
const COMP_BENCHMARKS_DETAIL = {
  pave: {
    name: "Pave Market Data Lite",
    description: "Free for companies under 200 employees. Connect your HRIS to access real-time base salary and equity benchmarks from 8,700+ peer companies. Covers US + one additional market.",
    url: "https://www.pave.com/products/market-data-lite",
  },
  carta: {
    name: "Carta Total Comp",
    description: "If you're already using Carta for your cap table, you can access compensation benchmarks through their platform. Particularly strong on equity data for private companies.",
    url: "https://carta.com",
  },
};

/* ── Special tool cards (same visual style as DB resource cards) ─────────── */
const SPECIAL_CARDS: Record<string, { title: string; description: string; icon: typeof BookOpen; to?: string; href?: string; fileType: string }> = {
  "Compensation & Equity:option-modeller": {
    title: "Option Modeller",
    description: "Interactive tool to model the value of your stock option grant across exit scenarios.",
    icon: Calculator,
    to: "/option-modeller",
    fileType: "Interactive Tool",
  },
  "Fundraising:financing-guide": {
    title: "Financing Process Guide",
    description: "A curated package of frameworks, templates, and tools for founders preparing for a Series A or growth-stage round.",
    icon: BookOpen,
    to: "/portal/financing-guide",
    fileType: "Interactive Tool",
  },
  "Governance:project-proposal": {
    title: "Project Proposal Template",
    description: "All company investments should be tied to hypotheses on the impact to the business. Use this guided form to structure proposals and export a clean Word document, or download a blank template.",
    icon: FileText,
    to: "/investment-brief",
    fileType: "Interactive Tool",
  },
};

/* ── Resource Detail Panel ──────────────────────────────────────────────── */
const ResourcePanel: FC<{
  resource: Resource | null;
  specialCard: (typeof SPECIAL_CARDS)[string] | null;
  open: boolean;
  onClose: () => void;
  onDownload: (id: string, href: string, filename: string) => void;
  getFileUrl: (fp: string) => string;
  loadingId: string | null;
}> = ({ resource, specialCard, open, onClose, onDownload, getFileUrl, loadingId }) => {
  const isCompBenchmarks = resource?.title === "Compensation Benchmarks";
  const isSpecial = !!specialCard;
  const title = specialCard?.title ?? resource?.title ?? "";
  const description = specialCard?.description ?? resource?.description ?? "";
  const category = resource?.category ?? "";
  const fileType = specialCard ? specialCard.fileType : resource ? getFileTypeBadge(resource) : "";

  const Icon = resource ? getResourceIcon(resource.title, resource.file_path) : specialCard ? specialCard.icon : FileText;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-[#DDE4EC] shadow-xl overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="px-6 pt-8 pb-5 border-b border-[#DDE4EC]">
          <div className="w-12 h-12 rounded-lg bg-[#1A7EC8]/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[#1A7EC8]" />
          </div>
          <h2 className="text-xl font-semibold text-[#173660] mb-3">{title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <Badge className="bg-[#1A7EC8] text-white border-0 text-[10px] uppercase tracking-wider font-semibold">
                {category}
              </Badge>
            )}
            {fileType && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold text-[#5C6B7A] border-[#CDD8E3]">
                {fileType}
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {description && (
            <p className="text-sm text-[#173660]/80 leading-[1.7] whitespace-pre-line">{description}</p>
          )}

          {/* Comp benchmarks special content */}
          {isCompBenchmarks && (
            <div className="space-y-4">
              {Object.values(COMP_BENCHMARKS_DETAIL).map((tool) => (
                <div key={tool.name} className="border border-[#DDE4EC] rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-[#173660]">{tool.name}</h4>
                  <p className="text-[13px] text-[#5C6B7A] leading-relaxed">{tool.description}</p>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#1A7EC8] hover:opacity-70 transition-opacity"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="px-6">
          <div className="h-px bg-[#1A7EC8]/20" />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5">
          {isSpecial && specialCard?.to ? (
            <Link
              to={specialCard.to}
              className="flex items-center justify-center gap-2 w-full bg-[#1A7EC8] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors"
            >
              Open Tool <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : isCompBenchmarks ? null : resource?.file_path ? (
            <button
              onClick={() => {
                const url = getFileUrl(resource.file_path!);
                onDownload(resource.id, url, resource.file_path!.split("/").pop()!);
              }}
              disabled={loadingId === resource?.id}
              className="flex items-center justify-center gap-2 w-full bg-[#1A7EC8] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors disabled:opacity-50"
            >
              {loadingId === resource?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download
            </button>
          ) : resource?.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#1A7EC8] text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-[#173660] transition-colors"
            >
              Open <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* ── Main Section ───────────────────────────────────────────────────────── */
const ResourcesSection: FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedSpecial, setSelectedSpecial] = useState<(typeof SPECIAL_CARDS)[string] | null>(null);
  const { loadingId, download } = useBlobDownload();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const [{ data }, { data: approvedData }] = await Promise.all([
        supabase.from("resources").select("id, title, description, url, file_path, category, approval_required").order("category").order("title"),
        session
          ? supabase.from("partner_requests").select("item_id").eq("user_id", session.user.id).eq("item_type", "resource").eq("status", "approved")
          : Promise.resolve({ data: [] }),
      ]);

      setResources(data ?? []);
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

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("resources").getPublicUrl(filePath);
    return data.publicUrl;
  };

  /* Group by category */
  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    (acc[r.category] = acc[r.category] ?? []).push(r);
    return acc;
  }, {});

  /* Sort categories by defined order */
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  /* ── Card renderer ────────────────────────────────────────────────── */
  const renderCard = (r: Resource) => {
    const isApproved = approvedIds.has(r.id);
    const locked = r.approval_required && !isApproved;
    const isCompBenchmarks = r.title === "Compensation Benchmarks";
    const isFile = !!r.file_path;
    const isExternal = !isFile && !!r.url && !isCompBenchmarks;
    const Icon = getResourceIcon(r.title, r.file_path);

    const handleCardClick = () => {
      if (locked) return;
      setSelectedSpecial(null);
      setSelectedResource(r);
    };

    return (
      <div
        key={r.id}
        onClick={handleCardClick}
        className={`relative bg-white border rounded-lg p-5 flex flex-col gap-2 transition-all duration-200 ${
          locked
            ? "border-[#DDE4EC] opacity-70 cursor-default"
            : "border-[#DDE4EC] cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-[#1A7EC8]"
        }`}
        style={{ height: 140, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 8 }}
      >
        {/* Top row: icon left, action icon right */}
        <div className="flex items-start justify-between">
          <Icon className="w-5 h-5 text-[#1A7EC8] flex-shrink-0" />
          {locked ? (
            <Lock className="w-3.5 h-3.5 text-[#5C6B7A]/50 flex-shrink-0" />
          ) : isFile ? (
            <Download className="w-3.5 h-3.5 text-[#5C6B7A] flex-shrink-0" />
          ) : isExternal ? (
            <ExternalLink className="w-3.5 h-3.5 text-[#5C6B7A] flex-shrink-0" />
          ) : null}
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold leading-tight" style={{ color: "#173660", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {r.title}
        </h4>

        {/* Description */}
        {r.description && (
          <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "#5C6B7A" }}>
            {r.description}
          </p>
        )}

        {/* Request access for locked */}
        {locked && (
          <div className="mt-auto">
            <RequestAccessButton itemId={r.id} itemName={r.title} companyName={companyName} />
          </div>
        )}
      </div>
    );
  };

  /* ── Special card (tools/links) ────────────────────────────────────── */
  const renderSpecialCard = (key: string) => {
    const card = SPECIAL_CARDS[key];
    if (!card) return null;
    const Icon = card.icon;

    return (
      <div
        key={key}
        onClick={() => {
          setSelectedResource(null);
          setSelectedSpecial(card);
        }}
        className="relative bg-white border border-[#DDE4EC] rounded-lg p-5 flex flex-col gap-2 transition-all duration-200 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-[#1A7EC8]"
        style={{ height: 140, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 8 }}
      >
        <div className="flex items-start justify-between">
          <Icon className="w-5 h-5 text-[#1A7EC8] flex-shrink-0" />
          <ExternalLink className="w-3.5 h-3.5 text-[#5C6B7A] flex-shrink-0" />
        </div>
        <h4 className="text-sm font-semibold leading-tight" style={{ color: "#173660", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {card.title}
        </h4>
        <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "#5C6B7A" }}>
          {card.description}
        </p>
      </div>
    );
  };

  return (
    <section id="resources">
      {/* Section header matching partnerships */}
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8]">Library</p>
      </div>
      <h2 className="text-xl font-bold text-[#173660] mb-8 pb-3 border-b border-[#DDE4EC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Resources
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-[#5C6B7A]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading resources…</span>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedCategories.map((category) => {
            const items = grouped[category];
            const specialKeys = Object.keys(SPECIAL_CARDS).filter((k) => k.startsWith(category + ":"));

            return (
              <div key={category}>
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-5 pl-3"
                  style={{ color: "#1A7EC8", borderLeft: "3px solid #1A7EC8", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {category}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category !== "Governance" && specialKeys.map((k) => renderSpecialCard(k))}
                  {items
                    .filter((r) => {
                      if (category === "Fundraising" && r.title === "Financing Process Guide") return false;
                      return true;
                    })
                    .map(renderCard)}
                  {category === "Governance" && specialKeys.map((k) => renderSpecialCard(k))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      <ResourcePanel
        resource={selectedResource}
        specialCard={selectedSpecial}
        open={!!(selectedResource || selectedSpecial)}
        onClose={() => { setSelectedResource(null); setSelectedSpecial(null); }}
        onDownload={download}
        getFileUrl={getFileUrl}
        loadingId={loadingId}
      />
    </section>
  );
};

export default ResourcesSection;
