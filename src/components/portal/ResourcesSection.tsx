import { FC, useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, ExternalLink, FileText, Loader2, Lock } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  category: string;
  approval_required: boolean;
}

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
      ) : resources.length === 0 ? (
        <p className="text-xs text-muted-foreground">Resources coming soon.</p>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).sort().map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">
                {category}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((r) => {
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
