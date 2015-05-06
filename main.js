var completeData, data;
var range, candidateKeys = ["year", "name", "position", "endorsed", "won", "votePercentage"];
var width, height, svg;
var x, y, r, cellH;

$(function(){
    $.getJSON('./stats.json', function(res) {
        completeData = res;
        data = completeData;

        width = $('#d3-container').width();
        height = $('#d3-container').height();
        svg = d3.select('#d3-container').append('svg')
                .attr('width', width)
                .attr('height', height);

        r = 6;
        cellH = 10;

        x = d3.scale.ordinal()
            .domain(d3.range(Math.floor(data.length/4)), 1)
            .rangeRoundPoints([0, width]);
        y = d3.scale.ordinal()
            .domain(d3.range(Math.floor(data.length/4)), 1)
            .rangeRoundPoints([0, height]);

        svg.selectAll('point')
            .data(d3.range(data.length))
          .enter().append('svg:circle')
            .attr('cx', function(d) { return x(Math.floor(d/4)); })
            .attr('cy', function(d) { return y(Math.floor(d/4)); })
            .attr('r', r)
            .on('mouseover', function(d) { mOver(d); });
    });
});

function mOver(d) {
    console.log(data[d].name);
}