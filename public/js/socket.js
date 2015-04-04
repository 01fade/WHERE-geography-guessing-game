var app = {};
var usersArray;
var name;
var iconColor;

app.init = function() {
  hashRouter();
  location.hash = ''; // Refresh hash
  location.hash = '#start';     
  attachEvents();
};

function attachEvents () {
  $('#start-host').on('click', function() {
    location.hash = '#host';
    socket.emit('host', socket.io.engine.id);
  });
  $('#start-player').on('click', function() {
    location.hash = '#player';
    socket.emit('player', socket.io.engine.id);
  });
  $('#check').on('click', function() {
    $(this).prop('disabled', true);
    $('#view-scoreboard').hide();
    $("#scorelist").html(" ");
    socket.emit('check');
  });
  $('#new-game').on('click', function() {
    $("#check").prop('disabled', false);
    console.log("new game!!!")
    $('#view-scoreboard').hide();
    socket.emit('new game', socket.io.engine.id);
    //clear the markers on host screen
    clearMarkersHost();
    allMarkers = [];
  });
  $('#reset').on('click', function() {
    console.log("reset!!!")
    socket.emit('reset', socket.io.engine.id);
    //clear the markers on host screen
    clearMarkersHost();
    allMarkers = [];
  });
  $('#scoreboard').on('click', function() {
    $('#view-scoreboard').show();
  });
  $('#close').on('click', function() {
    $('#view-scoreboard').hide();
  });
};

function hashRouter() {
  $(window).off('hashchange').on('hashchange', function() {
    if (location.hash == '#start') {
      renderStart();
    } else if (location.hash == '#host') {
      renderHost();
    } else {
      renderPlayer();
    };
    attachEvents();
  });
};


function renderStart () {
  var tplToCompile = $('#tpl-start').html();
  var compiled = _.template(tplToCompile, {
  });
  $('#container').html(compiled);
};

function renderHost () {
  var tplToCompile = $('#tpl-host').html();
  var compiled = _.template(tplToCompile, {
      city: city,
      country: country,
  });
  $('#container').html(compiled);
  $('#view-scoreboard').hide();
  //start google maps (styles)
  initialize();
};

function renderPlayer () {
  name = prompt("Please enter your name", "Supertramp" + Math.floor(Math.random()*100));
  var tplToCompile = $('#tpl-player').html();
  var compiled = _.template(tplToCompile, {
      name: name,
      city: city,
      country: country,
  });
  $('#container').html(compiled);
  $('#view-scoreboard').hide();
  //start google maps (styles)
  initialize();
};

socket.on('new user', function(_usersArray){
  console.log("socket.io.engine.id " + socket.io.engine.id);
  usersArray = _usersArray;
  console.log(_usersArray);
  for (var i = _usersArray.length - 1; i >= 0; i--) {
    if (_usersArray[i].id == socket.io.engine.id) {
      console.log("colorIndex: " + _usersArray[i].colorIndex);
      var number = _usersArray[i].colorIndex;
      iconColor = icons[number].url;
    };
  };
});

socket.on('winning distance', function( _distance){
  $("#result").html("<b>You won, yay!</b> (Missed by "+_distance+" km)");
});

socket.on('losing distance', function( _distance){
  $("#result").html("<b>Sorry, you lost!</b> (Missed by "+_distance+" km)");
});

socket.on('player scores', function (score){
  $("#player-scores").html(" ( "+score+" )");
  console.log("my score "+score);
});

socket.on('reset for new game', function(){
  // location.hash = '#start';   
  window.location.reload();  
});

socket.on('scores ready', function(users){
  $("#scoreboard").prop('disabled', false);
  console.log(users);
  function keysrt(key,desc) {
    return function(a,b){
     return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
    }
  }
  users.sort(keysrt('score')).reverse(); // sort by score ascending and then reverse
  for(var i in users){
    if (users[i].name !== undefined){
      $('<li>', {text: ' ( ' + users[i].score + ' )  ' + users[i].name}).appendTo('#scorelist');
    };
  };
});

app.init();
