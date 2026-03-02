import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X, MessageSquare, Send } from "lucide-react";

interface PartnerRequest {
  id: string;
  created_at: string;
  user_email: string;
  company_name: string;
  item_type: string;
  item_name: string;
  status: "pending" | "approved" | "denied";
  notes: string | null;
  response: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  denied: "bg-destructive/10 text-destructive border-destructive/20",
};

const RequestsAdmin: FC = () => {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "denied">("pending");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("partner_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests((data as PartnerRequest[]) ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "approved" | "denied") => {
    setUpdating(id);
    await supabase.functions.invoke("notify-request-decision", {
      body: { request_id: id, status },
    });
    await fetchRequests();
    setUpdating(null);
  };

  const openRespond = (r: PartnerRequest) => {
    setRespondingId(r.id);
    setResponseText(r.response ?? "");
  };

  const saveResponse = async (id: string) => {
    setSavingResponse(true);
    await supabase.from("partner_requests").update({ response: responseText.trim() || null }).eq("id", id);
    await fetchRequests();
    setSavingResponse(false);
    setRespondingId(null);
    setResponseText("");
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">{requests.length} total request{requests.length !== 1 ? "s" : ""}</p>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(["all", "pending", "approved", "denied"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-bold uppercase tracking-widest mb-2">No {filter === "all" ? "" : filter} requests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="border border-border rounded-lg p-4 bg-secondary/10">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{r.item_name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                      {r.item_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">{r.company_name}</span>
                    {" · "}{r.user_email}
                    {" · "}{new Date(r.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {r.notes && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">"{r.notes}"</p>
                  )}
                  {r.response && respondingId !== r.id && (
                    <p className="text-xs text-primary mt-1.5 font-medium">↩ {r.response}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "approved")}
                        disabled={updating === r.id}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20 px-2.5 py-1.5 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {updating === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "denied")}
                        disabled={updating === r.id}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1.5 rounded hover:bg-destructive/20 transition-colors disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                        Deny
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => respondingId === r.id ? setRespondingId(null) : openRespond(r)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {r.response ? "Edit Response" : "Respond"}
                  </button>
                </div>
              </div>

              {/* Inline response editor */}
              {respondingId === r.id && (
                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={2}
                    placeholder="Write a response visible to the partner…"
                    className="flex-1 bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveResponse(r.id)}
                    disabled={savingResponse}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-3 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 self-end"
                  >
                    {savingResponse ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsAdmin;
