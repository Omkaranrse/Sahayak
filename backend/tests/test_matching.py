import pytest
from types import SimpleNamespace
from app.matching import check_eligibility, match_all_schemes


def test_matching_state_restriction():
    rules = {"state": "Maharashtra"}
    profile_mismatch = {"state": "Bihar"}
    profile_match = {"state": "Maharashtra"}

    res_fail = check_eligibility(profile_mismatch, rules)
    assert not res_fail.is_eligible
    assert "Maharashtra" in res_fail.reason

    res_pass = check_eligibility(profile_match, rules)
    assert res_pass.is_eligible


def test_matching_occupation_restriction():
    rules = {"occupation": ["farmer"]}
    profile_mismatch = {"occupation": "salaried"}
    profile_match = {"occupation": "farmer"}

    assert not check_eligibility(profile_mismatch, rules).is_eligible
    assert check_eligibility(profile_match, rules).is_eligible


def test_matching_income_ceiling():
    rules = {"income_max_annual": 200000}
    profile_over = {"annual_income": 250000}
    profile_under = {"annual_income": 150000}
    profile_exact = {"annual_income": 200000}

    res_over = check_eligibility(profile_over, rules)
    assert not res_over.is_eligible
    assert "50,000" in res_over.reason

    assert check_eligibility(profile_under, rules).is_eligible
    assert check_eligibility(profile_exact, rules).is_eligible


def test_matching_age_bounds():
    rules = {"age_min": 60, "age_max": 80}

    assert not check_eligibility({"age": 55}, rules).is_eligible
    assert not check_eligibility({"age": 85}, rules).is_eligible
    assert check_eligibility({"age": 60}, rules).is_eligible
    assert check_eligibility({"age": 70}, rules).is_eligible
    assert check_eligibility({"age": 80}, rules).is_eligible


def test_matching_social_category():
    rules = {"category": ["sc", "st"]}

    assert not check_eligibility({"category": "general"}, rules).is_eligible
    assert check_eligibility({"category": "sc"}, rules).is_eligible
    assert check_eligibility({"category": "st"}, rules).is_eligible


def test_matching_land_ownership():
    rules = {"requires_land_ownership": True}

    assert not check_eligibility({"land_ownership": False}, rules).is_eligible
    assert check_eligibility({"land_ownership": True}, rules).is_eligible


def test_matching_disability_requirement():
    rules = {"requires_disability": True}

    assert not check_eligibility({"disability_status": False}, rules).is_eligible
    assert check_eligibility({"disability_status": True}, rules).is_eligible


def test_matching_gender_restriction():
    rules = {"gender": "female"}

    assert not check_eligibility({"gender": "male"}, rules).is_eligible
    assert check_eligibility({"gender": "female"}, rules).is_eligible


def test_matching_exclusions():
    rules = {"excluded_if": ["income_tax_payer", "govt_employee"]}

    assert not check_eligibility({"income_tax_payer": True}, rules).is_eligible
    assert not check_eligibility({"govt_employee": True}, rules).is_eligible
    assert check_eligibility({"income_tax_payer": False, "govt_employee": False}, rules).is_eligible


def test_match_all_schemes():
    schemes = [
        SimpleNamespace(scheme_id="scheme-a", name="Scheme A", eligibility_rules={"occupation": ["farmer"]}),
        SimpleNamespace(scheme_id="scheme-b", name="Scheme B", eligibility_rules={"income_max_annual": 100000}),
    ]
    profile = {"occupation": "farmer", "annual_income": 80000}

    results = match_all_schemes(profile, schemes)
    assert len(results) == 2
    assert results[0]["is_eligible"]
    assert results[1]["is_eligible"]


def test_match_household_maximizer():
    from app.matching import match_household

    schemes = [
        SimpleNamespace(scheme_id="pmkisan", name="PM-KISAN", eligibility_rules={"occupation": ["farmer"], "requires_land_ownership": True}),
        SimpleNamespace(scheme_id="sukanya-samriddhi", name="Sukanya Samriddhi Yojana", eligibility_rules={}),
        SimpleNamespace(scheme_id="nsap-old-age", name="Old Age Pension", eligibility_rules={"age_min": 60}),
    ]

    primary_profile = {
        "age": 42,
        "occupation": "farmer",
        "land_ownership": True,
        "annual_income": 90000,
    }

    family_members = [
        {"name": "Aaradhya", "relation": "daughter", "age": 7, "gender": "female"},
        {"name": "Anandi", "relation": "parent", "age": 68, "gender": "female"},
    ]

    eligible, near_misses, summary = match_household(primary_profile, family_members, schemes)
    assert len(eligible) >= 3
    assert summary["member_count"] == 3
    assert summary["total_benefit_value_annual"] > 0
    assert "Aaradhya" in summary["breakdown_by_member"]

