FROM node:18-slim AS base
WORKDIR /app
COPY frontend/package*.json .
RUN npm ci && npm cache clean --force

FROM node:18-slim AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json .
COPY frontend .

ARG APP_ENV=devprod
COPY config/client/${APP_ENV}/client.env ./.env
# https://stackoverflow.com/questions/70455362/ajv-and-ajv-formats-latest-must-be-broken-in-react
RUN npm install ajv@7.2.3 ajv-errors@2.0.1 ajv-formats@2.1.1 --save
RUN npm run build

# handle nginx server
FROM nginx
COPY config/client/prod/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html
