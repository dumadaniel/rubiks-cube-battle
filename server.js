var http = require('http');
var express = require('express');
var socketio = require('socket-io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socketio(server);

io.on('connection', function(socket) {
	// Connect actions
	
	socket.on('disconnect', function() {
		// Disconnect actions
	});
});

server.listen(8080);