all: constituents web

.PHONY: constituents web
constituents:
	make -C $@
web: constituents
	make -C $@
