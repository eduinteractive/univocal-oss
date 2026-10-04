# ============================
# UVC Project Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-project ./core/uvc-project

WORKDIR /service/core/uvc-project

RUN pnpm run build

ENV npm_package_name=uvc-project

EXPOSE 3009

CMD ["pnpm", "run", "dev"]

