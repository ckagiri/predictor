#
# compose dev
#
compose-dev-build:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/dev.env \
		build

compose-dev-up:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/dev.env \
		up --watch

compose-dev-up_b:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/dev.env \
		up --build --watch

compose-dev-down:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/dev.env \
		down

compose-dev-down_v:
	docker compose -f ./docker-compose-dev.yml \
		--env-file ./config/dev.env \
		down -v
