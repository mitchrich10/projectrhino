import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { emailHeader } from "../_shared/email-header.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PORTAL_URL = "https://rhinovc.com/portal";

interface QueueItem {
  id: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  summary: string | null;
}

interface PartnershipDetails {
  id: string;
  tagline: string | null;
  description: string | null;
  redemption_url: string | null;
  promo_code: string | null;
  website_url: string | null;
  partnership_pdf_path: string | null;
  detail_pdf_url: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  partnership_added: "New Partnership",
  partnership_updated: "Partnership Update",
  resource_added: "New Resource",
  event_added: "New Event",
};

const isPartnership = (t: string) => t === "partnership_added" || t === "partnership_updated";

const monthDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Safety net: keep summaries short even if a queue row still holds a long body.
const teaser = (s: string, max = 150): string => {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastStop > 60) return slice.slice(0, lastStop + 1);
  return slice.replace(/\s+\S*$/, "") + "…";
};

// Rewrite a Supabase public-storage URL through the storage-proxy edge function
// (the /storage/v1/ path is commonly blocked by ad blockers).
const proxiedStorageUrl = (supabaseUrl: string, url: string | null, download = false): string | null => {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return url;
  let path = match[2];
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep as-is */
  }
  const params = new URLSearchParams({ bucket: match[1], path });
  if (download) params.set("download", "1");
  return `${supabaseUrl}/functions/v1/storage-proxy?${params.toString()}`;
};

const buildSubject = (items: QueueItem[]): string => {
  const partnerships = items.filter((i) => isPartnership(i.entity_type));
  if (partnerships.length === items.length && partnerships.length === 1) {
    return `Rhino | New partnership: ${partnerships[0].title}`;
  }
  if (partnerships.length === items.length && partnerships.length > 1) {
    return `Rhino | ${partnerships.length} new partnerships`;
  }
  return `What's new on the Rhino Portal — ${monthDay(new Date())}`;
};

const buildIntro = (items: QueueItem[]): string => {
  const partnerships = items.filter((i) => isPartnership(i.entity_type));
  if (partnerships.length === items.length) {
    return partnerships.length === 1
      ? "We've added a new partnership to the Rhino Portal."
      : "We've added new partnerships to the Rhino Portal.";
  }
  return "Here's the latest from Rhino Ventures — new partnerships, resources, and events for your company.";
};

const partnershipCard = (
  it: QueueItem,
  p: PartnershipDetails | undefined,
  supabaseUrl: string,
): string => {
  const label = TYPE_LABEL[it.entity_type] ?? "New Partnership";
  // Prefer the benefit paragraph, not a truncated intro followed by a flattened heading.
  const summaryParagraph = p?.description?.match(/(?:^|\n)Partnership Summary\s*\n+([^\n]+)/i)?.[1];
  const firstParagraph = p?.description?.split(/\n\s*\n/)[0];
  const description = summaryParagraph
    ? teaser(summaryParagraph.replace(/^Rhino portfolio companies\s+/i, "Rhino companies ").replace(/\b(?:a\s+)?flat\s+/gi, ""), 600)
    : firstParagraph ? teaser(firstParagraph, 280) : it.summary ? teaser(it.summary) : null;
  const companyIntro = summaryParagraph && firstParagraph ? teaser(firstParagraph, 280) : null;
  const pdfUrl = proxiedStorageUrl(supabaseUrl, p?.partnership_pdf_path ?? p?.detail_pdf_url ?? null, true);
  const redeemUrl = p?.redemption_url ?? null;
  const websiteUrl = p?.website_url
    ? (/^https?:\/\//i.test(p.website_url) ? p.website_url : `https://${p.website_url}`)
    : null;

  const buttons: string[] = [];
  if (pdfUrl) {
    buttons.push(
      `<a href="${pdfUrl}" style="display:inline-block;background:#173660;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:11px 20px;text-decoration:none;border-radius:8px;margin:0 8px 8px 0;">Download partnership details</a>`,
    );
  }
  if (redeemUrl) {
    buttons.push(
      `<a href="${redeemUrl}" style="display:inline-block;background:#1A7EC8;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:11px 20px;text-decoration:none;border-radius:8px;margin:0 8px 8px 0;">Redeem This Offer</a>`,
    );
  }
  buttons.push(
    `<a href="${PORTAL_URL}?partnership=${encodeURIComponent(it.entity_id ?? "")}" style="display:inline-block;color:#1A7EC8;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:11px 4px;text-decoration:underline;">More info on the portal</a>`,
  );

  return `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:22px;margin:0 0 16px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1A7EC8;margin:0 0 8px;">${label}</p>
      <h3 style="font-size:18px;font-weight:700;color:#173660;margin:0;line-height:1.3;">${escapeHtml(it.title)}</h3>
      ${!summaryParagraph && p?.tagline ? `<p style="font-size:13px;font-weight:600;color:#173660;margin:6px 0 0;line-height:1.5;">${escapeHtml(p.tagline)}</p>` : ""}
      ${companyIntro ? `<p style="font-size:14px;color:#475569;margin:10px 0 0;line-height:1.6;">${escapeHtml(companyIntro)}</p>` : ""}
      ${description ? `<p style="font-size:14px;color:#475569;margin:10px 0 0;line-height:1.6;">${escapeHtml(description)}</p>` : ""}
      ${websiteUrl ? `<p style="font-size:13px;margin:10px 0 0;line-height:1.5;"><a href="${escapeHtml(websiteUrl)}" style="color:#1A7EC8;text-decoration:underline;">${escapeHtml(websiteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, ""))}</a></p>` : ""}
      ${p?.promo_code ? `<p style="font-size:13px;color:#173660;margin:10px 0 0;">Promo code: <strong>${escapeHtml(p.promo_code)}</strong></p>` : ""}
      <div style="margin-top:16px;">${buttons.join("")}</div>
    </div>`;
};

const simpleCard = (it: QueueItem): string => {
  const label = TYPE_LABEL[it.entity_type] ?? "Update";
  return `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:20px 22px;margin:0 0 16px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1A7EC8;margin:0 0 8px;">${label}</p>
      <h3 style="font-size:17px;font-weight:700;color:#173660;margin:0;line-height:1.3;">${escapeHtml(it.title)}</h3>
      ${it.summary ? `<p style="font-size:14px;color:#475569;margin:8px 0 0;line-height:1.6;">${escapeHtml(teaser(it.summary))}</p>` : ""}
    </div>`;
};

const buildDigestHtml = (
  items: QueueItem[],
  partnerships: Map<string, PartnershipDetails>,
  unsubscribeUrl: string,
  supabaseUrl: string,
): string => {
  const sections = items
    .map((it) =>
      isPartnership(it.entity_type) && it.entity_id
        ? partnershipCard(it, partnerships.get(it.entity_id), supabaseUrl)
        : simpleCard(it),
    )
    .join("");

  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    ${emailHeader()}
    <div style="padding:32px;">
      <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">${buildIntro(items)}</p>
      ${sections}
      ${items.some((it) => !isPartnership(it.entity_type)) ? `<a href="${PORTAL_URL}" style="display:inline-block;color:#1A7EC8;font-size:12px;text-decoration:underline;margin-top:8px;">View resources and events on the portal</a>` : ""}
    </div>
    <div style="padding:24px 32px;border-top:1px solid #e2e8f0;">
      <p style="font-size:11px;color:#94a3b8;margin:0;">You're receiving this because you have a Rhino Portal account. <a href="${unsubscribeUrl}" style="color:#1A7EC8;text-decoration:underline;">Unsubscribe</a> from these updates at any time.</p>
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

    // ── Enrich partnership items with full details (tagline, PDF, redemption link) ──
    const partnershipIds = queueItems
      .filter((i) => isPartnership(i.entity_type) && i.entity_id)
      .map((i) => i.entity_id as string);
    const partnerships = new Map<string, PartnershipDetails>();
    if (partnershipIds.length > 0) {
      const { data: rows } = await admin
        .from("partnerships")
        .select("id, tagline, description, redemption_url, promo_code, website_url, partnership_pdf_path, detail_pdf_url")
        .in("id", partnershipIds);
      (rows as PartnershipDetails[] | null)?.forEach((r) => partnerships.set(r.id, r));
    }

    const subject = buildSubject(queueItems);
    const unsubscribeBase = `${SUPABASE_URL}/functions/v1/unsubscribe-notifications`;

    // ── Preview mode: return rendered HTML without sending ──
    if (preview) {
      const html = buildDigestHtml(queueItems, partnerships, `${unsubscribeBase}?token=preview`, SUPABASE_URL);
      return new Response(JSON.stringify({ ok: true, html, subject, item_count: queueItems.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch active subscribers (only approved, logged-in users are ever enrolled) ──
    const { data: subs, error: subsErr } = await admin
      .from("notification_subscriptions")
      .select("id, email")
      .eq("subscribed", true);
    if (subsErr) throw subsErr;

    // De-dupe by email, keeping the subscription id for a per-recipient unsubscribe link.
    const recipientMap = new Map<string, string>();
    (subs ?? []).forEach((s: { id: string; email: string }) => {
      const em = s.email?.trim().toLowerCase();
      if (em && !recipientMap.has(em)) recipientMap.set(em, s.id);
    });
    const recipients = Array.from(recipientMap.entries()); // [email, subscriptionId]

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

    // ── Send to each subscriber with a personalized unsubscribe link ──
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let sent = 0;
    const failures: { email: string; reason: string }[] = [];
    for (const [to, subId] of recipients) {
      let delivered = false;
      let lastReason = "unknown error";
      // One retry on transient errors (rate limit / service hiccup) with a backoff.
      for (let attempt = 0; attempt < 2 && !delivered; attempt++) {
        if (attempt > 0) await sleep(2000);
        try {
          const html = buildDigestHtml(queueItems, partnerships, `${unsubscribeBase}?token=${subId}`, SUPABASE_URL);
          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: "Rhino Portal <portal@rhinovc.com>",
              to: [to],
              subject,
              html,
            }),
          });
          if (resp.ok) {
            delivered = true;
          } else {
            lastReason = `${resp.status} ${(await resp.text()).slice(0, 200)}`;
            // Only retry transient failures — permanent ones (bad address, unauthorized) won't recover.
            if (!(resp.status === 429 || resp.status >= 500)) break;
          }
        } catch (e) {
          lastReason = String(e).slice(0, 200);
        }
        if (attempt === 0) await sleep(300); // small stagger between recipients to stay under rate limits
      }
      if (delivered) sent++;
      else failures.push({ email: to, reason: lastReason });
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
