FROM node:lts-alpine as build-stage

WORKDIR /opt/app
COPY . /opt/app

RUN npm install --global gulp-cli

RUN npm install
RUN gulp build

FROM php:8.0.8-apache

RUN apt-get update && apt-get install -y \
    curl \
    g++ \
    git \
    libbz2-dev \
    libfreetype6-dev \
    libicu-dev \
    libjpeg-dev \
    libonig-dev\
    libmcrypt-dev \
    libpng-dev \
    libzip-dev \
    libreadline-dev \
    libxml2-dev \
    vim \
    sudo \
    unzip \
    zip \
 && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
    bcmath \
    bz2 \
    calendar \
    iconv \
    intl \
    mbstring \
    opcache \
    pdo_mysql \
    xml \
    zip


WORKDIR /var/www/html

RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT=/var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY  ./etc/php.ini /usr/local/etc/php/php.ini

USER www-data

WORKDIR /var/www/html
COPY --chown=www-data:www-data --from=build-stage  /opt/app/dist /var/www/html


EXPOSE 80/tcp


COPY --from=build-stage /opt/app/dist /usr/share/nginx/html




