MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

include $(MAKEFILE_DIR)/make/dev.mk

APPLICATION := ligi

list:
	docker ps -all
	docker images
	docker network ls

#
# all
#