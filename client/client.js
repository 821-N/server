var SERVER = "http://i32.tech/chat";

function register(username, password, cb) {
	var x = new XMLHttpRequest();
	x.open('POST', SERVER+"/register");
	x.setRequestHeader('username', username);
	x.setRequestHeader('password', password);
	x.onload = function() {
		if (x.status==200)
			cb();
		else
			cb(x.response);
	};
	x.onerror = function() {
		cb("Server is down");
	}
	x.send();
}

function login(username, password, cb) {
	var x = new XMLHttpRequest();
	x.open('GET', SERVER+"/login");
	x.setRequestHeader('username', username);
	x.setRequestHeader('password', password);
	x.onload = function() {
		if (x.status==200)
			cb(x.response);
		else
			cb(null, x.response);
	};
	x.onerror = function() {
		cb(null, "Server is down");
	}
	x.send();
}

function logout(auth, cb) {
	var x = new XMLHttpRequest();
	x.open('GET', SERVER+"/logout");
	x.setRequestHeader('auth', auth);
	x.onload = function() {
		if (x.status==200)
			cb();
		else
			cb(x.response);
	};
	x.onerror = function() {
		cb("Server is down");
	}
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
			if (x.status == 403) {
				error("Session expired, please log in again");
			} else {
				error("Error getting messages: "+x.response);
			}
		} else {
			var messages = JSON.parse(x.response);
			cb(messages, id);
		}
	}
	x.onerror = function() {
		error("Server is down");
	}
	x.ontimeout = function(){
		error("Connection timeout!");
	}
	x.send();
}

function sendMessage(auth, room, message, cb) {
	var x = new XMLHttpRequest();
	x.open('POST', SERVER+"/?room="+encodeURIComponent(room));
	x.setRequestHeader('auth', auth);
	x.setRequestHeader('Content-Type', "text/plain");
	x.onload = function(){
		if (x.status != 200)
			cb(x.response);
		else
			cb();
	}
	x.onerror = function() {
		cb("Server is down");
	}
	x.send(message);
	return x;
}

function run(auth, room, id, display, cancel, first) {
	longPoll(auth, room, id, function(data, id) {
		if (data.messages) {
			for(var i=0;i<data.messages.length;i++){
				display(data.messages[i], first);
			}
		}
		var t = setTimeout(function(){
			run(auth, room, id, display, cancel)
		}, 0);
		cancel[0] = function() {
			clearTimeout(t);
		};
	}, cancel);
}

/*function error(message) {
	if (message)
		alert(message);
}*/
