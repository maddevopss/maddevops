FROM php:8.3-fpm-alpine

RUN apk add --no-cache ca-certificates oniguruma \
    && apk add --no-cache --virtual .build-deps \
       $PHPIZE_DEPS oniguruma-dev \
    && docker-php-ext-install mbstring \
    && apk del .build-deps

WORKDIR /var/www/html
