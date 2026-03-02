import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { company_name, user_email, item_type, item_name, notes } = await req.json();

    // Fetch existing partnerships from DB to check for matches
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: partnerships } = await supabase
      .from("partnerships")
      .select("name, tagline, description, category")
      .order("display_order");

    let aiMatchHtml = "";

    // Use AI to find relevant existing partnerships
    if (LOVABLE_API_KEY && partnerships && partnerships.length > 0) {
      try {
        const partnershipList = partnerships
          .map((p) => `- ${p.name}${p.tagline ? ` (${p.tagline})` : ""}${p.category ? ` [${p.category}]` : ""}`)
          .join("\n");

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant for a venture capital firm called Rhino Ventures. Your job is to identify if any existing partnerships/vendor deals are relevant to a portfolio company's request. Be concise and practical. Return a plain-text response of 1-3 sentences max. If none are relevant, say so briefly.",
              },
              {
                role: "user",
                content: `A portfolio company called "${company_name}" submitted a request:\n\nRequest subject: "${item_name}"\nRequest type(s): ${item_type}\n${notes ? `Additional notes: ${notes}\n` : ""}\nHere are Rhino's existing partnership/vendor deals:\n${partnershipList}\n\nAre any of these existing partnerships potentially relevant to their request? Name them specifically if yes.`,
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiText = aiData.choices?.[0]?.message?.content ?? "";
          if (aiText) {
            aiMatchHtml = `
              <div style="background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 16px 0;">
                <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1d4ed8; margin: 0 0 8px;">🤖 AI Partnership Match Check</p>
                <p style="font-size: 13px; color: #1e3a5f; margin: 0; line-height: 1.6;">${aiText.replace(/\n/g, "<br>")}</p>
              </div>`;
          }
        }
      } catch (e) {
        console.error("AI matching error:", e);
        // Non-fatal — continue without AI insight
      }
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: true, note: "No RESEND_API_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUrl = "https://projectrhino.lovable.app/admin";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px 32px;">
          <h1 style="color: #fff; font-size: 22px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase;">Rhino Ventures</h1>
          <p style="color: #aaa; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 4px 0 0;">Partner Portal — New Request</p>
        </div>
        <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0 0 20px;">New Request from ${company_name}</h2>
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 700; font-size: 12px; background: #f9f9f9; width: 140px;">Company</td>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-size: 13px;">${company_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 700; font-size: 12px; background: #f9f9f9;">Submitted by</td>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-size: 13px;">${user_email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 700; font-size: 12px; background: #f9f9f9;">Type(s)</td>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-size: 13px; text-transform: capitalize;">${item_type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 700; font-size: 12px; background: #f9f9f9;">Subject</td>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-size: 13px; font-weight: 600;">${item_name}</td>
            </tr>
            ${notes ? `<tr>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 700; font-size: 12px; background: #f9f9f9;">Notes</td>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-size: 13px; font-style: italic;">${notes}</td>
            </tr>` : ""}
          </table>

          ${aiMatchHtml}

          <a href="${adminUrl}" style="display: inline-block; background: #000; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 8px;">
            Review in Admin →
          </a>
        </div>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Rhino Ventures Portal <onboarding@resend.dev>",
        to: ["candace@rhinovc.com"],
        subject: `New Request: ${item_name} — ${company_name}`,
        html: emailHtml,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
