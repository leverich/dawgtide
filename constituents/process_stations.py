#!/usr/bin/env python

import argparse
import sys
import re
import json
import yaml
import toml

def load_station(f):
    station = {}
    lines = [l.strip() for l in f]
    heading = lines.pop(0)
    station_name, year, datum = re.split('\s+', heading)
    station['reference_year'] = year
    station['datum'] = float(datum)
    station['constituents'] = {}
    for l in lines:
        # _, name, amplitude, phase, speed, _ = re.split('\s\s+', l)
        cols = re.split('\s\s+', l)
        name = cols[1]
        amplitude = cols[2]
        phase = cols[3]
        constituent = station['constituents'].setdefault(name, {})
        constituent['amplitude'] = float(amplitude)
        constituent['phase'] = float(phase)
        # constituent['speed'] = float(speed)
    return station_name, station

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--json', '-j', action='store_true')
    parser.add_argument('--yaml', '-y', action='store_true')
    parser.add_argument('--toml', '-t', action='store_true')
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()

    stations = {}

    for f in args.files:
        name, station = load_station(open(f))
        stations[name] = station
    
    if args.json:
        print json.dumps(stations, indent=4, sort_keys=True)
    elif args.yaml:
        print yaml.dump(stations, default_flow_style=False)
    elif args.toml:
        print toml.dumps(stations)
    else:
        raise ValueError("Must specify one of --json, --yaml, --toml.")
