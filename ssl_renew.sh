#!/bin/bash

COMPOSE="/usr/bin/compose --ansi never"
DOCKER="/usr/bin/docker"

cd /home/ckagiri/predictor/
$COMPOSE run certbot renew --dry-run && $COMPOSE kill -s SIGHUP ligiwebserver
$DOCKER system prune -af