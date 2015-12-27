#!/usr/bin/env bash

# base_url = "http://tidesandcurrents.noaa.gov/noaacurrents/Predictions?r=2&t=24hr&u=1&tz=GMT&i=6min"
# station_id = "SFB1210_13" # id=
# http://tidesandcurrents.noaa.gov/noaacurrents/Predictions?id=SFB1210_13&d=2015-01-01&r=2&t=24hr&u=1&tz=GMT&i=6min
# http://tidesandcurrents.noaa.gov/noaacurrents/DownloadPredictions?fmt=csv&i=6min&d=2015-01-01&r=2&tz=GMT&u=1&id=SFB1210_13&t=24hr&i=6min

for i in `python generate_weeks.py`; do
    if [ ! -f "SFB1210_13_$i.csv" ]; then
        curl "http://tidesandcurrents.noaa.gov/noaacurrents/DownloadPredictions?fmt=csv&id=SFB1210_13&d=$i&r=2&t=24hr&u=1&tz=GMT&i=6min" -o SFB1210_13_$i.csv
    fi
done
