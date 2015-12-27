define([
    'underscore',
    'backbone',
    'moment_tz',
    'util/TidePredictor'
], function(
    _,
    Backbone,
    moment,
    TidePredictor
) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.predictor = new TidePredictor({ station: options.station });
            this.time = options.time || moment().unix();
            this.limit = options.limit || 0.;
            this.selector = options.el;

            // 12am-12am PST8PDT
            var t = moment.unix(this.time).tz("America/Los_Angeles");
            this.start_time = t.hours(0).minutes(0).seconds(0).unix() | 0;
            this.stop_time = t.hours(24).minutes(0).seconds(0).unix() | 0;

            this.data = this.predictor.states(this.start_time, this.stop_time, this.limit);

            this.offset = moment().tz("America/Los_Angeles").utcOffset() * 60 - moment().utcOffset() * 60;
            console.log(this.offset);
            
            this.render();
        },
        render: function() {

            var offset = this.offset;
            console.log(offset);
            var d = _.map(this.data, function(x) { return { "x": (x.time + offset)*1000, "y": x.level, "state": x.state }; });

            var spec = {
                "width": 560,
                "height": 200,
                "padding": {"top": 10, "left": 30, "bottom": 30, "right": 10},
                "data": [
                    {
                        "name": "table",
                        "values": d
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
                    }
                ],
                "axes": [
                    {"type": "x", "scale": "x", "ticks": 12, "grid": true},
                    {"type": "y", "scale": "y", "grid": true}
                ],
                "marks": [
                    {
                        "type": "area",
                        "from": {"data": "table"},
                        "properties": {
                            "enter": {
                                "interpolate": {"value": "monotone"},
                                "x": {"scale": "x", "field": "x"},
                                "y": {"scale": "y", "field": "y"},
                                "y2": {"scale": "y", "value": 0},
                                "fill": {"value": "steelblue"}
                            },
                            "update": {
                                "fillOpacity": {"value": 1}
                            },
                            "hover": {
                                "fillOpacity": {"value": 0.5}
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
