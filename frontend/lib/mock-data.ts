import { MatchResult, Scheme } from "./types";

export const mockSchemes: Scheme[] = [
  {
    id: "pmkisan",
    name: "PM-KISAN",
    level: "central",
    category: "Agriculture",
    benefit: "₹6,000 per year, paid in 3 installments",
    explanation:
      "Because you're a landholding farmer, you qualify for direct income support paid straight into your bank account — no middleman, three installments a year.",
    documents: ["Aadhaar card", "Land ownership records", "Bank passbook", "Passport-size photo"],
    portalUrl: "https://pmkisan.gov.in",
    portalName: "pmkisan.gov.in",
  },
  {
    id: "pmjay",
    name: "Ayushman Bharat – PM-JAY",
    level: "central",
    category: "Healthcare",
    benefit: "₹5,00,000 health cover per family, per year",
    explanation:
      "Your household income falls under the eligibility threshold, which means your family can get cashless treatment up to ₹5 lakh a year at any listed hospital.",
    documents: ["Aadhaar card", "Ration card", "Income certificate"],
    portalUrl: "https://pmjay.gov.in",
    portalName: "pmjay.gov.in",
  },
  {
    id: "ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana",
    level: "central",
    category: "Household",
    benefit: "Free LPG connection + first refill",
    explanation:
      "Women from BPL households qualify for a free gas connection, cutting out the security deposit that usually makes switching from firewood too expensive.",
    documents: ["Aadhaar card", "BPL ration card", "Bank passbook"],
    portalUrl: "https://pmuy.gov.in",
    portalName: "pmuy.gov.in",
  },
  {
    id: "nsap-old-age",
    name: "National Social Assistance Programme (Old Age Pension)",
    level: "central",
    category: "Pension",
    benefit: "₹200–500 monthly pension",
    explanation:
      "You're above the qualifying age and within the income limit, so you're eligible for a monthly pension credited directly to your account.",
    documents: ["Aadhaar card", "Age proof", "BPL certificate", "Bank passbook"],
    portalUrl: "https://nsap.nic.in",
    portalName: "nsap.nic.in",
  },
];

export const mockMatches: MatchResult[] = [
  { scheme: mockSchemes[0], status: "eligible" },
  { scheme: mockSchemes[1], status: "eligible" },
  { scheme: mockSchemes[2], status: "eligible" },
  {
    scheme: mockSchemes[3],
    status: "near-miss",
    gapReason: "You're 3 years below the minimum qualifying age of 60.",
  },
];

export function getSchemeById(id: string): Scheme | undefined {
  return mockSchemes.find((s) => s.id === id);
}
