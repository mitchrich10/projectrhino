import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPortfolioCompanies from "./tools/list-portfolio-companies";
import listEvents from "./tools/list-events";
import listResources from "./tools/list-resources";
import listPartnerships from "./tools/list-partnerships";
import whoami from "./tools/whoami";

// Construct the OAuth issuer from the project ref (safe at import time —
// Vite inlines this as a literal). Do NOT read SUPABASE_URL: on Lovable Cloud
// that value is a `.lovable.cloud` proxy, and mcp-js rejects any token whose
// configured issuer doesn't match the discovery document's `supabase.co` issuer.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "rhino-portal-mcp",
  title: "Rhino Ventures Partner Portal",
  version: "0.1.0",
  instructions:
    "Tools for the Rhino Ventures Partner Portal. Signed-in portfolio company users and Rhino admins can list portfolio companies, events, resources, and partnership offers. All reads run as the signed-in user under portal access rules.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listPortfolioCompanies, listEvents, listResources, listPartnerships],
});
