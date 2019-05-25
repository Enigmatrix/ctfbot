FROM node:latest

RUN mkdir /src
WORKDIR /src

COPY package.json /src
RUN npm install

COPY . /src
CMD ["npm", "start"]
