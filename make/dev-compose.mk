#
# compose dev
#
compose-dev-build:
	docker compose -f ./docker-compose-dev.yml \
		-p ligipredictor-dev build

compose-dev-up:
	docker compose -f ./docker-compose-dev.yml -p ligipredictor-dev up

compose-dev-down:
	docker-compose -f ./docker-compose-dev.yml -p ligipredictor-dev down

compose-dev-clean: compose-dev-down
	docker rm -f ligipredictor-dev

	docker rmi -f ligipredictor-client-dev
	docker rmi -f ligipredictor-api-dev
	docker rmi -f ligipredictor-nginx-dev
