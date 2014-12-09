var WebSocket = require('faye-websocket'),
	http = require('http');

var server, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = http.createServer();
	server.on('upgrade', function(request, socket, body) {
		if (WebSocket.isWebSocket(request)) {
			var ws = new WebSocket(request, socket, body);

			ws.on('message', function(event) {
				ws.send(event.data);
			});

			ws.on('close', function(event) {
				ws = null;
			});
		}
	});
	server.listen(PORT);
}

exports.prepareClient = function(port){
	PORT = port;
}

exports.test = function(messages, callback){
	var socket;
	var returnedMessages = 0;

	var connect = function(){
		socket = new WebSocket.Client('ws://127.0.0.1:'+PORT);

		socket.on('message', function(e){
			if(++returnedMessages === messages){
				socket.close();
				return;
			}
		});

		socket.on('open', function(){
			for(var i=0; i<messages; ++i){
				socket.send('data');
			}
		});

		socket.on('close', function(){
			if(returnedMessages === messages){
				callback();
			} else {
				connect();
			}
		});
	}

	connect();
}