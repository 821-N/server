const Express = require('express');
const BodyParser = require('body-parser');
const Room = require('./room.js');
const User = require('./user.js');
const Fs = require('fs');

class Server {
	constructor(port, file) {
		var app = Express();
		app.use((req, res, next) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "*");
			res.header("Access-Control-Expose-Headers", "*");
			next();
		});
		app.use(BodyParser.text({type: "text/*"}));
		app.use(BodyParser.json());
		// [username] -> auth
		this.utoa = {};
		// [auth] -> username
		this.atou = {};
		// [username] -> password
		this.accounts = {};
		
		this.app = app;
		this.port = port;
		this.file = file;
		this.rooms = {};
		
		// GET / - request receive messages
		app.get('/', (req, res) => {
			var [user, room] = this.process(req, res);
			if (!user)
				return;
			
			var id = req.headers.id;

			var closed = false;

			var dc;
			var callback = (messages, id) => {
				if (closed)
					return;
				res.set('id', id);
				res.json(messages);
				req.removeListener('close', dc);
			}
			dc = () => {
				closed = true;
				room.onConnectionClose(callback);
			};
			
			req.on('close', dc);
			callback.id = id;
			room.addResponse(callback, user);
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
			room.post(message, user);
		});

		// register an account
		app.post('/register', (req, res) => {
			console.log("User registering account");
			var [username, password] = this.np(req, res, true);
			if (username === null)
				return;
			res.status(200);
			res.end();
		});

		// login
		app.get('/login', (req, res) => {
			console.log("User logging in");
			var [username, password] = this.np(req, res, false);
			if (username === null)
				return;
			var auth = this.getCreateUserAuth(username);
			res.status(200);
			res.send(auth);
		});

		//logout
		app.get('/logout', (req, res) => {
			console.log("user logging out");
			var auth;
			var [username, password] = this.np(req, res, false);
			if (username === null)
				return;
			var auth = this.getCreateUserAuth(username);
			delete this.accounts[auth];
			delete this.utoa[username];
			delete this.atou[auth];
			
			for (var room of this.rooms) {
				room.logoutUser(username);
			}
		});

		this.load();
		process.on("exit", this.save.bind(this));
		process.on("SIGINT", process.exit.bind(process));
	}

	getCreateUserAuth(user) {
		if (this.utoa[user]) {
			return this.utoa[user];
		}
		var auth = Math.random().toString();
		this.utoa[user] = auth;
		this.atou[auth] = user;
		return auth;
	}
	
	start() {
		var server = this.app.listen(this.port, () => {
			console.log("Starting server on port: "+this.port);
		})
		server.timeout = 0;
	}
	
	getRequestUser(req) {
		var auth = req.headers.auth;
		if (!auth)
			return [null, 401, "Missing auth token"];
		var user = this.atou[auth];
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
		/*if (!room.users[user.id]) {
			res.status(403);
			res.send("YOu don't have permission to access this room");
			return [null, null];
		}*/
		return [user, room];
	}

	np(req, res, create) {
		var username = req.headers.username;
		if (username === undefined) {
			res.status(400);
			res.send("missing username header");
			return [null, null];
		}
		var password = req.headers.password;
		if (password === undefined) {
			res.status(400);
			res.send("missing password header");
			return [null, null];
		}
		if (this.accounts[username] === undefined) {
			if (create) {
				this.accounts[username] = password;
			} else {
				res.status(400);
				res.send("account doesn't exist");
				return [null, null];
			}
		} else {
			if (create) {
				res.status(400);
				res.send("account already exists");
				return [null, null];
			}
		}
		if (this.accounts[username] !== password) {
			res.status(400);
			res.send("Incorrect password");
			return [null, null];
		}
		return [username, password];
	}

	save(cb) {
		console.log("saving to file");
		var rooms = {};
		for (var name in this.rooms) {
			rooms[name] = this.rooms[name].save();
		}
		var data = {
			accounts: this.accounts,
			rooms: rooms,
		}
		Fs.writeFileSync(this.file, JSON.stringify(data));
	}

	load() {
		try {
			console.log("loading data from file");
			var data = Fs.readFileSync(this.file, 'utf8');
			if (data) {
				data = JSON.parse(data);
				this.accounts = data.accounts;
				for (var name in data.rooms) {
					this.rooms[name] = new Room(name, data.rooms[name]);
				}
			}
		} catch (e) {
			
		}
	}
}

module.exports = Server;

