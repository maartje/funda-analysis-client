/*global d3*/

d3.json("data/amsterdam-pc4.json", function(json) {
    var margin = {
            top: 70,
            right: 70,
            bottom: 70,
            left: 70
        },
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var ams_dam_square = [4.8932, 52.373];

    var projection = d3.geoMercator() 
        .scale(400000)
        .translate([width/2,height/2])
        .center(ams_dam_square);

    var path = d3.geoPath().projection(projection);

var pc4_1018 =  json.features.slice(7, 8)
console.log(pc4_1018)

var mj1018 = path.bounds(pc4_1018)
console.log("bounds-1018:", mj1018[0][0])

    svg.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path)
      .attr("class", "feature")
      .style("fill", "steelblue");
        
    svg.selectAll("circle")
		.data([ams_dam_square]).enter()
		.append("circle")
		.attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "red");
        
        
});