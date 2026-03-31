import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Stub: push onboarding submission data + uploaded files to Google Drive.
 *
 * Expected secrets (not yet configured):
 *   - GOOGLE_SERVICE_ACCOUNT_JSON: JSON key for a Google service account
 *     with write access to Drive folder 1t9XTELnnb8jq6eR1Pixwt2Z-DEgQnrcn
 *
 * Payload: { companyName, submissionHtml, filePaths: string[] }
 *
 * Flow:
 *   1. Auth with Google Drive API using service account credentials.
 *   2. Create or find subfolder named after the company inside parent folder.
 *   3. Upload a summary PDF/doc.
 *   4. Download each file from Supabase Storage and re-upload to Drive subfolder.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { companyName, submissionHtml, filePaths } = await req.json();

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      console.warn("GOOGLE_SERVICE_ACCOUNT_JSON not configured — skipping Drive upload.");
      return new Response(
        JSON.stringify({ ok: false, reason: "google_credentials_not_configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Implement Google Drive API calls once service account is configured.
    // 1. Parse serviceAccountJson, generate JWT, exchange for access token.
    // 2. Create subfolder under parent folder 1t9XTELnnb8jq6eR1Pixwt2Z-DEgQnrcn.
    // 3. Upload summary as a Google Doc or PDF.
    // 4. For each filePath, download from Supabase Storage, upload to Drive subfolder.

    console.log(`Drive stub called for company: ${companyName}, files: ${filePaths?.length ?? 0}`);

    return new Response(
      JSON.stringify({ ok: true, stub: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
