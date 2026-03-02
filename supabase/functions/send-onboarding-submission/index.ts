import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { companyName, userEmail, teamMembers, needs, additionalNotes } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const teamHtml = (teamMembers ?? [])
      .map((m: { name: string; title: string; email: string }) =>
        `<li><strong>${m.name}</strong>${m.title ? ` — ${m.title}` : ""}${m.email ? ` (${m.email})` : ""}</li>`
      ).join("");

    const needsHtml = (needs ?? []).length > 0
      ? (needs as string[]).map((n) => `<li>${n}</li>`).join("")
      : "<li>None specified</li>";

    const html = `
      <h2>New Onboarding Submission: ${companyName}</h2>
      <p><strong>Submitted by:</strong> ${userEmail}</p>
      <h3>Key Team Members</h3>
      <ul>${teamHtml || "<li>None provided</li>"}</ul>
      <h3>Short-term Needs</h3>
      <ul>${needsHtml}</ul>
      ${additionalNotes ? `<h3>Additional Notes</h3><p>${additionalNotes}</p>` : ""}
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Rhino Portal <portal@rhinovc.com>",
        to: ["candace@rhinovc.com"],
        subject: `New Onboarding Submission: ${companyName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
