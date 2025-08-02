#
# dev
#
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
server-dev-sh:
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