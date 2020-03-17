var SERVER = "http://localhost:9998";

function register(username, password, cb) {
	var x = new XMLHttpRequest();
	x.open('POST', SERVER+"/register");
	x.setRequestHeader('username', username);
	x.setRequestHeader('password', password);
	x.onload = cb;
	x.send();
}

function login(username, password, cb) {
	var x = new XMLHttpRequest();
	x.open('GET', SERVER+"/login");
	x.setRequestHeader('username', username);
	x.setRequestHeader('password', password);
	x.onload = function() {
		cb(x.response);
	};
	x.send();
}

function longPoll(auth, room, id, cb, cancel) {
	var x = new XMLHttpRequest();
	cancel[0] = function() {
		x.abort();
	}
	x.open('GET', SERVER+"/?room="+encodeURIComponent(room));
	console.log("huh?", auth);
	x.setRequestHeader('Auth', auth);
	if (id)
		x.setRequestHeader('id', id);
	x.onload = function() {
		var id = x.getResponseHeader('id');
		var messages = JSON.parse(x.response);
		cb(messages, id);
	}
	x.send();
}

function sendMessage(auth, room, message, cb) {
	var x = new XMLHttpRequest();
	x.open('POST', SERVER+"/?room="+encodeURIComponent(room));
	x.setRequestHeader('auth', auth);
	x.onload = cb;
	x.send(message);
	return x;
}

function run(auth, room, id, display, cancel) {
	longPoll(auth, room, id, function(messages, id) {
		for(var i=0;i<messages.length;i++){
			display(messages[i]);
		}
		var t = setTimeout(function(){
			run(auth, room, id, display, cancel)
		}, 0);
		cancel[0] = function() {
			clearTimeout(t);
		};
	}, cancel);
}

