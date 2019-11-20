FROM node:slim

RUN mkdir -p /src/bot
RUN mkdir -p /src/webapp

COPY bot/package*.json /src/bot/
COPY bot/yarn.lock /src/bot/
COPY webapp/package*.json /src/webapp/
COPY webapp/yarn.lock /src/webapp/

WORKDIR /src/bot
RUN yarn install
WORKDIR /src/webapp
RUN yarn install

COPY webapp /src/webapp
COPY bot /src/bot

WORKDIR /src/webapp
RUN yarn build
WORKDIR /src/bot
RUN yarn build

EXPOSE 8080
ENTRYPOINT yarn start
