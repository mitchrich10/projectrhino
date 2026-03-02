import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — must be rhinovc.com
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user?.email?.endsWith("@rhinovc.com")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { emails, note } = await req.json() as { emails: string[]; note?: string };

    if (!emails?.length) {
      return new Response(JSON.stringify({ error: "No emails provided" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const trimmedEmails = emails.map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!trimmedEmails.length) {
      return new Response(JSON.stringify({ error: "No valid emails provided" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const portalUrl = "https://projectrhino.lovable.app/partner-login";

    // All emails in this batch share the same batch_id so progress is shared between them
    const batchId: string = crypto.randomUUID();

    // Record all invites with the same batch_id
    const inviteRows = trimmedEmails.map((email) => ({
      email,
      invited_by: user.email!,
      note: note ?? null,
      batch_id: batchId,
    }));

    await supabase.from("onboarding_invites").upsert(inviteRows, { onConflict: "email" });

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send ONE group email to all recipients together
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px 32px;">
          <h1 style="color: #fff; font-size: 22px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase;">Rhino Ventures</h1>
          <p style="color: #aaa; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 4px 0 0;">Partner Portal</p>
        </div>
        <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0 0 16px;">Welcome to the Rhino Partner Portal</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            We've set up your team's access to the Rhino Ventures Partner Portal — your hub for partnerships, resources, events, and everything you need as a portfolio company.
          </p>
          ${note ? `<p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">${note}</p>` : ""}
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Click below to sign in. Enter your email address and we'll send you a magic link to access the portal.
          </p>
          <a href="${portalUrl}" style="display: inline-block; background: #000; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 14px 28px; text-decoration: none; border-radius: 4px;">
            Access the Portal →
          </a>
          <p style="color: #999; font-size: 11px; margin: 24px 0 0;">
            If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      </div>
    `;

    const results: { email: string; success: boolean; error?: string }[] = [];

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Rhino Ventures <onboarding@resend.dev>",
          to: trimmedEmails,
          subject: "Welcome to the Rhino Ventures Partner Portal",
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend error: ${err}`);
      }

      trimmedEmails.forEach((email) => results.push({ email, success: true }));
    } catch (err: unknown) {
      console.error("Failed to send group email:", err);
      trimmedEmails.forEach((email) =>
        results.push({ email, success: false, error: err instanceof Error ? err.message : "Unknown error" })
      );
    }

    return new Response(JSON.stringify({ results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
