# PRISM-K api — multi-stage build from monorepo root
# Build context MUST be the repository root, e.g.
#   docker build -t prism-k-api -f apps/api/Dockerfile .

# ----------------------------------------------------------------
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

# ----------------------------------------------------------------
# Install all workspace dependencies (with dev deps for the build).
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/data/package.json ./packages/data/
COPY packages/types/package.json ./packages/types/
COPY packages/scoring/package.json ./packages/scoring/
RUN pnpm install --frozen-lockfile

# ----------------------------------------------------------------
# Build the api + its workspace dependencies.
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @prism-k/data --filter @prism-k/types --filter @prism-k/scoring run build \
  && pnpm --filter @prism-k/api exec prisma generate \
  && pnpm --filter @prism-k/api run build

# ----------------------------------------------------------------
# Production image: only the runtime files needed.
FROM node:20-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
ENV NODE_ENV=production
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/data/package.json ./packages/data/
COPY packages/types/package.json ./packages/types/
COPY packages/scoring/package.json ./packages/scoring/
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /repo/packages/data/dist ./packages/data/dist
COPY --from=build /repo/packages/data/data ./packages/data/data
COPY --from=build /repo/packages/types/dist ./packages/types/dist
COPY --from=build /repo/packages/scoring/dist ./packages/scoring/dist
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=build /repo/apps/api/node_modules/@prisma ./apps/api/node_modules/@prisma

EXPOSE 4000
ENV PORT=4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
