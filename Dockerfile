FROM node:latest

RUN mkdir /src
WORKDIR /src

COPY package*.json /src/
RUN npm install

COPY . /src
EXPOSE 8080
RUN npm run build
CMD ["npm", "start"]
