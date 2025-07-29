#
# compose dev
#
compose-dev-build:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/server/dev/server.env \
		build

compose-dev-up:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/server/dev/server.env \
		up -d

compose-dev-down:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/server/dev/server.env \
		down

compose-dev-down_v:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/server/dev/server.env \
		down -v

compose-dev-clean: compose-dev-down
	docker rm -f ligi-dev

	docker rmi -f ligi-client-dev
	docker rmi -f ligi-api-dev
	docker rmi -f ligi-nginx-dev
