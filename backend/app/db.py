from __future__ import annotations

import os
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text, create_engine, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://vises:vises@127.0.0.1:5432/vises",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    login: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(200), default="")
    password_hash: Mapped[str] = mapped_column(String(200))
    invite_password: Mapped[str] = mapped_column(String(200), default="")
    role: Mapped[str] = mapped_column(String(20), index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    invite_token: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    code: Mapped[str] = mapped_column(String(40), index=True)
    client_email: Mapped[str] = mapped_column(String(200), index=True)
    status: Mapped[str] = mapped_column(String(20), default="new")
    destination: Mapped[str] = mapped_column(String(80), default="")
    visa_type: Mapped[str] = mapped_column(String(80), default="")
    submit_country: Mapped[str] = mapped_column(String(80), default="")
    submit_city: Mapped[str] = mapped_column(String(80), default="")
    travel_date: Mapped[str] = mapped_column(String(20), default="")
    return_date: Mapped[str] = mapped_column(String(20), default="")
    comment: Mapped[str] = mapped_column(Text, default="")
    applicants: Mapped[list] = mapped_column(JSONB, default=list)
    documents: Mapped[list] = mapped_column(JSONB, default=list)
    payment_amount: Mapped[int] = mapped_column(Integer, default=180)
    payment_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    payment_note: Mapped[str] = mapped_column(String(300), default="")
    visit_date: Mapped[str] = mapped_column(String(20), default="")
    visit_time: Mapped[str] = mapped_column(String(20), default="")
    visit_place: Mapped[str] = mapped_column(String(200), default="")
    manager: Mapped[str] = mapped_column(String(200), default="")
    extras: Mapped[dict] = mapped_column(JSONB, default=dict)
    timeline: Mapped[list] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Setting(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company: Mapped[str] = mapped_column(String(200), default="Vises")
    default_price: Mapped[int] = mapped_column(Integer, default=180)
    cities: Mapped[list] = mapped_column(JSONB, default=list)
    destinations: Mapped[list] = mapped_column(JSONB, default=list)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema() -> None:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE applications ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}'::jsonb"))
