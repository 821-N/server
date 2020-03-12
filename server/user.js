class User {
	constructor(obj) {
		// account details
		this.id = obj.name
		this.name = obj.name;
		// this should have other fields like password, as well as maybe a bio or something
		// username color, etc.
		
		// connection state
		this.online = false;
		this.numConnections = 0;
	}
	
	toString() {
		return "[User:"+this.name+"]";
	}
}

module.exports = User;

// Idea:
// every time a user changes their info,
// send an update to all clients somehow


// Detecting if a user is online:
// - if a user fails to make a new long polling request after a certain amount of time, assume they've disconnected.
// - also detect if a user closes the connection before the long polling finishes
// - this should take care of all cases


// problem:
// we keep track of connections per-room
// however, what I haven't considered is
// why not allow a user to "watch" multiple rooms at once?
// perhaps it is best for them to just be connected to one at a time though
// hmm

/// either way, um
// we need a way to update the per-room userlist
// each LP connection can watch one room, but potentially a user might have multiple clients open or a client that supports multiple connections
// it would be good to track which rooms a user is in, ideally in the room class


// auth:
// every time a user logs in, an auth code is generated
// this auth code is reused, but is destroyed when a user logs out
// each user has one auth token at a time
// this is basically as good as a username/password (at least until the user finds out and logs out)
// so it should be protected lol
