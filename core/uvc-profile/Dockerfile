# ============================
# UVC Profile Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-profile ./core/uvc-profile

WORKDIR /service/core/uvc-profile

RUN pnpm run build

ENV npm_package_name=uvc-profile

EXPOSE 3003

CMD ["pnpm", "run", "dev"]

