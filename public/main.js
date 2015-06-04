$(document).ready(function() {
	var socket;

	var usernameInput = $('#username');
	usernameInput.focus();

	var setScramble = function(newScramble) {
		$('#scramble').text(newScramble);
	};

	/**
	 *	Player functions
	 */

	usernameInput.on('keydown', function(event) {
		if (event.keyCode != 13) { return; }

		socket = io();
		initializeSocket(socket);
		socket.emit('new player', usernameInput.val());

		// why can't I get socket.id here ??
		addPlayer("me", usernameInput.val());
		usernameInput.val('');
		usernameInput.hide();
	});

	var addPlayer = function(id, username) {
		jQuery("<div/>", {
	    id: id,
	    text: username+" "
		}).append(jQuery("<span/>", {
			class: "timer", 
			text: "0:0.000"
		})).appendTo($('#players'));
	};

	var playerHandsDown = function(id) {
		$("#"+id+" .timer").css('color', '#32cd32');
	};

	var playerHandsUp = function(id) {
		$("#"+id+" .timer").css('color', 'black');
	}

	/**
	 *	Timer functions
	 */

	var handsDown = false;
	var ready = false;
	var emitReady = function(id, down) {
		console.log('timeout handsDown:', down);
		if (down) {
			ready = true;
			playerHandsDown(id);
			socket.emit('hands down');
		}
	};

	$(this).on('keydown', function(event) {
		if (event.keyCode != 32 || handsDown) { return; }

		if (socket) {
			handsDown = true;
			setTimeout(function() {
				emitReady("me", handsDown);
			}, 2000);
		}
	});

	$(this).on('keyup', function(event) {
		if (event.keyCode != 32) { return; }

		if (socket) {
			handsDown = false;
			if (ready) {
				ready = false;
				playerHandsUp("me");
				socket.emit('hands up');
			}
		}
	});

	/**
	 *	When user logs in initialize socket with event listeners
	 */
	var initializeSocket = function(socket) {
		socket.on('set scramble', setScramble);
		socket.on('add player', addPlayer);
		socket.on('hands down', playerHandsDown);
		socket.on('hands up', playerHandsUp);
	};
});