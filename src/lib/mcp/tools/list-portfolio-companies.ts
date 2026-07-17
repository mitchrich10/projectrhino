import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  const supabaseUrl = (globalThis as any).Deno?.env.get("SUPABASE_URL");
  const anonKey = (globalThis as any).Deno?.env.get("SUPABASE_ANON_KEY");
  const missing = [!supabaseUrl && "SUPABASE_URL", !anonKey && "SUPABASE_ANON_KEY"].filter(Boolean);

  if (missing.length > 0) {
    const message = `Missing ${missing.join(" and ")} environment variable${missing.length > 1 ? "s" : ""} for MCP data tool.`;
    console.error(message);
    throw new Error(message);
  }

  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_portfolio_companies",
  title: "List portfolio companies",
  description:
    "List Rhino Ventures portfolio companies approved for portal access, including their primary email domain and logo key.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("approved_domains")
      .select("company_name, domain, logo_key")
      .order("company_name");
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { companies: data ?? [] },
    };
  },
});
