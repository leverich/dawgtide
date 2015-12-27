all: bower_components data/constituents.js data/stations.js index.min.js detail.min.js

bower_components: bower.json
	bower install
	touch bower_components/.timestamp

.PHONY: clean
clean:
	rm -rf bower_components data/* *.min.js

data/constituents.js: ../../constituents/constituents.js
	cp -v "$<" "$@"
data/stations.js: ../../constituents/stations.js
	cp -v "$<" "$@"

index.min.js: index.js bower_components/.timestamp */*.js
	r.js -o mainConfigFile=config.js name=$(patsubst %.js,%,$<) out=$@

detail.min.js: detail.js bower_components/.timestamp */*.js
	r.js -o mainConfigFile=config.js name=$(patsubst %.js,%,$<) out=$@
