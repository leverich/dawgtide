define([
    'underscore',
    'backbone',
    'moment_tz',
    'suncalc',
    'util/TidePredictor'
], function(
    _,
    Backbone,
    Moment,
    SunCalc,
    TidePredictor
) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.predictor = new TidePredictor({ station: options.station });
            this.time = options.time || Moment().unix();
            this.limit = options.limit || 0.;
            this.current = options.current;
            this.selector = options.el;

            // 6am-8pm PST8PDT
            var t = Moment.unix(this.time).tz("America/Los_Angeles");
            var d = new Date(this.time * 1000);
            var times = SunCalc.getTimes(d, 37.7833, -122.4167);
            
            this.start_time = Moment(times.sunrise).unix(); // t.hours(6).minutes(5).seconds(0).unix() | 0;
            this.stop_time = Moment(times.sunset).unix(); // t.hours(20).minutes(0).seconds(0).unix() | 0;

            // this.data = this.predictor.states(this.start_time, this.stop_time, this.limit);
            this.spans = this.predictor.spans(this.start_time, this.stop_time, this.limit);
            _.each(this.spans, function(span) {
                span.start_string = Moment.unix(span.start).tz("America/Los_Angeles").format("h:mm a");
                span.end_string = Moment.unix(span.end).tz("America/Los_Angeles").format("h:mm a");
                if (span.now) {
                    span.now.level = +(span.now.level.toFixed(2));
                    span.now.time = Moment.unix(span.now.time).tz("America/Los_Angeles").format("h:mm a");
                }

                if (span.max) {
                    span.max.level = +(span.max.level.toFixed(2));
                    span.max.time = Moment.unix(span.max.time).tz("America/Los_Angeles").format("h:mm a");
                }
            });
            this.spans[0].first = 'first';
            this.spans[this.spans.length - 1].last = 'last';

            this.truecolor = options.current ? "red" : "green";
            this.falsecolor = options.current ? "green" : "red";
            this.truelabel = options.current ? "Flooding" : "Safe";
            this.falselabel = options.current ? "Ebbing" : "Too low";
            this.nowlabel = options.current ? "kts" : "ft";
            this.truemaxlabel = options.current ? "Max Flood" : "High Tide";
            this.falsemaxlabel = options.current ? "Max Ebb" : "Low Tide";

            this.render();
        },

        template: '<table class="tidetable">\
    <% _.each(spans, function(span) { %>\
        <tr class="<%= span.state ? truecolor : falsecolor %>">\
            <td class="time">\
                <%= span.first ? "&lt; " : "" %>\
                <%= span.start_string %>\
            </td>\
            <td class="time">\
                <%= span.last ? "&gt; " : "" %>\
                <%= span.end_string %>\
            </td>\
            <td>\
                <%= span.state ? truelabel : falselabel %>\
            </td>\
            <% if (span.now) { %>\
                <tr class="<%= span.state ? truecolor : falsecolor %>">\
                    <td class="time"> <%= span.now.time %> </td>\
                    <td class="time"> <%= span.now.level %> <%= nowlabel %> </td>\
                    <td>Now</td>\
                </tr>\
            <% } %>\
            <% if (current && span.max && !span.state) { %>\
                <tr class="<%= span.state ? truecolor : falsecolor %>">\
                    <td class="time"> <%= span.max.time %> </td>\
                    <td class="time"> <%= span.max.level %> <%= nowlabel %> </td>\
                    <td> <%= span.state ? truemaxlabel : falsemaxlabel %> </td>\
                </tr>\
            <% } %>\
        </tr>\
    <% }); %>\
</table>',
        
        render: function() {
            var t = _.template(this.template);
            this.$el.html(t(this));
        }
    });
});
