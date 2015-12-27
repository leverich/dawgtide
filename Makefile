all: constituents web

.PHONY: constituents web clean
constituents:
	make -C $@
web: constituents
	make -C $@

clean:
	make -C web clean
	make -C constituents clean
