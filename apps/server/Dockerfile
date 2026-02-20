FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl
ENV COREPACK_HOME="/pnpm/corepack"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$COREPACK_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/db/ ./packages/db/
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/

RUN pnpm build:packages && pnpm build:server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ENV COREPACK_HOME="/pnpm/corepack"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$COREPACK_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/db/package.json ./packages/db/package.json
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/server/package.json ./apps/server/package.json
COPY --from=build /app/apps/server/dist ./apps/server/dist

RUN pnpm install --prod --frozen-lockfile

CMD ["node" , "apps/server/dist/server.js"]
