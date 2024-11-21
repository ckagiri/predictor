#!/bin/sh

ssh -o StrictHostKeyChecking=no travis@178.62.86.243 << ENDSSH
  docker stop hello-world
  docker rm hello-world
  docker image prune -a -f
  docker run hello-world
ENDSSH