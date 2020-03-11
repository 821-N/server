class User {
	constructor(obj) {
		this.uid = obj.uid;
		this.name = obj.name;
	}
}

module.exports = User;

// Idea:
// every time a user changes their info,
// send an update to all clients somehow


// Detecting if a user is ol
