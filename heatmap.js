/*global d3*/


d3.json("data/pc4-amsterdam.json", function(json) {
    var margin = {
            top: 70,
            right: 70,
            bottom: 70,
            left: 70
        },
        width = 900 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoAlbersUsa().translate([width/2, height/2]).scale([500]);
    var path = d3.geoPath().projection(projection);

    svg.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path);

});