from __future__ import annotations

import os
import secrets
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .auth import check_password, hash_password, make_token, read_token
from .db import Application, Base, Setting, User, engine, ensure_schema, get_db, utcnow
from .seed import reset_demo, seed, uid

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/vises-uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Vises API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)
Db = Annotated[Session, Depends(get_db)]


def iso(dt) -> str:
    return dt.isoformat() if dt else ""


def user_out(u: User, with_password: bool = False) -> dict:
    data = {
        "id": u.id,
        "name": u.name,
        "login": u.login,
        "email": u.email,
        "role": u.role,
        "active": u.active,
        "inviteToken": u.invite_token,
        "createdAt": iso(u.created_at),
        "updatedAt": iso(u.updated_at),
        "password": "",
    }
    if with_password:
        data["password"] = u.invite_password
    return data


def extras_out(a: Application) -> dict:
    extras = a.extras or {}
    return {
        "category": extras.get("category") or "",
        "paused": bool(extras.get("paused")),
        "transfer": bool(extras.get("transfer")),
        "submitFrom": extras.get("submitFrom") or "",
        "submitTo": extras.get("submitTo") or "",
    }


def extras_in(body: "AppIn") -> dict:
    return {
        "category": body.category,
        "paused": body.paused,
        "transfer": body.transfer,
        "submitFrom": body.submitFrom,
        "submitTo": body.submitTo,
    }


def app_out(a: Application) -> dict:
    data = {
        "id": a.id,
        "code": a.code,
        "clientEmail": a.client_email,
        "status": a.status,
        "destination": a.destination,
        "visaType": a.visa_type,
        "submitCountry": a.submit_country,
        "submitCity": a.submit_city,
        "travelDate": a.travel_date,
        "returnDate": a.return_date,
        "comment": a.comment or "",
        "applicants": a.applicants or [],
        "documents": a.documents or [],
        "paymentAmount": a.payment_amount,
        "paymentPaid": a.payment_paid,
        "paymentNote": a.payment_note or "",
        "visitDate": a.visit_date or "",
        "visitTime": a.visit_time or "",
        "visitPlace": a.visit_place or "",
        "manager": a.manager or "",
        "timeline": a.timeline or [],
        "createdAt": iso(a.created_at),
        "updatedAt": iso(a.updated_at),
    }
    data.update(extras_out(a))
    return data


def settings_out(s: Setting) -> dict:
    return {
        "company": s.company,
        "defaultPrice": s.default_price,
        "cities": s.cities or [],
        "destinations": s.destinations or [],
    }


def current_user(
    db: Db,
    creds: HTTPAuthorizationCredentials | None = Depends(security),
) -> User:
    if not creds:
        raise HTTPException(401, "Нужен вход")
    payload = read_token(creds.credentials)
    if not payload:
        raise HTTPException(401, "Сессия истекла")
    user = db.get(User, payload["sub"])
    if not user or not user.active:
        raise HTTPException(401, "Нет доступа")
    return user


AuthUser = Annotated[User, Depends(current_user)]


def require_roles(*roles: str):
    def inner(user: AuthUser) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Недостаточно прав")
        return user

    return inner


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    seed()


class LoginIn(BaseModel):
    login: str
    password: str


class DemoIn(BaseModel):
    role: str


class UserIn(BaseModel):
    name: str
    email: str = ""
    login: str = ""
    role: str = "client"


class UserPatch(BaseModel):
    name: str | None = None
    login: str | None = None
    email: str | None = None
    role: str | None = None
    active: bool | None = None


class AppIn(BaseModel):
    id: str | None = None
    code: str | None = None
    clientEmail: str = ""
    status: str = "new"
    destination: str = ""
    visaType: str = ""
    submitCountry: str = ""
    submitCity: str = ""
    travelDate: str = ""
    returnDate: str = ""
    comment: str = ""
    applicants: list = Field(default_factory=list)
    documents: list = Field(default_factory=list)
    paymentAmount: int = 180
    paymentPaid: bool = False
    paymentNote: str = ""
    visitDate: str = ""
    visitTime: str = ""
    visitPlace: str = ""
    manager: str = ""
    category: str = ""
    paused: bool = False
    transfer: bool = False
    submitFrom: str = ""
    submitTo: str = ""
    timeline: list = Field(default_factory=list)


class SettingsIn(BaseModel):
    company: str | None = None
    defaultPrice: int | None = None
    cities: list[str] | None = None
    destinations: list[str] | None = None


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/auth/login")
def login(body: LoginIn, db: Db):
    needle = body.login.strip().lower()
    user = (
        db.query(User)
        .filter(or_(func.lower(User.login) == needle, func.lower(User.email) == needle))
        .first()
    )
    if not user:
        raise HTTPException(400, "Нет такого логина")
    if not user.active:
        raise HTTPException(400, "Доступ отключён")
    if not check_password(body.password, user.password_hash):
        raise HTTPException(400, "Неверный пароль")
    return {"token": make_token(user), "user": user_out(user)}


@app.post("/api/auth/demo")
def demo_login(body: DemoIn, db: Db):
    if body.role not in ("admin", "manager", "client"):
        raise HTTPException(400, "Неизвестная роль")
    user = db.query(User).filter(User.role == body.role, User.active.is_(True)).first()
    if not user:
        raise HTTPException(400, "Нет пользователя с этой ролью")
    return {"token": make_token(user), "user": user_out(user)}


@app.get("/api/auth/me")
def me(user: AuthUser):
    return user_out(user)


@app.get("/api/invite/{token}")
def invite(token: str, db: Db):
    user = db.query(User).filter(User.invite_token == token).first()
    if not user:
        raise HTTPException(404, "Ссылка недействительна")
    return user_out(user, with_password=True)


@app.get("/api/users")
def list_users(db: Db, user: Annotated[User, Depends(require_roles("admin"))]):
    rows = db.query(User).order_by(User.created_at.desc()).all()
    return [user_out(u) for u in rows]


@app.post("/api/users")
def create_user(body: UserIn, db: Db, user: Annotated[User, Depends(require_roles("admin"))]):
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "Укажите имя")
    login = (body.login.strip() or body.email.strip() or uid("user")).lower()
    if db.query(User).filter(User.login == login).first():
        raise HTTPException(400, "Такой логин уже есть")
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"

    def pick(n: int) -> str:
        return "".join(secrets.choice(alphabet) for _ in range(n))

    password = f"{pick(4)}-{pick(4)}-{pick(4)}"
    token = uid("inv")
    now = utcnow()
    row = User(
        id=uid("u"),
        name=name,
        login=login,
        email=(body.email.strip().lower() or login),
        password_hash=hash_password(password),
        invite_password=password,
        role=body.role if body.role in ("admin", "manager", "client") else "client",
        active=True,
        invite_token=token,
        created_at=now,
        updated_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"user": user_out(row, True), "password": password, "token": token}


@app.patch("/api/users/{user_id}")
def patch_user(
    user_id: str,
    body: UserPatch,
    db: Db,
    user: Annotated[User, Depends(require_roles("admin"))],
):
    row = db.get(User, user_id)
    if not row:
        raise HTTPException(404, "Пользователь не найден")
    if body.active is False and row.role == "admin":
        others = (
            db.query(User)
            .filter(User.role == "admin", User.active.is_(True), User.id != user_id)
            .count()
        )
        if others == 0:
            raise HTTPException(400, "Нельзя отключить последнего админа")
    if body.login:
        login = body.login.strip().lower()
        exists = db.query(User).filter(User.login == login, User.id != user_id).first()
        if exists:
            raise HTTPException(400, "Такой логин уже есть")
        row.login = login
    if body.name is not None:
        row.name = body.name
    if body.email is not None:
        row.email = body.email
    if body.role is not None:
        row.role = body.role
    if body.active is not None:
        row.active = body.active
    row.updated_at = utcnow()
    db.commit()
    return user_out(row)


@app.post("/api/users/{user_id}/reissue")
def reissue(
    user_id: str,
    db: Db,
    user: Annotated[User, Depends(require_roles("admin"))],
):
    row = db.get(User, user_id)
    if not row:
        raise HTTPException(404, "Пользователь не найден")
    if not row.active:
        raise HTTPException(400, "Сначала включите доступ")
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"

    def pick(n: int) -> str:
        return "".join(secrets.choice(alphabet) for _ in range(n))

    password = f"{pick(4)}-{pick(4)}-{pick(4)}"
    row.password_hash = hash_password(password)
    row.invite_password = password
    row.invite_token = uid("inv")
    row.updated_at = utcnow()
    db.commit()
    return {"user": user_out(row, True), "password": password, "token": row.invite_token}


@app.delete("/api/users/{user_id}")
def delete_user(
    user_id: str,
    db: Db,
    user: Annotated[User, Depends(require_roles("admin"))],
):
    row = db.get(User, user_id)
    if not row:
        raise HTTPException(404, "Пользователь не найден")
    if row.id == user.id:
        raise HTTPException(400, "Нельзя удалить себя")
    if row.role == "admin":
        others = db.query(User).filter(User.role == "admin", User.id != user_id).count()
        if others == 0:
            raise HTTPException(400, "Нельзя удалить последнего админа")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/apps")
def list_apps(db: Db, user: AuthUser):
    q = db.query(Application).order_by(Application.created_at.desc())
    if user.role == "client":
        q = q.filter(
            (Application.client_email == user.email) | (Application.client_email == user.login)
        )
    return [app_out(a) for a in q.all()]


@app.post("/api/apps")
def upsert_app(body: AppIn, db: Db, user: AuthUser):
    app_id = body.id or uid("app")
    row = db.get(Application, app_id)
    now = utcnow()
    payload = dict(
        code=body.code or f"VS-{secrets.randbelow(500) + 2400}",
        client_email=body.clientEmail or user.email or user.login,
        status=body.status,
        destination=body.destination,
        visa_type=body.visaType,
        submit_country=body.submitCountry,
        submit_city=body.submitCity,
        travel_date=body.travelDate,
        return_date=body.returnDate,
        comment=body.comment,
        applicants=body.applicants,
        documents=body.documents,
        payment_amount=body.paymentAmount,
        payment_paid=body.paymentPaid,
        payment_note=body.paymentNote,
        visit_date=body.visitDate,
        visit_time=body.visitTime,
        visit_place=body.visitPlace,
        manager=body.manager,
        extras=extras_in(body),
        timeline=body.timeline,
        updated_at=now,
    )
    if row:
        if user.role == "client" and row.client_email not in (user.email, user.login):
            raise HTTPException(403, "Чужая заявка")
        for k, v in payload.items():
            setattr(row, k, v)
    else:
        row = Application(id=app_id, created_at=now, **payload)
        db.add(row)
    db.commit()
    db.refresh(row)
    return app_out(row)


@app.delete("/api/apps/{app_id}")
def delete_app(app_id: str, db: Db, user: Annotated[User, Depends(require_roles("admin", "manager"))]):
    row = db.get(Application, app_id)
    if not row:
        raise HTTPException(404, "Нет такой заявки")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.post("/api/apps/{app_id}/docs")
def add_doc(
    app_id: str,
    db: Db,
    user: AuthUser,
    type: str = Form(...),
    file: UploadFile = File(...),
):
    row = db.get(Application, app_id)
    if not row:
        raise HTTPException(404, "Нет такой заявки")
    if user.role == "client" and row.client_email not in (user.email, user.login):
        raise HTTPException(403, "Чужая заявка")
    folder = os.path.join(UPLOAD_DIR, app_id)
    os.makedirs(folder, exist_ok=True)
    doc_id = uid("doc")
    safe = "".join(ch for ch in file.filename or "file" if ch.isalnum() or ch in "._-") or "file"
    path = os.path.join(folder, f"{doc_id}_{safe}")
    content = file.file.read()
    with open(path, "wb") as fh:
        fh.write(content)
    docs = list(row.documents or [])
    docs.append(
        {
            "id": doc_id,
            "type": type,
            "name": file.filename or safe,
            "stored": f"{doc_id}_{safe}",
            "uploadedAt": utcnow().isoformat(),
        }
    )
    row.documents = docs
    timeline = list(row.timeline or [])
    timeline.append({"at": utcnow().isoformat(), "text": f"Файл: {file.filename}", "actor": user.name})
    row.timeline = timeline
    row.updated_at = utcnow()
    db.commit()
    db.refresh(row)
    return app_out(row)


def _can_see_app(user: User, row: Application) -> bool:
    if user.role == "client":
        return row.client_email in (user.email, user.login)
    return True


@app.get("/api/apps/{app_id}/docs/{doc_id}")
def get_doc(app_id: str, doc_id: str, db: Db, user: AuthUser):
    row = db.get(Application, app_id)
    if not row:
        raise HTTPException(404, "Нет такой заявки")
    if not _can_see_app(user, row):
        raise HTTPException(403, "Чужая заявка")
    doc = next((d for d in (row.documents or []) if d.get("id") == doc_id), None)
    if not doc:
        raise HTTPException(404, "Файл не найден")
    stored = doc.get("stored") or f"{doc_id}_{doc.get('name', 'file')}"
    path = os.path.join(UPLOAD_DIR, app_id, stored)
    if not os.path.isfile(path):
        raise HTTPException(404, "Файл не найден")
    return FileResponse(path, filename=doc.get("name") or stored)


@app.get("/api/settings")
def get_settings(db: Db, user: AuthUser):
    row = db.get(Setting, 1)
    if not row:
        raise HTTPException(404, "Нет настроек")
    return settings_out(row)


@app.patch("/api/settings")
def patch_settings(
    body: SettingsIn,
    db: Db,
    user: Annotated[User, Depends(require_roles("admin"))],
):
    row = db.get(Setting, 1)
    if not row:
        raise HTTPException(404, "Нет настроек")
    if body.company is not None:
        row.company = body.company
    if body.defaultPrice is not None:
        row.default_price = body.defaultPrice
    if body.cities is not None:
        row.cities = body.cities
    if body.destinations is not None:
        row.destinations = body.destinations
    db.commit()
    return settings_out(row)


@app.post("/api/settings/reset-demo")
def do_reset(db: Db, user: Annotated[User, Depends(require_roles("admin"))]):
    reset_demo(db)
    return {"ok": True}
