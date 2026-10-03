import logging
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from sqlalchemy.orm import Session

from contextlib import asynccontextmanager
from . import models, schemas, matching, llm, seva_kendras, tutorials
from .config import settings
from .database import get_db, Base, engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sahayak.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        from .seed import run as seed_run
        seed_run()
        logger.info("Database tables initialized and schemes seeded successfully.")
    except Exception as exc:
        logger.warning("Auto-init database skipped or failed on startup: %s", exc)
    yield


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Sahayak API",
    description="Matches user profiles & households against verified government scheme rules.",
    version="0.2.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = settings.cors_origins if isinstance(settings.cors_origins, list) else [settings.cors_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "Sahayak API",
        "description": "Government Scheme & Household Welfare Maximizer Backend",
        "version": "0.2.0",
        "status": "online",
        "documentation": "/docs",
        "alternative_docs": "/redoc",
        "endpoints": {
            "health": "/api/health",
            "schemes": "/api/schemes",
            "create_profile": "POST /api/profile",
            "matches": "/api/match/{profile_id}",
            "voice_parse": "POST /api/voice/parse-transcript",
            "seva_kendras": "GET /api/seva-kendras",
        },
    }


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        logger.error("Health check failed on database query: %s", e)

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "llm_configured": bool(settings.groq_api_key),
    }


@app.get("/api/schemes", response_model=list[schemas.SchemeOut])
def list_schemes(db: Session = Depends(get_db)):
    schemes = db.query(models.Scheme).all()
    results = []
    for s in schemes:
        tut = tutorials.get_scheme_tutorial(s.scheme_id)
        out = schemas.SchemeOut.model_validate(s)
        out.how_to_apply_steps = tut.get("how_to_apply_steps", [])
        out.youtube_video_id = tut.get("youtube_video_id")
        out.video_title = tut.get("video_title")
        results.append(out)
    return results


@app.post("/api/profile", response_model=schemas.ProfileOut)
@limiter.limit("15/minute")
def create_profile(
    request: Request,
    profile: schemas.ProfileCreate,
    db: Session = Depends(get_db),
):
    profile_data = profile.model_dump()
    db_profile = models.UserProfile(**profile_data)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    logger.info("Created user profile uuid=%s with %d family members", db_profile.uuid, len(profile.family_members))
    return schemas.ProfileOut(id=db_profile.uuid)


@app.post("/api/voice/parse-transcript", response_model=schemas.VoiceParseResponse)
@limiter.limit("20/minute")
async def parse_voice(request: Request, body: schemas.VoiceParseRequest):
    """
    Parses a citizen's spoken voice transcript into a structured demographic intake profile.
    """
    parsed = await llm.parse_voice_transcript(body.transcript, language=body.language)
    return schemas.VoiceParseResponse(**parsed)


@app.get("/api/seva-kendras", response_model=list[schemas.SevaKendra])
def get_seva_kendras(
    query: Optional[str] = None,
    pincode: Optional[str] = None,
    state: Optional[str] = None,
):
    """
    Finds nearest verified Common Service Centres (CSCs) and Maha e-Seva Kendras.
    """
    return seva_kendras.search_seva_kendras(query=query, pincode=pincode, state=state)


@app.get("/api/match/{profile_id}", response_model=schemas.MatchResponse)
async def get_matches(
    profile_id: str,
    language: str = Query(default="en", pattern="^(en|hi|mr)$"),
    db: Session = Depends(get_db),
):
    # Lookup by secure UUID (preventing IDOR) with fallback to legacy integer ID for backwards compatibility
    if len(profile_id) == 36:
        profile = db.query(models.UserProfile).filter(models.UserProfile.uuid == profile_id).first()
    elif profile_id.isdigit():
        profile = db.get(models.UserProfile, int(profile_id))
    else:
        profile = db.query(models.UserProfile).filter(models.UserProfile.uuid == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    schemes = db.query(models.Scheme).all()
    profile_dict = {
        "age": profile.age,
        "gender": profile.gender,
        "occupation": profile.occupation,
        "annual_income": float(profile.annual_income) if profile.annual_income is not None else 0,
        "state": profile.state,
        "category": profile.category,
        "disability_status": profile.disability_status,
        "land_ownership": profile.land_ownership,
    }

    family_members = profile.family_members or []

    # Run Household Welfare Maximizer or Standard Matcher
    if family_members:
        eligible_results, near_miss_results, household_summary_data = matching.match_household(
            profile_dict, family_members, schemes
        )
        household_summary = schemas.HouseholdSummary(**household_summary_data)
    else:
        all_results = matching.match_all_schemes(profile_dict, schemes)
        eligible_results = [r for r in all_results if r["is_eligible"]]
        near_miss_results = [r for r in all_results if not r["is_eligible"]]
        household_summary = None

    # Asynchronous non-blocking Groq LLM explanation batch
    explanations = await llm.explain_batch(profile_dict, eligible_results, language=language)

    eligible_items = [
        schemas.MatchItem(
            scheme=schemas.SchemeOut.model_validate(r["scheme"]),
            is_eligible=True,
            reason=r["reason"],
            explanation=explanation,
            beneficiary=r.get("beneficiary", "You"),
            bridge_recommendation=None,
        )
        for r, explanation in zip(eligible_results, explanations)
    ]

    near_miss_items = [
        schemas.MatchItem(
            scheme=schemas.SchemeOut.model_validate(r["scheme"]),
            is_eligible=False,
            reason=r["reason"],
            explanation=None,
            beneficiary=r.get("beneficiary", "You"),
            bridge_recommendation=r.get("bridge_recommendation"),
        )
        for r in near_miss_results
    ]

    profile_snapshot = {
        "age": profile.age,
        "gender": profile.gender,
        "occupation": profile.occupation,
        "income": float(profile.annual_income) if profile.annual_income else 0,
        "state": profile.state,
        "category": profile.category,
        "disability": profile.disability_status,
        "land_ownership": profile.land_ownership,
        "family_members_count": len(family_members),
    }

    return schemas.MatchResponse(
        profile_id=profile.uuid,
        eligible=eligible_items,
        near_misses=near_miss_items,
        household_summary=household_summary,
        profile_snapshot=profile_snapshot,
    )


@app.get("/api/schemes/{scheme_id}", response_model=schemas.SchemeOut)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(models.Scheme).filter_by(scheme_id=scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    tut = tutorials.get_scheme_tutorial(scheme.scheme_id)
    out = schemas.SchemeOut.model_validate(scheme)
    out.how_to_apply_steps = tut.get("how_to_apply_steps", [])
    out.youtube_video_id = tut.get("youtube_video_id")
    out.video_title = tut.get("video_title")
    return out
