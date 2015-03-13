var x1, y1, x2, y2;
var city;

//http://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
function getDistanceFromLatLonInKm (lat1,lon1,lat2,lon2) {
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
  $("#prompt").html("You missed "+city+" by <b>"+d+" km.</b>");
  console.log ("distance: " + d + "km");
}

function deg2rad (deg) {
  return deg * (Math.PI/180)
}

function latlnguser ( callback ) {
  x2 = markers[0].position.k;
  y2 = markers[0].position.D;
  callback && callback();
};

function latlngsearch () {
  var id = Math.floor(Math.random() * 10567); // real id +1
  console.log("random id: " + id);
  var localjson = 'cities.json';
  $.ajax ({
    url: localjson,
    dataType: "json",
    success: function (response){
      x1 = response[id].latitude;
      y1 = response[id].longitude;
      city = response[id].city;
      $("#prompt").html("<b>Where is "+response[id].city+", "+response[id].country+"?</b>");
      console.log(response[id].city + " " + x1 + " "+ y1);
    }
  });
};
 
function countdown() {
  //http://stackoverflow.com/questions/3089475/how-can-i-create-a-5-second-countdown-timer-with-jquery-that-ends-with-a-login-p
  var counter = 8;
  var interval = setInterval(function() {
      counter--;
      $("#count").html(" Play again in "+counter+" sec.");
      if (counter == 0) {
          $("#count").html(" ");
          clearInterval(interval);
      }
  }, 1000);
} 

function submit () {
  latlnguser( function (){ 
      getDistanceFromLatLonInKm(x1, y1, x2, y2);


      var location = new google.maps.LatLng(x1, y1);
      console.log(location);
      var marker = new google.maps.Marker({
        position: location,
        map: map
      });
      markers.push(marker);

      countdown();

      setTimeout(function(){ 
        clearMarkers();
        markers = [];
        latlngsearch();
      }, 8000);
  });
};



