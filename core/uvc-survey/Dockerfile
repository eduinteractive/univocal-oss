# ============================
# UVC Survey Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-survey ./core/uvc-survey

WORKDIR /service/core/uvc-survey

RUN pnpm run build

ENV npm_package_name=uvc-survey

EXPOSE 3007

CMD ["pnpm", "run", "dev"]

