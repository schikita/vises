# Portal HTTP module (browserless BLS engine)

Параллельный безбраузерный движок сценария BLS (регистрация → вход → статус →
запись) поверх чистого HTTP: cookie-jar fetch-клиент, JS-инференс капчи
(int8 CNN в процессе, без Python/torch), tempmail.plus-адаптер, ICAO-транслитерация.

## ⚠️ Прокси: evomi вместо proxy6

Прокси для безбраузерного флоу в этой ветке реализован через **evomi**
(residential, sticky-сессии), а **не через proxy6**, который использует старый
patchright-движок:

- Конфигурация: env `PORTAL_HTTP_PROXY_TEMPLATE` в `apps/workflow-worker/.env.dev`
- Формат: `http://USER:PASS_country-BY_fraudScore-0_session-{SESSION}_lifetime-30m@core-residential.evomi.com:1000`
- `{SESSION}` — плейсхолдер: движок держит один exit-IP на сессию и **ротирует
  его автоматически при каждом 429** от портала (см. `PortalHttpService.rotateProxySession`)
- Пустое значение = прямое соединение без прокси

**Для продакшена потребуется одно из двух:**
1. Собственный аккаунт evomi (креды НЕ хранятся в репозитории — только в `.env.dev`,
   который gitignored), либо
2. Модификация `PortalHttpService` на работу с proxy6 (их API выдачи прокси уже
   используется старым движком в `proxy6`-модуле — нужен адаптер формата
   `host:port:user:pass` → undici ProxyAgent).

Причины выбора evomi для стабилизации: per-IP rate-limits портала агрессивны,
резидентные BY-адреса с fraudScore-0 проходят свободно, sticky-сессии позволяют
держать портал-сессию на одном IP (требование портала — ротация IP внутри сессии
ломает авторизацию).

## Состав

- `portal-http.service.ts` — HTTP-клиент: cookie-jar, пейсинг, 429/5xx-бэкофф,
  one-shot режим для сабмитов капч, sticky-прокси с ротацией на 429
- `portal-http-captcha.service.ts` — решатель капчи 3×3: гейт уверенности
  (pick-only, ≥0.9 — «не угадываем»), скользящий бюджет сабмитов 8/час
- `captcha/bls-net.engine.ts` + `captcha-model.json` — int8 CNN (144×72),
  инференс в процессе воркера, self-test на бутстрапе
- `tempmail-plus-http.adapter.ts` — tempmail.plus по HTTP (OTP, welcome-пароль,
  поиск уже пришедших писем для recovery)
- `portal-http-flow.service.ts` — доменная логика: логин-цепочка с inline
  ротацией пароля, регистрация, форма заявителя (~90 полей), booking-walk с
  классификацией баннеров портала (qnKM/S7Ls/ZokWW), отмена зависшего запроса
- `clients/` — пять клиентов за DI-токенами старого движка (полный паритет
  сайд-эффектов: portal_autofill_runs, vault, portalFormEmail)
