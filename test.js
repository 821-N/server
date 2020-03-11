const Express = require('express');
const app = Express();
const BodyParser = require('body-parser');

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

app.use(BodyParser.text({ type: 'text/*' }));
app.use(BodyParser.json());

var requestCounter = 0;

var responses = [];

var keys = {
	password: "12Me21"
}

function lookupAuth(auth) {
	if (keys[auth] === undefined) {
		return null;
	}
	return keys[auth];
}

app.get('/', function (req, res) {
	var room = req.query.room;
	if (room === undefined) {
		res.status(404).send("missing room parameter");
		return;
	}
	var auth = req.headers.auth;
	if (auth === undefined) {
		res.status(404).send("missing auth header");
		return;
	}

	room = getRoom(room);
	
	var id = req.headers.id;
	if (id === undefined) {
		res.set("id", room.nextId());
		res.json(room.fromId());
		res.end();
	} else {
		room.addResponse(res, id);
	}
});

class Room {
	constructor(name) {
		this.name = name;
		this.messages = [];
		this.requests = [];
	}

	gotMessage(message) {
		this.messages.push(message);
		console.log("got message: "+message+" in room "+this);
		
		var nq = [];
		for (var [res, id] of this.requests) {
			var messages = this.fromId(id);
			if (messages) {
				res.json(messages);
				res.end();
			} else {
				nq.push([res, id]);
			}
		}
		this.requests = nq;
	}

	addResponse(res, id) {
		this.requests.push([res, id]);
	}
	
	fromId(id = this.nextId() - 3) {
		if (id < 0)
			id = 0;
		if (id >= this.messages.length)
			return null;
		return this.messages.slice(id);
	}
		
	nextId() {
		return this.messages.length;
	}

	toString() {
		return "["+this.name+"]";
	}
}

var rooms = {};

function getRoom(name) {
	if (rooms[name])
		return rooms[name];
	return rooms[name] = new Room(name);
}

// send
app.post('/', function (req, res) {
	console.log("post", req.body);
	var room = req.query.room;
	if (room === undefined) {
		res.status(404).send("missing room parameter");
		return;
	}
	var auth = req.headers.auth;
	if (auth === undefined) {
		res.status(404).send("missing auth header");
		return;
	}
	var message = req.body;
	if (message === undefined) {
		res.status(404).send("missing body");
		return;
	}
	// check auth
	if (auth !== "password") {
		res.status(404).send("bad auth");
		return;
	}
	room = getRoom(room);
	room.gotMessage(message);
	res.end();
});
/*	res.end();
	responses.forEach((res)=>{
		res.send(req.body);
		res.end();
	})
*/

app.listen(9998, function () {
	console.log("starting")
})
