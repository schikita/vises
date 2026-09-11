# Default API image (DEC-010 / portal-autofill-api DEC-005): Patchright npm dep may
# be present via package.json, but browser binaries / OS browser deps are NOT
# installed. Autofill is triggered via authenticated HTTP
# (POST /api/apps/:applicationId/portal-autofill) on a host Nest Dev process with
# browsers installed — not from Nest-DI CLI (removed). Invoking autofill inside
# this image without browsers fails clearly. Do not launch browsers from main.ts.

FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV UPLOAD_DIR=/data/uploads

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN mkdir -p /data/uploads

EXPOSE 8100

CMD ["node", "dist/main.js"]
