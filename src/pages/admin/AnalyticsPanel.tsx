import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BarChart3 } from "lucide-react";

interface AnalyticsSummary {
  totalPartnershipClicks: number;
  totalResourceDownloads: number;
  topPartnerships: { name: string; count: number }[];
  topResources: { name: string; count: number }[];
}

const AnalyticsPanel: FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsSummary>({
    totalPartnershipClicks: 0,
    totalResourceDownloads: 0,
    topPartnerships: [],
    topResources: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: rows } = await supabase
        .from("portal_analytics")
        .select("event_type, item_name")
        .order("created_at", { ascending: false });

      if (!rows) { setLoading(false); return; }

      const partnershipClicks = rows.filter(r => r.event_type === "partnership_click");
      const resourceDownloads = rows.filter(r => r.event_type === "resource_download");

      // Count by item_name
      const countBy = (items: typeof rows) => {
        const counts: Record<string, number> = {};
        items.forEach(r => { counts[r.item_name] = (counts[r.item_name] ?? 0) + 1; });
        return Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      };

      setData({
        totalPartnershipClicks: partnershipClicks.length,
        totalResourceDownloads: resourceDownloads.length,
        topPartnerships: countBy(partnershipClicks),
        topResources: countBy(resourceDownloads),
      });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Loading analytics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-5 bg-secondary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Partnership Clicks</p>
          <p className="text-3xl font-bold text-foreground">{data.totalPartnershipClicks}</p>
        </div>
        <div className="border border-border rounded-lg p-5 bg-secondary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Resource Downloads</p>
          <p className="text-3xl font-bold text-foreground">{data.totalResourceDownloads}</p>
        </div>
      </div>

      {/* Top partnerships */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
          Most Clicked Partnerships
        </h3>
        {data.topPartnerships.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-2">
            {data.topPartnerships.map((p) => (
              <div key={p.name} className="flex items-center justify-between border border-border rounded-lg p-3 bg-secondary/10">
                <span className="text-sm font-semibold text-foreground">{p.name}</span>
                <span className="text-xs font-bold text-primary">{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top resources */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
          Most Downloaded Resources
        </h3>
        {data.topResources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-2">
            {data.topResources.map((r) => (
              <div key={r.name} className="flex items-center justify-between border border-border rounded-lg p-3 bg-secondary/10">
                <span className="text-sm font-semibold text-foreground">{r.name}</span>
                <span className="text-xs font-bold text-primary">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
