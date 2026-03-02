import { FC, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, X, Upload, ExternalLink, Lock } from "lucide-react";
import { companyLogos } from "@/lib/companyLogos";
import { Switch } from "@/components/ui/switch";

interface Partnership {
  id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  logo_key: string | null;
  logo_url: string | null;
  redemption_url: string | null;
  promo_code: string | null;
  display_order: number;
  approval_required: boolean;
  created_at: string;
}

const CATEGORIES = ["Cloud & Infrastructure", "Legal", "Finance", "HR & People", "Sales & Marketing", "Software Tools", "Other"];

const emptyForm = () => ({
  name: "",
  category: "Cloud & Infrastructure",
  tagline: "",
  description: "",
  logo_key: "",
  logo_url: "",
  redemption_url: "",
  promo_code: "",
  display_order: 0,
  approval_required: false,
});

const PartnershipsAdmin: FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchPartnerships(); }, []);

  const fetchPartnerships = async () => {
    const { data } = await supabase
      .from("partnerships")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    setPartnerships((data as Partnership[]) ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Partnership) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      logo_key: p.logo_key ?? "",
      logo_url: p.logo_url ?? "",
      redemption_url: p.redemption_url ?? "",
      promo_code: p.promo_code ?? "",
      display_order: p.display_order,
      approval_required: p.approval_required,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      tagline: form.tagline?.trim() || null,
      description: form.description?.trim() || null,
      logo_key: form.logo_key?.trim() || null,
      logo_url: form.logo_url?.trim() || null,
      redemption_url: form.redemption_url?.trim() || null,
      promo_code: form.promo_code?.trim() || null,
      display_order: form.display_order,
      approval_required: form.approval_required,
    };

    if (editingId) {
      const { error: e } = await supabase.from("partnerships").update(payload).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("partnerships").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }

    await fetchPartnerships();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this partnership?")) return;
    setDeleting(id);
    await supabase.from("partnerships").delete().eq("id", id);
    await fetchPartnerships();
    setDeleting(null);
  };

  const grouped = partnerships.reduce<Record<string, Partnership[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] ?? []).push(p);
    return acc;
  }, {});

  const logoKeys = Object.keys(companyLogos).sort();

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-xs">Loading…</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-muted-foreground">{partnerships.length} partnership{partnerships.length !== 1 ? "s" : ""}</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> Add Partnership
        </button>
      </div>

      {partnerships.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-bold uppercase tracking-widest mb-2">No partnerships yet</p>
          <p className="text-xs">Click "Add Partnership" to get started.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).sort().map(([category, items]) => (
            <section key={category}>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">{category}</h3>
              <div className="space-y-2">
                {items.map((p) => {
                  const logoSrc = p.logo_key ? companyLogos[p.logo_key] : p.logo_url ?? null;
                  return (
                    <div key={p.id} className="flex items-center gap-4 border border-border rounded-lg p-4 bg-secondary/10">
                      {/* Logo preview */}
                      <div className="w-10 h-10 border border-border rounded flex items-center justify-center bg-background flex-shrink-0 p-1">
                        {logoSrc ? (
                          <img src={logoSrc} alt={p.name} className="max-h-8 max-w-[36px] w-auto h-auto object-contain" />
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground text-center leading-tight">{p.name.slice(0, 4)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{p.name}</span>
                          {p.promo_code && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">{p.promo_code}</span>
                          )}
                          {p.approval_required && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Approval Required
                            </span>
                          )}
                          {p.redemption_url && (
                            <a href={p.redemption_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {p.tagline && <p className="text-xs text-muted-foreground truncate">{p.tagline}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                {editingId ? "Edit Partnership" : "Add Partnership"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Partner Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. AWS, Stripe, Notion"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. $10,000 in AWS credits for new signups"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Describe the partnership terms, eligibility, and how to redeem…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Logo Key</label>
                  <select
                    value={form.logo_key}
                    onChange={(e) => setForm((f) => ({ ...f, logo_key: e.target.value }))}
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">— None —</option>
                    {logoKeys.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Or Logo URL</label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://…"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Redemption URL</label>
                <input
                  type="url"
                  value={form.redemption_url}
                  onChange={(e) => setForm((f) => ({ ...f, redemption_url: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://partner.com/redeem"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Promo Code</label>
                <input
                  type="text"
                  value={form.promo_code}
                  onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. RHINO2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  min={0}
                />
              </div>

              {/* Approval Required toggle */}
              <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-secondary/10">
                <div>
                  <p className="text-xs font-bold text-foreground">Require Approval</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Partners must request access before viewing details</p>
                </div>
                <Switch
                  checked={form.approval_required}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, approval_required: v }))}
                />
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-background">
              <button onClick={() => setModalOpen(false)} className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? "Save Changes" : "Add Partnership"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipsAdmin;
