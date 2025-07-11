MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

include $(MAKEFILE_DIR)/make/dev.mk
include $(MAKEFILE_DIR)/make/devprod.mk

include $(MAKEFILE_DIR)/make/dev-compose.mk
include $(MAKEFILE_DIR)/make/devprod-compose.mk
include $(MAKEFILE_DIR)/make/prod-compose.mk

APPLICATION := ligi

list:
	docker ps -all
	docker images
	docker network ls

#
# all
#
all-build: all-dev-build compose-dev-build

all-clean: all-dev-clean compose-dev-clean
	docker system prune -f
	docker ps -all
	docker images
