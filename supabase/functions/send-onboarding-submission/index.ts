import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      companyName, userEmail, teamMembers, needs, additionalNotes,
      logoPermission, announcingRaise, wantsRhinoSupport,
      techStack, priorityContext, logoPath, primaryColor, secondaryColor,
      tertiaryColor, accentColor,
      brandGuidelinesPath, prioritiesOther,
    } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const teamHtml = (teamMembers ?? [])
      .map((m: { name: string; role?: string; title?: string; email: string }) =>
        `<li><strong>${m.name}</strong>${m.role || m.title ? ` — ${m.role || m.title}` : ""}${m.email ? ` (${m.email})` : ""}</li>`
      ).join("");

    const needsHtml = (needs ?? []).length > 0
      ? (needs as string[]).map((n) => `<li>${n}</li>`).join("")
      : "<li><em>Not completed</em></li>";

    // Tech stack summary
    const techStackEntries = Object.entries(techStack ?? {}).filter(([k]) => k !== "other_tools_notes");
    const techStackHtml = techStackEntries.length > 0
      ? techStackEntries.map(([k, v]) => {
          const vals = v as string[];
          return vals.length > 0 ? `<li><strong>${k}:</strong> ${vals.join(", ")}</li>` : null;
        }).filter(Boolean).join("") || "<li><em>Not completed</em></li>"
      : "<li><em>Not completed</em></li>";

    const otherToolsNotes = (techStack as any)?.other_tools_notes;

    // Priority context
    const contextEntries = Object.entries(priorityContext ?? {}).filter(([, v]) => (v as string)?.trim());
    const contextHtml = contextEntries.length > 0
      ? contextEntries.map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join("")
      : "";

    const html = `
      <h2>Onboarding Submission: ${companyName}</h2>
      <p><strong>Submitted by:</strong> ${userEmail}</p>

      <h3>Brand Assets</h3>
      <ul>
        <li><strong>Logo:</strong> ${logoPath ? `<a href="${logoPath}">Uploaded</a>` : "<em>Not provided</em>"}</li>
        ${(!primaryColor && !secondaryColor && !tertiaryColor && !accentColor) 
          ? `<li><strong>Brand colours:</strong> <em>Not set</em></li>`
          : [
              primaryColor ? `<li><strong>Primary colour:</strong> ${primaryColor}</li>` : "",
              secondaryColor ? `<li><strong>Secondary colour:</strong> ${secondaryColor}</li>` : "",
              tertiaryColor ? `<li><strong>Tertiary colour:</strong> ${tertiaryColor}</li>` : "",
              accentColor ? `<li><strong>Accent colour:</strong> ${accentColor}</li>` : "",
            ].filter(Boolean).join("\n")
        }
        <li><strong>Brand guidelines:</strong> ${brandGuidelinesPath ? `<a href="${brandGuidelinesPath}">Uploaded</a>` : "<em>Not provided</em>"}</li>
      </ul>

      <h3>Key Team Members</h3>
      <ul>${teamHtml || "<li><em>Not completed</em></li>"}</ul>

      <h3>Tech Stack</h3>
      <ul>${techStackHtml}</ul>
      ${otherToolsNotes ? `<p><strong>Other tools:</strong> ${otherToolsNotes}</p>` : ""}

      <h3>Short-term Priorities</h3>
      <ul>${needsHtml}</ul>
      ${contextHtml ? `<h4>Priority Context</h4><ul>${contextHtml}</ul>` : ""}
      ${prioritiesOther ? `<p><strong>Other priorities:</strong> ${prioritiesOther}</p>` : ""}
      ${additionalNotes ? `<h3>Additional Notes</h3><p>${additionalNotes}</p>` : ""}

      <h3>Quick Questions</h3>
      <ul>
        <li><strong>Feature on Rhino site:</strong> ${logoPermission === true ? "✅ Yes" : logoPermission === false ? "❌ Not yet" : "<em>Not answered</em>"}</li>
        <li><strong>Announcing raise:</strong> ${announcingRaise ?? "<em>Not answered</em>"}</li>
        <li><strong>Rhino assistance requested:</strong> ${wantsRhinoSupport ?? "<em>Not answered</em>"}</li>
      </ul>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Candace Hobin <candace@rhinovc.com>",
        to: ["candace@rhinovc.com"],
        subject: `Onboarding Submission: ${companyName}`,
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
