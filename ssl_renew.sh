#!/bin/bash
cd /home/ckagiri/predictor/
$COMPOSE run certbot certonly --webroot --webroot-path=/var/www/html --email charleskagiri@gmail.com --agree-tos --no-eff-email --force-renewal -d ligipredictor.com  -d www.ligipredictor.com
$COMPOSE restart