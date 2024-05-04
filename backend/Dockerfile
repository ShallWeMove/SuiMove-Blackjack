FROM node:latest

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

ENV SSL_CERT_FILE ./localhost.crt
ENV SSL_KEY_FILE ./localhost.key

COPY backend .

EXPOSE 443

CMD ["npm", "start"]