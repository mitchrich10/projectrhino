import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLACK_CHANNEL_ID = "C0B572P76TV"; // #portal-requests
const ADMIN_URL = "https://projectrhino.lovable.app/admin";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SLACK_API_KEY = Deno.env.get("SLACK_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const logNotification = async (
    requestId: string | null,
    channel: "email" | "slack",
    status: "sent" | "failed",
    errorMessage?: string,
  ) => {
    try {
      await supabase.from("notification_log").insert({
        request_id: requestId,
        channel,
        status,
        error_message: errorMessage ?? null,
      });
    } catch (e) {
      console.error("notification_log insert failed:", e);
    }
  };

  try {
    const { request_id, company_name, user_email, item_type, item_name, notes } = await req.json();
    const requestId: string | null = request_id ?? null;
    // Normalize item_type to a comma-separated capitalized label
    const itemTypeLabel: string = Array.isArray(item_type)
      ? item_type.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
      : String(item_type ?? "");

    // ---- AI partnership match (non-fatal) ----
    let aiMatchText = "";
    let aiMatchHtml = "";
    if (LOVABLE_API_KEY) {
      try {
        const { data: partnerships } = await supabase
          .from("partnerships")
          .select("name, tagline, category")
          .order("display_order");

        if (partnerships && partnerships.length > 0) {
          const partnershipList = partnerships
            .map((p: any) => `- ${p.name}${p.tagline ? ` (${p.tagline})` : ""}${p.category ? ` [${p.category}]` : ""}`)
            .join("\n");

          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant for Rhino Ventures. Identify if any existing partnerships are relevant to a portfolio company's request. Plain text, 1-3 sentences. If none, say so briefly.",
                },
                {
                  role: "user",
                  content: `Company "${company_name}" requested:\nSubject: "${item_name}"\nType(s): ${itemTypeLabel}\n${notes ? `Notes: ${notes}\n` : ""}\nExisting partnerships:\n${partnershipList}\n\nAre any relevant? Name them if yes.`,
                },
              ],
            }),
          });
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiMatchText = aiData.choices?.[0]?.message?.content ?? "";
            if (aiMatchText) {
              aiMatchHtml = `
                <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:16px;margin:16px 0;">
                  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#1d4ed8;margin:0 0 8px;">AI Partnership Match Check</p>
                  <p style="font-size:13px;color:#1e3a5f;margin:0;line-height:1.6;">${aiMatchText.replace(/\n/g, "<br>")}</p>
                </div>`;
            }
          }
        }
      } catch (e) {
        console.error("AI matching error:", e);
      }
    }

    // ---- Email via Resend ----
    if (RESEND_API_KEY) {
      try {
        const emailHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            ${emailHeader("Partner Portal — New Request")}
            <div style="padding:32px;border:1px solid #e5e5e5;border-top:none;">
              <h2 style="font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;margin:0 0 20px;">New Request from ${company_name}</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px;">
                <tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:700;font-size:12px;background:#f9f9f9;width:140px;">Company</td><td style="padding:8px 12px;border:1px solid #e5e5e5;font-size:13px;">${company_name}</td></tr>
                <tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:700;font-size:12px;background:#f9f9f9;">Submitted by</td><td style="padding:8px 12px;border:1px solid #e5e5e5;font-size:13px;">${user_email}</td></tr>
                <tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:700;font-size:12px;background:#f9f9f9;">Type(s)</td><td style="padding:8px 12px;border:1px solid #e5e5e5;font-size:13px;text-transform:capitalize;">${itemTypeLabel}</td></tr>
                <tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:700;font-size:12px;background:#f9f9f9;">Subject</td><td style="padding:8px 12px;border:1px solid #e5e5e5;font-size:13px;font-weight:600;">${item_name}</td></tr>
                ${notes ? `<tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:700;font-size:12px;background:#f9f9f9;">Notes</td><td style="padding:8px 12px;border:1px solid #e5e5e5;font-size:13px;font-style:italic;">${notes}</td></tr>` : ""}
                <tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:700;font-size:12px;background:#f9f9f9;">Submitted</td><td style="padding:8px 12px;border:1px solid #e5e5e5;font-size:13px;">${new Date().toLocaleString("en-CA", { timeZone: "America/Vancouver" })} PT</td></tr>
              </table>
              ${aiMatchHtml}
              <a href="${ADMIN_URL}" style="display:inline-block;background:#000;color:#fff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:12px 24px;text-decoration:none;border-radius:4px;margin-top:8px;">Review in Admin →</a>
            </div>
          </div>`;

        const emailResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "Rhino Ventures Portal <portal@rhinovc.com>",
            to: ["candace@rhinovc.com"],
            subject: `New portal request from ${company_name} — ${itemTypeLabel}`,
            html: emailHtml,
          }),
        });
        if (emailResp.ok) {
          await logNotification(requestId, "email", "sent");
        } else {
          const errText = await emailResp.text();
          await logNotification(requestId, "email", "failed", `${emailResp.status}: ${errText.slice(0, 500)}`);
        }
      } catch (e) {
        await logNotification(requestId, "email", "failed", String(e).slice(0, 500));
      }
    } else {
      await logNotification(requestId, "email", "failed", "RESEND_API_KEY not configured");
    }

    // ---- Slack via connector gateway ----
    if (LOVABLE_API_KEY && SLACK_API_KEY) {
      try {
        const blocks: any[] = [
          {
            type: "header",
            text: { type: "plain_text", text: `New portal request — ${company_name}` },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Company:*\n${company_name}` },
              { type: "mrkdwn", text: `*Submitted by:*\n${user_email}` },
              { type: "mrkdwn", text: `*Type(s):*\n${itemTypeLabel}` },
              { type: "mrkdwn", text: `*Subject:*\n${item_name}` },
            ],
          },
        ];
        if (notes) {
          blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Notes:*\n${notes}` } });
        }
        if (aiMatchText) {
          blocks.push({ type: "section", text: { type: "mrkdwn", text: `*AI partnership match:*\n${aiMatchText}` } });
        }
        blocks.push({
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Review in Admin" },
              url: ADMIN_URL,
              style: "primary",
            },
          ],
        });

        const slackResp = await fetch("https://connector-gateway.lovable.dev/slack/api/chat.postMessage", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": SLACK_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: SLACK_CHANNEL_ID,
            text: `New portal request from ${company_name}: ${item_name}`,
            blocks,
          }),
        });
        const slackData = await slackResp.json();
        if (slackResp.ok && slackData.ok) {
          await logNotification(requestId, "slack", "sent");
        } else {
          await logNotification(requestId, "slack", "failed", `${slackResp.status}: ${JSON.stringify(slackData).slice(0, 500)}`);
        }
      } catch (e) {
        await logNotification(requestId, "slack", "failed", String(e).slice(0, 500));
      }
    } else {
      await logNotification(requestId, "slack", "failed", "Slack credentials not configured");
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-new-request error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
