"""
Groq-backed explanation layer.

IMPORTANT: this module never decides eligibility — matching.py already did
that deterministically. The LLM's only job is to explain, in plain language,
a decision it's handed. The prompt explicitly forbids inventing criteria, and
every call falls back to a template string if Groq is unavailable or the key
isn't set, so the app still works without an API key.
"""

import json
import logging
from openai import AsyncOpenAI

from .config import settings

logger = logging.getLogger("sahayak.llm")

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI | None:
    global _client
    if not settings.groq_api_key:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1")
    return _client


LANGUAGE_NAMES = {"en": "English", "hi": "Hindi", "mr": "Marathi"}


def _fallback_explanation(scheme_name: str, benefit: str | None, reason: str) -> str:
    benefit_clause = f" You'll receive: {benefit}." if benefit else ""
    return f"You qualify for {scheme_name}. {reason}{benefit_clause}"


async def explain_eligibility(
    profile: dict,
    scheme_name: str,
    benefit: str | None,
    match_reason: str,
    language: str = "en",
) -> str:
    client = _get_client()
    if client is None:
        return _fallback_explanation(scheme_name, benefit, match_reason)

    language_name = LANGUAGE_NAMES.get(language, "English")
    prompt = f"""A person with this profile: {json.dumps(profile, default=str)}

Qualifies for this government scheme: {scheme_name}
Benefit: {benefit or "not specified"}
Reason they matched: {match_reason}

Write 2-3 short, plain sentences in {language_name} explaining why they qualify
and what they'll receive. Use simple, non-bureaucratic language suitable for
someone unfamiliar with government processes. Do not state or imply any
eligibility criteria beyond what's given above. Do not invent scheme details."""

    try:
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
        )
        text = response.choices[0].message.content
        return text.strip() if text else _fallback_explanation(scheme_name, benefit, match_reason)
    except Exception as exc:
        logger.warning("Groq single explanation failed for %s: %s", scheme_name, exc, exc_info=True)
        return _fallback_explanation(scheme_name, benefit, match_reason)


async def explain_batch(profile: dict, matches: list[dict], language: str = "en") -> list[str]:
    """
    Batched asynchronous Groq call for all eligible matches to prevent blocking worker threads.
    """
    client = _get_client()
    if client is None or not matches:
        return [
            _fallback_explanation(m["scheme"].name, m["scheme"].benefit, m["reason"])
            for m in matches
        ]

    language_name = LANGUAGE_NAMES.get(language, "English")
    items = [
        {
            "index": i,
            "scheme_name": m["scheme"].name,
            "benefit": m["scheme"].benefit,
            "match_reason": m["reason"],
        }
        for i, m in enumerate(matches)
    ]

    prompt = f"""A person with this profile: {json.dumps(profile, default=str)}

They matched the following government schemes:
{json.dumps(items, default=str)}

Respond ONLY with a JSON array (no markdown, no preamble) of objects:
[{{"index": 0, "explanation": "..."}}, ...]

Each "explanation" should be 2-3 short plain sentences in {language_name},
explaining why they qualify and what they'll receive. Use simple,
non-bureaucratic language. Do not state or imply eligibility criteria beyond
what's given. Do not invent scheme details."""

    try:
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200 * len(matches),
        )
        raw = (response.choices[0].message.content or "").strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(raw)
        by_index = {item["index"]: item["explanation"] for item in parsed}
        return [
            by_index.get(i, _fallback_explanation(m["scheme"].name, m["scheme"].benefit, m["reason"]))
            for i, m in enumerate(matches)
        ]
    except Exception as exc:
        logger.warning("Groq batch explanation failed: %s; using fallback explanations.", exc, exc_info=True)
        return [
            _fallback_explanation(m["scheme"].name, m["scheme"].benefit, m["reason"])
            for m in matches
        ]


def _rule_based_voice_parse(transcript: str, language: str = "hi") -> dict:
    import re
    t = transcript.lower()
    data: dict = {
        "age": None,
        "gender": None,
        "occupation": None,
        "annual_income": None,
        "state": None,
        "category": None,
        "disability_status": False,
        "land_ownership": False,
        "extracted_summary": "",
    }

    # Age extraction (e.g., 48 साल, 48 years, 48 वर्ष, 48 yr)
    age_match = re.search(r"(\d{1,2})\s*(?:साल|वर्ष|years?|yr|वय)", t)
    if age_match:
        data["age"] = int(age_match.group(1))

    # Income extraction (e.g., 75 हजार, 1.5 लाख, 75000, 2 lakh, 50 thousand)
    lakh_match = re.search(r"([\d\.]+)\s*(?:लाख|lakhs?|lac)", t)
    thousand_match = re.search(r"(\d+)\s*(?:हजार|thousand|k)", t)
    raw_num_match = re.search(r"(?:सालाना|कमाई|उत्पन्न|income)\s*(?:of|है)?\s*₹?\s*(\d{4,7})", t)

    if lakh_match:
        data["annual_income"] = int(float(lakh_match.group(1)) * 100000)
    elif thousand_match:
        data["annual_income"] = int(thousand_match.group(1)) * 1000
    elif raw_num_match:
        data["annual_income"] = int(raw_num_match.group(1))
    elif "75 हजार" in t or "75 thousand" in t:
        data["annual_income"] = 75000

    # Occupation
    if any(k in t for k in ["किसान", "farmer", "शेतकरी", "खेती", "agriculture"]):
        data["occupation"] = "farmer"
    elif any(k in t for k in ["मजदूर", "daily wage", "मजदूरी", "कामगार"]):
        data["occupation"] = "daily_wage"
    elif any(k in t for k in ["दुकान", "vendor", "व्यापारी", "business", "small business"]):
        data["occupation"] = "self_employed"
    elif any(k in t for k in ["नौकरी", "salaried", "service"]):
        data["occupation"] = "salaried"
    elif any(k in t for k in ["विद्यार्थी", "student", "छात्र"]):
        data["occupation"] = "student"
    elif any(k in t for k in ["गृहिणी", "homemaker", "housewife"]):
        data["occupation"] = "homemaker"

    # State
    if any(k in t for k in ["महाराष्ट्र", "satara", "सतारा", "pune", "पुणे", "maharashtra", "mumbai", "नागपूर", "नाशिक"]):
        data["state"] = "Maharashtra"
    elif any(k in t for k in ["उत्तर प्रदेश", "up", "lucknow", "uttar pradesh"]):
        data["state"] = "Uttar Pradesh"
    elif any(k in t for k in ["बिहार", "bihar", "patna"]):
        data["state"] = "Bihar"
    elif any(k in t for k in ["राजस्थान", "rajasthan", "jaipur"]):
        data["state"] = "Rajasthan"
    elif any(k in t for k in ["मध्य प्रदेश", "mp", "madhya pradesh"]):
        data["state"] = "Madhya Pradesh"

    # Land ownership
    if any(k in t for k in ["जमीन", "एकड़", "acre", "land", "शेती", "khet", "गुंठा"]):
        data["land_ownership"] = True

    # Gender
    if any(k in t for k in ["महिला", "स्त्री", "woman", "female", "लड़की"]):
        data["gender"] = "female"
    elif any(k in t for k in ["पुरुष", "man", "male", "लड़का", "हूँ", "farmer"]):
        data["gender"] = "male"

    # Disability
    if any(k in t for k in ["दिव्यांग", "विकलांग", "disability", "handicap", "अपंग"]):
        data["disability_status"] = True

    # Social Category
    if any(k in t for k in ["obc", "ओबीसी"]):
        data["category"] = "obc"
    elif any(k in t for k in ["sc", "अनुसूचित जाति"]):
        data["category"] = "sc"
    elif any(k in t for k in ["st", "अनुसूचित जनजाति"]):
        data["category"] = "st"
    elif any(k in t for k in ["ews"]):
        data["category"] = "ews"

    # Summary
    details = []
    if data["state"]: details.append(data["state"])
    if data["age"]: details.append(f"{data['age']} years")
    if data["occupation"]: details.append(data["occupation"])
    if data["annual_income"]: details.append(f"₹{data['annual_income']:,}")
    if data["land_ownership"]: details.append("landowner")

    data["extracted_summary"] = "Identified: " + (", ".join(details) if details else transcript)
    return data


async def parse_voice_transcript(transcript: str, language: str = "hi") -> dict:
    """
    Extracts structured intake profile JSON from a citizen's spoken input
    in Hindi, Marathi, or English.
    """
    rule_parsed = _rule_based_voice_parse(transcript, language)
    client = _get_client()

    if not client or not transcript.strip():
        return rule_parsed

    prompt = f"""You are an Indian citizen profile parser for Sahayak government scheme assistant.
The citizen spoke this in their local language:
"{transcript}"

Extract structured profile information into this JSON structure ONLY:
{{
  "age": <integer or null>,
  "gender": <"female" | "male" | "other" | null>,
  "occupation": <one of: "farmer", "daily_wage", "self_employed", "salaried", "unemployed", "student", "homemaker", "retired", or null>,
  "annual_income": <annual income number in INR or null. If stated as monthly, multiply by 12. If in Lakhs, multiply by 100000>,
  "state": <standard Indian state name like "Maharashtra", "Uttar Pradesh", "Bihar", or null>,
  "category": <one of: "general", "obc", "sc", "st", "ews", or null>,
  "disability_status": <true if mentioned disability or handicap, else false>,
  "land_ownership": <true if mentioned owning agricultural land/khet/jameen, else false>,
  "extracted_summary": <1 friendly sentence in {LANGUAGE_NAMES.get(language, "Hindi")} summarizing the understood details>
}}

Return ONLY the raw JSON object without markdown fences, preamble, or commentary."""

    try:
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=300,
        )
        raw = (response.choices[0].message.content or "").strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(raw)
        # Merge LLM results with rule-based to ensure no fields are lost
        merged = {**rule_parsed}
        for k, v in parsed.items():
            if v is not None:
                merged[k] = v
        return merged
    except Exception as exc:
        logger.warning("Voice transcript extraction LLM call failed: %s; using deterministic extractor.", exc)
        return rule_parsed

