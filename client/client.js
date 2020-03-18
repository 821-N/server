var SERVER = "http://i32.tech/chat";

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

function logout(username, password, cb) {
	var x = new XMLHttpRequest();
	x.open('GET', SERVER+"/logout");
	x.setRequestHeader('username', username);
	x.setRequestHeader('password', password);
	x.onload = function() {
		cb();
	};
	x.send();
}

function longPoll(auth, room, id, cb, cancel) {
	console.log("request");
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
		console.log("response!");
		var id = x.getResponseHeader('id');
		if (x.status != 200) {
			alert("Error: "+x.response);
		} else {
			var messages = JSON.parse(x.response);
			cb(messages, id);
		}
	}
	x.ontimeout = function(){
		console.log("TIMEOUT!");
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

