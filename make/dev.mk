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
		-p 3110:3110 \
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

server-dev-run:
	docker run \
		--rm \
		--name ligi-server-dev \
		-it \
		-p 3110:3110 \
		ligi-server-dev-image:latest