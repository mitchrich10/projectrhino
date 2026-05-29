export interface FounderOnboardingData {
  id?: string;
  batch_id: string;
  logo_path: string | null;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  accent_color: string;
  brand_guidelines_path: string | null;
  tagline: string | null;
  additional_contacts: Contact[];
  tech_stack: TechStack;
  priorities: string[];
  priorities_other: string | null;
  priorities_notes: string | null;
  priority_context: Record<string, string>;
  rhino_assistance: string | null;
  feature_company: boolean | null;
  announcing_raise: string | null;
  completed: boolean;
}

export interface Contact {
  name: string;
  email: string;
  role: string;
}

export interface TechStack {
  cloud?: string[];
  payments?: string[];
  accounting?: string[];
  hris?: string[];
  crm?: string[];
  project_management?: string[];
  cap_table?: string[];
}

export interface StepCompletion {
  batch_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  step_number: number;
  completed_at: string;
}

export const STEP_LABELS = [
  "Brand Assets",
  "Key Contacts",
  "Tech Stack",
  "Priorities",
] as const;

export const TECH_CATEGORIES: { key: keyof TechStack; label: string; options: string[] }[] = [
  { key: "cloud", label: "Cloud Provider", options: ["AWS", "GCP", "Azure"] },
  { key: "payments", label: "Payment Processing", options: ["Stripe", "Square"] },
  { key: "accounting", label: "Accounting", options: ["QBO", "Xero", "Sage"] },
  { key: "hris", label: "HRIS / Payroll", options: ["Gusto", "Rippling", "Deel", "ADP"] },
  { key: "crm", label: "CRM", options: ["HubSpot", "Salesforce", "Pipedrive"] },
  { key: "project_management", label: "Project Management", options: ["Notion", "Asana", "Monday", "Jira"] },
  { key: "cap_table", label: "Cap Table", options: ["Carta", "Pulley", "Excel / Spreadsheet"] },
];

export const PRIORITY_OPTIONS: { value: string; contextPrompt: string }[] = [
  { value: "Growth / GTM", contextPrompt: "What are you focused on? (e.g., demand gen, sales motion, expansion)" },
  { value: "Capital introductions", contextPrompt: "What stage and timeline? (e.g., Series A in 12 months)" },
  { value: "Hiring", contextPrompt: "What roles are you looking to fill?" },
  { value: "Legal", contextPrompt: "What's the focus? (e.g., contracts, IP, corporate structuring)" },
  { value: "Customer intros", contextPrompt: "What kind of customers are you looking to meet?" },
  { value: "Finance / accounting", contextPrompt: "What do you need help with? (e.g., bookkeeping, modelling, reporting)" },
  { value: "PR / marketing", contextPrompt: "What are you looking to build or improve? (e.g., brand, press, content)" },
];
