var completeData, data;
var width, height, svg;
var x, y, r, cellH, cellPerRow;
// TODO: better color
var color = {
    endorsedAndWon: "#f9e939",
    notEndorsedAndWon: "#fff5aa",
    endorsedAndLost: "#099ab7",
    notEndorsedAndLost: "#0a006d"
};
var criteria = {};

$(function(){
    $.getJSON('./stats.json', function(res) {
        completeData = res;
        completeData.sort(function(a, b) {
            if (a.endorsed == b.endorsed)
                return (a.won == b.won) ? (a.year - b.year) : (a.won - b.won);
            return a.endorsed - b.endorsed;
        });
        data = completeData;

        draw();

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
    cellPerRow = 22;

    // TODO: correct function
    x = d3.scale.ordinal()
        .domain(d3.range(cellPerRow), 1)
        .rangeRoundPoints([3*r, width - 3*r]);
    y = d3.scale.ordinal()
        .domain(d3.range(Math.ceil(data.length/cellPerRow)), 1)
        .rangeRoundPoints([3*r, height - 3*r]);
}

function filter(criteria) {
    data = [];
    var keys = Object.keys(criteria);
    for (var i = 0; i < completeData.length; i ++) {
        var flag = true;
        for (var j = 0; j < keys.length; j ++) {
            if (completeData[i][keys[j]] != criteria[keys[j]]) {
                flag = false;
                break;
            }
        }
        if (flag)
            data.push(completeData[i]);
    }
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
        .attr('fill', function(d) {
            if (d.endorsed)
                return d.won ? color.endorsedAndWon : color.endorsedAndLost;
            return d.won ? color.notEndorsedAndWon : color.notEndorsedAndLost;
        })
      .transition().delay(300).duration(1000)
        .attr('cx', function(d, i) {
            return x(i%cellPerRow);
        })
        .attr('cy', function(d, i) {
            return y(Math.floor(i/cellPerRow));
        })
        .attr('r', r);
}

function updateStats() {
    $('#d3-container circle').popup();
    var stats = data.reduce(function(previousValue, d) {
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
    $('.ui.progress').attr('data-percent',
        Math.ceil(stats.eaw/(stats.eaw+stats.neaw)*100));
    $('.ui.progress').each(function() {
        // set the bar manually to avoid animation
        var percentage = this.dataset.percent;
        this.children[0].style.width = percentage + "%";
        this.children[0].children[0].textContent = percentage;
        this.children[1].textContent = percentage;
    });

    $('#stat-eaw>.value').text(stats.eaw + '%');
    $('#stat-eal>.value').text(stats.eal + '%');
    $('#stat-neaw>.value').text(stats.neaw + '%');
    $('#stat-neal>.value').text(stats.neal + '%');
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