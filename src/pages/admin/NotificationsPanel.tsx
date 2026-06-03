import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, Trash2, Eye, Send, Bell } from "lucide-react";

interface QueueItem {
  id: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  summary: string | null;
  queued_at: string;
}

interface SentDigest {
  id: string;
  batch_id: string;
  subscriber_count: number;
  item_count: number;
  subject: string | null;
  item_ids: string[];
  sent_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  partnership_added: "partnership_added",
  partnership_updated: "partnership_updated",
  resource_added: "resource_added",
  event_added: "event_added",
};

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const NotificationsPanel: FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [digests, setDigests] = useState<SentDigest[]>([]);

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [viewDigest, setViewDigest] = useState<{ digest: SentDigest; items: QueueItem[] } | null>(null);

  const fetchAll = async () => {
    const [queueRes, subsRes, digestRes] = await Promise.all([
      supabase.from("digest_queue").select("*").is("sent_at", null).order("queued_at", { ascending: false }),
      supabase.from("notification_subscriptions").select("id", { count: "exact", head: true }).eq("subscribed", true),
      supabase.from("digests_sent").select("*").order("sent_at", { ascending: false }).limit(20),
    ]);
    const queue = (queueRes.data as QueueItem[]) ?? [];
    setItems(queue);
    setSelected(new Set(queue.map((i) => i.id)));
    setSubscriberCount(subsRes.count ?? 0);
    setDigests((digestRes.data as SentDigest[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const removeItem = async (id: string) => {
    if (!confirm("Remove this item from the queue? It won't appear in any digest.")) return;
    await supabase.from("digest_queue").delete().eq("id", id);
    await fetchAll();
  };

  const selectedIds = () => items.filter((i) => selected.has(i.id)).map((i) => i.id);

  const openPreview = async () => {
    setError(null);
    setPreviewLoading(true);
    const ids = selectedIds();
    if (ids.length === 0) { setError("Select at least one item to preview."); setPreviewLoading(false); return; }
    const { data, error: e } = await supabase.functions.invoke("send-digest", {
      body: { item_ids: ids, preview: true },
    });
    setPreviewLoading(false);
    if (e || data?.error) { setError(e?.message || data?.error || "Preview failed."); return; }
    setPreviewHtml(data.html);
  };

  const send = async () => {
    setSending(true);
    setError(null);
    const ids = selectedIds();
    const { data, error: e } = await supabase.functions.invoke("send-digest", {
      body: { item_ids: ids },
    });
    setSending(false);
    setConfirmOpen(false);
    if (e || data?.error) { setError(e?.message || data?.error || "Send failed."); return; }
    setResult(`Digest sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}.`);
    await fetchAll();
  };

  const openViewDigest = async (d: SentDigest) => {
    const { data } = await supabase.from("digest_queue").select("*").in("id", d.item_ids);
    setViewDigest({ digest: d, items: (data as QueueItem[]) ?? [] });
  };

  const selectedCount = selectedIds().length;

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading…</span>
    </div>
  );

  return (
    <div className="space-y-10">
      {result && (
        <div className="flex items-center justify-between text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span>{result}</span>
          <button onClick={() => setResult(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Queue */}
      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
          Queued for Digest ({items.length} item{items.length !== 1 ? "s" : ""})
        </h3>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <Bell className="w-5 h-5 mx-auto mb-3 opacity-40" />
            <p className="text-xs max-w-sm mx-auto leading-relaxed">
              No items queued. Updates will appear here when you add or update partnerships, resources, or events.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-start gap-3 border border-border rounded-lg p-4 bg-secondary/10">
                <input
                  type="checkbox"
                  checked={selected.has(it.id)}
                  onChange={() => toggle(it.id)}
                  className="mt-1 h-4 w-4 accent-primary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold text-sm text-foreground">{it.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                      {TYPE_LABEL[it.entity_type] ?? it.entity_type}
                    </span>
                  </div>
                  {it.summary && <p className="text-xs text-muted-foreground line-clamp-2">{it.summary}</p>}
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Queued {relativeTime(it.queued_at)} ·{" "}
                    <button onClick={() => removeItem(it.id)} className="text-destructive hover:underline font-semibold">Remove</button>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={openPreview}
              disabled={previewLoading || selectedCount === 0}
              className="flex items-center gap-2 border border-border text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {previewLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              Preview Digest
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={selectedCount === 0 || subscriberCount === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Send to Subscribers ({subscriberCount})
            </button>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          {subscriberCount === 0 ? (
            <span className="text-amber-600 font-semibold">0 subscribers — share the portal sign-up link with portcos.</span>
          ) : (
            <span><span className="font-bold text-foreground">{subscriberCount}</span> active subscriber{subscriberCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      </section>

      {/* Previous digests */}
      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
          Previous Digests
        </h3>
        {digests.length === 0 ? (
          <p className="text-xs text-muted-foreground">No digests sent yet.</p>
        ) : (
          <div className="space-y-2">
            {digests.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-xs text-muted-foreground border border-border rounded-lg px-4 py-3 bg-secondary/10">
                <span className="font-bold text-foreground">{formatDate(d.sent_at)}</span>
                <span className="text-muted-foreground/50">·</span>
                <span>{d.item_count} item{d.item_count !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground/50">·</span>
                <span>sent to {d.subscriber_count} subscriber{d.subscriber_count !== 1 ? "s" : ""}</span>
                <button onClick={() => openViewDigest(d)} className="ml-auto text-primary hover:underline font-semibold">view</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preview modal */}
      {previewHtml !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Digest Preview</h3>
              <button onClick={() => setPreviewHtml(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto bg-secondary/20">
              <iframe title="Digest preview" srcDoc={previewHtml} className="w-full h-[60vh] bg-white rounded border border-border" />
            </div>
          </div>
        </div>
      )}

      {/* View previous digest modal */}
      {viewDigest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{formatDate(viewDigest.digest.sent_at)} Digest</h3>
              <button onClick={() => setViewDigest(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-3 overflow-y-auto">
              {viewDigest.digest.subject && <p className="text-xs font-semibold text-foreground">{viewDigest.digest.subject}</p>}
              <p className="text-[11px] text-muted-foreground">
                {viewDigest.digest.item_count} items · sent to {viewDigest.digest.subscriber_count} subscribers
              </p>
              <div className="space-y-2 pt-2">
                {viewDigest.items.map((it) => (
                  <div key={it.id} className="border border-border rounded-lg p-3 bg-secondary/10">
                    <span className="font-bold text-sm text-foreground">{it.title}</span>
                    {it.summary && <p className="text-xs text-muted-foreground mt-0.5">{it.summary}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-sm shadow-2xl">
            <div className="px-6 py-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-3">Send Digest?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Send digest with <span className="font-bold text-foreground">{selectedCount}</span> item{selectedCount !== 1 ? "s" : ""} to{" "}
                <span className="font-bold text-foreground">{subscriberCount}</span> subscriber{subscriberCount !== 1 ? "s" : ""}? Cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setConfirmOpen(false)} className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2">Cancel</button>
              <button onClick={send} disabled={sending} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
