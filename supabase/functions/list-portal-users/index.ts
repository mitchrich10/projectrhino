import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type PortalStatus =
  | "active"
  | "invited_never_logged_in"
  | "requested_never_logged_in"
  | "never_logged_in";

interface PortalUser {
  email: string;
  domain: string;
  company_name: string;
  created_at: string;
  // Only a genuine, access-granted login. null when the user never truly logged in.
  last_sign_in_at: string | null;
  status: PortalStatus;
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

    // Emails that were sent a portal/onboarding invite
    const { data: invites } = await supabase
      .from("onboarding_invites")
      .select("email");
    const invitedSet = new Set<string>();
    (invites ?? []).forEach((i: any) => i.email && invitedSet.add(i.email.toLowerCase()));

    // Emails that submitted an access request (latest status wins)
    const { data: requests } = await supabase
      .from("partner_requests")
      .select("user_email, item_type, status, created_at")
      .order("created_at", { ascending: false });
    const requestStatus = new Map<string, string>();
    (requests ?? []).forEach((r: any) => {
      const em = (r.user_email ?? "").toLowerCase();
      const types: string[] = Array.isArray(r.item_type) ? r.item_type : r.item_type ? [r.item_type] : [];
      if (!em || !types.includes("access_request")) return;
      if (!requestStatus.has(em)) requestStatus.set(em, r.status); // first = latest due to ordering
    });

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
        const emailLower = email.toLowerCase();
        const domain = email.split("@")[1]?.toLowerCase() ?? "";
        const domainApproved = domain === "rhinovc.com" || domainMap.has(domain);
        const invited = invitedSet.has(emailLower);
        const reqStatus = requestStatus.get(emailLower);
        const company = domain === "rhinovc.com"
          ? "Rhino (Admin)"
          : domainMap.get(domain) ?? "Unknown";

        // A user has portal access only if their domain is approved or they were invited.
        const hasAccess = domainApproved || invited;
        // Supabase sets last_sign_in_at on the FIRST OAuth/magic-link exchange even
        // when the person is later denied access, so a raw timestamp is not proof of
        // a real portal login. Treat it as a genuine login only when the account has
        // portal access.
        const rawSignIn = u.last_sign_in_at ?? null;
        const genuineLogin = !!rawSignIn && hasAccess;

        let status: PortalStatus;
        if (genuineLogin) {
          status = "active";
        } else if (reqStatus) {
          // Requested access (pending/denied) — never a real portal login.
          status = "requested_never_logged_in";
        } else if (invited) {
          status = "invited_never_logged_in";
        } else if (!hasAccess) {
          // Signed in via OAuth but no approved domain / invite: effectively a request.
          status = "requested_never_logged_in";
        } else {
          status = "never_logged_in";
        }

        users.push({
          email,
          domain,
          company_name: company,
          created_at: u.created_at,
          last_sign_in_at: status === "active" ? rawSignIn : null,
          status,
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
