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
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm fetch

# ---- Build ----
  FROM deps AS build
  COPY . .
  RUN pnpm install --frozen-lockfile --offline
  # 1. Сначала собираем все общие пакеты (contracts, config и т.д.)
  RUN pnpm turbo run build --filter="./packages/*" --force
  # 2. Затем собираем фронтенд (он будет видеть готовые dist файлы контрактов)
  RUN pnpm turbo run build --filter=@vises/web --force

# ---- Runtime ----
FROM nginx:alpine AS runtime
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html/vises/
COPY apps/web/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]