export type Direction = "increase" | "decrease" | "neutral" | "unit-change" | "not-established" | "no-change";
export interface Entry {
  id: string; date: string; vendor: string; plans: string[]; title: string; summary: string;
  before?: string | null; after?: string | null; announced?: string | null; vendor_framing?: string | null;
  direction: Direction; status: string; source_url: string; source_name?: string | null; via_url?: string | null; verified: boolean;
}
export interface Plan {
  slug: string; vendor: string; name: string; price: string; limits: [string, string][]; notes: string; source_url: string; checked: string;
}
export interface Vendor { slug: string; name: string; url: string }
