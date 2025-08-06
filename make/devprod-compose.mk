#
# compose devprod
#
compose-devprod-build:
	docker compose -f ./docker-compose-devprod.yml \
		--env-file ./config/devprod.env \
		build

compose-devprod-up:
	docker compose -f ./docker-compose-devprod.yml \
		--env-file ./config/devprod.env \
		up

compose-devprod-up_b:
	docker compose -f ./docker-compose-devprod.yml \
		--env-file ./config/devprod.env \
		up --build

compose-devprod-down:
	docker compose -f ./docker-compose-devprod.yml \
		--env-file ./config/devprod.env \
		down
