import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, Loader2, BellOff } from "lucide-react";

/* ── Top-of-page banner (shown to users who haven't decided yet) ──────── */
export const NotificationBanner: FC<{ userId: string; email: string }> = ({ userId, email }) => {
  const [status, setStatus] = useState<"loading" | "show" | "hidden">("loading");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("notification_subscriptions")
        .select("subscribed")
        .eq("user_id", userId)
        .maybeSingle();
      // Show banner only if user has never interacted
      setStatus(data === null ? "show" : "hidden");
    };
    check();
  }, [userId]);

  const subscribe = async () => {
    setSaving(true);
    await supabase.from("notification_subscriptions").upsert(
      { user_id: userId, email, subscribed: true },
      { onConflict: "user_id" }
    );
    setStatus("hidden");
  };

  const dismiss = async () => {
    // Dismiss = opt out so banner never returns
    await supabase.from("notification_subscriptions").upsert(
      { user_id: userId, email, subscribed: false },
      { onConflict: "user_id" }
    );
    setStatus("hidden");
  };

  if (status !== "show") return null;

  return (
    <div
      className="border border-[#1A7EC8]/20 rounded-lg bg-white px-5 py-4 flex items-center gap-4 shadow-sm"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Bell className="w-4 h-4 text-[#1A7EC8] flex-shrink-0" />
      <p className="text-sm text-[#173660] flex-1">
        <span className="font-semibold">Stay in the loop</span>
        <span className="text-[#5C6B7A]"> — get notified when we add new partnerships, resources, or events.</span>
      </p>
      <button
        onClick={subscribe}
        disabled={saving}
        className="flex-shrink-0 text-xs font-semibold uppercase tracking-widest text-[#1A7EC8] border border-[#1A7EC8] rounded-lg px-4 py-2 hover:bg-[#1A7EC8] hover:text-white transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Subscribe"}
      </button>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-[#173660]/30 hover:text-[#173660]/60 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ── Small unsubscribe link for nav/footer ─────────────────────────────── */
export const NotificationSettingsLink: FC<{ userId: string; email: string }> = ({ userId, email }) => {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("notification_subscriptions")
        .select("subscribed")
        .eq("user_id", userId)
        .maybeSingle();
      setSubscribed(data?.subscribed ?? null);
    };
    check();
  }, [userId]);

  const toggle = async () => {
    if (subscribed === null) return;
    setSaving(true);
    const next = !subscribed;
    await supabase.from("notification_subscriptions").upsert(
      { user_id: userId, email, subscribed: next },
      { onConflict: "user_id" }
    );
    setSubscribed(next);
    setSaving(false);
  };

  if (subscribed === null) return null;

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      {saving ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : subscribed ? (
        <BellOff className="w-3.5 h-3.5" />
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
      {subscribed ? "Unsubscribe" : "Subscribe"}
    </button>
  );
};
