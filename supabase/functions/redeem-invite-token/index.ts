import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json() as { token?: string };

    if (!token || !UUID_RE.test(token)) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Look up the invite by token
    const { data: invite, error: inviteErr } = await supabase
      .from("onboarding_invites")
      .select("email, token_expires_at")
      .eq("invite_token", token)
      .maybeSingle();

    if (inviteErr || !invite) {
      return new Response(JSON.stringify({ error: "This sign-in link is not valid." }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Expiry check (rows created before this feature have no expiry — treat as expired)
    const expiresAt = (invite as { token_expires_at: string | null }).token_expires_at;
    if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "This sign-in link has expired. Please request a new invite." }), {
        status: 410, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const email = (invite as { email: string }).email.toLowerCase();

    // Generate a magic-link token pair. `magiclink` auto-creates the user if missing.
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error("generateLink failed:", linkErr);
      return new Response(JSON.stringify({ error: "Could not sign you in. Please use the email link instead." }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Record first redemption (link remains usable until expiry)
    await supabase
      .from("onboarding_invites")
      .update({ token_redeemed_at: new Date().toISOString() })
      .eq("invite_token", token)
      .is("token_redeemed_at", null);

    return new Response(
      JSON.stringify({
        email,
        token_hash: linkData.properties.hashed_token,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("redeem-invite-token error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
