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
  name: "list_partnerships",
  title: "List portfolio partnerships",
  description:
    "List Rhino Ventures partnership offers available to portfolio companies. Includes vendor name, category, and offer summary.",
  inputSchema: {
    category: z.string().optional().describe("Optional category filter, e.g. 'Sales & Marketing'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase.from("partnerships").select("*").order("name");
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { partnerships: data ?? [] },
    };
  },
});
