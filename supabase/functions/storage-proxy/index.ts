import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Only public asset buckets may be proxied.
const ALLOWED_BUCKETS = new Set([
  "partnerships",
  "partnership-logos",
  "company-logos",
  "resources",
  "brand-assets",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const bucket = url.searchParams.get("bucket") ?? "";
    const path = url.searchParams.get("path") ?? "";
    const download = url.searchParams.get("download");
    const filenameOverride = url.searchParams.get("filename");

    if (!ALLOWED_BUCKETS.has(bucket) || !path) {
      return new Response(JSON.stringify({ error: "Invalid bucket or path" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Reject path traversal attempts.
    if (path.includes("..")) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error || !data) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const rawName = path.split("/").pop() ?? "file";
    // Strip a leading timestamp/UUID prefix (e.g. "1781644415102-Name.pdf")
    const fileName = filenameOverride || rawName.replace(/^\d+-/, "").replace(/^[0-9a-f-]{16,}-/i, "");
    const contentType = data.type || "application/octet-stream";

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    };
    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
    } else {
      headers["Content-Disposition"] = `inline; filename="${fileName}"`;
    }

    return new Response(data, { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
