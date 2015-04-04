var x1, y1, x0, y0;
var city;
var country;
var socket = io.connect();
var sortedDistance = [];
var namesDistance = [];

//http://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
function getDistanceFromLatLonInKm (lat1,lon1,lat2,lon2, _name) {
  if (lat2 !== undefined) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      d = Math.floor(d);

      sortedDistance.push(d);
      sortedDistance.sort(function(a, b){return a-b}); //sort ascending
      namesDistance.push({"distance": d, "name": _name}); //players and their distances

      console.log (_name + "distance: " + d + "km");
      socket.emit('distance-missed', {'km': d, 'name': _name});
  };
};

function deg2rad (deg) {
  return deg * (Math.PI/180)
}

socket.on('show-marker', function (_users) {
  //in case you one clicks "check" twice it clears all markers for host
  clearMarkersHost();
  allMarkers = [];
  sortedDistance = []; //clear
  namesDistance = []; //clear
  //store users array for client side access
  usersArray = _users;


  for (var i = _users.length - 1; i >= 0; i--) {
    if (_users[i].id != socket.io.engine.id) {
      console.log("current players: " + _users.length);
      var x = _users[i].latitude;
      var y = _users[i].longitude;
      if (_users[i].latitude !== undefined){
        var location = new google.maps.LatLng(x, y);
        var number = _users[i].colorIndex;
        var colorUrl = icons[number].url;
        var nameFromArray = _users[i].name;
        //show users' markers on host site
        showAllMarkers(location, colorUrl, nameFromArray);
        //calculate distance for each
        getDistanceFromLatLonInKm(x0, y0, usersArray[i].latitude, usersArray[i].longitude, usersArray[i].name);
      };
    };
  };

  // sortedDistance is array of shortest to farthest distances
  //namesDistance has objects with names of players and distance
  for (var i = namesDistance.length - 1; i >= 0; i--) {
    namesDistance[i].winner = false;
    console.log(namesDistance);
    if (namesDistance[i].distance == sortedDistance[0]){
      var winner = namesDistance[i].name;
      namesDistance[i].winner = true;
      socket.emit('winner', namesDistance);
      $("#winner-bar").html("<br><br><b>"+winner+"</b> won.");
    };
  };
});


//emit to all: the random city to find
socket.on('find-city', function (findData){
  x0 = findData.latitude;
  y0 = findData.longitude;
  city = findData.city;
  country = findData.country;
  console.log("findData: " + city + " " + country);
  //host screen
  $("#prompt").html("Where is <b>"+city+"</b>, "+country+"?");
  $("#winner-bar").html(" ");
  //player screen
  $("#result").html("Where is <b>"+city+"</b>, "+country+"?");
});

