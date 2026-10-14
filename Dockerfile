FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci

COPY . .

RUN npx prisma generate --schema apps/api/prisma/schema.prisma \
  && npm run build --workspace @ehms/shared \
  && npm run build --workspace @ehms/api \
  && npm run build --workspace @ehms/web \
  && npm prune --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
COPY --from=build /app/packages/shared/package.json packages/shared/package.json
COPY --from=build /app/packages/shared/dist packages/shared/dist

ENV NODE_ENV=production
ENV UPLOAD_DIR=/tmp/ehms-uploads
ENV WEB_DIST_DIR=/app/apps/web/dist

EXPOSE 8080

CMD ["node", "apps/api/dist/server.js"]
