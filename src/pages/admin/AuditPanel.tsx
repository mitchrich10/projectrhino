import { FC, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, ArrowUpDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Partnership {
  id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  redemption_url: string | null;
  website_url: string | null;
  detail_pdf_url: string | null;
}

interface ResourceRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  approval_required: boolean;
  file_path: string | null;
  url: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CTA_PHRASES = ["click here", "get started", "sign up", "apply now", "redeem", "visit"];
const EXPECTED_CTA = "redeem offer";

const preview = (s: string | null, n = 200) =>
  !s ? "—" : s.length > n ? s.slice(0, n) + "…" : s;

const findCtaMismatches = (desc: string | null): string[] => {
  if (!desc) return [];
  const lower = desc.toLowerCase();
  return CTA_PHRASES.filter((p) => lower.includes(p) && !lower.includes(EXPECTED_CTA + " " + p) && p !== "redeem");
};

type SortDir = "asc" | "desc";

function useSort<T extends Record<string, any>>(rows: T[]) {
  const [key, setKey] = useState<string | null>(null);
  const [dir, setDir] = useState<SortDir>("asc");
  const sorted = useMemo(() => {
    if (!key) return rows;
    return [...rows].sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, key, dir]);
  const toggle = (k: string) => {
    if (key === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setKey(k); setDir("asc"); }
  };
  return { sorted, toggle, key, dir };
}

const Th: FC<{ label: string; sortKey?: string; onSort?: (k: string) => void; activeKey?: string | null; dir?: SortDir }> = ({ label, sortKey, onSort, activeKey, dir }) => (
  <th
    onClick={() => sortKey && onSort?.(sortKey)}
    className={`text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border ${sortKey ? "cursor-pointer hover:text-foreground" : ""}`}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {sortKey && <ArrowUpDown className={`w-3 h-3 ${activeKey === sortKey ? "text-primary" : "opacity-40"}`} />}
      {activeKey === sortKey && <span className="text-[9px]">{dir === "asc" ? "▲" : "▼"}</span>}
    </span>
  </th>
);

const Check: FC<{ ok: boolean }> = ({ ok }) => (
  <span className={ok ? "text-emerald-600" : "text-destructive"}>{ok ? "✅" : "❌"}</span>
);

// ── Partnership Audit ────────────────────────────────────────────────────────
const PartnershipAudit: FC<{ rows: Partnership[] }> = ({ rows }) => {
  const enriched = useMemo(
    () =>
      rows.map((r) => {
        const mismatches = findCtaMismatches(r.description);
        const hasPdf = !!r.detail_pdf_url;
        const issue = !hasPdf || mismatches.length > 0 || !r.tagline || !r.redemption_url;
        return { ...r, _mismatches: mismatches, _hasPdf: hasPdf, _issue: issue };
      }),
    [rows]
  );
  const { sorted, toggle, key, dir } = useSort(enriched);

  return (
    <section className="mb-12">
      <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">Partnership Audit ({rows.length})</h3>
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/30">
            <tr>
              <Th label="Name" sortKey="name" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Category" sortKey="category" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Tagline" sortKey="tagline" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Redemption" />
              <Th label="Website" />
              <Th label="PDF" sortKey="_hasPdf" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Description (200)" />
              <Th label="CTA Issues" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className={`border-b border-border align-top ${r._issue ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                <td className="px-3 py-2 font-bold text-foreground">{r.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.category}</td>
                <td className="px-3 py-2 text-muted-foreground max-w-[220px]">{r.tagline || <span className="text-destructive">—</span>}</td>
                <td className="px-3 py-2">
                  {r.redemption_url ? (
                    <a href={r.redemption_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-destructive">—</span>}
                </td>
                <td className="px-3 py-2">
                  {r.website_url ? (
                    <a href={r.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <span className="text-emerald-600">✅</span> Site <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-destructive">❌ missing</span>}
                </td>
                <td className="px-3 py-2"><Check ok={r._hasPdf} /></td>
                <td className="px-3 py-2 text-muted-foreground max-w-[320px]">{preview(r.description)}</td>
                <td className="px-3 py-2">
                  {r._mismatches.length === 0 ? (
                    <span className="text-emerald-600">OK</span>
                  ) : (
                    <span className="text-destructive font-bold">{r._mismatches.join(", ")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ── Resource Audit ───────────────────────────────────────────────────────────
const ResourceAudit: FC<{ rows: ResourceRow[] }> = ({ rows }) => {
  const [fileStatus, setFileStatus] = useState<Record<string, boolean | null>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: Record<string, boolean | null> = {};
      for (const r of rows) {
        const url = r.file_path
          ? supabase.storage.from("resources").getPublicUrl(r.file_path).data.publicUrl
          : r.url;
        if (!url) { results[r.id] = null; continue; }
        try {
          const res = await fetch(url, { method: "HEAD", mode: "no-cors" }).catch(() => null);
          // no-cors returns opaque; fall back to GET range if needed
          if (res && (res.ok || res.type === "opaque")) results[r.id] = true;
          else results[r.id] = false;
        } catch {
          results[r.id] = false;
        }
      }
      if (!cancelled) setFileStatus(results);
    })();
    return () => { cancelled = true; };
  }, [rows]);

  const enriched = useMemo(
    () =>
      rows.map((r) => {
        const hasFile = !!r.file_path;
        const loads = fileStatus[r.id];
        const issue = !hasFile && !r.url ? true : loads === false;
        return { ...r, _hasFile: hasFile, _loads: loads, _issue: issue };
      }),
    [rows, fileStatus]
  );
  const { sorted, toggle, key, dir } = useSort(enriched);

  return (
    <section>
      <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">Resource Audit ({rows.length})</h3>
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/30">
            <tr>
              <Th label="Title" sortKey="title" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Category" sortKey="category" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Gated" sortKey="approval_required" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Has File" sortKey="_hasFile" onSort={toggle} activeKey={key} dir={dir} />
              <Th label="Loads" />
              <Th label="Description (200)" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className={`border-b border-border align-top ${r._issue ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                <td className="px-3 py-2 font-bold text-foreground">{r.title}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.category}</td>
                <td className="px-3 py-2"><Check ok={r.approval_required} /></td>
                <td className="px-3 py-2"><Check ok={r._hasFile} /></td>
                <td className="px-3 py-2">
                  {r._loads === null ? <span className="text-muted-foreground">n/a</span>
                    : r._loads === undefined ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    : <Check ok={r._loads} />}
                </td>
                <td className="px-3 py-2 text-muted-foreground max-w-[400px]">{preview(r.description)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ── Panel ────────────────────────────────────────────────────────────────────
const AuditPanel: FC = () => {
  const [loading, setLoading] = useState(true);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);

  useEffect(() => {
    (async () => {
      const [p, r] = await Promise.all([
        supabase.from("partnerships").select("id,name,category,tagline,description,redemption_url,website_url,detail_pdf_url").order("name"),
        supabase.from("resources").select("id,title,category,description,approval_required,file_path,url").order("category").order("title"),
      ]);
      setPartnerships((p.data as Partnership[]) ?? []);
      setResources((r.data as ResourceRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading audit…</span></div>;
  }

  return (
    <div>
      <div className="mb-6 p-3 border border-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded text-xs text-amber-900 dark:text-amber-200">
        <strong>Temporary QA tool.</strong> Rows highlighted in red have issues that need review.
      </div>
      <PartnershipAudit rows={partnerships} />
      <ResourceAudit rows={resources} />
    </div>
  );
};

export default AuditPanel;
