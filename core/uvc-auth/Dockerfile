# ============================
# UVC Auth Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-auth ./core/uvc-auth

WORKDIR /service/core/uvc-auth

RUN pnpm run build

ENV npm_package_name=uvc-auth

EXPOSE 3001

CMD ["pnpm", "run", "dev"]

