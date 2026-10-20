# Multi-stage Dockerfile for GÖKKALKAN Backend (Node.js / VDS Runtime)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

# Install all monorepo dependencies
RUN npm ci

# Copy sources
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api

# Compile shared and api packages
RUN npm run build --workspace=@gokkalkan/shared
RUN npm run build --workspace=@gokkalkan/api

# --- Runner stage ---
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/api/dist ./packages/api/dist

# Expose HTTP port
EXPOSE 3001

# Health check using native wget in alpine
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start Node.js server
CMD ["node", "packages/api/dist/index.node.js"]
