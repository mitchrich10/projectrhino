import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, X, Send, CheckCircle2, AlertCircle, GripVertical, Bell } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string | null;
  resource_url: string | null;
  order: number;
}

interface Invite {
  id: string;
  email: string;
  invited_by: string;
  created_at: string;
  note: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

const emptyStep = () => ({ title: "", description: "", resource_url: "", order: 0 });

// ── Steps Panel ────────────────────────────────────────────────────────────────
const StepsPanel: FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStep());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchSteps(); }, []);

  const fetchSteps = async () => {
    const { data } = await supabase.from("onboarding_steps").select("*").order("order");
    setSteps(data ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyStep(), order: steps.length });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Step) => {
    setEditingId(s.id);
    setForm({ title: s.title, description: s.description ?? "", resource_url: s.resource_url ?? "", order: s.order });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      resource_url: form.resource_url?.trim() || null,
      order: form.order,
    };
    if (editingId) {
      const { error: e } = await supabase.from("onboarding_steps").update(payload).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("onboarding_steps").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    await fetchSteps(); setSaving(false); setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this step? All partner progress for this step will also be removed.")) return;
    setDeleting(id);
    await supabase.from("onboarding_steps").delete().eq("id", id);
    await fetchSteps(); setDeleting(null);
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading…</span></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-muted-foreground">{steps.length} step{steps.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-bold uppercase tracking-widest mb-2">No steps yet</p>
          <p className="text-xs">Add onboarding steps to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4 border border-border rounded-lg p-4 bg-secondary/10">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">{s.title}</p>
                {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                {s.resource_url && <p className="text-[10px] text-primary truncate">{s.resource_url}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  {deleting === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-black uppercase tracking-widest">{editingId ? "Edit Step" : "Add Step"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Complete your company profile" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
                <textarea value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Brief description of this step…" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Resource URL (optional)</label>
                <input type="url" value={form.resource_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, resource_url: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://…" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" min={0} />
              </div>
              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setModalOpen(false)} className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? "Save Changes" : "Add Step"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Invite Panel ───────────────────────────────────────────────────────────────
const InvitePanel: FC = () => {
  const [emailInput, setEmailInput] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ email: string; success: boolean; error?: string }[] | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  useEffect(() => { fetchInvites(); }, []);

  const fetchInvites = async () => {
    const { data } = await supabase.from("onboarding_invites").select("*").order("created_at", { ascending: false });
    setInvites(data ?? []);
    setLoadingInvites(false);
  };

  const handleSend = async () => {
    const emails = emailInput.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setSending(true); setResults(null);
    const { data, error } = await supabase.functions.invoke("send-onboarding-invite", {
      body: { emails, note: note.trim() || undefined },
    });
    if (error) {
      setResults([{ email: "all", success: false, error: error.message }]);
    } else {
      setResults(data.results);
      await fetchInvites();
      setEmailInput(""); setNote("");
    }
    setSending(false);
  };

  return (
    <div className="space-y-10">
      {/* Send invites */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">Send Onboarding Invites</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Email Addresses</label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              rows={4}
              className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
              placeholder="one@company.com&#10;two@company.com&#10;&#10;(one per line, or comma-separated)"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Separate by new line, comma, or semicolon.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Personal Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Add a personal message that will appear in the invite email…"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !emailInput.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? "Sending…" : "Send Invites"}
          </button>

          {results && (
            <div className="space-y-1.5">
              {results.map((r) => (
                <div key={r.email} className={`flex items-center gap-2 text-xs ${r.success ? "text-green-600" : "text-destructive"}`}>
                  {r.success ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="font-mono">{r.email}</span>
                  {r.error && <span className="text-muted-foreground">— {r.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Past invites */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">Previously Invited ({invites.length})</h3>
        {loadingInvites ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading…</span></div>
        ) : invites.length === 0 ? (
          <p className="text-xs text-muted-foreground">No invites sent yet.</p>
        ) : (
          <div className="space-y-1.5">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 border border-border rounded-lg px-4 py-3 bg-secondary/10">
                <p className="text-xs font-mono text-foreground flex-1">{inv.email}</p>
                <p className="text-[10px] text-muted-foreground flex-shrink-0">
                  {new Date(inv.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Subscribers Panel ──────────────────────────────────────────────────────────
const SubscribersPanel: FC = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("notification_subscriptions").select("*").order("created_at", { ascending: false });
      setSubs(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const active = subs.filter((s) => s.subscribed);

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading…</span></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <p className="text-xs text-muted-foreground">{subs.length} total · <span className="text-primary font-bold">{active.length} subscribed</span></p>
      </div>
      {subs.length === 0 ? (
        <p className="text-xs text-muted-foreground">No subscribers yet.</p>
      ) : (
        <div className="space-y-1.5">
          {subs.map((s) => (
            <div key={s.id} className="flex items-center gap-4 border border-border rounded-lg px-4 py-3 bg-secondary/10">
              <Bell className={`w-3.5 h-3.5 flex-shrink-0 ${s.subscribed ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-xs font-mono text-foreground flex-1">{s.email}</p>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${s.subscribed ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-secondary text-muted-foreground border-border"}`}>
                {s.subscribed ? "Subscribed" : "Opted Out"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────────
type OnboardingTab = "steps" | "invites" | "subscribers";

const OnboardingAdmin: FC = () => {
  const [tab, setTab] = useState<OnboardingTab>("steps");

  return (
    <div>
      <div className="flex gap-1 mb-8 border-b border-border">
        {(["steps", "invites", "subscribers"] as OnboardingTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs font-bold uppercase tracking-widest px-4 py-2.5 transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "steps" && <StepsPanel />}
      {tab === "invites" && <InvitePanel />}
      {tab === "subscribers" && <SubscribersPanel />}
    </div>
  );
};

export default OnboardingAdmin;
