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
            this.predictor = new TidePredictor({ station: options.station });
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
            
            // Get spans.
            var spans = this.predictor.spans(start_time, stop_time, this.limit);

            var total_time = spans[spans.length - 1].end - spans[0].start;
            var bar_width = 110;

            // Get box color.
            box.color = 'yellow';
            if (spans.length == 1)
                box.color = spans[0].state ? 'green' : 'red';
            
            // Get box tag.
            box.tag = this.tag;
            
            // For each span:
            box.spans = spans;
            var left = 0;
            _.each(spans, function(span) {
                // Get span color.
                span.color = span.state ? 'green' : 'red';
                
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
