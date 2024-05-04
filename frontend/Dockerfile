FROM node:latest as builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build

FROM nginx:alpine

#COPY ../nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/build /usr/share/nginx/html

#COPY ../localhost.crt /etc/nginx/ssl/localhost.crt
#COPY ../localhost.key /etc/nginx/ssl/localhost.key

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
