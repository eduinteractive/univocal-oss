# ============================
# UVC Project Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-project ./core/uvc-project

RUN pnpm install --filter ./core/uvc-project --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-project

RUN pnpm run build

ENV npm_package_name=uvc-project

EXPOSE 3009

CMD ["pnpm", "run", "dev"]

