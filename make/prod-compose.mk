#
# compose prod
#
compose-prod-up:
	docker compose -f ./docker-compose-prod.yml -p pull
	docker compose -f ./docker-compose-prod.yml -p up

compose-prod-down:
	docker compose -f ./docker-compose-prod.yml -p ligi-prod down

compose-prod-clean: compose-prod-down
	docker rm -f ligi-prod

	docker rmi -f ${DOCKER_USERNAME}/ligi:client
	docker rmi -f ${DOCKER_USERNAME}/ligi:api
	docker rmi -f ${DOCKER_USERNAME}/ligi:nginx
