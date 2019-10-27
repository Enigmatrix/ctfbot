FROM node:slim

RUN mkdir /src
WORKDIR /src
COPY package*.json /src/
COPY yarn.lock /src/
RUN yarn install

COPY . /src
RUN yarn build

EXPOSE 8080
ENTRYPOINT yarn start
