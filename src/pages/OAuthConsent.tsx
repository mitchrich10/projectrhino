import { FC, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import rhinoLogo from "@/assets/rhino-logo-black.png";

// Beta @supabase/supabase-js `auth.oauth` namespace typing shim.
type AuthorizationDetails = {
  client?: { name?: string; client_id?: string; redirect_uris?: string[] };
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};
type AuthOauth = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
const authOauth = (supabase.auth as unknown as { oauth: AuthOauth }).oauth;

const OAuthConsent: FC = () => {
  usePageTitle("Authorize App | Rhino Partner Portal");
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/partner-login?next=" + encodeURIComponent(next);
        return;
      }
      setUserEmail(sess.session.user?.email ?? null);
      const { data, error: dErr } = await authOauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (dErr) {
        setError(dErr.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError(null);
    const { data, error: dErr } = approve
      ? await authOauth.approveAuthorization(authorizationId)
      : await authOauth.denyAuthorization(authorizationId);
    if (dErr) {
      setBusy(false);
      setError(dErr.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? "an external application";
  const scopeList = details?.scopes ?? (details?.scope ? details.scope.split(/\s+/).filter(Boolean) : []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <img src={rhinoLogo} alt="Rhino Ventures" className="h-7 w-auto" />
        </div>

        {error ? (
          <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-6">
            <h1 className="text-lg font-black uppercase tracking-tight text-foreground mb-2">Authorization error</h1>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Link to="/portal" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
              Back to portal
            </Link>
          </div>
        ) : !details ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs uppercase tracking-widest">Loading authorization…</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-white shadow-sm p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Authorize connection</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground leading-tight mb-2">
              Connect {clientName} to Rhino Portal
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              This lets {clientName} use the Rhino Ventures Partner Portal as you. It does not bypass portal
              permissions — data access still follows your account's approved rules.
            </p>

            {userEmail && (
              <div className="text-xs bg-secondary/30 rounded p-3 mb-4">
                <span className="text-muted-foreground uppercase tracking-widest font-bold mr-2">Signed in as</span>
                <span className="font-semibold text-foreground">{userEmail}</span>
              </div>
            )}

            {scopeList.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Requested access
                </p>
                <ul className="text-sm text-foreground space-y-1">
                  {scopeList.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {s === "openid" && "Verify your identity"}
                      {s === "email" && "Share your email address"}
                      {s === "profile" && "Share your basic profile"}
                      {!["openid", "email", "profile"].includes(s) && `Additional permission: ${s}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => decide(false)}
                disabled={busy}
                className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => decide(true)}
                disabled={busy}
                className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthConsent;
