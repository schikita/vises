# Default API image: Patchright npm dep + Chromium binaries + OS deps so
# authenticated HTTP autofill (POST /api/apps/:applicationId/portal-autofill)
# can launch a browser in-container. Do not launch browsers from main.ts.

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

RUN npx patchright install --with-deps chromium

RUN mkdir -p /data/uploads

EXPOSE 8100

CMD ["node", "dist/main.js"]
