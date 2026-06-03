import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PORTAL_URL = "https://projectrhino.lovable.app/portal";

interface QueueItem {
  id: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  summary: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  partnership_added: "New Partnership",
  partnership_updated: "Partnership Update",
  resource_added: "New Resource",
  event_added: "New Event",
};

const anchorFor = (entityType: string): string => {
  if (entityType.startsWith("partnership")) return "partnerships";
  if (entityType.startsWith("resource")) return "resources";
  if (entityType.startsWith("event")) return "events";
  return "";
};

const monthDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });

const buildSubject = () => `What's new on The Crash Portal — ${monthDay(new Date())}`;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildDigestHtml = (items: QueueItem[]): string => {
  const sections = items
    .map((it) => {
      const anchor = anchorFor(it.entity_type);
      const link = anchor ? `${PORTAL_URL}#${anchor}` : PORTAL_URL;
      const label = TYPE_LABEL[it.entity_type] ?? "Update";
      return `
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:20px 22px;margin:0 0 16px;">
          <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1A7EC8;margin:0 0 8px;">${label}</p>
          <h3 style="font-size:17px;font-weight:700;color:#173660;margin:0 0 8px;line-height:1.3;">${escapeHtml(it.title)}</h3>
          ${it.summary ? `<p style="font-size:14px;color:#475569;margin:0 0 14px;line-height:1.6;">${escapeHtml(it.summary)}</p>` : ""}
          <a href="${link}" style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1A7EC8;text-decoration:none;">View on the portal →</a>
        </div>`;
    })
    .join("");

  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#173660;padding:32px;">
      <h1 style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin:0;">The Crash Portal</h1>
      <p style="color:#a3d7c2;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:6px 0 0;">What's New</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">Here's the latest from Rhino Ventures — new partnerships, resources, and events for your company.</p>
      ${sections}
      <a href="${PORTAL_URL}" style="display:inline-block;background:#1A7EC8;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:14px 28px;text-decoration:none;border-radius:8px;margin-top:8px;">Open the Portal →</a>
    </div>
    <div style="padding:24px 32px;border-top:1px solid #e2e8f0;">
      <p style="font-size:11px;color:#94a3b8;margin:0;">You're receiving this because you subscribed to portal updates. Manage your preferences on the portal.</p>
    </div>
  </div>`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    // ── Authenticate & authorize the caller (must be a Rhino admin) ──
    const authHeader = req.headers.get("Authorization") ?? "";
    const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await authedClient.auth.getUser();
    const email = userData?.user?.email ?? "";
    if (!email.endsWith("@rhinovc.com")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const itemIds: string[] = Array.isArray(body.item_ids) ? body.item_ids : [];
    const preview: boolean = body.preview === true;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (itemIds.length === 0) {
      return new Response(JSON.stringify({ error: "No items selected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch queued items ──
    const { data: items, error: itemsErr } = await admin
      .from("digest_queue")
      .select("id, entity_type, entity_id, title, summary")
      .in("id", itemIds)
      .is("sent_at", null);

    if (itemsErr) throw itemsErr;
    const queueItems = (items as QueueItem[]) ?? [];
    if (queueItems.length === 0) {
      return new Response(JSON.stringify({ error: "Selected items are no longer queued" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildDigestHtml(queueItems);
    const subject = buildSubject();

    // ── Preview mode: return rendered HTML without sending ──
    if (preview) {
      return new Response(JSON.stringify({ ok: true, html, subject, item_count: queueItems.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch active subscribers ──
    const { data: subs, error: subsErr } = await admin
      .from("notification_subscriptions")
      .select("email")
      .eq("subscribed", true);
    if (subsErr) throw subsErr;

    const recipients = Array.from(
      new Set((subs ?? []).map((s: { email: string }) => s.email?.trim().toLowerCase()).filter(Boolean)),
    );

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "No active subscribers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Send to each subscriber ──
    let sent = 0;
    const failures: string[] = [];
    for (const to of recipients) {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "The Crash Portal <portal@rhinovc.com>",
            to: [to],
            subject,
            html,
          }),
        });
        if (resp.ok) sent++;
        else failures.push(`${to}: ${resp.status} ${(await resp.text()).slice(0, 200)}`);
      } catch (e) {
        failures.push(`${to}: ${String(e).slice(0, 200)}`);
      }
    }

    if (sent === 0) {
      return new Response(JSON.stringify({ error: "All sends failed", failures }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mark queue rows sent + record audit ──
    const batchId = crypto.randomUUID();
    const sentAt = new Date().toISOString();
    const sentIds = queueItems.map((i) => i.id);

    await admin
      .from("digest_queue")
      .update({ sent_at: sentAt, digest_batch_id: batchId })
      .in("id", sentIds);

    await admin.from("digests_sent").insert({
      batch_id: batchId,
      subscriber_count: sent,
      item_count: queueItems.length,
      subject,
      item_ids: sentIds,
      sent_by_admin_id: userData?.user?.id ?? null,
      sent_at: sentAt,
    });

    return new Response(
      JSON.stringify({ ok: true, batch_id: batchId, sent, item_count: queueItems.length, failures }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-digest error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
