# Client App
FROM node:14-alpine as client-app
LABEL authors="Charles Kagiri"
WORKDIR /usr/src
COPY ./frontend/package*.json ./
RUN npm install --silent
COPY ./frontend .
ARG REACT_APP_API
ENV REACT_APP_API $REACT_APP_API
RUN npm run build

FROM node:14 as node-server
WORKDIR /usr/src
COPY ./backend/package*.json ./
RUN npm install --silent
COPY ./backend .
RUN npm run build

FROM node:14-alpine
RUN mkdir -p /home/node/src/node_modules && chown -R node:node /home/node/src
USER node
WORKDIR /home/node/src
COPY --chown=node:node --from=node-server /usr/src/node_modules ./node_modules
COPY --chown=node:node --from=node-server /usr/src/build .
COPY --chown=node:node  --from=client-app /usr/src/build ./public
EXPOSE 8080
CMD [ "node", "app/index.js" ]
