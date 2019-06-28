let quakesUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
let platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';
let volcanoesUrl = 'https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:E3WebApp_Emissions&maxFeatures=100&outputFormat=application%2Fjson'
let groundURL = 'pk.eyJ1IjoiZ3J5YXp6eiIsImEiOiJjamozbTc1eWYwY2xzM3Bwb2U4bWoxMHZ6In0.F5ZH2NiT-cdQwd1Wpkmhow'
let floodURL = 'https://waterwatch.usgs.gov/webservices/realtime?format=json';

//a way to deal with CORB
let floods = `${'https://cors-anywhere.herokuapp.com/'}${floodURL}`
//let volcanoes = `${'https://cors-anywhere.herokuapp.com/'}${volcanoesUrl}`


const render = () => {

    const onEachFeature = (feature, layer) => { 
        layer.bindPopup("<h3>" + feature.properties.place +
          "</h3><hr><p>" + new Date(feature.properties.time) + ', magnitude ' + feature.properties.mag + "</p>");
    };
    
    const colormap = d3.scale.linear()
        .domain([0, 5])
        .range(["yellow", "red"]);

    // let colors = colormap({
    //     colormap: 'oxygen',
    //     nshades: 6,
    //     format: 'hex',
    //     alpha: 1
    // })

    // console.log(colors)

    let quakesLegend = L.control({ position: "bottomright" });
    
    Promise.all([
        fetch(quakesUrl, {mode: 'cors'}).then(response => response.json()),
        fetch(platesUrl, {mode: 'cors'}).then(response => response.json()),
        fetch(floods, {mode: 'cors'}).then(response => response.json()),
    ])
    .then(data => {
        console.log(data);
        const all_data = data
    
        const plates = L.geoJSON(all_data[1], {
            style: feature => {
                return {
                color: 'orange',
                weight: 1,
                fillColor: 'none'
                };
            }
        });
    
        const quakesData = L.geoJSON(all_data[0], {
    
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

        quakesLegend.onAdd = () => {

            let geojson = L.choropleth(all_data[0], {
                valueProperty: "mag",
                scale: ["yellow", "red"],
                steps: 6,    
            });
            
            let div = L.DomUtil.create("div", "info legend");
            
            let magnitudes = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']
            
            let labelsColors = geojson.options.limits.map((lim, ind) => {
                return ('<li style="background-color: ' + geojson.options.colors[ind] + '"></li>')
            })
            let labelsLabels = geojson.options.limits.map((lim, ind) => {
                return ('<li>'+ magnitudes[ind]+ '</li>')
            })
            
            div.innerHTML += "<ul>" + labelsColors.join("") + "</ul>" + "<ul>" + labelsLabels.join("") + "</ul>";
            return div;
        };

        let heatArray = all_data[2].sites.map(el => {
            return [el.dec_lat_va, el.dec_long_va]
        });
        
        let water = L.heatLayer(heatArray, {
            radius: 50,
            blur: 7
            });
        
        let waterclust = L.markerClusterGroup();

        all_data[2].sites.forEach(el => {
            waterclust.addLayer(L.marker([el.dec_lat_va, el.dec_long_va])
            .bindPopup("<h3>" + el.station_nm +  "</h3><p> Flow " + el.flow + "</p><hr><p>Class: "+
            el.class + "</p>"))
        });
    
        renderMap(quakesData, quakesLegend, plates, water, waterclust);
        
    })

}

const renderMap = (quakes, legend, plates, water, wcl) => {
        let satellTiles = L.tileLayer(
            "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?" +
              "access_token=" + groundURL);
        
        let regTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?' +
        "access_token=" + groundURL);
    
        let ligthTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?' +
        "access_token=" + groundURL)
    
        let baseMaps = { 
            "Satellite": satellTiles,
            "Street": regTiles,
            'Greyscale': ligthTiles
        };
        
        let overLay = { 
            'Quakes': quakes,
            'Plates': plates,
            // 'Explosions': volcs,
            'Water Stations': wcl,
            'Water Stations Heat': water
        };
    
        let myMap = L.map("map", {
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
        
        //disappearing legend
        myMap.on('overlayadd', eventLayer => {
            if (eventLayer.name === 'Quakes'){
                myMap.addControl(legend);
            } 
        });
        
        myMap.on('overlayremove', eventLayer => {
            if (eventLayer.name === 'Quakes'){
                myMap.removeControl(legend);
            } 
        });
    }



// function getQuakes(data) {        

//     //create quakes layer
//     function onEachFeature(feature, layer) { 
//         layer.bindPopup("<h3>" + feature.properties.place +
//           "</h3><hr><p>" + new Date(feature.properties.time) + ', magnitude ' + feature.properties.mag + "</p>");
//     };
//     var colormap = d3.scale.linear()
//     .domain([0, 5])
//     .range(["yellow", "red"]);
//     console.log(colormap)

//     var quakesData = L.geoJSON(data, {

//         pointToLayer: function (feature, latlng) {
//             return L.circleMarker(latlng, {

//                 radius: feature.properties.mag * 3,
//                 fillColor: colormap(feature.properties.mag),
//                 color: 'black',
//                 fillOpacity: 1,
//                 weight: 0.6
                
//             })
//         },
//         onEachFeature: onEachFeature
//     });

//     //create quakes legend control
//     var quakesLegend = L.control({ position: "bottomright" });

//     quakesLegend.onAdd = function() {

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
//     };

//     console.log(quakesLegend);
//     getPlates(quakesData, quakesLegend);
// }

// //create plates layer
// function getPlates(quakes,legend) { 

//     d3.json(platesUrl, function(data) {
//       var plates = L.geoJSON(data, {
//         style: function (feature) {
//           return {
//             color: 'orange',
//             weight: 1,
//             fillColor: 'none'
//           };
//         }
//       });
//     //   getVocanoes(quakes, legend, plates);
//     //getWater(quakes, legend, plates);
//     renderMap(quakes, legend, plates);
//     });
// };

// function getVocanoes(quakes, legend, plates) { //data server not working now for some reason
//     d3.json(volcanoesUrl, function(data) {
  
//     var volcanoes = L.markerClusterGroup();
  
//     var volcLayer = L.geoJson(data, {
//         onEachFeature: function (feature, layer) {
//             layer.bindPopup("<h3>" + feature.properties.VolcanoName +  "</h3><p>Explotion " + feature.properties.SO2_Kilotons + " KiloTons</p><hr><p>Start Date: "+
//             feature.properties.StartDate + "</p><hr><p>End date: " + feature.properties.EndDate + "</p>");
//         }
//     });
      
//     volcanoes.addLayer(volcLayer);

//     getWater(quakes, legend, plates, volcanoes);
//     });  
// }

// function getWater(quakes, legend, plates, volcanoes) {
// function getWater(quakes, legend, plates) {
//     d3.json(floodURL, function(data) {
//       console.log(data.sites[0].dec_lat_va);
      
    //     var heatArray = data.sites.map(el => {
    //         return [el.dec_lat_va, el.dec_long_va]
    //     });
      
    //     var water = L.heatLayer(heatArray, {
    //     radius: 50,
    //     blur: 7
    //     });
    //     // getWaterCluster(quakes, legend, plates, volcanoes, water);
    //     getWaterCluster(quakes, legend, plates, water);
    // });
// }

// function getWaterCluster(quakes, legend, plates, volcanoes, water) {
// function getWaterCluster(quakes, legend, plates, water) {
//     d3.json(floodURL, function(data) {
  
//         var waterclust = L.markerClusterGroup();
  
//         data.sites.forEach(el => {
//             waterclust.addLayer(L.marker([el.dec_lat_va, el.dec_long_va])
//             .bindPopup("<h3>" + el.station_nm +  "</h3><p> Flow " + el.flow + "</p><hr><p>Class: "+
//             el.class + "</p>"))
//         });
//         // renderMap(quakes, legend, plates, volcanoes, water, waterclust);
//         //renderMap(quakes, legend, plates, water, waterclust);
//         renderMap(quakes, legend, plates, waterclust);
//     });
//   }

// function renderMap(quakes, legend, plates, volcs, water, wcl) {
//function renderMap(quakes, legend, plates, water, wcl) {


// function renderMap(quakes, legend, plates, wcl) {

//     var satellTiles = L.tileLayer(
//         "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?" +
//           "access_token=" + groundURL);
    
//     var regTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?' +
//     "access_token=" + groundURL);

//     var ligthTiles = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?' +
//     "access_token=" + groundURL)

//     var baseMaps = { 
//         "Satellite": satellTiles,
//         "Street": regTiles,
//         'Greyscale': ligthTiles
//     };
    
//     var overLay = { 
//         'Quakes': quakes,
//         'Plates': plates,
//         // 'Explosions': volcs,
//         //'Water Stations': wcl,
//         //'Water Stations Heat': water
//     };

//     var myMap = L.map("map", {
//         center: [0, 0],
//         zoom: 2,
//         layers: [satellTiles, quakes],
//         timeDimension: true,
//         fullscreenControl: true,
//         timeDimensionOptions: {
//             autoPlay: true,
//             position: 'bottomleft',
//             playerOptions: {
//                 transitionTime: 500,
//                 loop: true,
//             },
//         },
//     });

//     L.control.layers(baseMaps, overLay, {
//         collapsed: false
//       }).addTo(myMap);
    
//     legend.addTo(myMap);
    
//     //disappearing legend
//     myMap.on('overlayadd', function(eventLayer){
//         if (eventLayer.name === 'Quakes'){
//             myMap.addControl(legend);
//         } 
//     });
    
//     myMap.on('overlayremove', function(eventLayer){
//         if (eventLayer.name === 'Quakes'){
//             myMap.removeControl(legend);
//         } 
//     });
    
// };


render()



