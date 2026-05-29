import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { item_type, item_id, item_name, company_name, notes } = await req.json();

    if (!item_type || !item_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const itemTypeArr: string[] = Array.isArray(item_type) ? item_type : [item_type];
    const isAccessRequest = itemTypeArr.includes("access_request");
    // Toolkit-level requests (e.g. the Fundraising Toolkit) have no specific
    // item_id — they grant access to a whole category. Dedupe these by item_type.
    const TOOLKIT_TYPES = ["financing_guide", "fundraising"];
    const isToolkitRequest = itemTypeArr.some((t) => TOOLKIT_TYPES.includes(t));

    if (!isAccessRequest && !isToolkitRequest) {
      // Item-specific request: item_id is required and we dedupe per user+item
      if (!item_id) {
        return new Response(JSON.stringify({ error: "Missing item_id" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const { data: existing } = await supabase
        .from("partner_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("item_id", item_id)
        .maybeSingle();
      if (existing) {
        return new Response(
          JSON.stringify({ error: "already_requested", status: existing.status }),
          { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
    } else if (isToolkitRequest) {
      // Dedupe toolkit requests per user + toolkit type (no item_id involved).
      const { data: existing } = await supabase
        .from("partner_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .overlaps("item_type", TOOLKIT_TYPES)
        .maybeSingle();
      if (existing) {
        return new Response(
          JSON.stringify({ error: "already_requested", status: existing.status }),
          { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
    }

    const companyName = company_name ?? user.email?.split("@")[1] ?? "Unknown";

    const { data: inserted, error: insertError } = await supabase
      .from("partner_requests")
      .insert({
        user_id: user.id,
        user_email: user.email!,
        company_name: companyName,
        item_type: itemTypeArr,
        item_id: item_id ?? null,
        item_name,
        notes: notes ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Single notification pipeline — fire-and-forget to notify-new-request
    try {
      await supabase.functions.invoke("notify-new-request", {
        body: {
          request_id: inserted?.id ?? null,
          company_name: companyName,
          user_email: user.email,
          item_type: itemTypeArr,
          item_name,
          notes: notes ?? null,
        },
      });
    } catch (e) {
      console.error("notify-new-request invoke failed (non-fatal):", e);
    }

    return new Response(JSON.stringify({ success: true, id: inserted?.id ?? null }), {
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
