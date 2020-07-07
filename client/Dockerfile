FROM node:13 as build

WORKDIR /app

ENV BACKEND_HOST "https://where-was-it-backend.exec.town"

COPY package.json yarn.lock index.html ./
COPY src ./src
RUN yarn
RUN yarn dist

FROM nginx
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx/where-was-it.conf /etc/nginx/conf.d/
EXPOSE 80
