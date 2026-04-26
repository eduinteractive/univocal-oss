# ============================
# UVC Event Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-event ./core/uvc-event

RUN pnpm install --filter ./core/uvc-event --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-event

RUN pnpm run build

ENV npm_package_name=uvc-event

EXPOSE 3008

CMD ["pnpm", "run", "dev"]
