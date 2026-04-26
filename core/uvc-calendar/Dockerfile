# ============================
# UVC Calendar Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-calendar ./core/uvc-calendar

RUN pnpm install --filter ./core/uvc-calendar --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-calendar

RUN pnpm run build

ENV npm_package_name=uvc-calendar

EXPOSE 3004

CMD ["pnpm", "run", "dev"]