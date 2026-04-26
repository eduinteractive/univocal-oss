# ============================
# UVC Landing (Next.js)
# ============================

FROM uvc-base as base

RUN npm install -g pnpm

WORKDIR /service

COPY ./core/uvc-landing ./core/uvc-landing

RUN pnpm install --filter ./core/uvc-landing --frozen-lockfile

WORKDIR /service/core/uvc-landing

ENV CI=true
ENV WDS_SOCKET_PORT=0
ENV npm_package_name=uvc-landing

EXPOSE 3010

CMD [ "pnpm", "run", "dev" ]