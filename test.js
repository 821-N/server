const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

var requestCounter = 0;

var responses = [];

app.get('/', function (req, res) {
	responses.push(res);
});

app.post('/', function (req, res) {
	console.log("post", req.body);
	responses.forEach((res)=>{
		res.end();
	})
	res.end();
});

app.use(bodyParser.text({ type: 'text/*' }));
app.use(bodyParser.json());

app.listen(9998, function () {
	console.log('Example app listening on port 9999!')
})
