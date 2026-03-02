import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface PartnerRequest {
  id: string;
  created_at: string;
  item_type: string;
  item_name: string;
  notes: string | null;
  response: string | null;
}

const REQUEST_TYPES = [
  { value: "resource", label: "Resource" },
  { value: "partnership", label: "Partnership" },
  { value: "event", label: "Event" },
  { value: "intro", label: "Intro / Connection" },
  { value: "other", label: "Other" },
];

const PLACEHOLDER: Record<string, string> = {
  resource: "e.g. Legal templates for SaaS contracts",
  partnership: "e.g. AWS Activate or Stripe startup credits",
  event: "e.g. Fundraising workshop for Series A",
  intro: "e.g. Intro to a CFO or enterprise customer",
  other: "Describe what you need",
};

const RequestsSection: FC<{ userId: string; userEmail: string; companyName: string }> = ({
  userId,
  userEmail,
  companyName,
}) => {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<string[]>(["resource"]);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("partner_requests")
      .select("id, created_at, item_type, item_name, notes, response")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setRequests((data as PartnerRequest[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [userId]);

  const toggleType = (val: string) => {
    setTypes((prev) =>
      prev.includes(val) ? (prev.length > 1 ? prev.filter((t) => t !== val) : prev) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    if (!subject.trim()) { setError("Please enter a subject."); return; }
    setSubmitting(true); setError(null);

    const itemType = types.join(", ");

    const { error: insertError } = await supabase.from("partner_requests").insert({
      user_id: userId,
      user_email: userEmail,
      company_name: companyName,
      item_type: itemType,
      item_name: subject.trim(),
      notes: notes.trim() || null,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Fire notification email with AI partnership matching
    supabase.functions.invoke("notify-new-request", {
      body: {
        company_name: companyName,
        user_email: userEmail,
        item_type: itemType,
        item_name: subject.trim(),
        notes: notes.trim() || null,
      },
    }).catch(() => {}); // non-blocking

    setSubject(""); setNotes(""); setTypes(["resource"]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    await fetchRequests();
    setSubmitting(false);
  };

  const placeholder = types.length === 1
    ? PLACEHOLDER[types[0]] ?? "Describe what you need"
    : "Describe what you need";

  return (
    <section id="requests">
      <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6 pb-3 border-b border-border">
        Requests
      </h2>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Submit form */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Submit a Request</p>
          <div className="space-y-4">
            {/* Multi-select type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Type <span className="normal-case font-normal">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {REQUEST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => toggleType(t.value)}
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                      types.includes(t.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any extra context that would help us respond…"
                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !subject.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {submitted ? "Sent ✓" : submitting ? "Sending…" : "Submit Request"}
            </button>
          </div>
        </div>

        {/* Past requests */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Your Requests</p>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading…</span>
            </div>
          ) : requests.length === 0 ? (
            <p className="text-xs text-muted-foreground">No requests submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="border border-border rounded-lg p-4 bg-secondary/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {r.item_type.split(", ").map((t) => (
                          <span key={t} className="text-[10px] font-bold uppercase tracking-widest bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-foreground leading-snug">{r.item_name}</p>
                      {r.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.notes}</p>
                      )}
                      {r.response && (
                        <p className="text-xs text-primary mt-1.5 font-medium border-l-2 border-primary/30 pl-2">
                          {r.response}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RequestsSection;
