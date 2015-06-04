var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var scrambler = require('./scrambler.js');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socketio(server);
var clients = [];

scrambler["333"].initialize(null, Math);
var currentScramble = scrambler["333"].getRandomScramble().scramble_string;

var readyPlayers = 0;

io.on('connection', function(socket) {
	clients.push(socket);
	for (var i=0; i<clients.length; i++) {
		if (clients[i] === socket) { continue; }
		socket.emit('add player', clients[i].id, clients[i].username);
	}
	console.log('opened connection', clients.indexOf(socket));

	socket.on('new player', function(username) {
		socket.emit('set scramble', currentScramble);
		socket.broadcast.emit('add player', socket.id, username);
		this.username = username;
	});

	socket.on('hands down', function() {
		console.log(socket.username, 'hands down');
		socket.broadcast.emit('hands down', socket.id);
		if (clients.length === ++readyPlayers) {
			console.log('Everyone is Ready!');
		}
	});

	socket.on('hands up', function() {
		--readyPlayers;
		socket.broadcast.emit('hands up', socket.id);
		console.log(socket.username, 'hands up', readyPlayers);
	});
	
	socket.on('disconnect', function() {
		var index = clients.indexOf(socket);
		if (index != -1) {
			clients.splice(index, 1);
		}
		socket.broadcast.emit('remove player', socket.id);
		console.log('closed connection', index);
	});
});

server.listen(8080);