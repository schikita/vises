# BLS browserless flow POC (patchright → HTTP)

Безбраузерный аналог сценария BLS (`регистрация → вход → статус → запись`) для
`https://appointment.blsspainbelarus.by` на примере заявки **VS-2538 (Дарья Васильева)**.

Ключевой результат: **у портала нет публичного JSON API, но весь сценарий проходит
чистым HTTP** (ASP.NET Core формы + antiforgery + сессии). Капча 3×3 решается
локальной нейросетью из `E:\my\poc\bls3x3` (бэкенд, без CapMonster). patchright не нужен.

## Состав

| Файл | Назначение |
|---|---|
| `solver_server.py` | HTTP-бэкенд капчи: torch + `model_best.pt` (144×72, 4 conv-блока). `POST /solve {target, tiles:[{id,b64}]}` → `{picks}`. Порт 8788 |
| `flow-register.mjs` | Регистрация: GET RegisterUser → капча (GenerateCaptcha/SubmitCaptcha) → справочники GUID → SendRegisterUserVerificationCode → OTP из tempmail.plus → POST RegisterUser → пароль портала из 2-го письма |
| `flow-login-status-book.mjs` | Вход: LoginSubmit (ResponseData JSON) → капча → LoginCaptchaSubmit → пароль (ResponseData JSON) → смена пароля (если принудительная) → myappointments (статусы) → newappointment (safe-stop, CON-006) |
| `eval-show-hide.js` | Мини-интерпретатор обфусцированного show/hide JS портала (диагностика) |
| `flow-register2.log`, `flow-login5.log` | Живые логи прогонов (evidence) |

Запуск: `python solver_server.py 8788` + `node flow-register.mjs` (или login-флоу).
Зависимости: node (axios из основного node_modules), python + torch + PIL,
модель из `E:\my\poc\bls3x3` (путь прописан в solver_server.py).

## Как устроен портал (найдено при исследовании)

- **Формы**: обычные POST `application/x-www-form-urlencoded` + `__RequestVerificationToken`
  (парный с cookie `.AspNetCore.Antiforgery.akJpGUoJIPA`). Ответы — 302-редиректы
  с зашифрованным состоянием в `?data=...`.
- **Капча 3×3** — один и тот же виджет на регистрации, входе и записи:
  9 видимых тайлов (150×80 GIF в data-URI) + ~45 приманок + ~30 ложных инструкций.
  Видимость определяется статическим CSS-каскадом (`display:none/block !important`
  на случайных классах) + `z-index`; обфусцированный show/hide-JS не может
  переопределить `!important`. Парсер (`parseCaptcha`, порт `extract.js` из POC)
  выбирает верхний тайл на ячейку сетки 3×3 и инструкцию с max z-index.
- **Поля-приманки**: на входе 10 email-полей и 10 password-полей со случайными id;
  реальное определяется статическим CSS (`display: block !important` обёртки
  против `none !important`). Значения полей передаются в hidden `ResponseData`
  как JSON всех 10 полей (механизм `OnSubmitVerify`/`onSubmit` портала).
- **FingerprintJS**: OSS v5 с openfpcdn, только клиентский скрипт, выставляет
  cookie `visitorId=<32 hex>`. Серверной валидации не замечено — безбраузерный
  клиент просто шлёт случайный 32-hex visitorId, всё работает.
- **Rate limits**: агрессивный per-IP 429 (~10-15 запросов за окно ~10 мин);
  отдельный лимит числа сабмитов капчи на аккаунт; редкие 502/504
  («Application Temporarily Unavailable») — флакичность бэкенда, лечится ретраем.
- **tempmail.plus**: публичный HTTP API (`/api/mails?email=<local%40domain>&epin=`),
  браузер не нужен. OTP-письмо «BLS Visa Appointment - User Verification»,
  пароль — «Welcome To BLS Appointment System» (6 цифр).

## Найденные проблемы существующего браузерного флоу

1. **Кириллица отвергается порталом**: «Special characters and numbers are not
   allowed in SurName/First Name/Last Name/Issue Place». CRM-данные VS-2538
   заполнены кириллицей → браузерный REGISTER падает на генерации OTP
   (симптом «#btnReGenerate not ready» в истории run'ов). Нужна транслитерация
   (ICAO): ВАСИЛЬЕВА → VASILYEVA, ДАРЬЯ → DARIA, РУЭП ГОМЕЛЬ → RUEP GOMEL.
2. **Формат дат**: отправляются как `YYYY-MM-DD` (без времени) + скрытые
   `Server*` поля + повторяющиеся `__Invariant`-пары.
3. **Первый вход принудительно требует смену пароля** (`ChangeUserPassword`),
   после смены сессия инвалидируется — нужен повторный вход.

## Что проверено живьём (2026-10-23)

- ✅ REGISTER полностью безбраузерный: капча решена локальной НС (2 попытки),
  OTP получен, `POST /Global/Account/RegisterUser` → `{"success":true}`,
  пароль портала извлечён из письма. Аккаунт `vises944a1f91068c@fexpost.com`.
- ✅ LOGIN: email-шаг (ResponseData JSON), капча входа, пароль-шаг — всё
  размечено и проверено (референсный браузер + безбраузерные прогоны до
  лимита сабмитов капчи; ретрай-логика на 502/504 добавлена).
- ✅ STATUS: myappointments — строка заявителя, статус «Form Filling In-Progress»,
  portalApplicantId из `ManageApplicant('<id>')`.
- ✅ BOOK: newappointment → Data Protection (подтверждение по email-ссылке
  `dataprotectionemailaccept?data=...`) → AppointmentCaptcha → страница
  Visa Type Selection. Safe-stop (CON-006) — сабмит VisaType не выполняется.

## Дополнительно (поздние прогоны)

- ✅ LOGIN стабильно проходит end-to-end безбраузерно (капчи conf=1.0).
- ✅ Форма заявителя (`ManageApplicant?userId=&id=&visaTypeId=&locationId=`):
  ~90 полей, все справочники инлайн (countryData/genderData/…), значения
  GUID резолвятся по имени; сервер валидирует по одному полю
  (`{"success":false,"error":"Please Enter …"}`) — доводится итеративно.
- ✅ Ответ на вопрос «куда попадёт пользователь после fresh-логина»:
  newappointment редиректит на первый НЕзавершённый шаг аккаунта
  (dp-consent и капча записи — аккаунт-уровневые, logincaptcha-блоб — тоже).
- ⚠️ Rate-limit портала: агрессивный на POST `/Global/Appointment/VisaType`
  (окно ~10 мин, ловится и на GET); стратегия — resumable-сессия
  (`bls-session.json`, флаг `--resume`) и пейсинг ≥11 c.
- ✅ VisaType-форма: реальный дропдауны определяются CSS-каскадом обёрток
  (`display:block !important`), значения опций резолвятся из инлайн-справочников
  страницы (Id опций генерируются заново на каждый рендер!), сабмит повторяет
  `OnSubmitVisaType()`: ResponseData = JSON всех полей + Data + DataSource +
  AppointmentFor.

## Финальный статус (прогон flow-book12, 2026-10-23 14:00 UTC)

Полный безбраузерный проход по заявке VS-2538:

```
LOGIN (email+капча+пароль+капча, все conf≥0.999)  → AUTHENTICATED ✅
STATUS → «Form Filling In-Progress»
APPLICANT FORM (ManageApplicant ~90 полей)          → {"success":true,"action":"Edit"}
STATUS                                              → «Ready To Book Appointment» ✅
BOOK: newappointment → AppointmentCaptcha (решена)  → VisaType Selection
VisaType submit (Location=Minsk, Schengen, Normal)  → 302 → SlotSelection ✅
SlotSelection                                       → «Appointment slots are not available»
```

Видеоверификация находится **после выбора слота** (SlotSelection → календарь →
подтверждение → liveness). Сейчас слотов нет ни в одной категории — шаг
недостижим даже для живого пользователя в браузере; при появлении слота
флоу останавливается на нём и передаёт сессию человеку (см. handoff ниже).

## Handoff: браузерная достройка шага человеком

- Всё состояние — cookies (`.AspNetCore.Cookies` httpOnly, `route`,
  antiforgery) + адресуемые URL шагов (`?data=...`).
- HttpOnly нельзя поставить из JS → только инъекция уровнем CDP/Playwright:
  `context.addCookies([{name,value,domain,secure,httpOnly}])` → `page.goto(stepUrl)`.
- В bladebro это уже есть: `state op=set-cookie` по одной + navigate.
- Продакшен-схема: BOOK-шаг доходит до слота/видеоверификации →
  (cookies, stepUrl) в зашифрованный vault → кнопка «Открыть в браузере»
  в staff-UI поднимает headed-браузер с этими куками на нужном шаге —
  человек руками проходит веб-камеру.

## Открытые вопросы / следующим шагом

1. **Слоты**: мониторинг появления слотов (retry newappointment; каждая
   попытка = 1 сабмит капчи записи при лимите ~3/час на аккаунт —
   закладывать в планировщик не чаще раза в 20-30 мин).
2. **Видеоверификация**: изучить провайдера/iframe/API при первом
   доступном слоте; проверить наличие upload-режима вместо live-камеры.
3. **Пароль портала** — передаётся через env `PORTAL_PASSWORD` (в репо не хранится);
   в продакшене класть в bls_secret_vault (purpose PORTAL_PASSWORD).
4. Транслитерация имён — обязательна (портал отвергает кириллицу);
   для продакшена добавить в CRM/маппер (ICAO-таблица).

## Операционные лимиты портала (важно для продакшена)

| Лимит | Наблюдение |
|---|---|
| Сабмиты капчи на аккаунт | **~3 за час** («You have reached the maximum number of allowed captcha submissions»). Полный вход = 2 сабмита + 1 на капчу записи. Ретраи «в лоб» сжигают бюджет. |
| 502/504 флакичность | ~20-30% POST-запросов в плохие часы. **5xx на сабмите капчи обычно = капча потреблена**: повтор того же тела не проходит — рестарт этапа целиком. |
| 429 per-IP | ~10-15 запросов за ~10 мин; особенно агрессивен на `/Global/Appointment/VisaType`. |
| Качество распознавания | Гейт «не гадай»: если ХОТЯ БЫ ОДИН тайл читается с conf < 0.9 — страница перезабирается (GET бесплатный), иначе неверный ответ тратит сабмит. |
| Сессия | Cookie `.AspNetCore.Cookies` переживает отдых >1ч — сохранённая сессия (`--resume`) экономит 2 сабмита капчи на каждом прогоне. |
