export interface FounderOnboardingData {
  id?: string;
  batch_id: string;
  logo_path: string | null;
  primary_color: string;
  secondary_color: string;
  brand_guidelines_path: string | null;
  tagline: string | null;
  additional_contacts: Contact[];
  tech_stack: TechStack;
  priorities: string[];
  priorities_other: string | null;
  priorities_notes: string | null;
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
  { key: "cap_table", label: "Cap Table", options: ["Carta", "Pulley"] },
];

export const PRIORITY_OPTIONS = [
  "Hiring key roles",
  "Setting up or improving board reporting",
  "Exploring cloud/AI credits",
  "Financial modelling or forecasting",
  "Fundraising prep (next round)",
  "Legal/compliance structuring",
  "Sales/marketing infrastructure",
];
