FROM node:slim

RUN mkdir -p /src/bot
RUN mkdir -p /src/webapp
RUN mkdir -p /src/shared

COPY bot/package*.json /src/bot/
COPY bot/yarn.lock /src/bot/
COPY webapp/package*.json /src/webapp/
COPY webapp/yarn.lock /src/webapp/

WORKDIR /src/bot
RUN yarn install
WORKDIR /src/webapp
RUN yarn install

COPY shared/* /src/shared/
COPY webapp /src/webapp
WORKDIR /src/webapp
RUN yarn build
COPY bot /src/bot
WORKDIR /src/bot
RUN yarn build

EXPOSE 8080
ENTRYPOINT yarn start
