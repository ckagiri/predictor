#
# compose dev
#
compose-dev-build:
	docker compose -f ./docker-compose-dev.yml \
		-p ligi-dev build

compose-dev-up:
	docker compose -f ./docker-compose-dev.yml -p ligi-dev up

compose-dev-down:
	docker compose -f ./docker-compose-dev.yml -p ligi-dev down

compose-dev-clean: compose-dev-down
	docker rm -f ligi-dev

	docker rmi -f ligi-client-dev
	docker rmi -f ligi-api-dev
	docker rmi -f ligi-nginx-dev
