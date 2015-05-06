var completeData, data;
var range, candidateKeys = ["year", "name", "position", "endorsed", "won", "votePercentage"];
var width, height, svg;
var x, y, r, cellH, cellPerRow;
// TODO: better color
var color = {
    endorsedAndWon: "#f9e939",
    notEndorsedAndWon: "#fff5aa",
    endorsedAndLost: "#099ab7",
    notEndorsedAndLost: "#0a006d"
}

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
            .domain(d3.range(Math.floor(data.length/cellPerRow)), 1)
            .rangeRoundPoints([0, width]);
        y = d3.scale.ordinal()
            .domain(d3.range(cellPerRow), 1)
            .rangeRoundPoints([0, height]);

        svg.selectAll('point')
            .data(data)
          .enter().append('svg:circle')
            .attr('cx', width/2)
            .attr('cy', height/2)
            .attr('r', 0)
          .transition().duration(700)
            .attr('cx', function(d, i) { return x(Math.floor(i/cellPerRow)); })
            .attr('cy', function(d, i) { return y(i%cellPerRow); })
            .attr('data-id', function(d,i) { return i; })
            .attr('r', r)
            .attr('fill', function(d) {
                if (d.endorsed)
                    return d.won ? color.endorsedAndWon : color.endorsedAndLost;
                return d.won ? color.notEndorsedAndWon : color.notEndorsedAndLost;
            })
            .on('mouseover', function(d, i) { mOver(i); });
    });
});

function mOver(d) {
    console.log(d.name);
}

function resize() {
    // TODO: redraw with new w/h
    // width = $('#d3-container').width();
    // height = $('#d3-container').height();
}