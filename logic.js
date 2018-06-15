// var access_token = token;

function renderMap(quakes, legend) {

    var satellTiles = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=" + token);
    
    var regTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?' +
    "access_token=" + token);

    var baseMaps = { 
        "Satellite": satellTiles,
        "Street": regTiles
    };
    
    var overLay = { 
        'Quakes': quakes,
    };

    var myMap = L.map("map", {
        center: [0, 0],
        zoom: 2,
        layers: [satellTiles, quakes]
      });

    L.control.layers(baseMaps, overLay, {
        // collapsed: false
      }).addTo(myMap);
    
    legend.addTo(myMap);

    myMap.on('overlayadd', function(eventLayer){
        if (eventLayer.name === 'Quakes'){
            myMap.addControl(legend);
        } 
    });
    
    myMap.on('overlayremove', function(eventLayer){
        if (eventLayer.name === 'Quakes'){
            myMap.removeControl(legend);
        } 
    });
    
};



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
    
    

    var legendQuakes = L.control({ position: "bottomright" });

    legendQuakes.onAdd = function() {

        var geojson = L.choropleth(data, {
            valueProperty: "mag",
            scale: ["yellow", "red"],
            steps: 6,    
        });

        var div = L.DomUtil.create("div", "info legend");

        var magnitudes = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']

        var labelsColors = geojson.options.limits.map((lim, ind) => {
            return ('<li style="background-color: ' + geojson.options.colors[ind] + '"></li>')
        })
        var labelsLabels = geojson.options.limits.map((lim, ind) => {
            return ('<li>'+ magnitudes[ind]+ '</li>')
        })
        
        div.innerHTML += "<ul>" + labelsColors.join("") + "</ul>" + "<ul>" + labelsLabels.join("") + "</ul>";
        return div;
    }


    // legend.addTo(myMap);
    // earthquakes.addTo(myMap);

    renderMap(earthquakes, legendQuakes)
    
    
    
})
