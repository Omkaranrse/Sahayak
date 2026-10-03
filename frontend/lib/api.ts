import { LanguageCode, ProfileData, Scheme, MatchResult, HouseholdSummary, SevaKendra, BridgeRecommendation } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15000;

interface ApiScheme {
  scheme_id: string;
  name: string;
  level: "central" | "state";
  state: string | null;
  category: string | null;
  benefit: string | null;
  documents_required: string[];
  application_portal: string | null;
  portal_name: string | null;
  last_verified: string | null;
}

interface ApiMatchItem {
  scheme: ApiScheme;
  is_eligible: boolean;
  reason: string;
  explanation: string | null;
  beneficiary?: string;
  bridge_recommendation?: BridgeRecommendation | null;
}

interface ApiMatchResponse {
  profile_id: string;
  eligible: ApiMatchItem[];
  near_misses: ApiMatchItem[];
  household_summary?: HouseholdSummary | null;
  profile_snapshot?: Record<string, any> | null;
}

function toScheme(s: ApiScheme): Scheme {
  return {
    id: s.scheme_id,
    name: s.name,
    level: s.level,
    state: s.state ?? undefined,
    category: s.category ?? "",
    benefit: s.benefit ?? "",
    explanation: "",
    documents: s.documents_required ?? [],
    portalUrl: s.application_portal ?? "#",
    portalName: s.portal_name ?? "official portal",
  };
}

function toMatchResult(item: ApiMatchItem): MatchResult {
  const scheme = { ...toScheme(item.scheme), explanation: item.explanation ?? "" };
  if (item.is_eligible) {
    return { scheme, status: "eligible", beneficiary: item.beneficiary };
  }
  return {
    scheme,
    status: "near-miss",
    gapReason: item.reason,
    beneficiary: item.beneficiary,
    bridgeRecommendation: item.bridge_recommendation,
  };
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function submitProfile(profile: ProfileData): Promise<{ profileId: string }> {
  const familyMembersPayload = (profile.familyMembers || []).map((m) => ({
    name: m.name,
    relation: m.relation,
    age: Number(m.age) || 0,
    gender: m.gender,
    occupation: m.occupation || null,
    disability_status: m.disability,
  }));

  const res = await fetchWithTimeout(`${API_URL}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age: Number(profile.age),
      gender: profile.gender,
      occupation: profile.occupation,
      annual_income: Number(profile.income),
      state: profile.state,
      category: profile.category,
      disability_status: profile.disability,
      land_ownership: profile.landOwnership,
      family_members: familyMembersPayload,
    }),
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Too many submissions. Please wait a minute before trying again.");
    }
    throw new Error(`Failed to submit profile (${res.status})`);
  }
  const data = await res.json();
  return { profileId: String(data.id) };
}

export async function getMatches(
  profileId: string,
  language: LanguageCode = "en"
): Promise<{
  eligible: MatchResult[];
  nearMisses: MatchResult[];
  householdSummary?: HouseholdSummary | null;
  profileSnapshot?: Record<string, any> | null;
}> {
  const res = await fetchWithTimeout(`${API_URL}/api/match/${profileId}?language=${language}`);
  if (!res.ok) throw new Error(`Failed to fetch matches (${res.status})`);
  const data: ApiMatchResponse = await res.json();
  return {
    eligible: data.eligible.map(toMatchResult),
    nearMisses: data.near_misses.map(toMatchResult),
    householdSummary: data.household_summary,
    profileSnapshot: data.profile_snapshot,
  };
}

export async function getScheme(schemeId: string): Promise<Scheme> {
  const res = await fetchWithTimeout(`${API_URL}/api/schemes/${schemeId}`);
  if (!res.ok) throw new Error(`Scheme not found (${res.status})`);
  const data: ApiScheme = await res.json();
  return toScheme(data);
}

export async function parseVoiceTranscript(
  transcript: string,
  language: string = "hi"
): Promise<{
  age: number | null;
  gender: string | null;
  occupation: string | null;
  annual_income: number | null;
  state: string | null;
  category: string | null;
  disability_status: boolean;
  land_ownership: boolean;
  extracted_summary: string;
}> {
  const res = await fetchWithTimeout(`${API_URL}/api/voice/parse-transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, language }),
  });
  if (!res.ok) throw new Error(`Voice parsing failed (${res.status})`);
  return res.json();
}

export async function getSevaKendras(query?: string, pincode?: string, state?: string): Promise<SevaKendra[]> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (pincode) params.set("pincode", pincode);
  if (state) params.set("state", state);

  const res = await fetchWithTimeout(`${API_URL}/api/seva-kendras?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch Seva Kendras (${res.status})`);
  return res.json();
}
