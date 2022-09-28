FROM node:14 as node-server
WORKDIR /usr/src
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:14-alpine
RUN mkdir -p /home/node/src/node_modules && chown -R node:node /home/node/src
USER node
WORKDIR /home/node/src
COPY --chown=node:node --from=node-server /usr/src/node_modules ./node_modules
COPY --chown=node:node --from=node-server /usr/src/build .
EXPOSE 7777
CMD [ "node", "app/index.js" ]
