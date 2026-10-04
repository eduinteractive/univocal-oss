# ============================
# UVC Calendar Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-calendar ./core/uvc-calendar

WORKDIR /service/core/uvc-calendar

RUN pnpm run build

ENV npm_package_name=uvc-calendar

EXPOSE 3004

CMD ["pnpm", "run", "dev"]