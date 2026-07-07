import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const page = (title: string, message: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title></head>
<body style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8fafc;">
  <div style="max-width:520px;margin:64px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:40px 36px;text-align:center;">
    <h1 style="font-size:20px;color:#173660;margin:0 0 12px;">${title}</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px;">${message}</p>
    <a href="https://projectrhino.lovable.app/portal" style="display:inline-block;background:#1A7EC8;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 24px;text-decoration:none;border-radius:8px;">Open the Portal</a>
  </div>
</body></html>`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";

  const htmlHeaders = { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" };

  if (!UUID_RE.test(token)) {
    return new Response(
      page("Invalid link", "This unsubscribe link is invalid or has expired."),
      { status: 400, headers: htmlHeaders },
    );
  }

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await admin
      .from("notification_subscriptions")
      .update({ subscribed: false })
      .eq("id", token)
      .select("email")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return new Response(
        page("Invalid link", "This unsubscribe link is invalid or has expired."),
        { status: 404, headers: htmlHeaders },
      );
    }

    return new Response(
      page(
        "You're unsubscribed",
        "You won't receive any more Rhino Portal update emails. You can re-enable notifications anytime from the portal.",
      ),
      { status: 200, headers: htmlHeaders },
    );
  } catch (err) {
    console.error("unsubscribe error:", err);
    return new Response(
      page("Something went wrong", "We couldn't process your request. Please try again later."),
      { status: 500, headers: htmlHeaders },
    );
  }
});
