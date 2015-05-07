var completeData, data;
var candidateKeys = ["year", "name", "position", "endorsed", "won", "votePercentage"];
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
        d3.select(window).on('resize', resize);
        completeData = res;
        data = completeData;

        width = $('#d3-container').width();
        height = $('#d3-container').height();

        svg = d3.select('#d3-container').append('svg')
                .attr('width', width)
                .attr('height', height);

        r = 8;
        cellH = 10;
        cellPerRow = 22;

        x = d3.scale.ordinal()
            .domain(d3.range(Math.ceil(data.length/cellPerRow)), 1)
            .rangeRoundPoints([3*r, width - 3*r]);
        y = d3.scale.ordinal()
            .domain(d3.range(cellPerRow), 1)
            .rangeRoundPoints([3*r, height - 3*r]);

        svg.selectAll('circle')
            .data(data, function(d) { return d.year + d.name; })
          .enter().append('circle')
            .attr('cx', function(){return Math.random()*width/2 + width/4;})
            .attr('cy', function(){return Math.random()*height/2 + height/4;})
            .attr('r', 2)
            .attr('data-title', function(d) { return d.name; })
            .attr('data-content', function(d) {
                // TODO: style the content
                // data-html can also be used
                return d.year + '\n' + d.position + '\n' + d.votePercentage;
            })
            .attr('fill', function(d) {
                if (d.endorsed)
                    return d.won ? color.endorsedAndWon : color.endorsedAndLost;
                return d.won ? color.notEndorsedAndWon : color.notEndorsedAndLost;
            })
          .transition().delay(300).duration(800)
            .attr('cx', function(d, i) {
                return x(Math.floor(i/cellPerRow));
            })
            .attr('cy', function(d, i) { return y(i%cellPerRow); })
            .attr('r', r);

        // Init semantic modules
        $('#d3-container circle').popup();
        $('.ui.progress').each(function() {
            // set the bar manually to avoid animation
            var percentage = this.dataset.percent;
            this.children[0].style.width = percentage + "%";
            this.children[0].children[0].textContent = percentage;
            this.children[1].textContent = percentage;
        });
        $('.dropdown').dropdown({onChange: function(value, text, choice) {
            var type = choice.parent().parent().data('type');
            criteria[type] = text;
            filter(criteria);
            redraw();
        }});
        $('.ui.accordion').accordion();
    });
});

function resize() {
    // TODO: redraw with new w/h
    // width = $('#d3-container').width();
    // height = $('#d3-container').height();
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

function redraw() {
    x = d3.scale.ordinal()
        .domain(d3.range(Math.ceil(data.length/cellPerRow)), 1)
        .rangeRoundPoints([3*r, width - 3*r]);
    y = d3.scale.ordinal()
        .domain(d3.range(cellPerRow), 1)
        .rangeRoundPoints([3*r, height - 3*r]);

    var circles = svg.selectAll('circle')
        .data(data, function(d) { return d.year + d.name; });

    circles.transition().duration(800)
        .attr('cx', function(d, i) {
            return x(Math.floor(i/cellPerRow));
        })
        .attr('cy', function(d, i) { return y(i%cellPerRow); });

    circles.enter().append('circle')
        .transition().duration(800)
        .attr('data-title', function(d) { return d.name; })
        .attr('data-content', function(d) {
            // TODO: style the content
            // data-html can also be used
            return d.year + '\n' + d.position + '\n' + d.votePercentage;
        })
        .attr('fill', function(d) {
            if (d.endorsed)
                return d.won ? color.endorsedAndWon : color.endorsedAndLost;
            return d.won ? color.notEndorsedAndWon : color.notEndorsedAndLost;
        })
        .attr('r', r)
        .attr('cx', function(d, i) {
            return x(Math.floor(i/cellPerRow));
        })
        .attr('cy', function(d, i) { return y(i%cellPerRow); });

    circles.exit().transition().duration(500)
        .style("fill-opacity", 1e-6)
        .remove();

    $('#d3-container circle').popup();
}