const Express = require('express');
const BodyParser = require('body-parser');
const Room = require('./room.js');
const User = require('./user.js');

class Server {
	constructor(port) {
		var app = Express();
		app.use((req, res, next) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "*");
			next();
		});
		app.use(BodyParser.text({type: "text/*"}));
		app.use(BodyParser.json());
		// this is a list of every user that is currently logged in
		this.auths = {
			password: new User({
				uid: 2,
				name: "TestUser",
			}),
		}
		this.app = app;
		this.port = port;
		this.rooms = {};

		// GET / - request receive messages
		app.get('/', (req, res) => {
			var [user, room] = this.process(req, res);
			if (!user)
				return;
			user.onRequest(room);
			user.setOnline(true);
			
			var id = req.headers.id;
			
			var dc = () => {
				user.onClose(room);
				console.log("client disconnected!");
			};
			
			var callback = (messages, id) => {
				res.set('id', id);
				res.json(messages);

				req.removeListener('close', dc);
				user.onResponse(room);
			}
			req.on('close', dc);
			callback.id = id;
			room.addResponse(callback);
		});

		// POST / - send message
		app.post('/', (req, res) => {
			var [user, room] = this.process(req, res);
			if (!user)
				return;
			var message = req.body;
			if (message === undefined) {
				res.status(404).send("Missing message");
				return;
			}
			res.end();
			room.post(message);
		});
	}

	start() {
		this.app.listen(this.port, () => {
			console.log("Starting server on port: "+this.port);
		})
	}

	lookupAuth(auth) {
		if (this.auths[auth] === undefined) {
			return null;
		}
		return this.auths[auth];
	}
	
	getRequestUser(req) {
		var auth = req.headers.auth;
		if (!auth)
			return [null, 401, "Missing auth token"];
		var user = this.lookupAuth(auth);
		if (!user)
			return [null, 403, "Invalid auth token"];
		return [user, null, null];
	}

	getRequestRoom(req) {
		var room = req.query.room;
		if (room == undefined)
			return [null, 400, "Missing room query parameter"];
		var room = this.getRoom(room);
		if (!room)
			return [null, 404, "Invalid room"];
		return [room, null, null];
	}

	getRoom(name) {
		if (this.rooms[name])
			return this.rooms[name];
		return this.rooms[name] = new Room(name);
	}
	
	process(req, res) {
		var [user, code, msg] = this.getRequestUser(req);
		if (code) {
			res.status(code);
			res.send(msg);
			return [null, null];
		}
		var [room, code, msg] = this.getRequestRoom(req);
		if (code) {
			res.status(code);
			res.send(msg);
			return [null, null];
		}
		return [user, room];
	}
}

module.exports = Server;
