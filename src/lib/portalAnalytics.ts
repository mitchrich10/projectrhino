import { supabase } from "@/integrations/supabase/client";

export type PortalEventType =
  | "partnership_click"
  | "resource_click"
  | "resource_download"
  | "partnership_download"
  | "onboarding_started"
  | "onboarding_completed";

export const trackPortalEvent = async (
  eventType: PortalEventType,
  itemName: string,
  itemId?: string | null,
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const email = session.user.email ?? "";
    const domain = email.split("@")[1] ?? "";

    // Get company name
    const { data: domainData } = await supabase
      .from("approved_domains")
      .select("company_name")
      .eq("domain", domain)
      .maybeSingle();

    await supabase.from("portal_analytics").insert({
      event_type: eventType,
      item_id: itemId ?? null,
      item_name: itemName,
      user_id: session.user.id,
      user_email: email,
      company_name: domainData?.company_name ?? domain,
    });
  } catch (e) {
    console.error("[portal_analytics] failed to track event", e);
  }
};
