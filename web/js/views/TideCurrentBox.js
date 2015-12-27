define([
    'jquery',
    'backbone',
    'util/TidePredictor',
    'moment_tz'
],
function(
    $,
    Backbone,
    TidePredictor,
    moment
) {
    return Backbone.View.extend({
        initialize: function(options) {
            if (options.tide_station)
                this.tide_predictor = new TidePredictor({ station: options.tide_station });
            if (options.current_station)
                this.current_predictor = new TidePredictor({ station: options.current_station });
            this.predictor = this.tide_predictor ? this.tide_predictor : this.current_predictor;
            this.tag = options.tag || 'NA';
            this.limit = options.limit || 0.;
            this.time = options.time || moment().unix();

            this.render();
        },

        render: function() {
            // 2pm-6pm PST8PDT
            var t = moment.unix(this.time).tz("America/Los_Angeles");
            var start_time = t.hours(14).minutes(0).seconds(0).unix() | 0;
            var stop_time = t.hours(18).minutes(0).seconds(0).unix() | 0;

            // Box template settings
            var box = {}

            var tide_states = this.tide_predictor ? this.tide_predictor.states(start_time, stop_time, this.limit) : null;
            var current_states = this.current_predictor ? this.current_predictor.states(start_time, stop_time) : null;

            // Blend tide and current states together.
            var states = _.map(_.zip(tide_states, current_states), function(x) {
                var s = (
                    !(x[0]) ? (x[1].state ? 'red' : 'green') : (
                        !(x[1]) ? (x[0].state ? 'green' : 'red') : (
                            !(x[0].state) ? 'red' : (
                                x[1].state ? 'yellow' : 'green'
                            )
                        )
                    )
                );
                return _.extend({}, x[0], x[1], { state: s } );
            });

            // Get spans.
            var spans = this.predictor._spans(states);

            var total_time = spans[spans.length - 1].end - spans[0].start;
            var bar_width = 110;

            // Get box color.
            box.color = 'yellow';
            if (spans.length == 1)
                box.color = spans[0].state;
            
            // Get box tag.
            box.tag = this.tag;
            
            // For each span:
            box.spans = spans;
            var left = 0;
            _.each(spans, function(span) {
                // Get span color.
                span.color = span.state; // ? 'green' : 'red';
                
                // Get span left and width.
                span.width = Math.round((span.end - span.start) / total_time * bar_width);
                span.left = left;
                left += span.width;

                span.first = '';
                span.last = '';
            });
            spans[0].first = 'first';
            spans[spans.length - 1].last = 'last';

            // Get now dot.
            var now = (new Date().getTime()/1000)|0;
            if (now > start_time && now < stop_time) {
                box.now = Math.round((now - start_time) / total_time * bar_width - 3);
            } else box.now = null;

            var template =
                '<div class="box <%- color %>">' +
                '   <div class="gloss"></div>' +
                '   <div class="tag"><%- tag %></div>' +
                '<% if (spans.length > 1) {%>' +
                '   <div class="bar">' +
                '      <% _.each(spans, function(span) { %>' +
                '         <div class="subbar <%- span.color %> <%- span.first %> <%- span.last %>"' +
                '              style="width: <%- span.width %>px; left: <%- span.left %>px;"></div>' +
                '      <% }); %>' +
                '      <% if (now) { %>' +
                '         <div class="now" style="left: <%- now %>px;"></div>' +
                '      <% } %>' +
                '   </div>' +
                '<% } %>' +
                '</div>';

            var t = _.template(template);
            this.$el.append(t(box));
            // this.$el.html(this.$el.html() + t(box));
            // this.$el.html(t(box));
        }
    });
});
