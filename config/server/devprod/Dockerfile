FROM node:16-alpine AS base
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package*.json ./
RUN npm install

FROM base AS dev
ENV NODE_ENV=development
RUN npm install

FROM dev AS build
COPY backend ./
RUN npm run build

FROM base AS prod
RUN mkdir -p /home/node/src/node_modules && chown -R node:node /home/node/src
USER node
WORKDIR /home/node/src
COPY --chown=node:node --from=base /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build .

ARG APP_ENV=devprod
COPY config/server/${APP_ENV}/server.env ./.env

COPY --chmod=755 config/server/start-command ./start-command

EXPOSE 3110
CMD ["./start-command"]
