FROM node:22-slim AS base
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --chown=node:node frontend/package*.json .
RUN npm ci --omit=dev && npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

# dev stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY --chown=node:node frontend .
EXPOSE 8040
CMD [ "npm", "run", "dev" ]

FROM dev AS builder
ARG VITE_API_URL_ARG=http://localhost:8100/api
ENV VITE_API_URL=$VITE_API_URL_ARG
RUN npm run build

FROM nginx
COPY config/client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
