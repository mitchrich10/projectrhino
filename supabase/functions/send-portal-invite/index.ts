import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { emails, senderName, companyName, portalUrl } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of (emails as string[])) {
      const html = `
        <p>Hi there,</p>
        <p><strong>${senderName || companyName}</strong> has invited you to access the <strong>Rhino Ventures Partner Portal</strong> — your home base for resources, events, partnerships, and more.</p>
        <p>Sign in with your work email at the link below:</p>
        <p style="margin: 24px 0;">
          <a href="${portalUrl}" style="background:#171717;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
            Access the Portal →
          </a>
        </p>
        <p style="color:#888;font-size:12px;">You'll need to sign in with your <strong>${email.split("@")[1]}</strong> work email. If you have any trouble, reply to this email.</p>
        <p style="color:#888;font-size:12px;">— The Rhino Ventures Team</p>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Rhino Ventures <portal@rhinovc.com>",
          to: [email],
          subject: `${companyName} invited you to the Rhino Partner Portal`,
          html,
        }),
      });

      if (res.ok) {
        results.push({ email, success: true });
      } else {
        const err = await res.text();
        results.push({ email, success: false, error: err });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
