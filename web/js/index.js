define([
    "jquery",
    "underscore",
    "views/TideBox",
    "views/TideCurrentBox",
    "views/NewTideBox",
    "util/urlParam",
    "util/TidePredictor"
],
function(
    $,
    _,
    TideBox,
    TideCurrentBox,
    NewTideBox,
    urlParam,
    TidePredictor
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

    /*
    new TideBox({ el: $(".boxes"), time: time, station: "9414392", tag: "Ha", limit: 3.25 });
    new TideBox({ el: $(".boxes"), time: time, station: "9414458", tag: "3rd", limit: 2.0 });
    new TideBox({ el: $(".boxes"), time: time, station: "9414575", tag: "PA", limit: 4.0 });
    new TideBox({ el: $(".boxes"), time: time, station: "ti", tag: "TI", limit: 0.0 });
    */

    //new TideCurrentBox({ el: $(".boxes"), time: time, tide_station: "9414392", tag: "Ha", limit: 3.25 });
    //new TideCurrentBox({ el: $(".boxes"), time: time, tide_station: "9414458", tag: "3rd", limit: 2.0 });
    //new TideCurrentBox({ el: $(".boxes"), time: time, tide_station: "9414575", tag: "PA", limit: 4.0 });
    //new TideCurrentBox({ el: $(".boxes"), time: time, current_station: "ti", tag: "TI", limit: 0.0 });

    new NewTideBox({ el: $(".boxes"), name: 'Haskins', time: time, tide_station: "9414392", tag: "Ha", limit: 3.25 });
    new NewTideBox({ el: $(".boxes"), name: '3rd Avenue', time: time, tide_station: "9414458", current_station: "sfb1305_7", tag: "3rd", limit: 2.0 });
    new NewTideBox({ el: $(".boxes"), name: 'Palo Alto', time: time, tide_station: "9414575", current_station: "sfb1301_12", tag: "PA", limit: 4.0 });
    new NewTideBox({ el: $(".boxes"), name: 'Treasure Island', time: time, current_station: "sfb1210_13", tag: "TI", limit: 0.0 });
    new NewTideBox({ el: $(".boxes"), name: 'Golden Gate', time: time, current_station: "sfb1203_18", tag: "GG", limit: 0.0 });
    new NewTideBox({ el: $(".boxes"), name: 'Sherman Island', time: time, current_station: "sfb1332_15", tag: "&Delta;", box_id: "box_Delta", limit: 0.0 });

    // Golden Gate Bridge
    // Delta

    /*
    var l1 = [{state: true, 1: true}, {state: true, 1: true}, {state: false, 1:true}, {state: false, 1:true}];
    var l2 = [{state: true, 2: true}, {state: false, 2: true}, {state: true, 2:true}, {state: false, 2:true}];
    var z = _.zip(l1, l2);
    var e = _.map(z, function(x) {
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
    console.log(l1);
    console.log(l2);
    console.log(e);
    */

    /*
    // var s = 1400000000;
    // var s = 1400000039;
    // var s = 1400000040;
    // var s = 1400000041;
    var i = 86400;

    tp = new TidePredictor({ station: "ti" });
    console.log(tp.spans(s, s+i, 1.0));
    console.log(tp.spans2(s, s+i, 1.0));

    console.log(s, i, s+i, (((s+i)/60)|0)*60 );

    var timestamps = _.range(s, s+i + 60, 60.);
    console.log(timestamps[timestamps.length - 1] - timestamps[0]);
    */

    /*
    tp = new TidePredictor({ station: "ti" });

    var timestamps = _.range(1419811200., ((1420125120./60)|0+1)*60, 360.);
    var predictions = tp.predictEach(timestamps);

    _.each(_.zip(timestamps, predictions).slice(0,14400), function(x) {
        console.log(x[0], x[1]);
    });
    */

    /*
    console.log('1419811200 0.69 0.6732533932597399', tp.predict(1419811200));
    console.log('1419811560 0.66 0.6376618244623271', tp.predict(1419811560));
    console.log('1419811920 0.62 0.601739826915842', tp.predict(1419811920));
    console.log('1419812280 0.59 0.5653104688599588', tp.predict(1419812280));
    console.log('1419812640 0.56 0.5281767511747915', tp.predict(1419812640));
    console.log('1419813000 0.52 0.4901339510084429', tp.predict(1419813000));
    console.log('1419813360 0.48 0.4509819343372333', tp.predict(1419813360));
    console.log('1419813720 0.44 0.4105369477553622', tp.predict(1419813720));
    console.log('1419814080 0.4 0.3686424304457388', tp.predict(1419814080));
    console.log('1419814440 0.36 0.3251784368389623', tp.predict(1419814440));
    console.log('1419814800 0.31 0.2800693260983002', tp.predict(1419814800));
    console.log('1419815160 0.27 0.23328945209283358', tp.predict(1419815160));
    console.log('1419815520 0.22 0.1848666745115098', tp.predict(1419815520));
    console.log('1419815880 0.17 0.13488360645443076', tp.predict(1419815880));
    console.log('1419816240 0.12 0.08347660775962334', tp.predict(1419816240));
    console.log('1419816600 0.07 0.030832626631600135', tp.predict(1419816600));
    console.log('1419816960 0.02 -0.022815919594251333', tp.predict(1419816960));
    console.log('1419817320 -0.04 -0.07719795747770028', tp.predict(1419817320));
    console.log('1419817680 -0.09 -0.13201193036101927', tp.predict(1419817680));
    console.log('1419818040 -0.15 -0.18693494803692484', tp.predict(1419818040));
    console.log('1419818400 -0.2 -0.24163249730795622', tp.predict(1419818400));
    console.log('1419818760 -0.25 -0.29576828125099125', tp.predict(1419818760));
    console.log('1419819120 -0.31 -0.3490137604799687', tp.predict(1419819120));
    console.log('1419819480 -0.36 -0.4010569912823997', tp.predict(1419819480));
    console.log('1419819840 -0.41 -0.45161039431453665', tp.predict(1419819840));
    console.log('1419820200 -0.46 -0.500417142985451', tp.predict(1419820200));
    console.log('1419820560 -0.5 -0.5472559280464069', tp.predict(1419820560));
    console.log('1419820920 -0.54 -0.5919439316721349', tp.predict(1419820920));
    console.log(1419811200, tp.predict(1419811200));
    console.log(1419811560, tp.predict(1419811560));
    console.log(1419811920, tp.predict(1419811920));
    console.log(1419812280, tp.predict(1419812280));
    */
});
