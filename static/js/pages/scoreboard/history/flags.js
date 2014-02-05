var chart;
$(document).ready(function() {
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'game_history',
            type: 'line',
            backgroundColor:'transparent',
            zoomType: 'x',
        },
        title: {
                text: 'Captured Flags',
                style: {
                    color: '#FFFFFF',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif',
                    'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
                },
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Time',
                style: {
                    color: '#FFFFFF',
                    font: 'bold 14px "Trebuchet MS", Verdana, sans-serif',
                    'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
                },
            }
        },
        yAxis: {
            title: {
                text: 'Flags Captured',
                style: {
                    color: '#FFFFFF',
                    font: 'bold 14px "Trebuchet MS", Verdana, sans-serif',
                    'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
                },
            }
        },
        tooltip: {
            enabled: true,
            formatter: function() {
                return '<strong>' + this.series.name + '</strong><br />' + this.y + ' flag(s)';
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
        },
        series: [
            {% for team in history %}
                {
                    name: "{{ team }}",
                    data: [
                        {% for entry in history[team] %}
                            [ {{ int(entry[0]) }}{{ " * 1000" }}, {{ entry[1] }} ],
                        {% end %}
                    ]
                },
            {% end %}
        ]
    });
});

function get_index_by_name(team_name) {
    for(var index = 0; index < chart.series.length; index++) {
        if (chart.series[index].name == team_name) {
            console.log("Existing series found for: " + team_name);
            return index;
        }
    }
    return undefined;
}

function plot_update(update) {
    console.log(update);
    timestamp = update['timestamp'] * 1000;
    for (var key in update['scoreboard']) {
        console.log("Updating: " + key);
        flags = update['scoreboard'][key]['flags'].length;
        index = get_index_by_name(key);
        if (index !== undefined) {
            var shift = (30 <= chart.series[index].data.length);
            var scores = [timestamp, flags];
            chart.series[index].addPoint(scores, true, shift);
        } else {
            create_series = {
                name: key,
                data: [
                    [timestamp, flags],
                ]
            }
            chart.addSeries(create_series);
        }
    }
}

$(document).ready(function() {
    var history_ws = new WebSocket($("ws-connect").val() + "/scoreboard/wsocket/game_history");
    history_ws.onmessage = function (evt) {
        msg = jQuery.parseJSON(evt.data);
        if ('error' in msg) {
            console.log(msg);
        } else if ('history' in msg) {
            history = msg['history'];
        } else if ('update' in msg) {
            plot_update(msg['update']);
        } else {
            console.log("Error no opcode.");
        }
    };
});