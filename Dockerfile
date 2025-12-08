FROM node:24-alpine AS base

WORKDIR /app

FROM base AS builder

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


FROM base AS prod-deps

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --omit=peer --no-fund --no-audit \
  && rm -rf node_modules/typescript node_modules/@types \
  && npm cache clean --force \
  && rm -rf /root/.npm /tmp/* \
  && find node_modules -type f \( -name "*.md" -o -name "*.ts" -o -name "*.d.ts" -o -name "*.map" -o -name "LICENSE" -o -name "LICENSE.*" -o -name "README*" -o -name "CHANGELOG*" \) -delete \
  && find node_modules -type d \( -name "test" -o -name "tests" -o -name "__tests__" -o -name "example" -o -name "examples" -o -name "docs" \) -prune -exec rm -rf '{}' +
FROM alpine:3.23 AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl libstdc++

COPY --from=base /usr/local/bin/node /usr/local/bin/node

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/doc ./doc
COPY package*.json ./

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node dist/main.js"]
