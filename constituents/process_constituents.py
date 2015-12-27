#!/usr/bin/env python

import sys
import re
import yaml
import json
import toml
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--json', '-j', action='store_true')
    parser.add_argument('--yaml', '-y', action='store_true')
    parser.add_argument('--toml', '-t', action='store_true')
    args = parser.parse_args()

    lines = [l.strip() for l in sys.stdin.readlines()]
    header = lines.pop(0)
    fields = re.split('\s+', header)
    records = [dict(zip(fields, re.split('\s+', l))) for l in lines]

    constituents = {}

    for r in records:
        constituent = constituents.setdefault(r['name'], {})
        constituent['speed'] = float(r['speed'])
    
        node_factor = constituent.setdefault('node_factor', {})
        node_factor[r['year']] = float(r['node_factor'])
        equilibrium = constituent.setdefault('equilibrium', {})
        equilibrium[r['year']] = float(r['equilibrium'])

    if args.json:
        print json.dumps(constituents, indent=4, sort_keys=True)
    elif args.yaml:
        print yaml.dump(constituents, default_flow_style=False)
    elif args.toml:
        print toml.dumps(constituents)
    else:
        raise ValueError("Must specify one of --json, --yaml, --toml.")
