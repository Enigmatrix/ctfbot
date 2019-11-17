FROM node:slim

RUN mkdir -p /src/bot
WORKDIR /src/bot
COPY bot/package*.json /src/bot/
COPY bot/yarn.lock /src/bot/
RUN yarn install

COPY bot /src/bot
RUN yarn build

EXPOSE 8080
ENTRYPOINT yarn start
