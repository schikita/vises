# Default API image: Patchright npm dep + Chromium binaries + OS deps so
# authenticated HTTP autofill (POST /api/apps/:applicationId/portal-autofill)
# can launch a browser in-container. Do not launch browsers from main.ts.
# Secrets / NODE_ENV are not baked into the image — Compose injects via env_file.

FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN npx patchright install --with-deps chrome

EXPOSE 8100

CMD ["node", "dist/main.js"]
