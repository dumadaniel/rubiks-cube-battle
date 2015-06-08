var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var scrambler = require('./scrambler.js');
var timer = require('./timer.js');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socketio(server);
var clients = [];

scrambler["333"].initialize(null, Math);
var currentScramble = scrambler["333"].getRandomScramble().scramble_string;

var readyPlayers = 0;
var timers = {};
var activeTimers = {};

//y, r, o, b, g
var colors = ["#D9FE01", "#BF0916", "#FF4900", "#012C7B", "#01E230"]

/**
 *	On connect, show all current players to new player
 */
io.on('connection', function(socket) {
	clients.push(socket);
	timers[socket.id] = new timer();
	socket.emit('set player', socket.id);
	for (var i=0; i<clients.length; i++) {
		if (clients[i] === socket) { continue; }
		socket.emit('add player', clients[i].id, clients[i].username);
	}
	console.log('opened connection', clients.indexOf(socket));

	/**
	 *	On login, set scramble and add player to all open clients
	 */
	socket.on('new player', function(username) {
		socket.emit('set scramble', currentScramble);
		socket.broadcast.emit('add player', socket.id, username);
		this.username = username;
	});

	/**
	 *	On player hands down, reset player's timer
	 */
	socket.on('hands down', function() {
		timers[socket.id].reset();
		console.log(socket.username, 'hands down');
		socket.broadcast.emit('hands down', socket.id);
		if (clients.length === ++readyPlayers) {
			console.log('Everyone is Ready!');
		}
	});

	/**
	 *	On player hands up, start timer and
	 *	repeatedly update timer on all open clients
	 */
	socket.on('hands up', function() {
		--readyPlayers;
		timers[socket.id].start();
		activeTimers[socket.id] = setInterval(function() {
			io.emit('update timer', socket.id, timers[socket.id].time());
		}, 100);
		socket.broadcast.emit('hands up', socket.id);
		console.log(socket.username, 'hands up', readyPlayers);
	});

	/**
	 *	On stop timer, stop timer and end timer updates
	 */
	socket.on('stop timer', function() {
		if (activeTimers[socket.id]) {
			timers[socket.id].stop();
			io.emit('update timer', socket.id, timers[socket.id].time());
			clearInterval(activeTimers[socket.id]);
		}
	});

	/**
	 *	On disconnect, remove player from all open clients
	 */
	socket.on('disconnect', function() {
		var index = clients.indexOf(socket);
		if (index != -1) {
			clients.splice(index, 1);
		}
		socket.broadcast.emit('remove player', socket.id);
		console.log('closed connection', index);
	});
});

server.listen(process.env.PORT || 8080);