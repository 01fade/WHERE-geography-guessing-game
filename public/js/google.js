// https://developers.google.com/maps/documentation/javascript/examples/marker-remove
var map;
var userMarkers = [];
var allMarkers = [];
var socket = io.connect();


function initialize() {

  // Create an array of styles.
  var styles = [
    {
      stylers: [
        { saturation: -10 },
        { lightness: -20 }
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
    zoom: 3,
    maxZoom: 5,
    minZoom: 2,
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
  
  // 
  // click listener only for PLAYERS
  // 

 socket.on('user update', function(_usersArray){
    usersArray = _usersArray;
    for (var i = usersArray.length - 1; i >= 0; i--) {
      if (usersArray[i].id == socket.io.engine.id){
        if (usersArray[i].host == false) {
          console.log("clicklistener: on, because host: " + usersArray[i].host);
          google.maps.event.addListener(map, 'click', function(event) {
              var marker = addMarker(event.latLng);
              socket.emit('marker', {
                  'name': name,
                  'lat': marker.position.k,
                  'lng': marker.position.D
              });
          });
        } else {
          console.log("clicklistener: off, because host: " + usersArray[i].host);
        }; //end of if else
      }; //end of if
    }; //end of for loop
  }); //end of socket.on

} //end of initialize

// 
// PLAYER Markers
// 

// Add a marker to the map and push to the array.
function addMarker(location) {
    clearMarkers();
    userMarkers = [];
    var marker = new google.maps.Marker({
        position: location,
        icon: iconColor,
        map: map,
        title: name
    });
    userMarkers.push(marker);
    console.log(location);
    console.log("marker: " + marker.position.k + " " + marker.position.D);
    return marker;
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < userMarkers.length; i++) {
    userMarkers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// 
// HOST Markers
// 

function showAllMarkers (location, colorUrl, nameFromArray) {
    var marker = new google.maps.Marker({
        position: location,
        icon: colorUrl,
        map: map,
        title: nameFromArray
    });
    allMarkers.push(marker);

    var location = new google.maps.LatLng(x0, y0);
    socket.emit('actual-location', {'lat': x0, 'lng': y0});
    var solutionTitle = "This is "+city+" in "+country+".";
    var findMarker = new google.maps.Marker({
      position: location,
      icon: "img/1.png",
      title: solutionTitle,
      map: map
    });      
    allMarkers.push(findMarker);
    return marker;
};

function setAllMapHost(map) {
  for (var i = 0; i < allMarkers.length; i++) {
    allMarkers[i].setMap(map);
  }
}

function clearMarkersHost() {
  setAllMapHost(null);
}

// not on window load, but when chosen HOST or PLAYER
// google.maps.event.addDomListener(window, 'load', initialize);
