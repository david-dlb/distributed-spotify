FROM node:21-alpine

WORKDIR /app

# RUN npm add vite 
RUN npm add -g serve
RUN apk add python3

COPY ./frontend/package.json .

COPY ./frontend .

COPY ./frontend/startup.sh /usr/local/bin/startup.sh

RUN chmod +x /usr/local/bin/startup.sh

WORKDIR /app/server

RUN npm install

WORKDIR /app

ENTRYPOINT ["/usr/local/bin/startup.sh"]
