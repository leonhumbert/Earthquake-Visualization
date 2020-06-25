//Step 1 Store the API and tectonic plates URLs
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

//Step 2 Create functions for the markers' color and size
function markerColor(magnitude){

    return magnitude > 5 ? "#ff0000":
    magnitude  > 4 ? "#ff6600":
    magnitude > 3 ? "#ffa500":
    magnitude > 2 ? "#ffb37e":
    magnitude > 1 ? "#ffff66":
             "#90ee90";
  }
  
function markerRadius(value){
      return value*25000
  }
// Step 3 Perform a get request to the query 
d3.json(earthquakeURL,function (data){
    // send the data.feautures to a feactures function (virtual at this step)
    console.log(data);
    createFeatures(data.features);
});
// Step 4 Create function feautures with earthquake parameter
function createFeatures(earthquakeData) {
    console.log(earthquakeData);
	var earthquakes = L.geoJSON(earthquakeData,{
    // Step 5 Create a function to run once for each feature in the features array
    // Give each feature a popup describing the magnitude(feature.properties.mag)
    //, place(feature.properties.place)
    // and time (feature.properties.time) of the earthquake
		onEachFeature: function(feature,layer){

			layer.bindPopup(`<h3>Magnitude:${feature.properties.mag}</h3>\
				<h3>Location:${feature.properties.place}</h3>\
                <hr><p>${new Date(feature.properties.time)}</p>`);
         
		},
		pointToLayer:function(feature,latlng){
			return new L.circle(latlng,{
				radius: markerRadius(feature.properties.mag),
				fillColor: markerColor(feature.properties.mag),
				fillOpacity:.9,
				stroke:false,
			})
		}
	});
//Step 6 send the earthquakes layer to a createMap function
	createMap(earthquakes);
}
//Step 7 Create a createMap function to receive the earthquakes layer
function createMap(earthquakes) {
    // Step 8 Define outdoors, satellite and darkmap layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id:  "mapbox.outdoors-v11", 
        accessToken:API_KEY
      });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id:  "mapbox.satellite",        
        accessToken:API_KEY
      });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id:  "mapbox.dark-v10",  
        accessToken: API_KEY
    });
    // Step 9 Define a baseMaps object where to hold the base layers
    var baseMaps = {
    	"Outdoors": outdoors,
    	"Satellite": satellite,
    	"Dark Map": darkmap
    };
//============Tectonic plates here ===================
     // Step 10 Create a new layer for the tectonic plates
     var tectonicplates = new L.LayerGroup();
    //  Step 11 Create a GeoJSON layer for the platesData object and add it to to tectonicplates 
     d3.json(tectonicPlatesURL, function(plateData) {
           L.geoJSON(plateData,{
               color:"red",
               weight:2
           })
           .addTo(tectonicplates);
       });

//=========== Step 12 Create overlay object to hold our overlay layers here =========
    var overlayMaps ={
    	"Earthquakes": earthquakes,
    	"Tectonic Plates": tectonicplates
    };
  
//=========== My Map here =========
    // Step 13 Create myMap with center in San Francisco, with the dark map, earthquakes and tectonic plates 
    // layers to display on load
  	var myMap = L.map("map", {
  		center: [37.7704697,-122.4335514],
  		zoom: 5,
  		layers: [darkmap, earthquakes, tectonicplates]
  	}); 

    // Step 14 Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
  	L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

//=========Legend is here! =====

    //Step 15 Add legend
      var legend = L.control({position: 'bottomright'});

      legend.onAdd = function () {
      
          var div = L.DomUtil.create('div', 'info legend'),
              magnitudes = [0, 1, 2, 3, 4, 5];
      
          for (var i = 0; i < magnitudes.length; i++) {
              div.innerHTML +=
                  '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' + 
          + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
          }
      
          return div;
      };
      
      legend.addTo(myMap);
}

