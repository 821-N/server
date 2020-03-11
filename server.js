const Express = require('express');
const BodyParser = require('body-parser');
const Room = require('./room.js');

const app = Express();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

app.use(BodyParser.text({type: "text/*"}));
app.use(BodyParser.json());

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



var rooms = {};

function getRoom(name) {
	if (rooms[name])
		return rooms[name];
	return rooms[name] = new Room(name);
}

// send
app.post('/', function (req, res) {
	console.log("post", req.body);
	console.log(req.headers);
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

app.listen(9998, function () {
	console.log("starting")
})
