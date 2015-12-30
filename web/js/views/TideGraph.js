define([
    'underscore',
    'backbone',
    'moment_tz',
    'suncalc',
    'util/TidePredictor'
], function(
    _,
    Backbone,
    moment,
    SunCalc,
    TidePredictor
) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.predictor = new TidePredictor({ station: options.station });
            this.time = options.time || moment().unix();
            this.limit = options.limit || 0.;
            this.selector = options.el;

            this.above_color = options.above_color || "#2a2";
            this.below_color = options.below_color || "#f00";

            // 12am-12am PST8PDT
            var t = moment.unix(this.time).tz("America/Los_Angeles");
            this.start_time = t.hours(0).minutes(0).seconds(0).unix() | 0;
            this.stop_time = t.hours(24).minutes(0).seconds(0).unix() | 0;

            // Get sunrise and sunset for shading rectangles
            var times = SunCalc.getTimes(t.toDate(), 37.7833, -122.4167);
            this.sunrise_time = moment(times.sunrise).unix() | 0;
            this.sunset_time = moment(times.sunset).unix() | 0;

            this.data = this.predictor.states(this.start_time, this.stop_time, this.limit);

            this.offset = moment().tz("America/Los_Angeles").utcOffset() * 60 - moment().utcOffset() * 60;
            
            this.render();
        },
        render: function() {
            var offset = this.offset;
            var d = _.map(this.data, function(x) { return { "x": (x.time + offset)*1000, "y": x.level, "state": x.state }; });
            var limit = this.limit;

            var above_color = this.above_color;
            var below_color = this.below_color;

            var darktime = [
                { 'x': (this.start_time + offset) * 1000,   'x2': (this.sunrise_time + offset) * 1000, 'y': 1.0 },
                { 'x': (this.sunset_time + offset) * 1000,  'x2': (this.stop_time + offset) * 1000, 'y': 1.0 }
            ];

            var spec = {
                "width": 560,
                "height": 200,
                "padding": {"top": 10, "left": 30, "bottom": 30, "right": 10},
                "data": [
                    {
                        "name": "table",
                        "values": d
                    },
                    {
                        "name": "dark",
                        "values": darktime
                    }
                ],
                "scales": [
                    {
                        "name": "x",
                        "type": "time",
                        "nice": "hour",
                        "range": "width",
                        // "round": true,
                        "domain": {"data": "table", "field": "x"}
                    },
                    {
                        "name": "y",
                        "type": "linear",
                        "range": "height",
                        "nice": true,
                        "domain": {"data": "table", "field": "y"}
                    },
                    {
                        "name": "y2",
                        "type": "linear",
                        "range": "height",
                        "nice": false,
                        "domain": {"data": "dark", "field": "y"}
                    }
                ],
                "axes": [
                    {"type": "x", "scale": "x", "ticks": 24, "grid": true, "format": "%I"},
                    {"type": "y", "scale": "y", "grid": true }
                ],
                "marks": [
                    {
                        "type": "area",
                        "from": {
                            "data": "table"
                        },
                        "properties": {
                            "enter": {
                                "interpolate": {"value": "linear"},
                                "x": {"scale": "x", "field": "x"},
                                "y": {"scale": "y", "field": "y"},
                                "y2": {"scale": "y", "value": limit},
                                "fill": {"value": below_color }
                            }
                        }
                    },
                    {
                        "type": "area",
                        "from": {
                            "data": "table",
                            "transform": [{"type": "filter", "test": "datum.y >= " + limit }]
                        },
                        "properties": {
                            "enter": {
                                "interpolate": {"value": "linear"},
                                "x": { "scale": "x", "field": "x" },
                                "y": { "scale": "y", "field": "y" },
                                "y2": {"scale": "y", "value": limit },
                                "fill": { "value": above_color }
                            }
                        }
                    },
                    {
                        "type": "rect",
                        "from": { "data": "dark" },
                        "properties": {
                            "enter": {
                                "x": { "scale": "x", "field": "x" },
                                "x2": { "scale": "x", "field": "x2" },
                                "y": { "scale": "y2", "field": "y" },
                                "y2": { "scale": "y2", "value": 0},
                                "fill": { "value": "black" },
                                "fillOpacity": { "value": 0.35 }
                            }
                        }
                    }
                ]
            }

            var el = $(this.selector)[0];
            
            //_.bind(vg.parse.spec, this)(spec, function(error, chart) {
            //    chart({ el: "#graph" }).update();
            //});
            vg.parse.spec(spec, function(error, chart) {
                chart({ el: el }).update();
            });
        }
    });
});
