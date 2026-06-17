

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PROXY_BASE = `${SUPABASE_URL}/functions/v1/storage-proxy`;

// Matches: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
const STORAGE_RE = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;

/**
 * Rewrite a Supabase public-storage URL to go through our storage-proxy edge
 * function. The `/storage/v1/` path pattern is commonly blocked by ad/privacy
 * blockers (ERR_BLOCKED_BY_CLIENT); the `/functions/v1/` path is not.
 *
 * Non-storage URLs (external logos, static /public files) are returned as-is.
 */
export function proxiedStorageUrl(url: string | null | undefined, opts?: { download?: boolean }): string | null {
  if (!url) return null;
  const match = url.match(STORAGE_RE);
  if (!match) return url; // not a Supabase storage URL — leave untouched

  const bucket = match[1];
  // path may contain encoded characters already; decode then re-encode cleanly
  let path = match[2];
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep as-is */
  }
  const params = new URLSearchParams({ bucket, path });
  if (opts?.download) params.set("download", "1");
  return `${PROXY_BASE}?${params.toString()}`;
}

/**
 * Build a proxied URL directly from a bucket + path (e.g. when you only have
 * the storage path, not a full public URL).
 */
export function proxiedBucketUrl(bucket: string, path: string | null | undefined, opts?: { download?: boolean }): string | null {
  if (!path) return null;
  const params = new URLSearchParams({ bucket, path });
  if (opts?.download) params.set("download", "1");
  return `${PROXY_BASE}?${params.toString()}`;
}
