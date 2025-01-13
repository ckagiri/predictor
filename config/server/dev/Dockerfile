
FROM node:16 as builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --silent
COPY backend ./
RUN npm run build

FROM node:16-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/build .

COPY config/server/dev/server.env ./.env
COPY config/server/start-command ./start-command

EXPOSE 3110
CMD ["./start-command"]
