/*global d3*/
/*global $*/

$("body").append(`    
    <div id='linechart-tooltip' class='hidden tooltip'>
        <p><strong><span id="linechart-x-value"></span></strong></p>
        <p><span id="linechart-y-value"></span></p>
    </div>`);

var drawMultiTrendLineChart = function(
    datasets,
    getX,
    getY,
    plotTitle = "",
    yUnit = "",
    selector = "body",
    w = 800,
    h = 400) {
    var margin = {
            top: 50,
            bottom: 70,
            right: 200,
            left: 50
        },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom,
        values = datasets.reduce(
            function(result, dataset) {
                return result.concat(dataset['values']);
            }, []);


    var xScale = d3.time.scale()
        .domain(d3.extent(values, getX))
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .orient("bottom")
        .scale(xScale)
        .tickFormat(d3.time.format("%Y %b"));

    var make_x_axis = function() {
        return d3.svg.axis()
            .orient("bottom")
            .scale(xScale);
    };

    var niceExtent = function(values, getY) {
        var extent = d3.extent(values, getY);
        var min = extent[0];
        var max = extent[1];
        var denominator = 1;
        while (max / denominator > 10) {
            denominator = denominator * 10;
        }
        var niceMax = denominator * (Math.floor(max / denominator) + 1);
        var niceMin = denominator * (Math.floor(min / denominator));

        return [niceMin, niceMax];
    };

    var yScale = d3.scale.linear()
        .domain(niceExtent(values, getY))
        .range([height, 0]);

    var yAxis = d3.svg.axis()
        .orient("left")
        .scale(yScale);

    var make_y_axis = function() {
        return d3.svg.axis()
            .orient("left")
            .scale(yScale);
    };
    
    var line = d3.svg.line()
        .x(function(d) {
            return xScale(getX(d));
        })
        .y(function(d) {
            return yScale(getY(d));
        });

    
    var colors = [
        "#e41a1c",
        "#377eb8",
        "#4daf4a",
        "#984ea3",
        "#ff7f00",
        "#ffff33",
        "#a65628",
        "#f781bf",
        "#999999"];

    var svg = d3.select(selector).append("svg")
        .attr("class", "line-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var keys = datasets.map(function(o){ return o.key});
    var colorOrdinalScale = d3.scale.ordinal().domain(keys).range(colors.slice(0, keys.length));
    var verticalLegend = d3.svg.legend()
                               .labelFormat("none")
                               .cellPadding(15)
                               .orientation("vertical")
                               .units("")
                               .cellWidth(40)
                               .cellHeight(5)
                               .inputScale(colorOrdinalScale)
                               .cellStepping(10);
    
    svg.append("g")
       .attr("transform", "translate(" + (width + 20) + ",0)")
       .attr("class", "legend")
       .call(verticalLegend);

    svg.selectAll(".legendCells rect")
       .style("stroke-width", "0px");
       

    for (var i = 0; i < datasets.length; i++){
        var dataset = datasets[i].values;
        var color = colors[i];
        var g = svg.append("g");
        g.append("path")
            .data([dataset])
            .attr("class", "line")
            .attr("d", line)
            .style("stroke", color);

        g.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d, i) {
                return xScale(getX(d));
            })
            .attr("cy", function(d, i) {
                return yScale(getY(d));

            })
            .attr("r", function(d, i) {
                return 3;
            })
            .style("stroke", color)
            .attr("class", "point")
            .on("mouseover", function(d, i) {

                var xPosition = d3.event.pageX; 
                var yPosition = d3.event.pageY; 


                var tooltip = d3.select("#linechart-tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px");

                tooltip.select("#linechart-x-value")
                       .text(d3.time.format("%B %Y")(getX(d)));
                tooltip.select("#linechart-y-value")
                       .html(getY(d) + "&nbsp;" + yUnit);
                tooltip.classed("hidden", false);

            })
            .on("mouseout", function() {
                d3.select("#linechart-tooltip").classed("hidden", true);
            });
    }


    svg.append("g")
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    svg.append("g")
        .attr("class", "grid")
        .call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis().tickSize(-height, 0, 0).tickFormat(""));

    svg.selectAll(".xaxis text")
        .attr("transform", function(d) {
            return "translate(" + -1 * this.getBBox().height + "," + (0.5 * this.getBBox().width + 5) + ")rotate(-90)";
        });

    svg.append("text")
        .attr("class", "plot-title")
        .attr("text-anchor", "middle") 
        .attr("transform", "translate(" + (width / 2) + "," + (-0.5 * margin.top + 6) + ")") // centre below axis
        .text(plotTitle);


};

d3.json("data/means_per_month.json", function(data) {
    var meansPerGemeente = d3.nest()
        .key(function(d) {
            return d.gemeente;
        })
        .entries(data.means);

    drawMultiTrendLineChart(
            meansPerGemeente,
            function(d) {
                var date = new Date(d.verkoopdatum_jaar, d.verkoopdatum_maand, 1);
                return date;
            },
            function(d) {
                return Math.round(d.ppm2);
            },
            "Vraagprijs per Vierkante Meter",
            "euro",
            "#plot-ppm2-tijd"
        );
});
