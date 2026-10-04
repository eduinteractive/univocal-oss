# ============================
# UVC Tenant Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-tenant ./core/uvc-tenant

WORKDIR /service/core/uvc-tenant

RUN pnpm run build

ENV npm_package_name=uvc-tenant

EXPOSE 3002

CMD ["pnpm", "run", "dev"]
