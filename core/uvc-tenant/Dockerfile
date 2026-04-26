# ============================
# UVC Tenant Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-tenant ./core/uvc-tenant

RUN pnpm install --filter ./core/uvc-tenant --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-tenant

RUN pnpm run build

ENV npm_package_name=uvc-tenant

EXPOSE 3002

CMD ["pnpm", "run", "dev"]
