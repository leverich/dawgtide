define([
    'jquery',
    'backbone',
    'util/TidePredictor',
    'models/TidePredictor',
    'moment_tz'
],
function(
    $,
    Backbone,
    TidePredictor,
    TidePredictorModel,
    moment
) {
    return Backbone.View.extend({
        initialize: function(options) {
            if (options.tide_station) {
                this.tide_station = options.tide_station;
                this.tide_model = new TidePredictorModel({ station: options.tide_station });
            }
            if (options.current_station) {
                this.current_station = options.current_station;
                this.current_model = new TidePredictorModel({ station: options.current_station });
            }
            this.predictor = this.tide_model ? this.tide_model.predictor : this.current_model.predictor;
            this.tag = options.tag || 'NA';
            this.name = options.name || '';
            this.limit = options.limit || 0.;
            this.time = options.time || moment().unix();
            this.box_id = options.box_id || ("box_" + this.tag);

            // 2pm-6pm PST8PDT
            var t = moment.unix(this.time).tz("America/Los_Angeles");
            this.start_time = t.hours(14).minutes(0).seconds(0).unix() | 0;
            this.stop_time = t.hours(18).minutes(0).seconds(0).unix() | 0;

            if (this.tide_model) {
                this.tide_model.on('change:data', _.bind(this.render, this));
                this.tide_model.do_states(this.start_time, this.stop_time, this.limit);
            }

            if (this.current_model) {
                this.current_model.on('change:data', _.bind(this.render, this));
                this.current_model.do_states(this.start_time, this.stop_time);
            }

            this.$boxel = $("#" + this.box_id, this.$el);
            if (this.$boxel.length == 0) {
                this.$el.append('<div id="' + this.box_id + '" class="box"></div>');
                this.$boxel = $("#" + this.box_id);
            }

            this.render();
        },

        render: function() {
            if (this.tide_model && !this.tide_model.get("data") ||
                this.current_model && !this.current_model.get("data")) {
                return;
            }

            // Box template settings
            var box = {}

            var tide_states = this.tide_model ? this.tide_model.get("data") : null;
            var current_states = this.current_model ? this.current_model.get("data") : null;

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
                span.color = span.state;
                
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
            if (now > this.start_time && now < this.stop_time) {
                box.now = Math.round((now - this.start_time) / total_time * bar_width - 3);
            } else box.now = null;

            this.$boxel.addClass(box.color);

            /*
        "site_url": 'detail?time=%f%s%s%s%s' % (
            this_time,
            "&name=%s" % urllib.quote(name) if name else "",
            "&current_site=%s" % urllib.quote(current_site) if current_site else "",
            "&tide_site=%s" % urllib.quote(tide_site) if tide_site else "",
            "&target=%s" % urllib.quote(str(target)) if target else "",
        ),
            */
            // onclick="location.href='{{box['site_url']}}';" style="cursor: pointer"
            box.url = 'detail.html?time=' +
                this.time +
                '&name=' + this.name +
                (this.tide_station ? '&tide_station=' + this.tide_station : '') +
                (this.current_station ? '&current_station=' + this.current_station : '') +
                '&limit=' + this.limit;
            
            var template =
                '<div class="gloss"></div>' +
                '<div class="tag"><%= tag %></div>' +
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
                '<a href="<%= url %>" class="fill-div"></a>';

            var t = _.template(template);
            this.$boxel.html(t(box));
        }
    });
});
