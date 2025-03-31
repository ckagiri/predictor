FROM node:18-slim AS base
ENV NODE_ENV=development
WORKDIR /app
COPY backend/package*.json .
RUN npm ci && npm cache clean --force

# Install production dependencies only
FROM node:18-slim AS deps
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package*.json .
RUN npm ci --omit=dev && npm cache clean --force

# Compile typescript sources
FROM base AS build
WORKDIR /app
COPY backend .
RUN npm run build

# Combine production only node_modules with compiled javascript files.
FROM node:18-slim AS final
RUN mkdir -p /home/node/src/node_modules && chown -R node:node /home/node/src
USER node
WORKDIR /home/node/src
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build .

ARG APP_ENV=devprod
COPY config/server/${APP_ENV}/server.env ./.env

COPY --chmod=755 config/server/start-command ./start-command

EXPOSE 3110
CMD ["./start-command"]
