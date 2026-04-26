# ============================
# UVC Auth Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-auth ./core/uvc-auth

RUN pnpm install --filter ./core/uvc-auth --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-auth

RUN pnpm run build

ENV npm_package_name=uvc-auth

EXPOSE 3001

CMD ["pnpm", "run", "dev"]

