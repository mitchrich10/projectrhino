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
    // Must be a rhinovc.com admin
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

    const { request_id, status } = await req.json() as { request_id: string; status: "approved" | "denied" };

    if (!request_id || !["approved", "denied"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch the request details
    const { data: request, error: fetchError } = await supabase
      .from("partner_requests")
      .select("user_email, company_name, item_name, item_type")
      .eq("id", request_id)
      .single();

    if (fetchError || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update status in DB
    await supabase.from("partner_requests").update({ status }).eq("id", request_id);

    // Send notification email to the partner
    if (RESEND_API_KEY) {
      const portalUrl = "https://projectrhino.lovable.app/portal";
      const approved = status === "approved";

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; padding: 24px 32px;">
            <h1 style="color: #fff; font-size: 22px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase;">Rhino Ventures</h1>
            <p style="color: #aaa; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 4px 0 0;">Partner Portal</p>
          </div>
          <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0 0 16px;">
              ${approved ? "✅ Access Approved" : "Access Request Update"}
            </h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
              ${approved
                ? `Your request to access <strong>${request.item_name}</strong> has been approved. You can now access it in the Partner Portal.`
                : `Your request to access <strong>${request.item_name}</strong> was not approved at this time. Please reach out to your Rhino contact if you have questions.`
              }
            </p>
            ${approved ? `
            <a href="${portalUrl}" style="display: inline-block; background: #000; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 14px 28px; text-decoration: none; border-radius: 4px;">
              Go to Portal →
            </a>` : ""}
            <p style="color: #999; font-size: 11px; margin: 24px 0 0;">
              Questions? Reply to this email or contact your Rhino Ventures partner.
            </p>
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
          to: [request.user_email],
          subject: approved
            ? `Access Approved: ${request.item_name}`
            : `Access Request Update: ${request.item_name}`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
