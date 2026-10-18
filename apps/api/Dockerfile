# Slim API image — no Chrome/Patchright browser install (REQ-001 / DEC-005).
# Secrets / NODE_ENV are not baked in — Compose injects via env_file.

FROM node:24-bookworm-slim AS build

WORKDIR /repo

COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm ci
RUN npx turbo run build --filter=@vises/api

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
RUN npm ci --omit=dev -w @vises/api && npm cache clean --force

COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /repo/packages/config/dist ./packages/config/dist
COPY --from=build /repo/packages/database/dist ./packages/database/dist
COPY --from=build /repo/packages/domain-bls/dist ./packages/domain-bls/dist

WORKDIR /app/apps/api
EXPOSE 8100
CMD ["node", "dist/main.js"]
