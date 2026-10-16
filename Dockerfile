# syntax=docker/dockerfile:1
FROM node:24.15.0-bookworm-slim@sha256:4e6b70dd6cbfc88c8157ba19aa3d9f9cce6ba4703576d55459e45efcbc9c5f5d AS toolchain
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global bun@1.4.3
WORKDIR /app
ENV HUSKY=0
ENV ASTRO_TELEMETRY_DISABLED=1

# Used only to establish the unmodified Navfolio reference baseline.
FROM toolchain AS reference
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-fonttools python3-brotli \
    && rm -rf /var/lib/apt/lists/*

FROM toolchain AS dependencies
COPY package.json bun.lock .npmrc ./
RUN bun install --frozen-lockfile

FROM dependencies AS source
COPY . .

FROM source AS development
EXPOSE 4321
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]

FROM source AS build
RUN bun run build

FROM build AS preview
EXPOSE 8787
CMD ["bun", "run", "preview"]

FROM dependencies AS browser-tools
ENV PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
RUN bunx playwright install --with-deps --only-shell chromium

FROM browser-tools AS qa
COPY . .
CMD ["sh", "-c", "bun run test && bun run check && bun run build && bun run test:browser"]
