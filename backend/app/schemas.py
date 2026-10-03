from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ---- Family Member ----

class FamilyMember(BaseModel):
    name: str = ""
    relation: str = "other"  # spouse, son, daughter, parent, other
    age: int = Field(ge=0, le=120)
    gender: str  # female, male, other
    occupation: Optional[str] = None
    disability_status: bool = False


# ---- Profile ----

class ProfileCreate(BaseModel):
    session_id: Optional[str] = None
    age: int = Field(ge=0, le=120)
    gender: str
    occupation: str
    annual_income: float = Field(ge=0)
    state: str
    category: str
    disability_status: bool = False
    land_ownership: bool = False
    family_members: list[FamilyMember] = []


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str


# ---- Scheme ----

class SchemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scheme_id: str
    name: str
    level: str
    state: Optional[str] = None
    category: Optional[str] = None
    benefit: Optional[str] = None
    documents_required: list[str] = []
    application_portal: Optional[str] = None
    portal_name: Optional[str] = None
    last_verified: Optional[date] = None


# ---- Bridge Recommendation for Near Misses ----

class BridgeRecommendation(BaseModel):
    title: str
    action: str
    alternative_scheme: Optional[str] = None
    timeline_months: Optional[int] = None


# ---- Household Summary ----

class HouseholdSummary(BaseModel):
    total_benefit_value_annual: float
    total_benefit_value_display: str
    member_count: int
    eligible_schemes_count: int
    breakdown_by_member: dict[str, list[str]] = {}


# ---- Matching ----

class MatchItem(BaseModel):
    scheme: SchemeOut
    is_eligible: bool
    reason: str
    explanation: Optional[str] = None
    beneficiary: str = "You"
    bridge_recommendation: Optional[BridgeRecommendation] = None


class MatchResponse(BaseModel):
    profile_id: str
    eligible: list[MatchItem]
    near_misses: list[MatchItem]
    household_summary: Optional[HouseholdSummary] = None
    profile_snapshot: Optional[dict] = None


# ---- Voice Parsing ----

class VoiceParseRequest(BaseModel):
    transcript: str
    language: str = "hi"


class VoiceParseResponse(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    state: Optional[str] = None
    category: Optional[str] = None
    disability_status: Optional[bool] = None
    land_ownership: Optional[bool] = None
    extracted_summary: str


# ---- Seva Kendra Locator ----

class SevaKendra(BaseModel):
    id: str
    name: str
    center_type: str  # "CSC (Common Service Centre)", "Maha e-Seva Kendra", "Post Office Seva Kendra"
    address: str
    district: str
    state: str
    pincode: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    services: list[str] = []
    maps_url: str
