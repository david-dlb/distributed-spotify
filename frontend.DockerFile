FROM node:21-alpine

WORKDIR /app

RUN npm add -g serve
RUN apk add python3
RUN npm install -g ts-node

COPY ./frontend/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

COPY ./frontend/ts-proxy ./ts-proxy
WORKDIR /app/ts-proxy
RUN npm install

WORKDIR /app

COPY ./frontend/client.py ./ 
COPY ./frontend/dist ./dist



ENTRYPOINT ["/usr/local/bin/startup.sh"]