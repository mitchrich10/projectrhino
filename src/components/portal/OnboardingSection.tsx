import { FC, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Circle, ExternalLink, Bell, BellOff } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string | null;
  resource_url: string | null;
  order: number;
}

interface NotificationState {
  loading: boolean;
  subscribed: boolean | null; // null = not yet set
  saving: boolean;
}

// ── Notification opt-in ────────────────────────────────────────────────────────
const NotificationOptIn: FC<{ userId: string; email: string }> = ({ userId, email }) => {
  const [state, setState] = useState<NotificationState>({ loading: true, subscribed: null, saving: false });

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("notification_subscriptions")
        .select("subscribed")
        .eq("user_id", userId)
        .maybeSingle();
      setState({ loading: false, subscribed: data?.subscribed ?? null, saving: false });
    };
    check();
  }, [userId]);

  const toggle = async (subscribe: boolean) => {
    setState((s) => ({ ...s, saving: true }));
    await supabase.from("notification_subscriptions").upsert(
      { user_id: userId, email, subscribed: subscribe },
      { onConflict: "user_id" }
    );
    setState({ loading: false, subscribed: subscribe, saving: false });
  };

  if (state.loading) return null;

  // Not yet decided — show prompt
  if (state.subscribed === null) {
    return (
      <div className="mt-8 border border-primary/30 rounded-lg p-5 bg-primary/5 flex items-start gap-4">
        <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground mb-1">Stay in the loop</p>
          <p className="text-xs text-muted-foreground mb-3">Get notified by email whenever Rhino adds new partnerships, resources, or events to the portal.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggle(true)}
              disabled={state.saving}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground px-3 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {state.saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
              Yes, notify me
            </button>
            <button
              onClick={() => toggle(false)}
              disabled={state.saving}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Already set — show status with toggle
  return (
    <div className="mt-8 border border-border rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {state.subscribed ? (
          <Bell className="w-4 h-4 text-primary flex-shrink-0" />
        ) : (
          <BellOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <p className="text-xs text-muted-foreground">
          {state.subscribed
            ? "You're subscribed to portal update notifications."
            : "You've opted out of portal update notifications."}
        </p>
      </div>
      <button
        onClick={() => toggle(!state.subscribed)}
        disabled={state.saving}
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
      >
        {state.saving ? <Loader2 className="w-3 h-3 animate-spin" /> : state.subscribed ? "Unsubscribe" : "Subscribe"}
      </button>
    </div>
  );
};

// ── Main Section ───────────────────────────────────────────────────────────────
interface OnboardingSectionProps {
  userId: string;
  userEmail: string;
  isInvited: boolean; // only show full onboarding to invited users
}

const OnboardingSection: FC<OnboardingSectionProps> = ({ userId, userEmail, isInvited }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [batchId, setBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Look up the user's invite to find their shared batch_id
      const [{ data: stepsData }, { data: inviteData }] = await Promise.all([
        supabase.from("onboarding_steps").select("*").order("order"),
        supabase.from("onboarding_invites").select("batch_id").eq("email", userEmail.toLowerCase()).maybeSingle(),
      ]);
      setSteps(stepsData ?? []);

      const bid = (inviteData as { batch_id: string } | null)?.batch_id ?? null;
      setBatchId(bid);

      if (bid) {
        const { data: progressData } = await supabase
          .from("onboarding_progress")
          .select("step_id")
          .eq("batch_id", bid);
        setCompletedIds(new Set((progressData ?? []).map((p: { step_id: string }) => p.step_id)));
      }

      setLoading(false);
    };
    init();
  }, [userEmail]);

  const toggleStep = async (stepId: string) => {
    if (!batchId) return;
    setToggling(stepId);
    const isCompleted = completedIds.has(stepId);

    if (isCompleted) {
      await supabase.from("onboarding_progress").delete().eq("batch_id", batchId).eq("step_id", stepId);
      setCompletedIds((prev) => { const n = new Set(prev); n.delete(stepId); return n; });
    } else {
      await supabase.from("onboarding_progress").insert({ user_id: userId, batch_id: batchId, step_id: stepId });
      setCompletedIds((prev) => new Set([...prev, stepId]));
    }
    setToggling(null);
  };

  const completedCount = completedIds.size;
  const totalCount = steps.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  // If not invited, only show notification opt-in
  if (!isInvited) {
    return (
      <section id="onboarding">
        <NotificationOptIn userId={userId} email={userEmail} />
      </section>
    );
  }

  return (
    <section id="onboarding">
      <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-6 pb-3 border-b border-border">
        Onboarding
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading…</span>
        </div>
      ) : steps.length === 0 ? (
        <p className="text-xs text-muted-foreground">Onboarding steps coming soon.</p>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {allDone ? "🎉 All done!" : `${completedCount} of ${totalCount} completed`}
              </p>
              <p className="text-xs font-bold text-primary">{progressPct}%</p>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {steps.map((step) => {
              const done = completedIds.has(step.id);
              return (
                <div
                  key={step.id}
                  className={`border rounded-lg p-4 transition-colors ${done ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/10"}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStep(step.id)}
                      disabled={toggling === step.id}
                      className="flex-shrink-0 mt-0.5 transition-colors"
                    >
                      {toggling === step.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : done ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-bold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {step.title}
                        </p>
                        {step.resource_url && (
                          <a
                            href={step.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notification opt-in below checklist */}
          <NotificationOptIn userId={userId} email={userEmail} />
        </>
      )}
    </section>
  );
};

export default OnboardingSection;
