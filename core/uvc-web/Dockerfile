# ============================
# UVC Web Service - Schnell mit uvc-base
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-web ./core/uvc-web

WORKDIR /service/core/uvc-web

ENV CI=true
ENV WDS_SOCKET_PORT=0
ENV npm_package_name=uvc-web

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
