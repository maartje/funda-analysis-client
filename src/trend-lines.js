/*global d3*/
/*global $*/

d3.json("data/means_per_month_utrecht.json", function(data) {
// d3.json("data/means_per_month.json", function(data) {

    var dataset = data.means;

    $("body").append(`    
        <div id='linechart-tooltip' class='hidden tooltip'>
            <p><strong><span id="linechart-date-value"></span></strong></p>
            <p id="linechart-mean-value"></p>
        </div>`
    );

    plotTrendline(function(d) {
        return Math.round(d.ppm2);
    }, "euro", "Vraagprijs per Vierkante Meter", "#plot-ppm2-tijd");

    plotTrendline(function(d) {
        return Math.round(d.looptijd_in_dagen);
    }, "dagen", "Looptijd in Dagen", "#plot-looptijd-tijd");

    function plotTrendline(getY, unit = "", plotTitle = "", selector = "body") {

        var margin = {
                top: 50,
                bottom: 70,
                right: 20,
                left: 50
            },
            width = 560 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var getX = function(d) {
            var date = new Date(d.verkoopdatum_jaar, d.verkoopdatum_maand, 1);
            return date;
        };

        var xScale = d3.time.scale()
            .domain([d3.min(dataset, getX), d3.max(dataset, getX)])
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xScale)
            .tickFormat(d3.time.format("%Y %b"));

        var make_x_axis = function() {
            return d3.svg.axis()
                .orient("bottom")
                .scale(xScale)
                .ticks(dataset.length);
        };

        function niceDomain() {
            var min = d3.min(dataset, getY);
            var max = d3.max(dataset, getY);

            var denominator = 1;
            while (max / denominator > 10) {
                denominator = denominator * 10;
            }

            var niceMax = denominator * (Math.floor(max / denominator) + 1);
            var niceMin = denominator * (Math.floor(min / denominator));

            return {
                min: niceMin,
                max: niceMax
            };
        }

        var yScale = d3.scale.linear()
            .domain([niceDomain().min, niceDomain().max])
            .range([height, 0]);

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(yScale)
            .ticks(5);

        var make_y_axis = function() {
            return d3.svg.axis()
                .orient("left")
                .scale(yScale)
                .ticks(5);
        };

        var line = d3.svg.line()
            .x(function(d) {
                return xScale(getX(d));
            })
            .y(function(d) {
                return yScale(getY(d));
            });

        // var area = d3.svg.area()
        //     .x(function(d) {
        //         return xScale(getX(d));
        //     })
        //     .y0(height)
        //     .y1(function(d) {
        //         return yScale(getY(d));
        //     });

        var svg = d3.select(selector).append("svg")
            .attr("class", "line-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "xaxis axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .call(yAxis);

        // svg.append("path")
        //     .datum(dataset)
        //     .attr("class", "area")
        //     .attr("d", area);


        svg.append("path")
            .data([dataset])
            .attr("class", "line")
            .attr("d", line);

        svg.selectAll("circle")
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
            .attr("class", "point")
            .on("mouseover", function(d, i) {

                var xPosition = d3.event.pageX; 
                var yPosition = d3.event.pageY; 


                var tooltip = d3.select("#linechart-tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px");

                tooltip.select("#linechart-date-value")
                       .text(d3.time.format("%B %Y")(getX(d)));
                tooltip.select("#linechart-mean-value")
                       .html(getY(d) + "&nbsp;" + unit);
                tooltip.classed("hidden", false);

            })
            .on("mouseout", function() {
                d3.select("#linechart-tooltip").classed("hidden", true);

            });

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

        // svg.append("text")
        //     .attr("class", "axis-title")
        //     .attr("text-anchor", "middle")
        //     .attr("transform", "translate(" + (-margin.left + 20) + "," + (height / 2) + ")rotate(-90)")
        //     .text(yAxisText);

        svg.append("text")
            .attr("class", "plot-title")
            .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (width / 2) + "," + (-0.5 * margin.top + 6) + ")") // centre below axis
            .text(plotTitle);
    }

});
