# SPA image from monorepo apps/web (DEC-003 / TASK-025).
# Build context: repository root.

FROM node:24-bookworm-slim AS build

WORKDIR /repo

COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN npm ci
RUN npm run build -w @vises/web

FROM nginx:alpine AS runtime

COPY --from=build /repo/apps/web/dist /usr/share/nginx/html/vises/
COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
