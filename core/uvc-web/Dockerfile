# ============================
# UVC Web Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-web ./core/uvc-web

RUN pnpm install --filter ./core/uvc-web --frozen-lockfile

WORKDIR /service/core/uvc-web

ENV CI=true
ENV WDS_SOCKET_PORT=0
ENV npm_package_name=uvc-web

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
