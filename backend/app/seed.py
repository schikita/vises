from datetime import datetime, timedelta, timezone
import secrets

from .auth import hash_password
from .db import Application, SessionLocal, Setting, User, utcnow


def uid(prefix: str) -> str:
    return f"{prefix}-{secrets.token_hex(4)}"


def iso(days_ago: int, hour: int = 11) -> str:
    d = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return d.replace(hour=hour, minute=20, second=0, microsecond=0).isoformat()


def seed(db=None) -> None:
    own = db is None
    db = db or SessionLocal()
    try:
        if db.query(User).count() == 0:
            now = utcnow()
            users = [
                User(
                    id="u-admin",
                    name="Админ Vises",
                    login="admin",
                    email="admin@vises.app",
                    password_hash=hash_password("VisesAdmin1"),
                    invite_password="VisesAdmin1",
                    role="admin",
                    active=True,
                    invite_token="seed-admin",
                    created_at=now,
                    updated_at=now,
                ),
                User(
                    id="u-maria",
                    name="Мария",
                    login="maria@vises.app",
                    email="maria@vises.app",
                    password_hash=hash_password("VisesOffice1"),
                    invite_password="VisesOffice1",
                    role="manager",
                    active=True,
                    invite_token="seed-manager",
                    created_at=now,
                    updated_at=now,
                ),
                User(
                    id="u-anna",
                    name="Анна Волкова",
                    login="anna@example.com",
                    email="anna@example.com",
                    password_hash=hash_password("VisesClient1"),
                    invite_password="VisesClient1",
                    role="client",
                    active=True,
                    invite_token="seed-client",
                    created_at=now,
                    updated_at=now,
                ),
            ]
            db.add_all(users)

        if db.query(Setting).count() == 0:
            db.add(
                Setting(
                    id=1,
                    company="Vises",
                    default_price=180,
                    cities=["Минск", "Москва"],
                    destinations=["Испания", "Кипр", "Франция", "Италия"],
                )
            )

        if db.query(Application).count() == 0:
            db.add_all(_apps())
        db.commit()
    finally:
        if own:
            db.close()


def reset_demo(db) -> None:
    db.query(Application).delete()
    db.query(User).delete()
    db.query(Setting).delete()
    db.commit()
    seed(db)


def _apps() -> list[Application]:
    anna = [
        {
            "id": "p-anna",
            "firstName": "ANNA",
            "lastName": "VOLKOVA",
            "lastNameAtBirth": "VOLKOVA",
            "dob": "1994-05-12",
            "placeOfBirth": "MINSK",
            "countryOfBirth": "Belarus",
            "nationality": "Belarus",
            "gender": "female",
            "maritalStatus": "Single",
            "passportNumber": "MP1234567",
            "passportIssued": "2022-03-01",
            "passportExpires": "2032-03-01",
        }
    ]
    return [
        Application(
            id="a1",
            code="VS-2408",
            client_email="anna@example.com",
            status="booked",
            destination="Испания",
            visa_type="Туристическая",
            submit_country="Беларусь",
            submit_city="Минск",
            travel_date="2026-10-12",
            return_date="2026-10-26",
            comment="Нужна запись ближе к дате поездки, один заявитель.",
            applicants=anna,
            documents=[
                {"id": "d1", "type": "selfie", "name": "selfie.jpg", "uploadedAt": iso(6)},
                {"id": "d2", "type": "passport", "name": "passport.pdf", "uploadedAt": iso(6)},
                {"id": "d3", "type": "visa_photo", "name": "visa-photo.jpg", "uploadedAt": iso(5)},
            ],
            payment_amount=180,
            payment_paid=True,
            payment_note="Оплачено картой",
            visit_date="2026-09-04",
            visit_time="09:40",
            visit_place="Визовый центр, Минск",
            manager="Мария",
            timeline=[
                {"at": iso(8, 10), "text": "Заявка создана", "actor": "Анна Волкова"},
                {"at": iso(6, 12), "text": "Загружены документы", "actor": "Анна Волкова"},
                {"at": iso(4, 15), "text": "Комплект проверен", "actor": "Мария"},
                {"at": iso(1, 9), "text": "Назначен визит 04.09 в 09:40", "actor": "Мария"},
            ],
        ),
        Application(
            id="a2",
            code="VS-2411",
            client_email="pavel@example.com",
            status="review",
            destination="Кипр",
            visa_type="Туристическая",
            submit_country="Беларусь",
            submit_city="Минск",
            travel_date="2026-11-02",
            return_date="2026-11-12",
            comment="",
            applicants=[
                {
                    "id": "p-pavel",
                    "firstName": "PAVEL",
                    "lastName": "IVANOV",
                    "lastNameAtBirth": "IVANOV",
                    "dob": "1988-11-03",
                    "placeOfBirth": "GRODNO",
                    "countryOfBirth": "Belarus",
                    "nationality": "Belarus",
                    "gender": "male",
                    "maritalStatus": "Married",
                    "passportNumber": "MP7654321",
                    "passportIssued": "2021-08-20",
                    "passportExpires": "2031-08-20",
                },
                {
                    "id": "p-olga",
                    "firstName": "OLGA",
                    "lastName": "IVANOVA",
                    "lastNameAtBirth": "PETROVA",
                    "dob": "1990-02-18",
                    "placeOfBirth": "MINSK",
                    "countryOfBirth": "Belarus",
                    "nationality": "Belarus",
                    "gender": "female",
                    "maritalStatus": "Married",
                    "passportNumber": "MP7654322",
                    "passportIssued": "2021-08-20",
                    "passportExpires": "2031-08-20",
                },
            ],
            documents=[
                {"id": "d4", "type": "passport", "name": "passports.pdf", "uploadedAt": iso(2)},
                {"id": "d5", "type": "selfie", "name": "family.jpg", "uploadedAt": iso(2)},
            ],
            payment_amount=320,
            payment_paid=False,
            visit_date="",
            visit_time="",
            visit_place="",
            manager="Мария",
            timeline=[
                {"at": iso(3, 14), "text": "Заявка создана, 2 заявителя", "actor": "Павел Иванов"},
            ],
        ),
        Application(
            id="a5",
            code="VS-2419",
            client_email="anna@example.com",
            status="docs",
            destination="Франция",
            visa_type="Туристическая",
            submit_country="Беларусь",
            submit_city="Минск",
            travel_date="2026-12-01",
            return_date="2026-12-10",
            comment="",
            applicants=anna,
            documents=[],
            payment_amount=180,
            payment_paid=False,
            visit_date="",
            visit_time="",
            visit_place="",
            manager="Мария",
            timeline=[{"at": iso(0, 13), "text": "Черновик создан", "actor": "Анна Волкова"}],
        ),
    ]
