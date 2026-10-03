import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Boolean,
    TIMESTAMP,
    Date,
    ForeignKey,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship

from .database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True)
    scheme_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    level = Column(String(20), nullable=False)  # 'central' | 'state'
    state = Column(String(100), nullable=True)  # NULL if central
    category = Column(String(100))
    eligibility_rules = Column(JSONB, nullable=False, default=dict)
    benefit = Column(Text)
    explanation_template = Column(Text)  # fallback if LLM call fails/unavailable
    documents_required = Column(ARRAY(String), default=list)
    application_portal = Column(String(500))
    portal_name = Column(String(255))
    source_url = Column(String(500))
    last_verified = Column(Date)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()), index=True)
    session_id = Column(String(100), index=True)
    age = Column(Integer)
    gender = Column(String(20))
    occupation = Column(String(100))
    annual_income = Column(Numeric)
    state = Column(String(100))
    category = Column(String(50))  # general/obc/sc/st/ews
    disability_status = Column(Boolean, default=False)
    land_ownership = Column(Boolean, default=False)
    family_members = Column(JSONB, default=list, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    matches = relationship("MatchResult", back_populates="profile", cascade="all, delete-orphan")


class MatchResult(Base):
    __tablename__ = "match_results"
    __table_args__ = (
        UniqueConstraint("profile_id", "scheme_id", name="uq_match_results_profile_scheme"),
    )

    id = Column(Integer, primary_key=True)
    profile_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    is_eligible = Column(Boolean, nullable=False)
    reason = Column(Text)
    explanation = Column(Text)  # LLM-generated plain-language version
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))

    profile = relationship("UserProfile", back_populates="matches")
    scheme = relationship("Scheme")
