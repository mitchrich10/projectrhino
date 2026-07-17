import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient((globalThis as any).Deno.env.get("SUPABASE_URL")!, (globalThis as any).Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_events",
  title: "List portal events",
  description:
    "List Rhino Ventures portal events (upcoming and past). Returns title, date, description, and any linked recording URL.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Maximum number of events to return. Defaults to 25."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false })
      .limit(limit ?? 25);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
