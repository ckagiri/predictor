FROM node:22-slim AS base
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --chown=node:node frontend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

# dev stage
FROM base AS dev
ENV NODE_ENV=development
COPY --chown=node:node config/client/dev/client.env ./.env
RUN npm install
EXPOSE 8040
CMD [ "npm", "run", "dev" ]
