FROM node:16-alpine AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --silent
COPY frontend ./
COPY config/client/devprod/client.env ./.env

RUN npm run build

# handle nginx server
FROM nginx
EXPOSE 8040
COPY config/client/prod/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html
# CMD ["nginx", "-g", "daemon off;"]
