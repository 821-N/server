const Axios = require('axios');

var SERVER = "http://localhost:9998";

function sendMessage(room, message) {
	Axios({
		method: 'POST',
		headers: {
			auth: "password",
			'content-type': "text/plain",

		},
		data: message,
		url: `${SERVER}/?room=${room}`,
	});
}

async function longPoll(room, id) {
	var headers = {
		auth: "password",
	}
	if (id)
		headers.id = id;
	var response = await Axios({
		method: 'GET',
		headers: headers,
		url: `${SERVER}/?room=${room}`,
	});
	var messages = response.data;
	id = response.headers.id;
	return [id, messages];
}

if (process.argv[2])
	sendMessage("test", process.argv[2]);
(async function() {
	var id = undefined;
	var messages;
	while (1) {
		[id, messages] = await longPoll("test", id);
		for (var message of messages) {
			console.log(message);
		}
	}
})();

