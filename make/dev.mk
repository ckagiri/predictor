#
# dev
#

all-dev-build: client-dev-build server-dev-build nginx-dev-build

all-dev-clean: all-dev-images-clean all-dev-containers-clean

all-dev-containers-clean:
	docker rm -f ligi-client-dev
	docker rm -f ligi-server-dev
	docker rm -f ligi-nginx-dev

all-dev-images-clean:
	docker rmi -f ligi-client-dev-image
	docker rmi -f ligi-server-dev-image
	docker rmi -f ligi-nginx-dev-image

#
# client
#

client-dev-build:
	docker build -f ./config/client/dev/Dockerfile \
		-t ligi-client-dev-image:latest \
		.

client-dev-sh:
	docker run --rm --name ligi-client-dev \
		-it \
		ligi-client-dev-image \
		sh

client-dev-run:
	docker run \
		--rm \
		--name ligi-client-dev \
		-it \
		-p 8040:8040 \
		ligi-client-dev-image:latest

#
# server
#

server-dev-build:
	docker build -f ./config/server/dev/Dockerfile \
	-t ligi-server-dev-image:latest \
	.

server-dev-sh:
	docker run --rm --name ligi-server-dev \
		-it ligi-server-dev-image \
		sh

server-dev-sh1:
	docker run --rm --name ligi-server-dev \
		-it ligi-server-dev-image \
		sh

server-dev-run:
	docker run \
		--rm \
		--name ligi-server-dev \
		-it \
		-p 3110:3110 \
		ligi-server-dev-image:latest

#
# nginx
#

nginx-dev-build:
	docker build -f ./config/nginx/Dockerfile \
		-t ligi-nginx-dev-image:latest \
		.

nginx-dev-sh:
	docker run --rm --name ligi-nginx-dev \
		-it \
		ligi-nginx-dev-image \
		sh

nginx-dev-run:
	docker run \
		--rm \
		--name ligi-nginx-dev \
		-it \
		-p 8100:8100 \
		ligi-nginx-dev-image:latest
