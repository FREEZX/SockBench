var http = require('http'),
	WebSocket = require('ws'),
	WebSocketServer = require('ws').Server;

var wss, server, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = http.createServer();
	wss = new WebSocketServer({server: server});
	wss.on('connection', function(socket){
		socket.on('message', function(message){
			socket.send(message);
		});
	});

	server.listen(PORT);
}

exports.test = function(messages, callback){
	var socket;
	var retryInterval;
	socket = new WebSocket('http://127.0.0.1:'+PORT);
	var returnedMessages = 0;

	socket.on('message', function(e){
		if(++returnedMessages === messages){
			socket.terminate();
			callback();
			return;
		}
	});
	socket.on('open', function(){
		for(var i=0; i<messages; ++i){
			socket.send('data', {});
		}
	});
}