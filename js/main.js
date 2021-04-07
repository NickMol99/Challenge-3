// API Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoibmlja3Jtb2wiLCJhIjoiY2tta2ppYmJ5MTFtMjJ4bXFuOHg3eGE1MSJ9.39pLiqnYMxhSXonIFxvlrg';

// API openWeatherMap
var openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather';
var openWeatherMapUrlApiKey = '6b3adeb78c820e4025b76b982a28f56b';

// Map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11',
    center: [5.508852, 52.142480],
    zoom: 7
  });

// Steden
var steden = [
    {
      name: 'Amsterdam',
      coordinates: [4.895168, 52.370216]
    },
    {
      name: 'Utrecht',
      coordinates: [5.1214201, 52.0907374]
    },
    {
      name: 'Leiden',
      coordinates: [4.49306, 52.15833]
    },
  ];

map.on('load', function () {
    steden.forEach(function(city) {
      var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapUrlApiKey + '&lon=' + city.coordinates[0] + '&lat=' + city.coordinates[1];
      
      fetch(request)
        .then(function(response) {
          if(!response.ok) throw Error(response.statusText);
          return response.json();
        })
        .then(function(response) {
          plotImageOnMap(response.weather[0].icon, city)
        })
        .catch(function (error) {
          console.log('ERROR:', error);
        });
    });
  });

function plotImageOnMap(icon, city) {
  map.loadImage(
    'https://openweathermap.org/img/w/' + icon + '.png',
    function (error, image) {
      if (error) throw error;
      map.addImage("weatherIcon_" + city.name, image);
      map.addSource("point_" + city.name, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: city.coordinates
            }
          }]
        }
      });
      map.addLayer({
        id: "points_" + city.name,
        type: "symbol",
        source: "point_" + city.name,
        layout: {
          "icon-image": "weatherIcon_" + city.name,
          "icon-size": 1.3
        }
      });
    }
  );
}

// Pop up
map.on('load', function () {
    map.addSource('places', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': myLocationsList
      }
    });

    map.addLayer({
      'id': 'places',
      'type': 'symbol',
      'source': 'places',
      'layout': {
        'icon-image': '{icon}-15',
        'icon-allow-overlap': true
      }
    });
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    map.on('mouseenter', 'places', function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;
    popup.setLngLat(coordinates)
           .setHTML(description)
           .addTo(map);
    });
    map.on('mouseleave', 'places', function () {
      popup.remove();
    });
  });
