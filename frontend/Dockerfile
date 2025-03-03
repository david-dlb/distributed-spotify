FROM node:21-alpine

WORKDIR /app

COPY ./frontend/package.json .

COPY ./frontend .

RUN npm add vite 
RUN apk add --no-cache python3

COPY ./frontend/startup.sh /usr/local/bin/startup.sh

RUN chmod +x /usr/local/bin/startup.sh

ENTRYPOINT ["/usr/local/bin/startup.sh"]
