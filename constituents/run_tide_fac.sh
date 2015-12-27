#!/bin/bash

echo "year name node_factor equilibrium speed" > constituents.txt

for YEAR in `seq 2013 2016`; do
    echo -e "365\n0,1,1,$YEAR" | ./tide_fac > /dev/null
    tail -37 tide_fac.out | sed "s/^/$YEAR /" >> constituents.txt
done

column -t < constituents.txt > constituents.txt2
mv -f constituents.txt2 constituents.txt

rm -f tide_fac.out
