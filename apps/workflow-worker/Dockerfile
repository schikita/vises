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
COPY apps/workflow-worker/package.json ./apps/workflow-worker/package.json
RUN pnpm fetch

# ---- Build ----
FROM deps AS build
COPY . .
RUN pnpm install --frozen-lockfile --offline
# 1. Сначала собираем все общие пакеты
RUN pnpm turbo run build --filter="./packages/*"
# 2. Затем собираем сам воркер (он увидит готовый dist)
RUN pnpm turbo run build --filter=@vises/workflow-worker

# ---- Deploy ----
FROM build AS deploy
RUN pnpm --filter @vises/workflow-worker deploy --prod /out

# ---- Runtime ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8101

# Устанавливаем системные зависимости для Chromium (Patchright)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deploy /out ./

# ИСПОЛЬЗУЕМ ЛОКАЛЬНЫЙ БИНАРНИК ИЗ node_modules ВМЕСТО pnpm exec
RUN ./node_modules/.bin/patchright install chrome

EXPOSE 8101
CMD ["node", "dist/main.js"]