import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Play, ChevronDown, ChevronUp, Loader2, ExternalLink } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  rsvp_url: string | null;
  recording_path: string | null;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
};

const EventCard: FC<{ event: Event; past?: boolean }> = ({ event, past = false }) => {
  const recordingUrl = event.recording_path
    ? supabase.storage.from("recordings").getPublicUrl(event.recording_path).data.publicUrl
    : null;

  return (
    <div className={`border border-border rounded-lg p-5 flex flex-col gap-3 ${past ? "bg-secondary/10 opacity-75" : "bg-secondary/20"}`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-bold text-sm text-foreground leading-tight">{event.title}</h3>
        {past && recordingUrl && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
            Recording
          </span>
        )}
      </div>

      {event.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
          <span>{formatDate(event.event_date)}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{formatTime(event.event_date)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        {!past && event.rsvp_url && (
          <a
            href={event.rsvp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            RSVP
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {recordingUrl && (
          <a
            href={recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-border text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded hover:border-primary hover:text-primary transition-colors text-muted-foreground"
          >
            <Play className="w-3 h-3" />
            Watch Recording
          </a>
        )}
      </div>
    </div>
  );
};

const EventsSection: FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastOpen, setPastOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, event_date, location, rsvp_url, recording_path")
        .order("event_date", { ascending: true });
      setEvents((data as Event[]) ?? []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const now = new Date().toISOString();
  const upcoming = events.filter((e) => e.event_date >= now);
  const past = events.filter((e) => e.event_date < now && e.recording_path);

  return (
    <section id="events">
      <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6 pb-3 border-b border-border">
        Events
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading events…</span>
        </div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <p className="text-xs text-muted-foreground">Events coming soon.</p>
      ) : (
        <div className="space-y-10">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">
                Upcoming
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}

          {/* Past Events (only if recordings exist) */}
          {past.length > 0 && (
            <Collapsible open={pastOpen} onOpenChange={setPastOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-full pb-2 border-b border-border">
                <span className="flex-1 text-left">Past Events</span>
                <span className="text-[10px] bg-secondary/50 px-2 py-0.5 rounded-full">{past.length}</span>
                {pastOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...past].reverse().map((e) => (
                    <EventCard key={e.id} event={e} past />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </section>
  );
};

export default EventsSection;
