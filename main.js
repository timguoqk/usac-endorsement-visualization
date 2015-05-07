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
            .domain(d3.range(Math.ceil(data.length/cellPerRow)), 1)
            .rangeRoundPoints([3*r, width - 3*r]);
        y = d3.scale.ordinal()
            .domain(d3.range(cellPerRow), 1)
            .rangeRoundPoints([3*r, height - 3*r]);

        svg.selectAll('point')
            .data(data)
          .enter().append('svg:circle')
            .attr('cx', function(){return Math.random()*width/2 + width/4;})
            .attr('cy', function(){return Math.random()*height/2 + height/4;})
            .attr('r', 2)
            .attr('data-id', function(d, i) { return i; })
            .attr('data-title', function(d) { return d.name; })
            .attr('data-content', function(d) {
                // TODO: style the content
                // data-html can also be used
                return d.year + '\n' + d.position + '\n' + d.votePercentage;
            })
            // .on('mouseover', function(d, i) { mOver(i); })
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
            .attr('r', r);;

        // Init semantic modules
        $('#d3-container circle').popup();
        $('.ui.progress').each(function() {
            // set the bar manually to avoid animation
            var percentage = this.dataset.percent;
            this.children[0].style.width = percentage + "%";
            this.children[0].children[0].textContent = percentage;
            this.children[1].textContent = percentage;
        });
        $('.dropdown').dropdown();
    });
});

function mOver(i) {
    // TODO: add tooltip
}

function resize() {
    // TODO: redraw with new w/h
    // width = $('#d3-container').width();
    // height = $('#d3-container').height();
}