# ============================
# UVC Event Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-event ./core/uvc-event

WORKDIR /service/core/uvc-event

RUN pnpm run build

ENV npm_package_name=uvc-event

EXPOSE 3008

CMD ["pnpm", "run", "dev"]
