import { FC, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, X, Upload, ExternalLink, Lock, Image as ImageIcon } from "lucide-react";
import { companyLogos } from "@/lib/companyLogos";
import { Switch } from "@/components/ui/switch";
import { resolvePartnershipLogo } from "@/lib/partnershipLogo";

interface Partnership {
  id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  logo_key: string | null;
  logo_url: string | null;
  logo_path: string | null;
  website_url: string | null;
  redemption_url: string | null;
  promo_code: string | null;
  display_order: number;
  approval_required: boolean;
  detail_pdf_url: string | null;
  created_at: string;
}

const CATEGORIES = ["Cloud", "Finance", "HR & Benefits", "Marketing", "Insurance", "Operations & Services", "Productivity", "Rhino Companies", "Swag & Merch", "Other"];

const emptyForm = () => ({
  name: "",
  category: "Cloud",
  tagline: "",
  description: "",
  logo_key: "",
  logo_url: "",
  logo_path: "",
  website_url: "",
  redemption_url: "",
  promo_code: "",
  display_order: 0,
  approval_required: false,
  detail_pdf_url: "",
});

const DEFAULT_MAIL_SUBJECT = "Rhino Portfolio Partnership Inquiry";

const parseMailto = (url: string): { email: string; subject: string } | null => {
  if (!url || !/^mailto:/i.test(url)) return null;
  const rest = url.replace(/^mailto:/i, "");
  const [email, query = ""] = rest.split("?");
  const params = new URLSearchParams(query);
  return { email: decodeURIComponent(email || ""), subject: params.get("subject") ?? "" };
};

const buildMailto = (email: string, subject: string): string => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return "";
  const subj = (subject || DEFAULT_MAIL_SUBJECT).trim();
  return `mailto:${trimmedEmail}?subject=${encodeURIComponent(subj)}`;
};

const RedemptionField: FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const parsed = parseMailto(value);
  const [mode, setMode] = useState<"url" | "email">(parsed ? "email" : "url");
  const [email, setEmail] = useState(parsed?.email ?? "");
  const [subject, setSubject] = useState(parsed?.subject ?? DEFAULT_MAIL_SUBJECT);

  const switchMode = (next: "url" | "email") => {
    setMode(next);
    if (next === "url") {
      // clear mailto so URL field starts blank if it was a mailto
      if (/^mailto:/i.test(value)) onChange("");
    } else {
      onChange(buildMailto(email, subject));
    }
  };

  const updateEmail = (v: string) => {
    setEmail(v);
    onChange(buildMailto(v, subject));
  };
  const updateSubject = (v: string) => {
    setSubject(v);
    onChange(buildMailto(email, v));
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Redemption Method</label>
      <div className="flex gap-2 mb-2">
        {(["url", "email"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-secondary/30"
            }`}
          >
            {m === "url" ? "URL Link" : "Email"}
          </button>
        ))}
      </div>
      {mode === "url" ? (
        <input
          type="url"
          value={/^mailto:/i.test(value) ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="https://partner.com/redeem"
        />
      ) : (
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => updateEmail(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="lisa@partner.com"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => updateSubject(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Email subject line"
          />
          <p className="text-[10px] text-muted-foreground">Portal button will open the user's mail client with this address and subject pre-filled.</p>
        </div>
      )}
    </div>
  );
};

const PartnershipsAdmin: FC = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      logo_path: p.logo_path ?? "",
      website_url: p.website_url ?? "",
      redemption_url: p.redemption_url ?? "",
      promo_code: p.promo_code ?? "",
      display_order: p.display_order,
      approval_required: p.approval_required,
      detail_pdf_url: p.detail_pdf_url ?? "",
    });
    setError(null);
    setModalOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const filePath = `pdfs/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("partnerships").upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("partnerships").getPublicUrl(filePath);
    setForm((f) => ({ ...f, detail_pdf_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(png|jpe?g|svg|webp)$/i.test(file.name)) {
      setError("Logo must be PNG, JPG, SVG, or WebP.");
      return;
    }
    setUploadingLogo(true);
    setError(null);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("partnership-logos")
      .upload(filePath, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setError(`Logo upload failed: ${uploadError.message}`);
      setUploadingLogo(false);
      return;
    }
    setForm((f) => ({ ...f, logo_path: filePath, logo_url: "" }));
    setUploadingLogo(false);
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
      logo_path: form.logo_path?.trim() || null,
      website_url: form.website_url?.trim() || null,
      redemption_url: form.redemption_url?.trim() || null,
      promo_code: form.promo_code?.trim() || null,
      display_order: form.display_order,
      approval_required: form.approval_required,
      detail_pdf_url: form.detail_pdf_url?.trim() || null,
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
                  const logoSrc = resolvePartnershipLogo(p);
                  return (
                    <div key={p.id} className="flex items-center gap-4 border border-border rounded-lg p-4 bg-secondary/10">
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
                          {p.detail_pdf_url && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-1.5 py-0.5 rounded">PDF</span>
                          )}
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
                <input
                  type="text"
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Finance, Rhino Companies"
                />
                <datalist id="category-suggestions">
                  {CATEGORIES.map((c) => <option key={c} value={c} />)}
                </datalist>
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

              {/* Self-hosted Logo Upload (preferred) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Logo Upload (PNG / SVG / JPG)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 border border-border rounded-lg flex items-center justify-center bg-background flex-shrink-0 overflow-hidden">
                    {resolvePartnershipLogo({ logo_path: form.logo_path, logo_url: form.logo_url, logo_key: form.logo_key }) ? (
                      <img
                        src={resolvePartnershipLogo({ logo_path: form.logo_path, logo_url: form.logo_url, logo_key: form.logo_key })!}
                        alt="preview"
                        className="max-h-14 max-w-[56px] object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={logoInputRef} type="file" accept=".png,.svg,.jpg,.jpeg,.webp" onChange={handleLogoUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors disabled:opacity-50"
                    >
                      {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingLogo ? "Uploading…" : form.logo_path ? "Replace logo" : "Upload logo"}
                    </button>
                    {form.logo_path && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="truncate flex-1">{form.logo_path}</span>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, logo_path: "" }))}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Self-hosted via the partnership-logos bucket. Falls back to a circular letter badge if none provided.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Logo Key (Rhino portfolio)</label>
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
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">External Logo URL (fallback)</label>
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
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Partner Website (homepage)</label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://partner.com"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Displayed as the domain link in the detail panel.</p>
              </div>

              <RedemptionField
                value={form.redemption_url}
                onChange={(v) => setForm((f) => ({ ...f, redemption_url: v }))}
              />


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

              {/* PDF One-Pager Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">PDF One-Pager</label>
                <div className="space-y-2">
                  {form.detail_pdf_url && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <span className="truncate flex-1">{form.detail_pdf_url.split("/").pop()}</span>
                      <button onClick={() => setForm((f) => ({ ...f, detail_pdf_url: "" }))} className="text-red-500 hover:text-red-700 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? "Uploading…" : "Upload PDF"}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Upload a one-pager PDF for this partnership. This will be used as the default download instead of auto-generated PDFs.</p>
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
