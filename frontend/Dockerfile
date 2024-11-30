FROM node:21-alpine

WORKDIR /app

COPY package*.json /app

COPY . /app

RUN npm add vite 

COPY startup.sh /usr/local/bin/startup.sh

RUN chmod +x /usr/local/bin/startup.sh

ENTRYPOINT ["/usr/local/bin/startup.sh"]
