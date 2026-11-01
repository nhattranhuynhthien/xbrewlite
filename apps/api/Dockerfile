# ==========================================
# BrewLite API Dockerfile (Multi-stage build)
# Author: TV1 (Tech Lead / DevOps)
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and api package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspace=apps/api

# Copy API source code
COPY apps/api ./apps/api

# Build NestJS production bundle
RUN npm run build:api

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

# Install only production dependencies
RUN npm ci --workspace=apps/api --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/scripts ./apps/api/scripts

USER nestjs

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]
