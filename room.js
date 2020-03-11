const RECENTS = 10;

// always my favorite class

class Room {
	constructor(name) {
		this.name = name;
		this.messages = {}; // recent messages cache
		this.callbacks = [];
		this.nextId = 0;
		this.oldest = null; // the oldest message id in the room
	}

	// post a message
	post(message) {
		// insert new
		this.messages[this.nextId] = message;
		if (this.oldest === null)
			this.oldest = this.nextId;
		this.nextId++;
		
		// clear old messages
		if (this.nextId-RECENTS > 0) {
			delete this.messages[this.nextId-RECENTS];
			this.oldest = this.nextId-RECENTS+1;
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
