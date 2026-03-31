import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return new Response(JSON.stringify({ error: "Missing token or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up share token
    const { data: share, error: shareErr } = await supabaseAdmin
      .from("founder_onboarding_shares")
      .select("batch_id, target_step")
      .eq("token", token)
      .maybeSingle();

    if (shareErr || !share) {
      return new Response(JSON.stringify({ error: "Invalid share token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if invite already exists
    const { data: existing } = await supabaseAdmin
      .from("onboarding_invites")
      .select("id, batch_id")
      .eq("email", email.toLowerCase())
      .eq("batch_id", share.batch_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ batch_id: share.batch_id, target_step: share.target_step, already_invited: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create invite for team member with same batch_id
    const { error: insertErr } = await supabaseAdmin
      .from("onboarding_invites")
      .insert({
        email: email.toLowerCase(),
        batch_id: share.batch_id,
        invited_by: "share-link",
        note: "Invited via team share link",
      });

    if (insertErr) {
      return new Response(JSON.stringify({ error: "Failed to create invite" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ batch_id: share.batch_id, target_step: share.target_step, already_invited: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
