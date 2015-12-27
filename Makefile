all: constituents web

.PHONY: constituents web
constituents:
	make -C $@
web:
	make -C $@
