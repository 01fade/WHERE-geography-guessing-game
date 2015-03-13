var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 9000;

// app.use(function(req, res, next) {
//   res.locals.ua = req.get('User-Agent');
//   console.log(res.locals.ua);
//   if(res.locals.ua.indexOf('Mac OS X') > -1) {
//   	console.log('Boom you are using a mac');
//   	res.redirect('/display.html');
//   } else {

//   }
//   next();
// });

app.use('/', express.static(__dirname + '/public'));

server.listen(port, function() {
    console.log('Server running at port:' + port);
});

var users = [];

io.on('connection', function(socket) {
    socket.emit('global message', 'hello, ' + socket.id);
    console.log(socket.id + ' just connected');
    addUser(socket.id);

    // Listening for chat message
    socket.on('marker', function(data) {
        console.log(socket.id + ' has sent: ' + data);
        // Emit to every clients
        io.sockets.emit('from clients', {
            user: data.name,
            msg: data.msg
        });
    });

    // A listener for socket disconnection
    socket.on('disconnect', function() {
        console.log(socket.id + ' just disconnected');
        io.sockets.emit('global message', socket.id + ' just disconnected');
        removeUser(socket.id);
    });
});

//
function addUser(user) {
	if(users.indexOf(user) === -1) {
		users.push(user);
	}
	console.log('current users: ' + users.length);
}

function removeUser(user) {
	users.splice(user, 1);
	console.log('current users: ' + users.length);
}
