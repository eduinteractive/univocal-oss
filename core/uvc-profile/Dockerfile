# ============================
# UVC Profile Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-profile ./core/uvc-profile

RUN pnpm install --filter ./core/uvc-profile --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-profile

RUN pnpm run build

ENV npm_package_name=uvc-profile

EXPOSE 3003

CMD ["pnpm", "run", "dev"]

