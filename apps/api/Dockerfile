# syntax=docker/dockerfile:1.4
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /repo

# ---- Dependencies ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
# pnpm fetch скачивает все зависимости строго по lock-файлу (кешируется)
RUN pnpm fetch

# ---- Build ----
FROM deps AS build
COPY . .
RUN pnpm install --frozen-lockfile --offline
# Сначала собираем все общие пакеты
RUN pnpm turbo run build --filter="./packages/*" --force
# Затем собираем само API
RUN pnpm turbo run build --filter=@vises/api --force

# ---- Deploy (Production) ----
FROM build AS deploy
# Извлекаем только production-зависимости для @vises/api в /out
RUN pnpm --filter @vises/api deploy --prod /out

# ---- Runtime ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Копируем автономный пакет (включает dist и prod node_modules)
COPY --from=deploy /out ./

# Копируем dist для workspace-пакетов, если они не попали в deploy
# (pnpm deploy обычно включает их, но для надёжности можно скопировать)
# COPY --from=build /repo/packages/contracts/dist ./packages/contracts/dist
# ... аналогично для других packages

EXPOSE 8100
CMD ["node", "dist/main.js"]