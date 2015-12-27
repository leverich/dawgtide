all: stations.js constituents.js

stations.js: stations.json json_to_js.sh
	bash json_to_js.sh < $< > $@

constituents.js: constituents.json json_to_js.sh
	bash json_to_js.sh < $< > $@

stations.json: station_*.txt process_stations.py
	python process_stations.py -j station_*.txt > $@

stations.yaml: station_*.txt process_stations.py
	python process_stations.py -j station_*.txt > $@

stations.toml: station_*.txt process_stations.py
	python process_stations.py -j station_*.txt > $@

constituents.json: constituents.txt process_constituents.py
	python process_constituents.py -j < $< > $@

constituents.yaml: constituents.txt process_constituents.py
	python process_constituents.py -y < $< > $@

constituents.toml: constituents.txt process_constituents.py
	python process_constituents.py -t < $< > $@

constituents.txt: tide_fac run_tide_fac.sh
	bash run_tide_fac.sh

tide_fac: tide_fac.f
	gfortran -o $@ $<

clean:
	rm -f tide_fac constituents.* stations.*
