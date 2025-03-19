MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

include $(MAKEFILE_DIR)/make/dev.mk

include $(MAKEFILE_DIR)/make/dev-compose.mk

APPLICATION := ligi

list:
	docker ps -all
	docker images
	docker network ls

#
# all
#
all-build: all-dev-build

all-clean: all-dev-clean
	docker system prune -f
	docker ps -all
	docker images
