FROM node:22-slim AS base
ENV NODE_ENV=production
EXPOSE 3110
USER node
WORKDIR /app
COPY --chown=node:node backend/package*.json .
COPY --chown=node:node backend/tsconfig*.json .
RUN npm ci --omit=dev && npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

# for dev stage we will bind-mount the code
FROM base AS dev
ENV NODE_ENV=development
COPY --chown=node:node config/dev.env ./.env
RUN npm install
CMD ["dotenvx", "run", "--", "tsx", "src/app/index.ts"]

# seeder
FROM base AS seeder
ENV NODE_ENV=development
COPY --chown=node:node backend/src ./src
COPY --chown=node:node config/server/dev/seeder-healthcheck.js .
CMD ["dotenvx", "run", "--", "tsx", "src/app/tasks/seed/index.ts"]

FROM dev AS build
COPY --chown=node:node backend/src ./src
RUN npm run build

FROM base AS prod
ARG APP_ENV=devprod
COPY --chown=node:node --from=build /app/build ./src
COPY --chown=node:node config/${APP_ENV}.env ./.env
CMD ["dotenvx", "run", "--", "node", "src/app/index.js"]

