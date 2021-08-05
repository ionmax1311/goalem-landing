FROM node:lts-alpine as build-stage

WORKDIR /opt/app
COPY . /opt/app

RUN npm install --global gulp-cli

RUN npm install
RUN gulp build


FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /opt/app/dist /usr/share/nginx/html
COPY etc/nginx/default.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

