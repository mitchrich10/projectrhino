import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Maps the inviter's Rhino email to their display name (mirrors the wizard lookup)
const RHINO_CONTACT_NAMES: Record<string, string> = {
  "candace@rhinovc.com": "Candace Hobin",
  "jay@rhinovc.com": "Jay Rhind",
  "mitch@rhinovc.com": "Mitch Richardson",
  "nicholas@rhinovc.com": "Nicholas Hyldelund",
  "fraser@rhinovc.com": "Fraser Hall",
};

// Base URL used for the one-click sign-in link in the email
const PORTAL_BASE_URL = "https://rhinovc.com";

// Invite token lifetime
const TOKEN_TTL_HOURS = 48;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Recipient {
  email: string;
  name?: string;
  company?: string;
}

const inviterDisplayName = (email?: string | null): string => {
  if (!email) return "The Rhino Ventures team";
  return RHINO_CONTACT_NAMES[email.toLowerCase()] ?? "The Rhino Ventures team";
};

const buildEmailHtml = (opts: {
  greetingName?: string;
  greetingCompany?: string;
  inviterName: string;
  note?: string;
  portalUrl: string;
}) => {
  // "Hi Jane, welcome to the Crash on behalf of Acme Inc," when both are present.
  let greeting: string;
  if (opts.greetingName && opts.greetingCompany) {
    greeting = `Hi ${opts.greetingName}, welcome to the Crash on behalf of ${opts.greetingCompany},`;
  } else if (opts.greetingName) {
    greeting = `Hi ${opts.greetingName},`;
  } else if (opts.greetingCompany) {
    greeting = `Hi ${opts.greetingCompany} team,`;
  } else {
    greeting = "Hi there,";
  }
  // One font stack used everywhere. Declared inline on EVERY element because
  // most email clients (Gmail, Outlook) strip <style> blocks and fall back to
  // their own default font otherwise.
  const FONT = "Arial, Helvetica, sans-serif";
  // Shared declarations so every text element renders identically.
  const base = `font-family: ${FONT}; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;`;
  const body = `${base} color: #555555; font-size: 14px; font-weight: 400; line-height: 1.6;`;

  return `
    <div style="${base} background: #ffffff; max-width: 600px; margin: 0 auto;">
      <div style="background: #173660; padding: 24px 32px;">
        <h1 style="${base} color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: -1px; line-height: 1.2; margin: 0; text-transform: uppercase;">RHINO</h1>
        <p style="${base} color: #aaaaaa; font-size: 10px; font-weight: bold; letter-spacing: 3px; line-height: 1.4; text-transform: uppercase; margin: 2px 0 0;">Partner Portal</p>
      </div>
      <div style="${base} padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
        <p style="${base} color: #173660; font-size: 14px; font-weight: bold; line-height: 1.6; margin: 0 0 20px;">
          ${opts.inviterName} from Rhino Ventures invited you to the Crash.
        </p>
        <p style="${body} margin: 0 0 8px;">${greeting}</p>
        <p style="${body} margin: 0 0 16px;">
          Welcome to the Crash — Rhino's portfolio company portal. Inside you'll find:
        </p>
        <ul style="${body} margin: 0 0 16px; padding-left: 20px;">
          <li style="${body} margin: 0 0 6px;">Curated partnerships and discounts across cloud, finance, hiring, and productivity tools</li>
          <li style="${body} margin: 0 0 6px;">A library of founder resources covering fundraising, governance, compensation, and hiring</li>
          <li style="${body} margin: 0;">A request channel for intros, partnerships, and anything else you need from the Rhino team</li>
        </ul>
        <p style="${body} margin: 0 0 16px;">
          To get started, click below to sign in. There's a brief onboarding flow to share your brand assets, key contacts, tech stack, and current priorities — so we can make sure you're plugged into everything relevant.
        </p>
        ${opts.note ? `<p style="${body} margin: 0 0 16px; padding: 12px 16px; background: #f4f7fa; border-left: 3px solid #1A7EC8;">${opts.note}</p>` : ""}
        <a href="${opts.portalUrl}" style="${base} display: inline-block; background: #1A7EC8; color: #ffffff; font-size: 12px; font-weight: bold; letter-spacing: 2px; line-height: 1.2; text-transform: uppercase; padding: 14px 28px; text-decoration: none; border-radius: 4px; margin: 8px 0 0;">
          Access the Portal →
        </a>
        <p style="${base} color: #999999; font-size: 11px; font-weight: 400; line-height: 1.5; margin: 24px 0 0;">
          This sign-in link is unique to you and expires in ${TOKEN_TTL_HOURS} hours. If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — must be rhinovc.com
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

    const body = await req.json() as {
      recipients?: Recipient[];
      emails?: string[]; // backward compatibility
      note?: string;
      assignedRhinoContacts?: string[];
    };
    const { note, assignedRhinoContacts } = body;

    // Normalize recipients (support legacy `emails` array)
    let recipients: Recipient[] = [];
    if (body.recipients?.length) {
      recipients = body.recipients;
    } else if (body.emails?.length) {
      recipients = body.emails.map((e) => ({ email: e }));
    }

    recipients = recipients
      .map((r) => ({
        email: (r.email ?? "").trim().toLowerCase(),
        name: r.name?.trim() || undefined,
        company: r.company?.trim() || undefined,
      }))
      .filter((r) => r.email.includes("@"));

    if (!recipients.length) {
      return new Response(JSON.stringify({ error: "No valid recipients provided" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Always include candace; dedupe
    const rhinoContacts = Array.from(new Set([
      "candace@rhinovc.com",
      ...(assignedRhinoContacts ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean),
    ]));

    const inviterName = inviterDisplayName(user.email);

    // All emails in this batch share the same batch_id so progress is shared between them
    const batchId: string = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

    // Record all invites with the same batch_id and a fresh per-recipient token
    const inviteRows = recipients.map((r) => ({
      email: r.email,
      invitee_name: r.name ?? null,
      invitee_company: r.company ?? null,
      invited_by: user.email!,
      note: note ?? null,
      batch_id: batchId,
      assigned_rhino_contacts: rhinoContacts,
      invite_token: crypto.randomUUID(),
      token_expires_at: expiresAt,
      token_redeemed_at: null,
    }));

    const { data: upserted, error: upsertError } = await supabase
      .from("onboarding_invites")
      .upsert(inviteRows, { onConflict: "email" })
      .select("email, invitee_name, invitee_company, invite_token");

    if (upsertError || !upserted) {
      console.error("Upsert failed:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to record invites" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send ONE personalized email per recipient (each has a unique sign-in token)
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const row of upserted as { email: string; invitee_name: string | null; invite_token: string }[]) {
      try {
        const portalUrl = `${PORTAL_BASE_URL}/portal?invite_token=${row.invite_token}`;
        const emailHtml = buildEmailHtml({
          greetingName: row.invitee_name ?? undefined,
          inviterName,
          note: note,
          portalUrl,
        });

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Rhino Ventures Portal <portal@rhinovc.com>",
            to: [row.email],
            subject: `${inviterName} invited you to the Crash — Rhino Ventures`,
            html: emailHtml,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Resend error: ${err}`);
        }

        results.push({ email: row.email, success: true });
      } catch (err: unknown) {
        console.error(`Failed to send invite to ${row.email}:`, err);
        results.push({ email: row.email, success: false, error: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
