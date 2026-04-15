import { FC, useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Loader2,
  LogOut,
  Menu,
  Presentation,
  X,
} from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
import { companyLogos } from "@/lib/companyLogos";

/* ── Types ─────────────────────────────────────────────────── */

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
}

interface CompanyInfo {
  company_name: string;
  logo_key: string | null;
}

/* ── Resource metadata (order + styling) ───────────────────── */

const RESOURCE_META: Record<
  string,
  { icon: typeof FileText; typeBadge: string; badgeClass: string }
> = {
  "Financing Process Guide": {
    icon: Presentation,
    typeBadge: "Presentation",
    badgeClass: "bg-[#173660] text-white",
  },
  "Data Room Request": {
    icon: FileSpreadsheet,
    typeBadge: "Excel Tracker",
    badgeClass: "bg-[#1A7EC8] text-white",
  },
  "First Meeting Prep Guide": {
    icon: FileText,
    typeBadge: "Word Document",
    badgeClass: "bg-[#CDD8E3] text-[#173660]",
  },
  "VC Prospecting Tracker": {
    icon: FileSpreadsheet,
    typeBadge: "Excel Tracker",
    badgeClass: "bg-[#1A7EC8] text-white",
  },
  "Fundraising Questions": {
    icon: FileText,
    typeBadge: "Reference Guide",
    badgeClass: "bg-[#173660] text-white",
  },
};

const RESOURCE_ORDER = [
  "Financing Process Guide",
  "Data Room Request",
  "First Meeting Prep Guide",
  "VC Prospecting Tracker",
  "Fundraising Questions",
  "SAFE Template",
];

/* ── Helpers ───────────────────────────────────────────────── */

const getFileUrl = (filePath: string) =>
  supabase.storage.from("resources").getPublicUrl(filePath).data.publicUrl;

const isPdf = (filePath: string | null) =>
  filePath?.toLowerCase().endsWith(".pdf");

const downloadFile = async (href: string, filename: string) => {
  const res = await fetch(href);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── Download button ───────────────────────────────────────── */

const DownloadBtn: FC<{ href: string; filename: string }> = ({ href, filename }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      setLoading(true);
      try {
        await downloadFile(href, filename);
      } finally {
        setLoading(false);
      }
    },
    [href, filename],
  );

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#1A7EC8] text-white px-3 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50 w-full sm:w-auto"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Download className="w-3 h-3" />
      )}
      Download
    </button>
  );
};

/* ── Download All button ───────────────────────────────────── */

const DownloadAllBtn: FC<{ resources: Resource[] }> = ({ resources }) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadAll = async () => {
    setLoading(true);
    try {
      for (const r of resources) {
        if (!r.file_path) continue;
        const url = getFileUrl(r.file_path);
        const filename = r.file_path.split("/").pop()!;
        await downloadFile(url, filename);
        await sleep(800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadAll}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-[#1A7EC8] text-white font-bold uppercase tracking-widest text-xs px-5 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {loading ? "Downloading…" : "Download All Resources"}
    </button>
  );
};

/* ── Slide-over preview panel ──────────────────────────────── */

const PreviewPanel: FC<{
  resource: Resource;
  onClose: () => void;
}> = ({ resource, onClose }) => {
  const meta = RESOURCE_META[resource.title] ?? {
    icon: FileText,
    typeBadge: "Document",
    badgeClass: "bg-[#CDD8E3] text-[#173660]",
  };

  const fileUrl = resource.file_path ? getFileUrl(resource.file_path) : null;
  const pdf = isPdf(resource.file_path);
  const filename = resource.file_path?.split("/").pop() ?? "file";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#CDD8E3] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#173660] truncate">{resource.title}</h3>
            <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${meta.badgeClass}`}>
              {meta.typeBadge}
            </span>
          </div>
          <button onClick={onClose} className="text-[#5C6B7A] hover:text-[#173660] transition-colors ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="px-6 py-4 border-b border-[#CDD8E3]">
            <p className="text-xs text-[#5C6B7A] leading-relaxed">{resource.description}</p>
          </div>
        )}

        {/* PDF Viewer or info */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {pdf && fileUrl ? (
            <iframe
              src={fileUrl}
              title={resource.title}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full px-6">
              <p className="text-sm text-[#5C6B7A] text-center">
                This file type cannot be previewed inline.<br />
                Use the download button below.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {fileUrl && (
          <div className="px-6 py-4 border-t border-[#CDD8E3] flex-shrink-0">
            <DownloadBtn href={fileUrl} filename={filename} />
          </div>
        )}
      </div>
    </>
  );
};

/* ── Request access for entire bundle ─────────────────────── */

const RequestAccessBtn: FC<{ companyName: string }> = ({ companyName }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "requested" | "error">("idle");

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("partner_requests")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("item_type", "financing_guide")
        .maybeSingle();
      if (data) setStatus("requested");
    };
    check();
  }, []);

  const handleRequest = async () => {
    setStatus("loading");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setStatus("error");
      return;
    }

    const res = await supabase.functions.invoke("request-access", {
      body: {
        item_type: "financing_guide",
        item_id: null,
        item_name: "Financing Process Guide Package",
        company_name: companyName,
      },
    });

    if (res.error || res.data?.error === "already_requested" || res.data?.success) {
      setStatus("requested");
    } else {
      setStatus("error");
    }
  };

  if (status === "requested") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/80">
          <Lock className="w-4 h-4" /> Access Requested ✓
        </span>
        <p className="text-xs text-white/50">Rhino reviews all resource requests and will confirm access shortly.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleRequest}
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 bg-[#1A7EC8] text-white font-bold uppercase tracking-widest text-sm px-6 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        Request Access
      </button>
      <p className="text-xs text-white/50">Rhino reviews all resource requests and will confirm access shortly.</p>
    </div>
  );
};

/* ── Resource Card ─────────────────────────────────────────── */

const ResourceCard: FC<{
  resource: Resource;
  unlocked: boolean;
  onPreview: (r: Resource) => void;
}> = ({ resource, unlocked, onPreview }) => {
  const meta = RESOURCE_META[resource.title] ?? {
    icon: FileText,
    typeBadge: "Document",
    badgeClass: "bg-[#CDD8E3] text-[#173660]",
  };
  const Icon = meta.icon;

  const fileUrl = resource.file_path ? getFileUrl(resource.file_path) : null;

  return (
    <div
      onClick={() => unlocked && onPreview(resource)}
      className={`bg-white rounded-lg border border-[#CDD8E3] overflow-hidden flex flex-col transition-shadow ${unlocked ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      {/* Navy accent bar */}
      <div className="h-1 bg-[#173660]" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Icon + badge row */}
        <div className="flex items-start justify-between gap-2">
          <Icon className="w-5 h-5 text-[#173660] flex-shrink-0 mt-0.5" />
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${meta.badgeClass}`}
          >
            {meta.typeBadge}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm text-[#173660] leading-tight">{resource.title}</h3>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-[#5C6B7A] leading-relaxed">{resource.description}</p>
        )}

        {/* Action */}
        <div className="mt-auto pt-2">
          {unlocked && fileUrl ? (
            <DownloadBtn href={fileUrl} filename={resource.file_path!.split("/").pop()!} />
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5C6B7A]">
              <Lock className="w-3 h-3" /> Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────── */

const FinancingGuide: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        navigate("/partner-login");
      }
    });

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        navigate("/partner-login");
        return;
      }

      const email = session.user.email;
      const domain = email.split("@")[1]?.toLowerCase();

      const [{ data: domainData }, { data: resourceData }, { data: approvedData }, { data: inviteData }] =
        await Promise.all([
          supabase
            .from("approved_domains")
            .select("company_name, logo_key")
            .eq("domain", domain)
            .maybeSingle(),
          supabase
            .from("resources")
            .select("id, title, description, file_path")
            .eq("category", "Fundraising")
            .order("title"),
          supabase
            .from("partner_requests")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("item_type", "financing_guide")
            .eq("status", "approved")
            .maybeSingle(),
          supabase
            .from("onboarding_invites")
            .select("id")
            .eq("email", email.toLowerCase())
            .maybeSingle(),
        ]);

      setCompany(domainData ?? { company_name: "Partner", logo_key: null });

      if (!domainData && !email.endsWith("@rhinovc.com") && !inviteData) {
        navigate("/portal");
        return;
      }

      setIsAdmin(email.endsWith("@rhinovc.com"));
      setUnlocked(!!approvedData || email.endsWith("@rhinovc.com") || !!inviteData);

      const sorted = (resourceData ?? []).sort((a, b) => {
        const ai = RESOURCE_ORDER.indexOf(a.title);
        const bi = RESOURCE_ORDER.indexOf(b.title);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      setResources(sorted);
      setLoading(false);
    };

    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/partner-login");
  };

  const logoSrc = company?.logo_key ? companyLogos[company.logo_key] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A7EC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-foreground flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#CDD8E3]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/portal"
              className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A] hover:text-[#173660] transition-colors"
            >
              ← Back to Portal
            </Link>
            {logoSrc ? (
              <img src={logoSrc} alt={company?.company_name} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-[#173660]">
                {company?.company_name}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5C6B7A] hover:text-[#173660] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8] hover:opacity-70 transition-opacity"
              >
                Admin
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-[#173660]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#CDD8E3] bg-white px-6 py-4 flex flex-col gap-4">
            <Link to="/portal" className="text-xs font-bold uppercase tracking-widest text-[#5C6B7A]">
              ← Back to Portal
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5C6B7A]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            {isAdmin && (
              <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[#1A7EC8]">
                Admin
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-16">
        <div className="bg-[#173660] px-6 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A7EC8] mb-4">
              Rhino Ventures · Founder Resources
            </p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight mb-4">
              Guide to Running a Financing Process
            </h1>
            <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              A complete package of frameworks, templates, and tools for founders preparing for a
              Series A or growth-stage financing round.
            </p>
            {!unlocked && (
              <RequestAccessBtn companyName={company?.company_name ?? "Partner"} />
            )}
            {unlocked && (
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#a3d7c2]">
                ✓ Access Granted
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Resource cards */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Download All */}
          {unlocked && resources.filter((r) => r.file_path).length > 0 && (
            <div className="mb-8 flex justify-center">
              <DownloadAllBtn resources={resources} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                unlocked={unlocked}
                onPreview={setPreviewResource}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#CDD8E3] bg-white px-6 py-6">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#5C6B7A]">
          Rhino Ventures · rhinovc.com · For informational purposes only.
        </p>
      </footer>

      {/* Preview panel */}
      {previewResource && (
        <PreviewPanel
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </div>
  );
};

export default FinancingGuide;
