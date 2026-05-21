import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ApprovedDomainInfo {
  company_name: string;
  logo_key: string | null;
}

// Module-level cache: one in-flight promise per domain for the lifetime of the page.
const cache = new Map<string, Promise<ApprovedDomainInfo | null>>();

export const fetchApprovedDomain = (
  domain: string,
): Promise<ApprovedDomainInfo | null> => {
  const key = domain.toLowerCase();
  if (!cache.has(key)) {
    const p = (async () => {
      try {
        const { data } = await supabase
          .from("approved_domains")
          .select("company_name, logo_key")
          .eq("domain", key)
          .maybeSingle();
        return (data as ApprovedDomainInfo | null) ?? null;
      } catch {
        return null;
      }
    })();
    cache.set(key, p);
  }
  return cache.get(key)!;
};

/**
 * React hook wrapper around the cached approved-domain lookup.
 * Pass `null` to skip (e.g., before the session is ready).
 */
export const useApprovedDomain = (
  domain: string | null | undefined,
): { data: ApprovedDomainInfo | null; loading: boolean } => {
  const [data, setData] = useState<ApprovedDomainInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(!!domain);

  useEffect(() => {
    let alive = true;
    if (!domain) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchApprovedDomain(domain).then((d) => {
      if (!alive) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [domain]);

  return { data, loading };
};

/** Clear the cache on sign-out so the next session can re-fetch. */
export const clearApprovedDomainCache = () => cache.clear();
