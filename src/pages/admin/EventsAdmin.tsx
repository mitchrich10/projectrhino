import { FC, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, X, Upload, ExternalLink, Play } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  rsvp_url: string | null;
  recording_path: string | null;
  created_at: string;
}

const emptyForm = () => ({
  title: "",
  description: "",
  event_date: "",
  location: "",
  rsvp_url: "",
  recording_path: null as string | null,
});

const formatDisplayDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const EventsAdmin: FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvents();
    setLoading(false);
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    setEvents((data as Event[]) ?? []);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditingId(e.id);
    // Convert ISO to local datetime-local format for input
    const local = new Date(e.event_date).toISOString().slice(0, 16);
    setForm({
      title: e.title,
      description: e.description ?? "",
      event_date: local,
      location: e.location ?? "",
      rsvp_url: e.rsvp_url ?? "",
      recording_path: e.recording_path,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleRecordingUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const { error: uploadError } = await supabase.storage.from("recordings").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
    } else {
      setForm((f) => ({ ...f, recording_path: path }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.event_date) { setError("Event date is required."); return; }
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      event_date: new Date(form.event_date).toISOString(),
      location: form.location?.trim() || null,
      rsvp_url: form.rsvp_url?.trim() || null,
      recording_path: form.recording_path || null,
    };

    if (editingId) {
      const { error: e } = await supabase.from("events").update(payload).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("events").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }

    await fetchEvents();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string, recordingPath: string | null) => {
    if (!confirm("Delete this event?")) return;
    setDeleting(id);
    if (recordingPath) {
      await supabase.storage.from("recordings").remove([recordingPath]);
    }
    await supabase.from("events").delete().eq("id", id);
    await fetchEvents();
    setDeleting(null);
  };

  const getRecordingUrl = (path: string) =>
    supabase.storage.from("recordings").getPublicUrl(path).data.publicUrl;

  const now = new Date().toISOString();
  const upcoming = events.filter((e) => e.event_date >= now);
  const past = events.filter((e) => e.event_date < now);

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-muted-foreground">{upcoming.length} upcoming · {past.length} past</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-bold uppercase tracking-widest mb-2">No events yet</p>
          <p className="text-xs">Click "Add Event" to get started.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-border">Upcoming</h3>
              <div className="space-y-2">
                {upcoming.map((e) => <EventRow key={e.id} event={e} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} getRecordingUrl={getRecordingUrl} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">Past</h3>
              <div className="space-y-2">
                {[...past].reverse().map((e) => <EventRow key={e.id} event={e} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} getRecordingUrl={getRecordingUrl} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                {editingId ? "Edit Event" : "Add Event"}
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
                  placeholder="e.g. Portfolio Summit 2026"
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
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Vancouver, BC or Zoom"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">RSVP Link</label>
                <input
                  type="url"
                  value={form.rsvp_url ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, rsvp_url: e.target.value }))}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://…"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Recording</label>
                {form.recording_path ? (
                  <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-secondary/30">
                    <Play className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs text-primary font-bold flex-1 truncate">{form.recording_path.split("-").slice(1).join("-")}</span>
                    <button onClick={() => setForm((f) => ({ ...f, recording_path: null }))} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? "Uploading…" : "Upload Recording"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,audio/*,.mp4,.mov,.m4v,.webm"
                      onChange={handleRecordingUpload}
                      className="hidden"
                    />
                  </>
                )}
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
                {editingId ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EventRow: FC<{
  event: Event;
  onEdit: (e: Event) => void;
  onDelete: (id: string, path: string | null) => void;
  deleting: string | null;
  getRecordingUrl: (p: string) => string;
}> = ({ event, onEdit, onDelete, deleting, getRecordingUrl }) => (
  <div className="flex items-start gap-4 border border-border rounded-lg p-4 bg-secondary/10">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="font-bold text-sm text-foreground">{event.title}</span>
        {event.recording_path && (
          <a href={getRecordingUrl(event.recording_path)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded hover:opacity-70 transition-opacity flex items-center gap-1">
            <Play className="w-2.5 h-2.5" /> Recording
          </a>
        )}
        {event.rsvp_url && (
          <a href={event.rsvp_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date(event.event_date).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        {event.location && ` · ${event.location}`}
      </p>
      {event.description && <p className="text-xs text-muted-foreground/70 mt-1 truncate">{event.description}</p>}
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <button onClick={() => onEdit(event)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDelete(event.id, event.recording_path)} disabled={deleting === event.id} className="text-muted-foreground hover:text-destructive transition-colors p-1">
        {deleting === event.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  </div>
);

export default EventsAdmin;
