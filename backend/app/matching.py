"""
Deterministic scheme-matching logic.

Eligibility is decided ENTIRELY here, from structured rules — never by the LLM.
The LLM (see llm.py) is only used afterwards, to explain a decision this module
already made. This keeps a wrong/hallucinated eligibility call out of the loop
on something with real financial consequences for the user.
"""

from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class MatchOutcome:
    is_eligible: bool
    reason: str
    bridge_action: Optional[dict] = None


# Estimated annual welfare/financial benefit values for household maximization
SCHEME_FINANCIAL_VALUES = {
    "pmjay": 500000.0,            # ₹5 Lakh health insurance cover
    "pmkisan": 6000.0,            # ₹6,000 annual direct benefit transfer
    "nsap-old-age": 6000.0,       # ₹500/month pension
    "sukanya-samriddhi": 15000.0, # High-yield compound growth valuation
    "ujjwala": 3200.0,            # Free LPG connection + stove + first refill
    "pmegp": 75000.0,             # 15-35% government capital subsidy on self-employment
    "disability-pension": 6000.0, # ₹500/month disability support pension
    "mh-shramik-karmakar": 12000.0, # Annual health, scholarship & accidental assistance
}


def compute_bridge_recommendation(scheme_id: str, profile: dict[str, Any], rules: dict[str, Any]) -> Optional[dict]:
    """Generates a deterministic, actionable roadmap for bridging a near-miss."""
    # 1. Land ownership near-miss (e.g. PM-KISAN)
    if rules.get("requires_land_ownership") and not profile.get("land_ownership"):
        return {
            "title": "Collateral-Free Small Business & Enterprise Credit",
            "action": "Since you don't own agricultural land, explore PM-SVANidhi (micro-loans up to ₹50,000 with 7% interest subsidy) or PMEGP self-employment subsidies.",
            "alternative_scheme": "pmegp",
            "timeline_months": None,
        }

    # 2. Gender restricted (e.g. PM Ujjwala Yojana)
    required_gender = rules.get("gender")
    if required_gender and profile.get("gender") != required_gender:
        return {
            "title": "Apply via Adult Female Family Member",
            "action": "This scheme is granted in the name of an adult woman of the household. You can apply on behalf of your spouse, mother, or adult daughter.",
            "alternative_scheme": "ujjwala",
            "timeline_months": None,
        }

    # 3. Age bounds (e.g. Old Age Pension under 60)
    age = profile.get("age") or 0
    age_min = rules.get("age_min")
    if age_min and age < age_min:
        years_left = age_min - age
        return {
            "title": "Enroll in Atal Pension Yojana (APY)",
            "action": f"You are {years_left} years away from the non-contributory Old Age Pension. Enroll in Atal Pension Yojana to guarantee ₹1,000–₹5,000 monthly pension starting at age 60.",
            "alternative_scheme": "nsap-old-age",
            "timeline_months": years_left * 12,
        }

    # 4. Income ceiling exceeded
    income_max = rules.get("income_max_annual")
    income = profile.get("annual_income") or 0
    if income_max and income > income_max:
        gap = income - income_max
        return {
            "title": "Alternative Subsidy Schemes & EWS Verification",
            "action": f"Your declared income is ₹{gap:,.0f} above this targeted low-income ceiling. Check PMEGP for self-employment subsidies (no strict income ceiling) or obtain an official Tehsildar income certificate if your income varies.",
            "alternative_scheme": "pmegp",
            "timeline_months": None,
        }

    # 5. Disability status required
    if rules.get("requires_disability") and not profile.get("disability_status"):
        return {
            "title": "UDID Portal Registration",
            "action": "If you or a dependent have a qualifying medical condition, apply for a Unique Disability ID (UDID) on swavlamban.gov.in to access disability pensions.",
            "alternative_scheme": "disability-pension",
            "timeline_months": None,
        }

    return None


def check_eligibility(profile: dict[str, Any], rules: dict[str, Any], scheme_id: str = "") -> MatchOutcome:
    """Evaluate one scheme's rules against one user profile."""

    # State-restricted schemes
    required_state = rules.get("state")
    if required_state and profile.get("state") != required_state:
        bridge = {
            "title": "Check Central & Domicile Schemes",
            "action": f"This scheme is restricted to {required_state}. You qualify for national Central Government schemes in your current state of {profile.get('state')}.",
            "alternative_scheme": None,
            "timeline_months": None,
        }
        return MatchOutcome(False, f"This scheme is only available to residents of {required_state}.", bridge)

    # Occupation
    allowed_occupations = rules.get("occupation")
    if allowed_occupations and profile.get("occupation") not in allowed_occupations:
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, "Your occupation doesn't match this scheme's requirements.", bridge)

    # Income ceiling
    income_max = rules.get("income_max_annual")
    if income_max is not None:
        income = profile.get("annual_income") or 0
        if income > income_max:
            gap = income - income_max
            bridge = compute_bridge_recommendation(scheme_id, profile, rules)
            return MatchOutcome(False, f"Your income is ₹{gap:,.0f} over the eligible limit.", bridge)

    # Age bounds
    age = profile.get("age")
    age_min = rules.get("age_min")
    age_max = rules.get("age_max")
    if age_min is not None and (age is None or age < age_min):
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, f"You need to be at least {age_min} years old.", bridge)
    if age_max is not None and (age is None or age > age_max):
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, f"This scheme is only for people up to {age_max} years old.", bridge)

    # Social category
    allowed_categories = rules.get("category")
    if allowed_categories and profile.get("category") not in allowed_categories:
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, "Your social category doesn't match this scheme's eligibility.", bridge)

    # Requires land ownership
    if rules.get("requires_land_ownership") and not profile.get("land_ownership"):
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, "This scheme requires land ownership.", bridge)

    # Requires disability status
    if rules.get("requires_disability") and not profile.get("disability_status"):
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, "This scheme is limited to persons with a registered disability.", bridge)

    # Requires gender match (e.g. women-only schemes)
    required_gender = rules.get("gender")
    if required_gender and profile.get("gender") != required_gender:
        bridge = compute_bridge_recommendation(scheme_id, profile, rules)
        return MatchOutcome(False, "This scheme is restricted by gender.", bridge)

    # Simple boolean exclusions, e.g. ["income_tax_payer", "govt_employee_current"]
    for condition in rules.get("excluded_if", []):
        if profile.get(condition) is True:
            return MatchOutcome(False, f"You're excluded from this scheme due to: {condition.replace('_', ' ')}.", None)

    return MatchOutcome(True, "All eligibility criteria matched.", None)


def match_all_schemes(profile: dict[str, Any], schemes: list) -> list[dict]:
    """Run the rules engine against every scheme record for the primary profile."""
    results = []
    for scheme in schemes:
        s_id = getattr(scheme, "scheme_id", getattr(scheme, "id", ""))
        outcome = check_eligibility(profile, scheme.eligibility_rules or {}, scheme_id=str(s_id))
        results.append({
            "scheme": scheme,
            "is_eligible": outcome.is_eligible,
            "reason": outcome.reason,
            "beneficiary": "You (Primary)",
            "bridge_recommendation": outcome.bridge_action,
        })
    return results


def match_household(
    primary_profile: dict[str, Any],
    family_members: list[dict[str, Any]],
    schemes: list
) -> tuple[list[dict], list[dict], dict]:
    """
    Evaluates both primary applicant and all family members to calculate
    the Total Household Welfare Maximizer benefit.
    """
    eligible_matches = []
    near_miss_matches = []
    breakdown_by_member: dict[str, list[str]] = {}
    matched_scheme_keys = set()

    # 1. Primary Applicant Matching
    primary_results = match_all_schemes(primary_profile, schemes)
    for r in primary_results:
        if r["is_eligible"]:
            eligible_matches.append(r)
            matched_scheme_keys.add(r["scheme"].scheme_id)
            breakdown_by_member.setdefault("You", []).append(r["scheme"].name)
        else:
            near_miss_matches.append(r)

    # 2. Family Member Matching
    schemes_by_id = {s.scheme_id: s for s in schemes}

    for member in family_members:
        member_name = member.get("name") or member.get("relation", "Family Member").title()
        member_age = member.get("age", 0)
        member_gender = member.get("gender", "")
        member_disability = member.get("disability_status", False)
        member_relation = member.get("relation", "").lower()

        # Sukanya Samriddhi Yojana (Girl child <= 10 years)
        if member_gender == "female" and member_age <= 10:
            if "sukanya-samriddhi" in schemes_by_id:
                s = schemes_by_id["sukanya-samriddhi"]
                eligible_matches.append({
                    "scheme": s,
                    "is_eligible": True,
                    "reason": f"Eligible for daughter {member_name} (Age {member_age} <= 10).",
                    "beneficiary": f"{member_name} (Daughter)",
                    "bridge_recommendation": None,
                })
                breakdown_by_member.setdefault(member_name, []).append(s.name)

        # NSAP Old Age Pension (Grandparents/Parents >= 60)
        if member_age >= 60 and (primary_profile.get("annual_income") or 0) <= 250000:
            if "nsap-old-age" in schemes_by_id and "nsap-old-age" not in matched_scheme_keys:
                s = schemes_by_id["nsap-old-age"]
                eligible_matches.append({
                    "scheme": s,
                    "is_eligible": True,
                    "reason": f"Eligible for elderly family member {member_name} (Age {member_age} >= 60).",
                    "beneficiary": f"{member_name} ({member_relation.title()})",
                    "bridge_recommendation": None,
                })
                breakdown_by_member.setdefault(member_name, []).append(s.name)

        # National Disability Pension Scheme
        if member_disability:
            if "disability-pension" in schemes_by_id and "disability-pension" not in matched_scheme_keys:
                s = schemes_by_id["disability-pension"]
                eligible_matches.append({
                    "scheme": s,
                    "is_eligible": True,
                    "reason": f"Eligible for family member {member_name} with registered disability status.",
                    "beneficiary": f"{member_name} ({member_relation.title()})",
                    "bridge_recommendation": None,
                })
                breakdown_by_member.setdefault(member_name, []).append(s.name)

        # Pradhan Mantri Ujjwala Yojana (If primary was male, but spouse/mother is female)
        if member_gender == "female" and member_age >= 18 and (primary_profile.get("annual_income") or 0) <= 200000:
            if "ujjwala" in schemes_by_id and "ujjwala" not in matched_scheme_keys:
                s = schemes_by_id["ujjwala"]
                eligible_matches.append({
                    "scheme": s,
                    "is_eligible": True,
                    "reason": f"Granted in the name of adult female member {member_name}.",
                    "beneficiary": f"{member_name} ({member_relation.title()})",
                    "bridge_recommendation": None,
                })
                breakdown_by_member.setdefault(member_name, []).append(s.name)

    # 3. Compute Total Financial Value
    total_value = sum(SCHEME_FINANCIAL_VALUES.get(m["scheme"].scheme_id, 10000.0) for m in eligible_matches)
    total_display = f"₹{total_value:,.0f}" if total_value < 100000 else f"₹{total_value / 100000:.2f} Lakh"

    household_summary = {
        "total_benefit_value_annual": total_value,
        "total_benefit_value_display": total_display,
        "member_count": 1 + len(family_members),
        "eligible_schemes_count": len(eligible_matches),
        "breakdown_by_member": breakdown_by_member,
    }

    return eligible_matches, near_miss_matches, household_summary
