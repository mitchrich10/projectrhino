import { supabase } from "@/integrations/supabase/client";

/**
 * Route-level prefetch for the portal's public data (partnerships + resources).
 *
 * These queries are session-independent, so we kick them off as soon as the
 * Portal route chunk loads — before the section components mount. The sections
 * await the cached promise instead of issuing a fresh request, so on a cold
 * load the data is often already in flight (or resolved) by the time the grids
 * render, replacing the long "Loading…" state.
 */

export type PrefetchResult<T> = { data: T[] | null };

let partnershipsPromise: Promise<PrefetchResult<Record<string, unknown>>> | null = null;
let resourcesPromise: Promise<PrefetchResult<Record<string, unknown>>> | null = null;

export function prefetchPartnerships() {
  if (!partnershipsPromise) {
    partnershipsPromise = Promise.resolve(
      supabase
        .from("partnerships")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })
    ).then((res) => ({ data: res.data as Record<string, unknown>[] | null }));
  }
  return partnershipsPromise;
}

export function prefetchResources() {
  if (!resourcesPromise) {
    resourcesPromise = Promise.resolve(
      supabase
        .from("resources")
        .select("id, title, description, url, file_path, category, approval_required")
        .order("category")
        .order("title")
    ).then((res) => ({ data: res.data as Record<string, unknown>[] | null }));
  }
  return resourcesPromise;
}

/** Fire both prefetches. Safe to call multiple times (memoized). */
export function prefetchPortalData() {
  prefetchPartnerships();
  prefetchResources();
}
