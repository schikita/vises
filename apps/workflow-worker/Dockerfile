# Workflow worker image — Patchright Chromium + OS deps (REQ-002 / DEC-005).
# Secrets / NODE_ENV are not baked in — Compose injects via env_file.

FROM node:24-bookworm-slim AS build

WORKDIR /repo

COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/workflow-worker ./apps/workflow-worker

RUN npm ci
RUN npx turbo run build --filter=@vises/workflow-worker

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/workflow-worker/package.json ./apps/workflow-worker/package.json
RUN npm ci --omit=dev -w @vises/workflow-worker && npm cache clean --force

COPY --from=build /repo/apps/workflow-worker/dist ./apps/workflow-worker/dist
COPY --from=build /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /repo/packages/config/dist ./packages/config/dist
COPY --from=build /repo/packages/database/dist ./packages/database/dist
COPY --from=build /repo/packages/domain-bls/dist ./packages/domain-bls/dist

WORKDIR /app/apps/workflow-worker
RUN npx patchright install --with-deps chrome

# Headed Chromium needs an X display (REQ-001: always headed for browser-mail,
# non-prod portal clients). Xvfb provides a virtual one in containers.
# Note: xvfb-run hangs waiting for X readiness in slim images — start Xvfb
# directly and wait for the socket instead.
RUN apt-get update && apt-get install -y --no-install-recommends xvfb \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8101
ENV PORT=8101 DISPLAY=:99
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x720x24 -nolisten tcp & until [ -S /tmp/.X11-unix/X99 ]; do sleep 0.1; done; exec node dist/main.js"]
