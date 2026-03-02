import { FC, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, X, Upload, ExternalLink, ArrowLeft, Lock } from "lucide-react";
import rhinoLogo from "@/assets/rhino-logo-black.png";
import { Switch } from "@/components/ui/switch";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  category: string;
  approval_required: boolean;
  created_at: string;
}

const CATEGORIES = ["Legal", "Finance", "Operations", "Hiring", "Marketing", "Other"];

const empty = (): Omit<Resource, "id" | "created_at"> => ({
  title: "",
  description: "",
  url: "",
  file_path: null,
  category: "Legal",
  approval_required: false,
});

const ResourcesAdmin: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email?.endsWith("@rhinovc.com")) {
        navigate("/portal");
        return;
      }
      await fetchResources();
      setLoading(false);
    };
    check();
  }, [navigate]);

  const fetchResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("category")
      .order("title");
    setResources(data ?? []);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(empty());
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (r: Resource) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      description: r.description ?? "",
      url: r.url ?? "",
      file_path: r.file_path,
      category: r.category,
      approval_required: r.approval_required,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
    } else {
      setForm((f) => ({ ...f, file_path: path, url: "" }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.url && !form.file_path) { setError("Provide a URL or upload a file."); return; }
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      url: form.url?.trim() || null,
      file_path: form.file_path || null,
      category: form.category,
      approval_required: form.approval_required,
    };

    if (editingId) {
      const { error: e } = await supabase.from("resources").update(payload).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("resources").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }

    await fetchResources();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string, filePath: string | null) => {
    if (!confirm("Delete this resource?")) return;
    setDeleting(id);
    if (filePath) {
      await supabase.storage.from("resources").remove([filePath]);
    }
    await supabase.from("resources").delete().eq("id", id);
    await fetchResources();
    setDeleting(null);
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("resources").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    (acc[r.category] = acc[r.category] ?? []).push(r);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/portal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Portal
            </Link>
            <span className="text-muted-foreground/40">|</span>
            <img src={rhinoLogo} alt="Rhino Ventures" className="h-6 w-auto" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Admin · Resources</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Resource
          </button>
        </div>
      </header>

      <main className="pt-16 max-w-5xl mx-auto px-6 py-12">
        {resources.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-sm font-bold uppercase tracking-widest mb-2">No resources yet</p>
            <p className="text-xs">Click "Add Resource" to get started.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).sort().map(([category, items]) => (
              <section key={category}>
                <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">
                  {category}
                </h2>
                <div className="space-y-2">
                  {items.map((r) => (
                    <div key={r.id} className="flex items-start gap-4 border border-border rounded-lg p-4 bg-secondary/10 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{r.title}</span>
                          {(r.url || r.file_path) && (
                            <a
                              href={r.file_path ? getFileUrl(r.file_path) : r.url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {r.file_path && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">PDF</span>
                          )}
                          {r.approval_required && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Approval Required
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEdit(r)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.file_path)}
                          disabled={deleting === r.id}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                {editingId ? "Edit Resource" : "Add Resource"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Fundraising Term Sheet Template"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Brief description…"
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
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Link or File *</label>
                {form.file_path ? (
                  <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-secondary/30">
                    <span className="text-xs text-primary font-bold flex-1 truncate">📄 {form.file_path.split("-").slice(1).join("-")}</span>
                    <button
                      onClick={() => setForm((f) => ({ ...f, file_path: null }))}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={form.url ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                      className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="https://…"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? "Uploading…" : "Upload PDF"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Approval Required toggle */}
              <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-secondary/10">
                <div>
                  <p className="text-xs font-bold text-foreground">Require Approval</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Partners must request access before viewing this resource</p>
                </div>
                <Switch
                  checked={form.approval_required}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, approval_required: v }))}
                />
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-background">
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-5 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? "Save Changes" : "Add Resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesAdmin;
