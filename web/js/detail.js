define([
    'jquery',
    'underscore',
    'util/urlParam',
    'util/TidePredictor',
    'views/TideGraph',
    'views/TideAgenda'
],
function(
    $,
    _,
    urlParam,
    TidePredictor,
    TideGraph,
    TideAgenda
) {
    var updateQueryString = function(key, value, url) {
        if (!url) url = window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
            hash;

        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null)
                return url.replace(re, '$1' + key + "=" + value + '$2$3');
            else {
                hash = url.split('#');
                url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
        }
        else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
            else
                return url;
        }
    };
    
    var time = urlParam('time')|0 || (new Date().getTime() / 1000)|0;
    var name = urlParam('name');
    var tide_station = urlParam('tide_station');
    var current_station = urlParam('current_station');
    var limit = urlParam('limit') || 0.;

    var days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
    var mons = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    var today = new Date(time * 1000);
    var today_str = days[today.getDay()] + " " + mons[today.getMonth()] + " " + today.getDate();

    var yesterday = new Date((time - 86400) * 1000);
    var yesterday_str = days[yesterday.getDay()] + " " + mons[yesterday.getMonth()] + " " + yesterday.getDate();
    var yesterday_time = (yesterday.getTime() / 1000)|0;

    var tomorrow = new Date((time + 86400) * 1000);
    var tomorrow_str = days[tomorrow.getDay()] + " " + mons[tomorrow.getMonth()] + " " + tomorrow.getDate();
    var tomorrow_time = (tomorrow.getTime() / 1000)|0;

    // var day_template = _.template('<a href="?time=<%- time %>"><%- str %></a>');
    var day_template = _.template('<a href="<%= url %>"><%- str %></a>');

    $("#this_day").html(today_str);
    $("#today").html(day_template({ str: 'Today', url: updateQueryString('time') }));
    $("#yesterday").html(day_template({ str: yesterday_str, url: updateQueryString('time', yesterday_time) }));
    $("#tomorrow").html(day_template({ str: tomorrow_str, url: updateQueryString('time', tomorrow_time) }));
    $("#heading").html(name);

    if (tide_station) {
        new TideGraph({ el: "#tide_graph", time: time, station: tide_station, limit: limit });
        new TideAgenda({ el: "#tide_table", time: time, station: tide_station, limit: limit });
    }

    if (current_station) {
        new TideGraph({ el: "#current_graph", time: time, station: current_station, above_color: "#f00", below_color: "#2a2" });
        new TideAgenda({ el: "#current_table", time: time, station: current_station, current: true });
    }
});
