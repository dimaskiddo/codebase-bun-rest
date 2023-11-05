# Builder Image
# ---------------------------------------------------
FROM oven/bun:alpine as bun-builder

ARG SERVICE_NAME
ENV SERVICE_NAME ${SERVICE_NAME:-"codebase-bun-rest"}

WORKDIR /usr/src/app

COPY . .

RUN bun install \
      --no-cache \
      --frozen-lockfile \
    && bun run build:minify \
    && mv ${SERVICE_NAME} main


# Final Image
# ---------------------------------------------------
FROM dimaskiddo/alpine:base-glibc
MAINTAINER Dimas Restu Hidayanto <dimas.restu@student.upi.edu>

ENV PATH $PATH:/opt/app
WORKDIR /opt/app

COPY --from=bun-builder /usr/src/app/misc ./misc
COPY --from=bun-builder /usr/src/app/.env.example ./.env
COPY --from=bun-builder /usr/src/app/main ./main

RUN apk --no-cache --update upgrade

EXPOSE 3000
CMD ["main"]
