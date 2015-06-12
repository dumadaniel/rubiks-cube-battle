$(document).ready(function() {
	var socket;

	var usernameInput = $('#username');
	usernameInput.focus();

	$(function () {
	  $('[data-toggle="tooltip"]').tooltip()
	})

	var setScramble = function(newScramble) {
		$('.scramble').text(newScramble);
	};

	/**
	 *	Player functions
	 */

	usernameInput.on('keydown', function(event) {
		if (event.keyCode != 13) { return; }

		socket = io();
		initializeSocket(socket);
		socket.emit('new player', usernameInput.val());

		$(".main-player .name").text(usernameInput.val());
		$(".profile-button a").text(usernameInput.val());
		usernameInput.val('');
		usernameInput.hide();
		$(".nav").fadeIn();
	});

	var setMainPlayer = function(id) {
		$(".main-player").attr("id", id);
		$(".main").fadeIn();
	};

	var addPlayer = function(id, username) {
		var playerElement = jQuery("<div/>", {
			class: "player", 
		    id: id
		});

		jQuery("<h4/>", {
			class: "timer", 
			text: "00:00.000"
		}).appendTo(playerElement);

		jQuery("<p/>", {
			class: "name", 
			text: username
		}).appendTo(playerElement);

		$('.players').append(playerElement);
	};

	var removePlayer = function(id) {
		$('#'+id).remove();
	};

	var playerHandsDown = function(id) {
		$("#"+id+" .timer").css('color', '#32cd32');
	};

	var playerHandsUp = function(id) {
		$("#"+id+" .timer").css('color', 'black');
	};

	var showMessage = function(msg) {
		$(".message").text(msg);
	};

	/**
	 *	Timer functions
	 */

	var handsDown = false;
	var ready = false;
	var allReady = false;
	var timerActive = false;
	var emitHandsDown = function(id, down) {
		if (down) {
			ready = true;
			playerHandsDown(id);
			socket.emit('hands down');
		}
	};

	$(this).on('keydown', function(event) {
		if (event.keyCode == 32 && timerActive) {
			socket.emit('stop timer');
			timerActive = false;
			return;
		}
		if (event.keyCode != 32 || handsDown) {
			return;
		}

		if (socket) {
			handsDown = true;
			setTimeout(function() {
				emitHandsDown(socket.id, handsDown);
			}, 1000);
		}
	});

	$(this).on('keyup', function(event) {
		if (event.keyCode != 32) { return; }

		if (socket) {
			handsDown = false;
			playerHandsUp(socket.id);

			if (ready && !allReady) {
				ready = false;
				socket.emit('hands up');
			}
			else if (ready && allReady) {
				ready = false;
				allReady = false;
				timerActive = true;
				socket.emit('start timer');
			}
		}
	});

	var updateTimer = function(id, time) {
		$("#"+id+" .timer").css('color', 'blue');
		$("#"+id+" .timer").text(time);
	};

	var setAllReady = function() {
		allReady = true;
		$(".message").text("");
		$(".timer").text('Ready').css('color', '#32cd32');
	};

	/**
	 *	When user logs in initialize socket with event listeners
	 */
	var initializeSocket = function(socket) {
		socket.on('set scramble', setScramble);
		socket.on('set player', setMainPlayer);
		socket.on('add player', addPlayer);
		socket.on('remove player', removePlayer);
		socket.on('hands down', playerHandsDown);
		socket.on('hands up', playerHandsUp);
		socket.on('update timer', updateTimer);
		socket.on('all ready', setAllReady);
		socket.on('show message', showMessage);
	};
});