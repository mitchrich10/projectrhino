import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, FileText, Loader2 } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  category: string;
}

const ResourcesSection: FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("resources")
        .select("id, title, description, url, file_path, category")
        .order("category")
        .order("title");
      setResources(data ?? []);
      setLoading(false);
    };
    fetch();
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
                  const href = r.file_path ? getFileUrl(r.file_path) : r.url;
                  return (
                    <a
                      key={r.id}
                      href={href ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group border border-border rounded-lg p-5 bg-secondary/20 flex flex-col gap-2 transition-colors ${href ? "hover:border-primary/50 hover:bg-secondary/40 cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-foreground leading-tight">{r.title}</h4>
                        {href && (
                          r.file_path
                            ? <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            : <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      )}
                      {r.file_path && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary self-start">
                          PDF ↗
                        </span>
                      )}
                    </a>
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
