# ============================
# UVC Chat Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-chat ./core/uvc-chat

RUN pnpm install --filter ./core/uvc-chat --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-chat

RUN pnpm run build

ENV npm_package_name=uvc-chat

EXPOSE 3005

CMD ["pnpm", "run", "dev"]

