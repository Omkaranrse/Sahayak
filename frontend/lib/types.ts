export type LanguageCode = "en" | "hi" | "mr";

export interface Scheme {
  id: string;
  name: string;
  nameLocal?: Partial<Record<LanguageCode, string>>;
  level: "central" | "state";
  state?: string;
  category: string;
  benefit: string;
  explanation: string;
  documents: string[];
  portalUrl: string;
  portalName: string;
  howToApplySteps?: string[];
  youtubeVideoId?: string;
  videoTitle?: string;
}

export interface BridgeRecommendation {
  title: string;
  action: string;
  alternative_scheme?: string | null;
  timeline_months?: number | null;
}

export interface EligibleMatch {
  scheme: Scheme;
  status: "eligible";
  beneficiary?: string;
}

export interface NearMissMatch {
  scheme: Scheme;
  status: "near-miss";
  gapReason: string;
  beneficiary?: string;
  bridgeRecommendation?: BridgeRecommendation | null;
}

export type MatchResult = EligibleMatch | NearMissMatch;

export interface FamilyMember {
  name: string;
  relation: "spouse" | "son" | "daughter" | "parent" | "other";
  age: string;
  gender: "female" | "male" | "other";
  occupation?: string;
  disability: boolean;
}

export interface ProfileData {
  age: string;
  gender: string;
  state: string;
  occupation: string;
  income: string;
  category: string;
  disability: boolean;
  landOwnership: boolean;
  familyMembers?: FamilyMember[];
}

export interface HouseholdSummary {
  total_benefit_value_annual: number;
  total_benefit_value_display: string;
  member_count: number;
  eligible_schemes_count: number;
  breakdown_by_member: Record<string, string[]>;
}

export interface SevaKendra {
  id: string;
  name: string;
  center_type: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  contact_person?: string;
  phone?: string;
  services: string[];
  maps_url: string;
}
