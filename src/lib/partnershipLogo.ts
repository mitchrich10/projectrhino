import { companyLogos } from "@/lib/companyLogos";
import { proxiedBucketUrl, proxiedStorageUrl } from "@/lib/storageProxy";

export interface PartnershipLogoSource {
  logo_path?: string | null;
  logo_url?: string | null;
  logo_key?: string | null;
}

/**
 * Resolve a partnership's logo to an image URL.
 * Priority: self-hosted bucket file > external logo_url > bundled companyLogos[key] > null
 * `logo.clearbit.com` URLs are stripped (the service is discontinued and returns 503).
 *
 * Supabase storage URLs are routed through the storage-proxy edge function so
 * ad/privacy blockers don't block the `/storage/` URL pattern.
 */
export function resolvePartnershipLogo(p: PartnershipLogoSource): string | null {
  if (p.logo_path) {
    return proxiedBucketUrl("partnership-logos", p.logo_path);
  }
  if (p.logo_url && !/logo\.clearbit\.com/i.test(p.logo_url)) {
    return proxiedStorageUrl(p.logo_url);
  }
  if (p.logo_key && companyLogos[p.logo_key]) {
    return companyLogos[p.logo_key];
  }
  return null;
}

// Stable brand-tinted color from a name (HSL hash)
export function badgeColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}
