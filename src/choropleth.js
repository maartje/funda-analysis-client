/*global $*/
/*global google*/
/*global d3*/

var drawChoropleth = function() {

    var mapStyle = [{
        "featureType": "all",
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
        }, {
            "color": "#efebe2"
        }]
    }, {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "poi.attraction",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "poi.business",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "poi.government",
        "elementType": "all",
        "stylers": [{
            "color": "#dfdcd5"
        }]
    }, {
        "featureType": "poi.medical",
        "elementType": "all",
        "stylers": [{
            "color": "#dfdcd5"
        }]
    }, {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [{
            "color": "#bad294"
        }]
    }, {
        "featureType": "poi.place_of_worship",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "poi.school",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "poi.sports_complex",
        "elementType": "all",
        "stylers": [{
            "color": "#efebe2"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#ffffff"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#ffffff"
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [{
            "color": "#fbfbfb"
        }]
    }, {
        "featureType": "road.local",
        "elementType": "geometry.stroke",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{
            "color": "#a5d7e0"
        }]
    }];

    var $map = $("#map");
    var ams_dam_square = [4.8932, 52.373];
    var map = new google.maps.Map($map[0], {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(ams_dam_square[1], ams_dam_square[0]),
        disableDefaultUI: true,
        styles: mapStyle
    });
    d3.json("data/amsterdam-pc4-simplified.json", function(geoJson) {
        var overlay = new google.maps.OverlayView();
        overlay.onAdd = function() {
            var layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay");
            var svg = layer.append("svg");
            var adminDivisions = svg.append("g").attr("class", "AdminDivisions");

            overlay.draw = function() {
                var markerOverlay = this;
                var overlayProjection = markerOverlay.getProjection();

                // Turn the overlay projection into a d3 projection
                var googleMapProjection = function(coordinates) {
                    var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
                    var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
                    return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
                };

                var path = d3.geo.path().projection(googleMapProjection);

                d3.json("data/means_per_wijk.json", function(jsonData) {
                    var data = jsonData.means;
                    for (var i = 0; i < data.length; i++) {

                        var dataKey = data[i].postcode_wijk;
                        var dataValue = parseInt(data[i].ppm2);

                        for (var j = 0; j < geoJson.features.length; j++) {

                            var geoKey = geoJson.features[j].properties.PC4;

                            if (dataKey == geoKey.toString()) {
                                geoJson.features[j].properties.dataValue = dataValue;
                                break;
                            }
                        }
                    }
                    
                    var color = d3.scale.threshold()
                                        .domain([3000, 4000, 5000, 6000])
                                        // .range(['#fee5d9', '#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15'])
                                        .range(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']);

                    // var color = d3.scale.quantize()
                    //     .range(["rgb(255,255,178)", "rgb(254,204,92)", "rgb(253,141,60)", "rgb(240,59,32)", "rgb(189,0,38)"])
                    //     .domain([d3.min(data, function(d) {
                    //         return parseFloat(d.ppm2);
                    //     }), d3.max(data, function(d) {
                    //         return parseFloat(d.ppm2);
                    //     })]);

                    adminDivisions.selectAll("path")
                        .data(geoJson.features)
                        .attr("d", path) // update existing paths
                        .enter().append("svg:path")
                        .attr("d", path)
                        .on("mouseover", function(d, i, e) {

                            var xPosition = d3.event.pageX; 
                            var yPosition = d3.event.pageY; 


                            var tooltip = d3.select("#tooltip")
                                .style("left", xPosition + "px")
                                .style("top", yPosition + "px");

                            tooltip.select("#pc4")
                                   .text(d.properties.PC4);
                            tooltip.select("#mean_value")
                                   .text(d.properties.dataValue);

                            tooltip.classed("hidden", false);

                        })
                        .on("mouseout", function() {

                            //Hide the tooltip
                            d3.select("#tooltip").classed("hidden", true);

                        })
                        .style("fill", function(d, i) {
                            var value = d.properties.dataValue;
                            if (value) {
                                return color(value);
                            }
                            else {
                                return 'None'; //"#ccc";
                            }

                        });
                    
                    var horizontalLegend = d3.svg.legend()
                                             .units("Euro")
                                             .cellWidth(80)
                                             .cellHeight(25)
                                             .inputScale(color)
                                             .cellStepping(100);
                    d3.select("#map-wrap")
                        .append("svg")
                        .style("width", "100%")
                        .append("g")
                      .attr("transform", "translate(0,40)")
                       .attr("class", "legend")
                       .call(horizontalLegend);


                });
            };
        };
        overlay.setMap(map);
    });

};
