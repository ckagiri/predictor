#
# dev
#

all-devprod-build: client-devprod-build server-devprod-build nginx-devprod-build

all-devprod-clean: all-devprod-images-clean all-devprod-containers-clean

all-devprod-containers-clean:
	docker rm -f ligi-client-devprod
	docker rm -f ligi-server-devprod
	docker rm -f ligi-nginx-devprod

all-devprod-images-clean:
	docker rmi -f ligi-client-devprod-image
	docker rmi -f ligi-server-devprod-image
	docker rmi -f ligi-nginx-devprod-image

#
# client
#

client-devprod-build:
	docker build -f ./config/client/prod/Dockerfile \
		-t ligi-client-devprod-image:latest \
		--build-arg APP_ENV=devprod \
		.

client-devprod-sh:
	docker run --rm --name ligi-client-devprod \
		-it \
		ligi-client-devprod-image \
		sh

client-devprod-run:
	docker run \
		--rm \
		--name ligi-client-devprod \
		-it \
		-p 8040:8040 \
		ligi-client-devprod-image:latest

#
# server
#

server-devprod-build:
	docker build -f ./config/server/prod/Dockerfile \
	-t ligi-server-devprod-image:latest \
	--build-arg APP_ENV=devprod \
	.

server-devprod-sh:
	docker run --rm --name ligi-server-devprod \
		-it ligi-server-devprod-image \
		sh

server-devprod-run:
	docker run \
		--rm \
		--name ligi-server-devprod \
		-it \
		-p 3110:3110 \
		ligi-server-devprod-image:latest

#
# nginx
#

nginx-devprod-build:
	docker build -f ./config/nginx/Dockerfile \
		-t ligi-nginx-devprod-image:latest \
		.

nginx-devprod-sh:
	docker run --rm --name ligi-nginx-devprod \
		-it \
		ligi-nginx-devprod-image \
		sh

nginx-devprod-run:
	docker run \
		--rm \
		--name ligi-nginx-devprod \
		-it \
		-p 8100:8100 \
		ligi-nginx-devprod-image:latest