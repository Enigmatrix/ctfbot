FROM node:slim

RUN mkdir /src
WORKDIR /src
COPY package*.json /src/
RUN npm install

COPY . /src
RUN npm run build

EXPOSE 8080
ENTRYPOINT npm start
