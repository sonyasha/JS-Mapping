var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3
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
            .domain([0, 3, 7])
            .range(["blue", "orange", "red"]);
    
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 4,
                fillColor: colormap(feature.properties.mag),
                // color: "white",
                fillOpacity: 1,
                opacity: 0.5
                
            })
        },
        onEachFeature: onEachFeature
        
        
    }).addTo(myMap);
    
    



    
    
    
})
