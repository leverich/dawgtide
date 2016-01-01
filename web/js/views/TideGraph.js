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

            var start_mtime = (this.start_time + offset) * 1000;
            var stop_mtime = (this.stop_time + offset) * 1000;

            var above_color = this.above_color;
            var below_color = this.below_color;

            var darktime = [
                { 'x': (this.start_time + offset) * 1000,   'x2': (this.sunrise_time + offset) * 1000, 'y': 1.0 },
                { 'x': (this.sunset_time + offset) * 1000,  'x2': (this.stop_time + offset) * 1000, 'y': 1.0 }
            ];

            // Hacky way to lookup Y-value for horizontal rule
            var pixels_to_x = function(pix) {
                var pleft = 30;
                var pright = 10;
                var width = 560;
                return start_mtime + (stop_mtime - start_mtime) * (pix - pleft) / width;
            };
            var lookup_x = function(x, data) {
                var v = _.find(data, function(d) {
                    return d.x > x;
                });
                return v ? v : data[data.length - 1];
            };

            var now = (moment().unix() + offset) * 1000;
            var now_level = (now > start_mtime && now < stop_mtime) ? lookup_x(now, d).y : undefined;
            console.log(now, now_level);

            var spec = {
                "width": 560,
                "height": 200,
                "padding": { "top": 10, "left": 30, "bottom": 30, "right": 10 },
                "data": [
                    {
                        "name": "table",
                        "values": d
                    },
                    {
                        "name": "dark",
                        "values": darktime
                    },
                ],

                "signals": [
                    {
                        "name": "indexTime",
                        "init": { "expr": -666 },
                        "streams": [{
                            "type": "mousemove",
                            "expr": "clamp(eventX(), 0, eventGroup('root').width)",
                            "scale": { "name": "x", "invert": true }
                        }]
                    },
                    {
                        "name": "mouseY",
                        "init": { "expr": -666 },
                    },
                ],

                "scales": [
                    {
                        "name": "x",
                        "type": "time",
                        "nice": "hour",
                        "range": "width",
                        "domain": { "data": "table", "field": "x" }
                    },
                    {
                        "name": "y",
                        "type": "linear",
                        "range": "height",
                        "nice": true,
                        "domain": { "data": "table", "field": "y" }
                    },
                    {
                        "name": "y2",
                        "type": "linear",
                        "range": "height",
                        "nice": false,
                        "domain": { "data": "dark", "field": "y" }
                    }
                ],

                "axes": [
                    { "type": "x", "scale": "x", "ticks": 24, "grid": true, "format": "%I" },
                    { "type": "y", "scale": "y", "grid": true, }
                ],
                
                "marks": [
                    {
                        "type": "area",
                        "from": {
                            "data": "table"
                        },
                        "properties": {
                            "enter": {
                                // "interpolate": {"value": "linear"},
                                "x": { "scale": "x", "field": "x" },
                                "y": { "scale": "y", "field": "y" },
                                "y2":  { "scale": "y", "value": limit },
                                "fill": { "value": below_color }
                            }
                        }
                    },
                    {
                        "type": "area",
                        "from": {
                            "data": "table",
                            "transform": [
                                {
                                    "type": "formula",
                                    "field": "y",
                                    "expr": "clamp(datum.y, " + limit + ", 666)"
                                }
                            ]
                        },
                        "properties": {
                            "enter": {
                                // "interpolate": {"value": "linear"},
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
                                "y2": { "scale": "y2", "value": 0 },
                                "fill": { "value": "black" },
                                "fillOpacity": { "value": 0.35 }
                            }
                        }
                    },
                    {
                        "type": "rule",
                        "properties": {
                            "update": {
                                "x": { "scale": "x", "signal": "indexTime" },
                                "y": { "value": 0 },
                                "y2": { "field": { "group": "height" } },
                                "stroke": { "value": "#000" },
                                "strokeWidth": { "value": 1 },
                            }
                        }
                    },
                    {
                        "type":"rule",
                        "properties": {
                            "update": {
                                "x": { "value": 0 },
                                "x2": { "field": { "group": "width" } },
                                "y": { "scale": "y", "signal": "mouseY" },
                                "stroke": { "value": "#000" },
                                "strokeWidth": { "value": 1 },
                            }
                        }
                    },
                    {
                        "type": "symbol",
                        "properties": {
                            "enter": {
                                "size": { "value": 20 },
                                "shape": { "value": "circle" },
                                // "size": 5,
                                "x": { "scale": "x", "value": now },
                                "y": { "scale": "y", "value": now_level },
                                "stroke": { "value": "#333" },
                                "strokeWidth": { "value": 2 },
                                "fill": { "value": "#333" },
                            }
                        }
                    }
                ]
            };

            var el = $(this.selector)[0];
            
            //_.bind(vg.parse.spec, this)(spec, function(error, chart) {
            //    chart({ el: "#graph" }).update();
            //});
            vg.parse.spec(spec, function(error, chart) {
                var view = chart({ el: el });
                view.update();
                view.on("mousemove", function(event, item) {
                    view.signal("mouseY", lookup_x(pixels_to_x(event.layerX), d).y);
                    view.update();
                });
            });
        }
    });
});
