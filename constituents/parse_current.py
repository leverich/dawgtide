#!/usr/bin/env python

from argparse import ArgumentParser
import arrow
#import os
import pandas as pd
import sys

def load(f):
    df = pd.read_csv(f, sep='\s*,\s*')
    df['time'] = [arrow.get(x).timestamp for x in df['Date_Time (GMT)']]
    dt = [arrow.get(x).datetime for x in df['Date_Time (GMT)']]
    df.index = dt
    df.rename(columns={'Speed (knots)': 'v'}, inplace=True)
    df = df[['time', 'v']]
    return df

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()

    data = pd.DataFrame()

    for f in args.files:
        new_df = load(f)
        data = data.append(new_df)

    data.to_csv(sys.stdout, index=False)
