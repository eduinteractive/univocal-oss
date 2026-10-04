# ============================
# UVC Statistics Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-statistics ./core/uvc-statistics

WORKDIR /service/core/uvc-statistics

RUN pnpm run build

ENV npm_package_name=uvc-statistics

EXPOSE 3011

CMD ["pnpm", "run", "dev"]

