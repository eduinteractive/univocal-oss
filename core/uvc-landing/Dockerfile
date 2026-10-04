# ============================
# UVC Landing (Next.js)
# ============================

FROM uvc-base as base

WORKDIR /service

COPY ./core/uvc-landing ./core/uvc-landing

WORKDIR /service/core/uvc-landing

ENV CI=true
ENV WDS_SOCKET_PORT=0
ENV npm_package_name=uvc-landing

EXPOSE 3010

CMD [ "pnpm", "run", "dev" ]