# ============================
# UVC Knowledge Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-knowledge ./core/uvc-knowledge

RUN pnpm install --filter ./core/uvc-knowledge --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-knowledge

RUN pnpm run build

ENV npm_package_name=uvc-knowledge

EXPOSE 3006

CMD ["pnpm", "run", "dev"]