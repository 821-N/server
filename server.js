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
	password: "TestUser",
};

function lookupAuth(auth) {
	if (keys[auth] === undefined) {
		return null;
	}
	return keys[auth];
}

// returns room, user, error
function process(req) {
	var auth = req.headers.auth;
	if (!auth)
		return [null, null, "Missing auth token"];
	var user = lookupAuth(auth);
	if (!user)
		return [null, null, "Invalid auth token"];
	var room = req.query.room;
	if (room == undefined)
		return [null, null, "Missing room query parameter"]
	var room = getRoom(room)
	if (!room)
		return [null, null, "Invalid room"];
	return [room, user, null];
}

app.get('/', function (req, res) {
	var [room, user, err] = process(req);
	if (err) {
		// todo: better status codes
		res.status(404);
		res.send(err);
		return;
	}
	
	var id = req.headers.id;
	
	var callback = (messages, id) => {
		res.set('id', id);
		res.json(messages);
		res.end();
	}
	callback.id = id;
	room.addResponse(callback);
});

var rooms = {};
function getRoom(name) {
	if (rooms[name])
		return rooms[name];
	return rooms[name] = new Room(name);
}

// send
app.post('/', function (req, res) {
	var [room, user, err] = process(req);
	if (err) {
		// todo: better status codes
		res.status(404);
		res.send(err);
		return;
	}
	var message = req.body;
	if (message === undefined) {
		res.status(404).send("Missing message");
		return;
	}
	res.end();
	room.post(message);
});

app.listen(9998, () => {
	console.log("starting")
})
