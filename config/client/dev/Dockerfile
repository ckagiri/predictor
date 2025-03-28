FROM node:16-alpine AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --silent

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

COPY frontend ./
COPY config/client/dev/client.env ./.env
COPY config/client/dev/start-command ./start-command

EXPOSE 8040
CMD ["./start-command"]
