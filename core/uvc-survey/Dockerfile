# ============================
# UVC Survey Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-survey ./core/uvc-survey

RUN pnpm install --filter ./core/uvc-survey --frozen-lockfile --include-workspace-root

WORKDIR /service/core/uvc-survey

RUN pnpm run build

ENV npm_package_name=uvc-survey

EXPOSE 3007

CMD ["pnpm", "run", "dev"]

