#
# compose dev
#
compose-dev-build:
	docker compose -f ./docker-compose-dev.yml \
		-p ligi-dev \
		--env-file ./config/server/dev/server.env \
		build

compose-dev-up:
	docker compose -f ./docker-compose-dev.yml \
		-p ligi-dev \
		--env-file ./config/server/dev/server.env \
		up -d

compose-dev-up1:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/server/dev/server.env \
		up -d

compose-dev-down:
	docker compose -f ./docker-compose-dev.yml -p ligi-dev down

compose-dev-build-up:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/server/dev/server.env
			---build -d

compose-dev-clean: compose-dev-down
	docker rm -f ligi-dev

	docker rmi -f ligi-client-dev
	docker rmi -f ligi-api-dev
	docker rmi -f ligi-nginx-dev
