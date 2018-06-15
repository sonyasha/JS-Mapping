var myMap = L.map("map", {
    center: [0, 0],
    zoom: 2
  });

L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NDg1bDA1cjYzM280NHJ5NzlvNDMifQ.d6e-nNyBDtmQCVwVNivz7A"
  ).addTo(myMap);

var quakesUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';


d3.json(quakesUrl, function(data) {
    console.log(data.features);

    function onEachFeature(feature, layer) { //add popups
        layer.bindPopup("<h3>" + feature.properties.place +
          "</h3><hr><p>" + new Date(feature.properties.time) + ', magnitude ' + feature.properties.mag + "</p>");
    };
    
    var colormap = d3.scale.linear()
        .domain([0, 5])
        .range(["yellow", "red"]);
    
    var earthquakes = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 3,
                fillColor: colormap(feature.properties.mag),
                color: 'black',
                fillOpacity: 1,
                weight: 0.6
                
            })
        },
        onEachFeature: onEachFeature
        
    // })    
    });
    
    

    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {

        var geojson = L.choropleth(data, {
            valueProperty: "mag",
            scale: ["yellow", "red"],
            steps: 6,    
        });
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;

        // var legendInfo =
        //  "<h4>Magnitude</h4>" +
            // "<div class=\"labels\">" +
            // "<div class=\"min\">" + limits[0] + "</div>" +
            // "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            // "</div>";
        var magnitudes = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']

        var labelsColors = limits.map((lim, ind) => {
            return ('<li style="background-color: ' + colors[ind] + '"></li>')
        })
        var labelsLabels = limits.map((lim, ind) => {
            return ('<li>'+ magnitudes[ind]+ '</li>')
        })

        // div.innerHTML = legendInfo;
        // limits.forEach(function(limit, index) {
        //     labels.push('<li style="background-color: ' + colors[index] + '">'+ magnitudes[index]+ '</li>');
        //   });
        
        div.innerHTML += "<ul>" + labelsColors.join("") + "</ul>" + "<ul>" + labelsLabels.join("") + "</ul>";
        return div;
    }


    legend.addTo(myMap);
    earthquakes.addTo(myMap);


    
    
    
})
