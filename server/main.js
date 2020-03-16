const Server = require('./server.js');

var server = new Server(9998, 'SAVE.json');

server.start();
