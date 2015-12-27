#!/usr/bin/env python

from argparse import ArgumentParser
import arrow
import json
import math
import numpy as np
import os
import pandas as pd
from sklearn.linear_model import LinearRegression
import sys

coef_order = [
    "M2", "S2", "N2", "K1", "M4", "O1", "M6", "MK3", "S4", "MN4", "NU2", "S6",
    "MU2", "2N2", "OO1", "LAM2", "S1", "M1", "J1", "MM", "SSA", "SA", "MSF",
    "MF", "RHO", "Q1", "T2", "R2", "2Q1", "P1", "2SM2", "M3", "L2", "2MK3",
    "K2", "M8", "MS4"
]

def load(f):
    df = pd.read_csv(f, sep='\s*,\s*')
    df['timestamp'] = [arrow.get(x).timestamp for x in df['Date_Time (GMT)']]
    dt = [arrow.get(x).datetime for x in df['Date_Time (GMT)']]
    df.index = dt
    df.rename(columns={'Speed (knots)': 'value'}, inplace=True)
    df = df[['timestamp', 'value']]
    return df

def load_constituents(f = open('../constituents.json')):
    constituents = json.load(f)
    for k,c in constituents.items():
        for y in c['equilibrium']:
            c['equilibrium'][y] = c['equilibrium'][y] * np.pi / 180.
        c['speed'] = c['speed'] / 3600. * np.pi / 180.
    return constituents

def make_terms(constituents, timestamps, year):
    ref = arrow.get(int(year), 1, 1).timestamp
    year = str(year)
    df = pd.DataFrame()

    for k, c in constituents.items():
        df['A_' + k] = c['node_factor'][year] * np.sin(c['speed'] * (timestamps - ref) + c['equilibrium'][year])
        df['B_' + k] = c['node_factor'][year] * np.cos(c['speed'] * (timestamps - ref) + c['equilibrium'][year])

    return df

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument('--name', '-n', required=True)
    parser.add_argument('--constituents', '-c', required=True)
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()

    data = pd.DataFrame()

    for f in args.files:
        new_df = load(f)
        data = data.append(new_df)

    constituents = load_constituents(open(args.constituents))

    terms = make_terms(constituents, data['timestamp'].values, 2015)

    y = data['value'].values
    X = terms.values

    m = LinearRegression()
    m.fit(X, y)
    print >>sys.stderr, "R^2:", m.score(X, y)

    coef = pd.DataFrame([m.coef_], columns=terms.columns)

    coefs = []
    for i,c in enumerate(coef_order):
        amplitude = np.sqrt(coef['A_' + c][0]**2. + coef['B_' + c][0]**2.)
        phase = ((-math.atan2(coef['B_' + c][0], coef['A_' + c][0]) + np.pi/2.) * 180. / np.pi) % 360.
        coefs.append([i+1, c, amplitude, phase, constituents[c]['speed'] * 180 / np.pi * 3600.])
    coefs_canonical = pd.DataFrame(coefs, columns=['number', 'name', 'amplitude', 'phase', 'speed'])

    p = m.predict(terms.values)
    df = pd.DataFrame({'y': y, 'y_hat': p, 'timestamp': data['timestamp'].values})

    # df.to_csv(open('output_new.csv', 'w'), index=False)
    #print m.intercept_
    #print coefs_canonical

    print '%s  2015  %s' % (args.name, str(m.intercept_))
    for r in coefs_canonical.to_records(index=False):
        print "  ".join([str(x) for x in r])
