const RECENTS = 3;

class Room { // <
	constructor(name, owner) {
		this.name = name;
		this.messages = {}; // recent messages cache
		this.callbacks = [];
		this.nextId = 0;
		this.oldest = null; // the oldest message id in the room
		this.id = name; // any unique identifier
		this.users = {};
		//this.owner = owner;
	}

	getUser(user) {
		var r = this.users[user.id];
		if (!r) {
			r = this.users[user.id] = {
				user: user,
				connections: 0,
				online: false,
			};
			this.post(user.name + " found the room");
		}
		return r;
	}
	
	onUserRequest(user) {
		var roomUser = this.getUser(user);
		roomUser.connections++;
		console.log("client joined: ", roomUser.connections);
		this.userOnline(user, true);
		clearTimeout(roomUser.dcTimeout);
		roomUser.dcTimeout = undefined;
	}
	
	onUserResponse(user) {
		var roomUser = this.getUser(user);
		console.log("response sent, dec");
		roomUser.connections--;
		roomUser.dcTimeout = setTimeout(()=>{
			if (!roomUser.connections)
				this.userOnline(user, false);
		}, 1000);
	}

	onUserClose(user) {
		var roomUser = this.getUser(user);
		roomUser.connections--;
		console.log("closed",roomUser.connections);
		if (roomUser.dcTimeout === undefined && !roomUser.connections)
			this.userOnline(user, false);
	}
	
	userOnline(user, state) {
		var roomUser = this.getUser(user);
		if (roomUser.online != state) {
			roomUser.online = state;
			this.post(user.name + " " + (state ? "joined" : "left"));
		}
	}
	
	// post a message
	post(message, user) {
		if (user) {
			var roomUser = this.getUser(user);
			message = user.name + ": " + message;
			console.log("userrr");
		} else {
			console.log("ff");
		}
		// insert new
		this.messages[this.nextId] = message;
		if (this.oldest === null)
			this.oldest = this.nextId;
		this.nextId++;
		
		// clear old messages
		if (this.nextId-RECENTS-1 >= 0) {
			delete this.messages[this.nextId-RECENTS-1];
			this.oldest = this.nextId-RECENTS;
		}
		
		console.log("got message: "+message+" in room "+this);
		// send message to clients
		this.callbacks = this.callbacks.filter(callback => {
			return !this.tryRespond(callback);
		})
	}
	
	tryRespond(callback) {
		var messages = this.fromId(callback.id);
		if (messages) {
			console.log("sending to client");
			callback(messages, this.nextId);
			return true;
		} else {
			return false;
		}
	}

	// add a client request callback
	// as soon as there are messages with ids >= callback.id,
	// it will call callback(newMessages, nextId);
	addResponse(callback) {
		if (!this.tryRespond(callback)) {
			this.callbacks.push(callback);
		}
	}

	// get a list of all messages with ids >= id
	fromId(id = 0) {
		if (id < this.oldest)
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
}

module.exports = Room;
