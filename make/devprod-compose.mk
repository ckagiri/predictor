#
# compose dev
#
compose-devprod-build:
	docker compose -f ./docker-compose-devprod.yml \
		-p ligi-devprod build

compose-devprod-up:
	docker compose -f ./docker-compose-devprod.yml -p ligi-devprod up

compose-devprod-down:
	docker compose -f ./docker-compose-devprod.yml -p ligi-devprod down

compose-devprod-clean: compose-devprod-down
	docker rm -f ligi-devprod

	docker rmi -f ligi-client-devprod
	docker rmi -f ligi-api-devprod
	docker rmi -f ligi-nginx-devprod
