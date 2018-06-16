var quakesUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
var platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

d3.json(quakesUrl, function(quakedata) {
    getQuakes(quakedata);
});

function getQuakes(data) {        

    //create quakes layer
    function onEachFeature(feature, layer) { 
        layer.bindPopup("<h3>" + feature.properties.place +
          "</h3><hr><p>" + new Date(feature.properties.time) + ', magnitude ' + feature.properties.mag + "</p>");
    };
    var colormap = d3.scale.linear()
    .domain([0, 5])
    .range(["yellow", "red"]);

    var quakesData = L.geoJSON(data, {

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
    });

    //create quakes legend control
    var quakesLegend = L.control({ position: "bottomright" });

    quakesLegend.onAdd = function() {

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
    };

    getPlates(quakesData, quakesLegend);
}

//create plates layer
function getPlates(quakes,legend) { 

    d3.json(platesUrl, function(data) {
      var plates = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: 'orange',
            weight: 1,
            fillColor: 'none'
          };
      }
      });
      renderMap(quakes, legend, plates);
    });
};

function renderMap(quakes, legend, plates) {

    var satellTiles = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?" +
          "access_token=" + token);
    
    var regTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?' +
    "access_token=" + token);

    var ligthTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?' +
    "access_token=" + token)

    var baseMaps = { 
        "Satellite": satellTiles,
        "Street": regTiles,
        'Greyscale': ligthTiles
    };
    

    var overLay = { 
        'Quakes': quakes,
        'Plates': plates
    };

    var myMap = L.map("map", {
        center: [0, 0],
        zoom: 2,
        layers: [satellTiles, quakes],
        timeDimension: true,
        fullscreenControl: true,
        timeDimensionOptions: {
            autoPlay: true,
            position: 'bottomleft',
            playerOptions: {
                transitionTime: 500,
                loop: true,
            },
        },
    });

    

    L.control.layers(baseMaps, overLay, {
        collapsed: false
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




    

    

    // function onEachFeature(feature, layer) { //add popups
    //     layer.bindPopup("<h3>" + feature.properties.place +
    //       "</h3><hr><p>" + new Date(feature.properties.time) + ', magnitude ' + feature.properties.mag + "</p>");
    // };
    
    // var colormap = d3.scale.linear()
    //     .domain([0, 5])
    //     .range(["yellow", "red"]);
    
    // var quakesData = L.geoJSON(data, {

    //     pointToLayer: function (feature, latlng) {
    //         return L.circleMarker(latlng, {

    //             radius: feature.properties.mag * 3,
    //             fillColor: colormap(feature.properties.mag),
    //             color: 'black',
    //             fillOpacity: 1,
    //             weight: 0.6
                
    //         })
    //     },
    //     onEachFeature: onEachFeature
    // });

    // var quakesLegend = L.control({ position: "bottomright" });

    // quakesLegend.onAdd = function() {

    //     var geojson = L.choropleth(data, {
    //         valueProperty: "mag",
    //         scale: ["yellow", "red"],
    //         steps: 6,    
    //     });

    //     var div = L.DomUtil.create("div", "info legend");

    //     var magnitudes = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']

    //     var labelsColors = geojson.options.limits.map((lim, ind) => {
    //         return ('<li style="background-color: ' + geojson.options.colors[ind] + '"></li>')
    //     })
    //     var labelsLabels = geojson.options.limits.map((lim, ind) => {
    //         return ('<li>'+ magnitudes[ind]+ '</li>')
    //     })
        
    //     div.innerHTML += "<ul>" + labelsColors.join("") + "</ul>" + "<ul>" + labelsLabels.join("") + "</ul>";
    //     return div;
    // };

    // getPlates(quakesData, quakesLegend, tdWmsLayer);
    // getPlates(quakesData, quakesLegend);
    








