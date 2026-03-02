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
    // Authenticate the requesting user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { item_type, item_id, item_name, company_name } = await req.json();

    if (!item_type || !item_id || !item_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check for duplicate request
    const { data: existing } = await supabase
      .from("partner_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("item_id", item_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "already_requested", status: existing.status }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert the request
    const { error: insertError } = await supabase.from("partner_requests").insert({
      user_id: user.id,
      user_email: user.email!,
      company_name: company_name ?? user.email?.split("@")[1] ?? "Unknown",
      item_type,
      item_id,
      item_name,
      status: "pending",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send notification email to Candace
    if (RESEND_API_KEY) {
      const adminUrl = "https://projectrhino.lovable.app/admin";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #000;">New Access Request</h2>
          <p>A portfolio company partner has requested access to a gated item.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Requester</td><td style="padding: 8px; border: 1px solid #eee;">${user.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Company</td><td style="padding: 8px; border: 1px solid #eee;">${company_name ?? user.email?.split("@")[1] ?? "Unknown"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Item Type</td><td style="padding: 8px; border: 1px solid #eee; text-transform: capitalize;">${item_type}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee; font-weight: bold; background: #f9f9f9;">Item</td><td style="padding: 8px; border: 1px solid #eee;">${item_name}</td></tr>
          </table>
          <p><a href="${adminUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold;">Review in Admin</a></p>
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
          subject: `Access Request: ${item_name} — ${user.email}`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
