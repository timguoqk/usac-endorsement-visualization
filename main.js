var completeData, data;
var width, height, svg;
var x, y, r, cellH, cellPerRow;
var color = {
    // y-axis?
    endorsedAndWon: '#fd7400',
    notEndorsedAndWon: '#ffe11a',
    endorsedAndLost: '#1f8a70',
    notEndorsedAndLost: '#004358'
};
var grayColor = '#807F83';
var criteria = {};
var stats, globalSuccessRate = 0.66;

$(function(){
    $.getJSON('./stats.json', function(res) {
        completeData = res;
        completeData.sort(function(a, b) {
            if (a.endorsed == b.endorsed)
                return (a.won == b.won) ? (b.year - a.year) : (b.won - a.won);
            return b.endorsed - a.endorsed;
        });
        data = completeData;

        // Event listener
        d3.select(window).on('resize', resize);

        // Init semantic modules
        updateStats();
        $('.dropdown').dropdown({onChange: function(value, text, choice) {
            var type = choice.parent().parent().data('type');
            if (text != "All")
                criteria[type] = text;
            else
                delete criteria[type];
            filter(criteria);
            redraw();
        }});
        $('.ui.accordion').accordion();

        draw();
        $('#d3-container circle').popup();
    });
});

function resize() {
    $('#d3-container').empty();
    draw();
}

function determineSize() {
    // TODO: non-constant r/h/perRow
    r = 8;
    cellH = 10;
    cellPerRow = Math.min(20, data.filter(function(d){return d.won && d.endorsed;}).length);

    x = d3.scale.ordinal()
        .domain(d3.range(cellPerRow))
        .rangeRoundPoints([3*r, width - 3*r]);
    y = d3.scale.ordinal()
        .domain(d3.range(Math.ceil(data.length/cellPerRow)))
        .rangeRoundPoints([height - 3*r, 3*r]);
}

function filter(criteria) {
    var keys = Object.keys(criteria);
    data = completeData.filter(function(d){
        return !keys.some(function(key){
            // use double negation to handle the case when keys=[]
            return d[key] != criteria[key];
        });
    });
}

function draw() {
    width = $('#d3-container').width();
    height = $('#d3-container').height();
    determineSize();

    svg = d3.select('#d3-container').append('svg')
            .attr('width', width)
            .attr('height', height);

    svg.selectAll('circle')
        .data(data, function(d) { return d.year + d.name; })
      .enter().append('circle')
        .attr('cx', function(){return Math.random()*width/2 + width/4;})
        .attr('cy', function(){return Math.random()*height/2 + height/4;})
        .attr('r', 2)
        .attr('data-title', function(d) { return d.name; })
        .attr('data-content', function(d) {
            return d.year + '\n' + d.position + '\n' + d.votePercentage;
        })
        .attr('fill', grayColor)
      .transition().delay(300).duration(1000)
        .attr('cx', function(d, i) {
            return x(i%cellPerRow);
        })
        .attr('cy', function(d, i) {
            return y(Math.floor(i/cellPerRow));
        })
        .attr('r', r);

    // Commented: line is not a good choice
    // // 66% line
    // var h100 = height * ((stats.eaw+stats.eal)/100);
    // var h = globalSuccessRate * h100;
    // svg.append('line')
    //     .attr('x1', 3 * r).attr('y1', height - h)
    //     .attr('x2', width - 2 * r).attr('y2', height - h)
    //     .attr('stroke-width', 5)
    //     .attr('stroke-dasharray', '20, 20')
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke', '#fd0400');
    // svg.append('line')
    //     .attr('x1', 3 * r).attr('y1', height - h100)
    //     .attr('x2', width - 2 * r).attr('y2', height - h100)
    //     .attr('stroke-width', 5)
    //     .attr('stroke-dasharray', '20, 20')
    //     .attr('stroke-linecap', 'round')
    //     .attr('stroke', '#fd7400');
}

function updateStats() {
    $('#d3-container circle').popup();
    stats = data.reduce(function(previousValue, d) {
        if (d.endorsed) {
            if (d.won)
                previousValue.eaw += 1;
            else
                previousValue.eal += 1;
        }
        else {
            if (d.won)
                previousValue.neaw += 1;
            else
                previousValue.neal += 1;
        }
        return previousValue;
    }, {eaw: 0, eal: 0, neaw: 0, neal: 0});
    for (var key in stats)
        stats[key] = Math.ceil(stats[key]/data.length*100);

    // Percentage for success predictions / total predictions
    var successPercentage = Math.ceil(stats.eaw/(stats.eaw+stats.eal)*100);
    // set the bar manually to avoid animation
    $('#success-progress>.bar').css("width", successPercentage + "%")
        .css("background-color", "hsla(177,100%," + Math.sqrt(successPercentage*20) + "%,1)");
    $('#success-progress>.label').text(successPercentage + "% of Daily Bruin endorsed candidates won");

    $('#stat-eaw>.value').text(stats.eaw + '%');
    $('#stat-eal>.value').text(stats.eal + '%');
    $('#stat-neaw>.value').text(stats.neaw + '%');
    $('#stat-neal>.value').text(stats.neal + '%');
}

function changeToYear() {
    if ($('#changeMode-year').hasClass('active')) {
        $('.changeMode .ui.button').removeClass('active');
        turnGray();
        return;
    }
    $('.changeMode .ui.button').removeClass('active');
    $('#changeMode-year').addClass('active');

    var circles = svg.selectAll('circle');

    y = d3.scale.ordinal()
        .domain(d3.range(1998, 2016))
        .rangeRoundPoints([height - 3*r, 3*r]);

    var yearCount = {};
    for (var i = 0; i < data.length; i ++) {
        if (data[i].year in yearCount) {
            yearCount[data[i].year] += 1;
            data[i].x = yearCount[data[i].year];
        }
        else
            data[i].x = yearCount[data[i].year] = 0;
    }

    x = d3.scale.ordinal()
        .domain(d3.range(0, 35))  // Max number of candidates/yr
        .rangeRoundPoints([3*r, width - 3*r]);

    svg.selectAll('circle').transition().duration(800)
        .attr('fill', fillByResult)
        .attr('cx', function(d) {
            return x(d.x);
        })
        .attr('cy', function(d) { return y(d.year); });

    // Line and area
    // http://bl.ocks.org/mbostock/3883245
    // https://github.com/mbostock/d3/wiki/SVG-Shapes#line
    var line = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.close); });
}

function changeToResult() {
    if ($('#changeMode-result').hasClass('active')) {
        $('.changeMode .ui.button').removeClass('active');
        turnGray();
        return;
    }
    $('.changeMode .ui.button').removeClass('active');
    $('#changeMode-result').addClass('active');
    determineSize();
    svg.selectAll('circle').transition().duration(800)
        .attr('fill', fillByResult)
        .attr('cx', function(d, i) {
            return x(i%cellPerRow);
        })
        .attr('cy', function(d, i) {
            return y(Math.floor(i/cellPerRow));
        });
}

function redraw() {
    determineSize();

    var circles = svg.selectAll('circle')
        .data(data, function(d) { return d.year + d.name; });

    circles.transition().duration(800)
        .attr('cx', function(d, i) {
            return x(i%cellPerRow);
        })
        .attr('cy', function(d, i) {
            return y(Math.floor(i/cellPerRow));
        });

    circles.enter().append('circle')
        .attr('data-title', function(d) { return d.name; })
        .attr('data-content', function(d) {
            return d.year + '\n' + d.position + '\n' + d.votePercentage;
        })
        .attr('fill', '#ffffff')
        .transition().duration(800)
        .attr('fill', function(d) {
            if (d.endorsed)
                return d.won ? color.endorsedAndWon : color.endorsedAndLost;
            return d.won ? color.notEndorsedAndWon : color.notEndorsedAndLost;
        })
        .attr('r', r)
        .attr('cx', function(d, i) {
            return x(i%cellPerRow);
        })
        .attr('cy', function(d, i) {
            return y(Math.floor(i/cellPerRow));
        });

    circles.exit().transition().duration(500)
        .style("fill-opacity", 1e-6)
        .remove();

    updateStats();
}


function fillByResult(d) {
    if (d.endorsed)
        return d.won ? color.endorsedAndWon : color.endorsedAndLost;
    return d.won ? color.notEndorsedAndWon : color.notEndorsedAndLost;
}

function turnGray() {
    determineSize();
    svg.selectAll('circle').transition().duration(800)
        .attr('fill', grayColor)
        .attr('cx', function(d, i) {
            return x(i%cellPerRow);
        })
        .attr('cy', function(d, i) {
            return y(Math.floor(i/cellPerRow));
        });
}
