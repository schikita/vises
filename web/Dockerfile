# Multi-stage SPA image: Node build → nginx alpine runtime (DEC-002).
# Serves /vises/ static + proxies /vises/api/ → api:8100/api/ (DEC-001, DEC-003, DEC-006).
# Secrets are not copied into the image — Compose injects via env_file.
# Vite base uses command === 'build' (/vises/); no custom VITE_* keys.

FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY public ./public
COPY src ./src
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
RUN npm run build

FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html/vises/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
