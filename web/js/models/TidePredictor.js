define([
    'underscore',
    'backbone',
    'util/TidePredictor'
],
function(
    _,
    Backbone,
    TidePredictor
) {
    return Backbone.Model.extend({
        initialize: function() {
            this.predictor = new TidePredictor({ station: this.get("station") });
        },
        do_states: function(start_time, stop_time, limit) {
            _.defer(function(this_) {
                this_.set({ data: this_.predictor.states(start_time, stop_time, limit) });
            }, this);
        }
    });
});
