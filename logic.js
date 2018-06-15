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

    function rad(magn) {
        return magn*2;
    }

    function onEachFeature(feature, layer) { //add popups
        layer.bindPopup("<h3>" + feature.properties.place +
          "</h3><hr><p>" + new Date(feature.properties.time) + ', magnitude ' + feature.properties.mag + "</p>");
    };
    
    // var quakeLayer = L.geoJSON(data.features, {
    //     onEachFeature: onEachFeature
    //     }).addTo(myMap); //create a new layer for quakes

    // console.log(quakeLayer);
    
    
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 4,
                // fillColor: "white",
                color: "red",
                fillOpacity: 0.8
                
            })
        },
        onEachFeature: onEachFeature
        
        
    }).addTo(myMap);
    
    



    
    
    
})
