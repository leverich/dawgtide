#!/usr/bin/env python

import argparse
import json
import re
import sys

import arrow
import numpy as np
import pandas as pd

def load_constituents(f = open('constituents.json')):
    constituents = json.load(f)
    for k,c in constituents.items():
        for y in c['equilibrium']:
            c['equilibrium'][y] = c['equilibrium'][y] * np.pi / 180.
        c['speed'] = c['speed'] / 3600. * np.pi / 180.
    return constituents

def load_stations(f = open('stations.json')):
    stations = json.load(f)
    for k,s in stations.items():
        for _,c in s['constituents'].items():
            c['phase'] = c['phase'] * np.pi / 180.
    return stations

coef_order = [
    "M2", "S2", "N2", "K1", "M4", "O1", "M6", "MK3", "S4", "MN4", "NU2", "S6",
    "MU2", "2N2", "OO1", "LAM2", "S1", "M1", "J1", "MM", "SSA", "SA", "MSF",
    "MF", "RHO", "Q1", "T2", "R2", "2Q1", "P1", "2SM2", "M3", "L2", "2MK3",
    "K2", "M8", "MS4"
]
def make_station_constituents(station, constituents):
    year = str(station['reference_year'])
    cs = []
    for c in coef_order:
        cs.append([
            c,
            station['constituents'][c]['amplitude'],
            station['constituents'][c]['phase'],
            constituents[c]['equilibrium'][year],
            constituents[c]['node_factor'][year],
            constituents[c]['speed'],
        ])
    df = pd.DataFrame(cs, columns=['name', 'amplitude', 'phase', 'equilibrium', 'node_factor', 'speed'])
    return df

def predict(timestamps, station, sc):
    ref = arrow.get(int(station['reference_year']), 1, 1).timestamp

    p = []
    for t in timestamps:
        p.append(
            station['datum'] + (
                sc['amplitude'] *
                sc['node_factor'] *
                np.cos((t - ref) *
                       sc['speed'] -
                       sc['phase'] +
                       sc['equilibrium'])
            ).sum()
        )
    return np.array(p)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--station', '-s', required=True)
    parser.add_argument('--earliest', '-e', required=True)
    parser.add_argument('--latest', '-l', required=True)
    parser.add_argument('--interval', '-i', type=int, default=60)
    args = parser.parse_args()

    earliest = arrow.get(args.earliest).timestamp
    latest = arrow.get(args.latest).timestamp

    constituents = load_constituents()
    stations = load_stations()

    sc = make_station_constituents(stations[args.station], constituents)

    #print json.dumps(constituents, indent=2)
    #print json.dumps(stations, indent=2)

    print >>sys.stderr, sc

    timestamps = np.arange(earliest, latest, args.interval)

    p = predict(timestamps, stations[args.station], sc)

    df = pd.DataFrame()
    df['time'] = timestamps
    df['p'] = p

    df.to_csv(sys.stdout, index=False)
