const RECENTS = 30;

class Room { // <
	constructor(name, data) {
		this.name = name;
		this.messages = {}; // recent messages cache
		this.callbacks = [];
		this.nextId = 0;
		this.oldest = null; // the oldest message id in the room
		this.id = name; // any unique identifier
		this.users = {};
		if (data) {
			for (var message of data.messages)
				this.addMessage(message);
		} else {
			this.addMessage("Room created");
		}
		//this.owner = owner;
	}

	logoutUser(user) {
		var roomUser = this.users[user];
		if (!roomUser)
			return;
		// end all requests from that user
		this.callbacks = this.callbacks.filter(callback => {
			if (callback.user == user) {
				this.tryRespond(callback);
				return false;
			}
			return true;
		});
		// just in case
		roomUser.connections = 0;
		this.userOnline(user, false);
	}
	
	getUser(user) {
		var r = this.users[user];
		if (!r) {
			r = this.users[user] = {
				user: user,
				connections: 0,
				online: false,
			};
			this.post("User "+user+" joined room for the first time");
		}
		return r;
	}
	
	onUserRequest(user) {
		var roomUser = this.getUser(user);
		roomUser.connections++;
		this.log("User "+user+" requested ("+roomUser.connections+")");
		this.userOnline(user, true);
		clearTimeout(roomUser.dcTimeout);
		roomUser.dcTimeout = undefined;
	}
	
	onUserResponse(user) {
		var roomUser = this.getUser(user);
		roomUser.connections--;
		this.log("Response sent to user "+user+" ("+roomUser.connections+")");
		roomUser.dcTimeout = setTimeout(()=>{
			if (!roomUser.connections)
				this.userOnline(user, false);
		}, 5000); // if user doesn't make a new request within 5 seconds
	}

	onConnectionClose(callback) {
		var roomUser = this.getUser(callback.user);
		this.callbacks = this.callbacks.filter(cb => {
			if (cb === callback) {
				roomUser.connections--;
				return false;
			} else
				return true;
		});
		this.log(" User "+callback.user+" closed connection ("+roomUser.connections+")");
		if (roomUser.dcTimeout === undefined && !roomUser.connections)
			this.userOnline(callback.user, false);
	}

	// set the online status of a user
	userOnline(user, state) {
		var roomUser = this.getUser(user);
		if (roomUser.online != state) {
			roomUser.online = state;
			this.post(user + " " + (state ? "joined" : "left"));
		}
	}
	
	// post a message
	post(message, user) {
		if (user) {
			if (!this.users[user]) {
				return false;
			}
			var roomUser = this.getUser(user);
			if (!roomUser.online)
				return false;
			message = user + ": " + message;
		}
		this.addMessage(message);
		this.log("Message: "+message);
		// send message to clients
		this.callbacks = this.callbacks.filter(callback => {
			return !this.tryRespond(callback);
		})
		return true;
	}

	//add message to internal list;
	addMessage(message) {
		// insert new
		this.messages[this.nextId] = message;
		if (this.oldest === null)
			this.oldest = this.nextId;
		this.nextId++;
		
		// clear old messages
		/*if (this.nextId-RECENTS-1 >= 0) {
			delete this.messages[this.nextId-RECENTS-1];
			this.oldest = this.nextId-RECENTS;
		}*/
	}
	
	log(message) {
		console.log("["+this.name+"] "+message);
	}
	
	tryRespond(callback) {
		var messages = this.fromId(callback.id);
		if (messages) {
			this.log("Sending to client");
			callback(messages, this.nextId);
			this.onUserResponse(callback.user);
			return true;
		} else {
			return false;
		}
	}

	// add a client request callback
	// as soon as there are messages with ids >= callback.id,
	// it will call callback(newMessages, nextId);
	addResponse(callback, user) {
		callback.user = user;
		this.onUserRequest(user);
		if (!this.tryRespond(callback)) {
			this.callbacks.push(callback);
		}
	}

	// get a list of all messages with ids >= id
	fromId(id = 0, force) {
		if (id < this.oldest && !force)
			id = this.oldest;
		
		// if id is after newest message, it won't respond immediately
		if (id >= this.nextId)
			return null;
		
		var messages = [];
		for (var i=id; i<this.nextId; i++){
			messages.push(this.messages[i]);
		}
		return messages;
	}
		
	toString() {
		return "[Room:"+this.name+"]";
	}

	save() {
		return {
			messages: this.fromId(0, true),
			//users: 
		};
	}
}

module.exports = Room;
