var rawData;
var candidateKeys = ["year", "name", "position", "endorsed", "won", "votePercentage"];

$(function(){
	$.getJSON('./stats.json', function(data) {
		rawData = data;
	});
});

