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

async function longPoll(room) {
	var response = await Axios({
		method: 'GET',
		headers: {
			auth: "password",
			id: 0,
		},
		url: `${SERVER}/?room=${room}`,
	});
	var messages = response.data;
	var id = response.headers.id;
	console.log(id, messages);
}

if (process.argv[2])
	sendMessage("test", process.argv[2]);
longPoll("test");

