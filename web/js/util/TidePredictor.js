define([
    "underscore",
    "data/constituents",
    "data/stations"
], function(
    _,
    constituents,
    stations
) {
    return function(options) {
        // PUBLIC INTERFACE

        this.predict = function(timestamp) {
            var reference = new Date(Date.UTC(this.station.reference_year, 0, 1)).getTime()/1000;
            return this._predict(timestamp, reference);
        };

        this.predictEach = function(timestamps) {
            var reference = new Date(Date.UTC(this.station.reference_year, 0, 1)).getTime()/1000;
            return _.map(timestamps, function(a) { return this._predict(a, reference); }, this);
        }

        // [ { time: .., state: .. }, .. ]
        this._spans = function(records) {
            var spans = [{ state: records[0].state, start: records[0].time }];
            var current_state = records[0].state;

            var now = new Date().getTime()/1000;
            var lt_now_prev = records[0].time < now;

            var prev_dir = records[0].level <= records[1].level;
            var prev_level = records[0].level;
            
            _.each(records, function(x) {
                var lt_now = x.time < now;
                if (lt_now_prev && !lt_now) {
                    spans[spans.length - 1].now = { level: x.level, time: x.time };
                }
                lt_now_prev = lt_now;

                var this_dir = prev_level <= x.level;
                if (prev_dir != this_dir) {
                    spans[spans.length - 1].max = { level: x.level, time: x.time };
                }
                prev_dir = this_dir;
                prev_level = x.level;
                
                if (x.state != current_state) {
                    spans[spans.length - 1].end = x.time;
                    spans.push({ state: x.state, start: x.time });
                    current_state = x.state;
                }
            });
            spans[spans.length - 1].end = records[records.length - 1].time;

            return spans;
        }

        this.states = function(start, stop, limit) {
            var limit = limit || 0.;

            var timestamps = _.range(start, stop + 60, 60.);
            var predictions = this.predictEach(timestamps);

            var records = _.map(_.zip(timestamps, predictions), function(x) {
                return { time: x[0], state: x[1] >= limit, level: x[1] };
            });

            return records;
        };

        this.spans = function(start, stop, limit) {
            return this._spans(this.states(start, stop, limit));
        }

        /*
        this.spans = function(start, stop, limit) {
            var limit = limit || 0.;
            var timestamps = _.range(start, ((stop/60)|0+1)*60, 60.);
            var predictions = this.predictEach(timestamps);

            var records = _.map(_.zip(timestamps, predictions), function(x) {
                return { time: x[0], level: x[1] };
            });

            var pairs = _.zip(records.slice(0,-1), records.slice(1));
            var crossings = _.filter(pairs, function(x) {
                return (x[0].level <  limit && x[1].level >= limit ||
                        x[0].level >= limit && x[1].level <  limit);
            });
            crossings.unshift([records[0], records[0]]);
            crossings.push([records.slice(-1)[0], records.slice(-1)[0]]);

            var crossing_pairs = _.zip(crossings.slice(0,-1), crossings.slice(1));
            var spans = _.map(crossing_pairs, function(x) {
                var l01 = x[0][1].level;
                var l10 = x[1][0].level;
                var state = x[0][1].level >= limit && x[1][0].level >= limit;
                return { state: state, start: x[0][0].time, end: x[1][0].time };
            });

            return spans;
        }
        */
        
        // CONSTRUCTOR

        this.options = _.extend({}, options);

        if (!this.options.station) {
            throw "TidePredictor: must specify station";
        }

        this.station = stations[this.options.station];
        if (!this.station) {
            throw "Unknown station: " + this.options.station;
        }
        
        this._c = {
            amplitude: [],
            node_factor: [],
            equilibrium: [],
            phase: [],
            speed: []
        };

        for (c in this.station.constituents) {
            this._c.amplitude.push(+(this.station.constituents[c].amplitude));
            this._c.phase.push(this.station.constituents[c].phase * Math.PI / 180.);
            this._c.equilibrium.push(constituents[c].equilibrium[this.station.reference_year] * Math.PI / 180.);
            this._c.node_factor.push(+(constituents[c].node_factor[this.station.reference_year]));
            this._c.speed.push(constituents[c].speed / 3600. * Math.PI / 180.);
        }

        // INTERNAL METHODS

        this._predict = function(timestamp, reference) {
            var t = timestamp - reference;

            // p = offset + sum(ampitude * node_factor * cos(t * speed - phase + equilibrium))
            p = this.station.datum +
                this.sum(
                    this.mul(
                        this.mul(
                            this._c.amplitude,
                            this._c.node_factor
                        ), this.cos(
                            this.add(
                                this.sub(
                                    this.scale(
                                        this._c.speed,
                                        t
                                    ),
                                    this._c.phase
                                ),
                                this._c.equilibrium
                            )
                        )
                    )
                );

            return p;
        };

        this.mul = function(a, b) {
            var c = []; c.length = a.length;
            for (i = 0; i < a.length; i++)
                c[i] = a[i] * b[i];
            return c;
        }

        this.add = function(a, b) {
            var c = []; c.length = a.length;
            for (i = 0; i < a.length; i++)
                c[i] = a[i] + b[i];
            return c;
        }

        this.sub = function(a, b) {
            var c = []; c.length = a.length;
            for (i = 0; i < a.length; i++)
                c[i] = a[i] - b[i];
            return c;
        }

        this.sum = function(a) {
            var c = 0.;
            for (i = 0; i < a.length; i++)
                c += a[i];
            return c;
        }

        this.scale = function(a, z) {
            var c = []; c.length = a.length;
            for (i = 0; i < a.length; i++)
                c[i] = z * a[i];
            return c;
        }

        this.cos = function(a) {
            var c = []; c.length = a.length;
            for (i = 0; i < a.length; i++)
                c[i] = Math.cos(a[i]);
            return c;
        }

        return this;
    };
});
