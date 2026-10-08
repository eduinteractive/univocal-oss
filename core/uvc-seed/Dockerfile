# ============================
# UVC Seed Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-seed ./core/uvc-seed

WORKDIR /service/core/uvc-seed

RUN pnpm run build

ENV npm_package_name=uvc-seed

EXPOSE 3012

CMD ["pnpm", "run", "dev"]
