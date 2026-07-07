import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PortalUser {
  email: string;
  domain: string;
  company_name: string;
  created_at: string;
  last_sign_in_at: string | null;
}

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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    const callerEmail = (claimsData?.claims as any)?.email as string | undefined;

    if (claimsError || !callerEmail?.endsWith("@rhinovc.com")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Build domain -> company map
    const { data: domains } = await supabase
      .from("approved_domains")
      .select("domain, company_name");
    const domainMap = new Map<string, string>();
    (domains ?? []).forEach((d: any) => domainMap.set(d.domain.toLowerCase(), d.company_name));

    // Page through all auth users
    const users: PortalUser[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const batch = data?.users ?? [];
      for (const u of batch) {
        const email = u.email ?? "";
        if (!email) continue;
        const domain = email.split("@")[1]?.toLowerCase() ?? "";
        const company = domain === "rhinovc.com"
          ? "Rhino (Admin)"
          : domainMap.get(domain) ?? "Unknown";
        users.push({
          email,
          domain,
          company_name: company,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
        });
      }
      if (batch.length < perPage) break;
      page++;
    }

    return new Response(JSON.stringify({ users }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
