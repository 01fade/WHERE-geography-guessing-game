// https://developers.google.com/maps/documentation/javascript/examples/marker-remove
var map;
var markers = [];

function initialize() {

  // Create an array of styles.
  var styles = [
    {
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "off" }
      ]
    },{
      //important no city labels
      featureType: "all",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];

  // Create a new StyledMapType object, passing it the array of styles,
  // as well as the name to be displayed on the map type control.
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

  var centerworld = new google.maps.LatLng(35, -9);
  var mapOptions = {
    zoom: 2,
    center: centerworld,
    disableDefaultUI: true,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  };

  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');


  // This event listener will call addMarker() when the map is clicked.
  google.maps.event.addListener(map, 'click', function(event) {
    addMarker(event.latLng);
  });
}

// Add a marker to the map and push to the array.
function addMarker(location) {
  clearMarkers();
  markers = [];
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);
  console.log(location);
  console.log("marker: "+markers[0].position.k+" "+markers[0].position.D);
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

google.maps.event.addDomListener(window, 'load', initialize);
