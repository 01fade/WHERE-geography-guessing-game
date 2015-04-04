var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var port = 3000;


app.use('/', express.static(__dirname + '/public'));

server.listen(port, function() {
    console.log('Server running at port:' + port);
});

var users = [];
var obj; // to store json data
var x0; // find-city lat
var y0; // find-city lng
var city;
var country;
var colorIndex = 1;
var score;

// listen for incoming connections from client
io.on('connection', function(socket) {
    console.log(socket.id + ' just connected');
    addUser(socket.id);
    sendFindCity();

    // A listener for socket disconnection
    socket.on('disconnect', function() {
    console.log(socket.id + ' just disconnected');
    removeUser(socket.id);
    });

    // start listening for coordinates
    //Listen for a marker event from a player
    socket.on('marker', function(data) {
        console.log(socket.id + 'marker latitude: ' + data.lat + ', marker longitude:' + data.lng);
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].id == socket.id) {
                users[i].latitude = data.lat;
                users[i].longitude = data.lng;
                users[i].name = data.name;
                console.log(users);
            };
        };
        socket.emit('user update', users);
    });

    socket.on('host', function(_socketid){
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].id == _socketid) {
                users[i].host = true;
                console.log(users);
            };
        };
        socket.emit('user update', users);
    });

    socket.on('player', function(_socketid){
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].id == _socketid) {
                users[i].host = false;
                console.log(users);
            };
        };
        socket.emit('user update', users);
    });

    socket.on('check', function (){
        // only to host
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].host == true){
                var hostid = users[i].id;
                io.to(hostid).emit('show-marker', users);
            };
        };        
    });

    socket.on('new game', function( hostid ){
        //start from the beginning
        startRound();
        io.sockets.emit('reset for new round');
    });

    socket.on('reset', function( hostid ){
        io.sockets.emit('reset for new game');
        //reset data
        for (var i = users.length - 1; i >= 0; i--) {
            users[i].score = 0;
            users[i].host = false;
        };
        //start from the beginning
        startRound();
        sendFindCity();
    });

    socket.on('actual-location', function(data){
        console.log('actual latitude: '+ data.lat + ', actual longitude: ' + data.lng);
    });

    socket.on('distance-missed', function(data){
    console.log(data.name + ' missed by: ', data.km + 'km');
    });

    socket.on('winner', function(data){
        var winnerIndex; //in users array
        for (var i = data.length - 1; i >= 0; i--) {
            if (data[i].name !== undefined){ //== if not host
                //data has obj with winner (bool) and distance and name
                if (data[i].winner == true){
                    console.log(data[i].name + " is the winner!");
                    //look for name (of winner) in users array
                    for (var y = users.length - 1; y >= 0; y--) {
                        //check y's names for match to winner id
                        if (users[y].name == data[i].name) { //checks if the name in the users array (server side) matches with the data array (was passed by the client side)
                            console.log("users[y].name "+y+users[y].name)
                            console.log("data[i].name "+i+data[i].name)
                            var id = users[y].id;
                            winnerIndex = y;
                            io.to(id).emit('winning distance', data[i].distance);
                            users[y].score += 10;
                            console.log(users[y].name+"'s score: "+users[y].score);
                            io.to(id).emit('player scores', users[y].score);
                        };  
                    };
                } else {
                    for (var z = users.length - 1; z >= 0; z--) {
                        if (z != winnerIndex) { //everyone that winner != true
                            var id = users[z].id;
                            console.log(users[z].name+"'s score: "+users[z].score);
                            io.to(id).emit('losing distance', data[i].distance);
                            io.to(id).emit('player scores', users[z].score);
                        };
                    };
                };
            };
        };
        io.sockets.emit('scores ready', users)
    });
});

//
function addUser(user, socket) {
	if(users.indexOf(user) === -1) {
        var id = user; //user = socket.id
        if (colorIndex > 17) {
            colorIndex = 1;
        } else { 
            colorIndex = colorIndex + 1;
        }
        var userObj = {
            id: id,
            colorIndex: colorIndex,
            score: 0
        };
		users.push(userObj);
	}
	console.log('current players: ' + users.length);
    console.log(users);
    io.sockets.emit('new user', users);
}

function removeUser(user) {
	users.splice(user, 1);
	console.log('current users: ' + users.length);
}

function findCity () {
  var id = Math.floor(Math.random() * 238);
  console.log("random id: " + id);

  fs.readFile('world-capitals.json', 'utf8' , function(err, res) {
    obj = JSON.parse(res);
    x0 = obj[id].latitude;
    y0 = obj[id].longitude;
    city = obj[id].city;
    country = obj[id].country;
    console.log(obj[id].city);
    sendFindCity();
  });
};

function sendFindCity (){
    var findData = {
        "city": city,
        "country": country,
        "latitude": x0,
        "longitude": y0
    };
    // broadcast = to all, but the one who started
    // socket.broadcast.emit('find-city', findData);
    // io.sockets = to ALL
    io.sockets.emit('find-city', findData);
};

function startRound() {
    findCity();
};
//random city when app starts
startRound();
