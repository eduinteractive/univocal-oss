# ============================
# UVC Knowledge Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-knowledge ./core/uvc-knowledge

WORKDIR /service/core/uvc-knowledge

RUN pnpm run build

ENV npm_package_name=uvc-knowledge

EXPOSE 3006

CMD ["pnpm", "run", "dev"]