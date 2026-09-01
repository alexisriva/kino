# syntax=docker/dockerfile:1

# Stage 1: Dependencies & Prisma Generation
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ gcc
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate

# Stage 2: Next.js Standalone Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++ gcc
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache libc6-compat

# Copy node_modules from deps to support Prisma CLI migrations at startup
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy standalone server and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy prisma schema and migrations (and backup template for persistent volume sync)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma ./prisma-template
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy startup entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
