/*global $*/
/*global google*/
/*global d3*/

var drawChoropleth = function() {

    var $map = $("#map");
    var ams_dam_square = [4.8932, 52.373];
    var map = new google.maps.Map($map[0], {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(ams_dam_square[1], ams_dam_square[0]),
        disableDefaultUI: true,
        styles: [{
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
        }]
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
                        var dataValue = parseFloat(data[i].ppm2);

                        for (var j = 0; j < geoJson.features.length; j++) {

                            var geoKey = geoJson.features[j].properties.PC4;

                            if (dataKey == geoKey.toString()) {
                                geoJson.features[j].properties.dataValue = dataValue;
                                break;
                            }
                        }
                    }





                    var color = d3.scale.quantize()
                        .range(["rgb(255,255,178)", "rgb(254,204,92)", "rgb(253,141,60)", "rgb(240,59,32)", "rgb(189,0,38)"])
                        // .range(["rgb(237,248,233)", "rgb(186,228,179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"])
                        .domain([d3.min(data, function(d) {
                            return parseFloat(d.ppm2);
                        }), d3.max(data, function(d) {
                            return parseFloat(d.ppm2);
                        })]);

                    adminDivisions.selectAll("path")
                        .data(geoJson.features)
                        .attr("d", path) // update existing paths
                        .enter().append("svg:path")
                        .attr("d", path)
                        .style("fill", function(d, i) {
                            var value = d.properties.dataValue;
                            if (value) {
                                return color(value);
                            }
                            else {
                                return 'None'; //"#ccc";
                            }

                        });


                });

            };

        };
        
        overlay.setMap(map);
    });
};