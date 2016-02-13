define([
    "jquery",
    "underscore",
    "views/TideBox",
    "util/urlParam"
],
function(
    $,
    _,
    TideBox,
    urlParam
) {
    var time = urlParam('time')|0 || (new Date().getTime() / 1000)|0;

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

    var day_template = _.template('<a href="?time=<%- time %>"><%- str %></a>');
    
    $("#this_day").html(today_str);
    $("#yesterday").html(day_template({ str: yesterday_str, time: yesterday_time }));
    $("#tomorrow").html(day_template({ str: tomorrow_str, time: tomorrow_time }));

    new TideBox({ el: $(".boxes"), name: 'Haskins', time: time, tide_station: "9414392", tag: "Ha", limit: 3.25 });
    new TideBox({ el: $(".boxes"), name: '3rd Avenue', time: time, tide_station: "9414458", current_station: "sfb1305_7", tag: "3rd", limit: 2.0 });
    new TideBox({ el: $(".boxes"), name: 'Palo Alto', time: time, tide_station: "9414575", current_station: "sfb1301_12", tag: "PA", limit: 2.4 });
    new TideBox({ el: $(".boxes"), name: 'Treasure Island', time: time, current_station: "sfb1210_13", tag: "TI", limit: 0.0 });
    new TideBox({ el: $(".boxes"), name: 'Golden Gate', time: time, current_station: "sfb1203_18", tag: "GG", limit: 0.0 });
    new TideBox({ el: $(".boxes"), name: 'Sherman Island', time: time, current_station: "sfb1332_15", tag: "&Delta;", box_id: "box_Delta", limit: 0.0 });
});
