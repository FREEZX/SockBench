var BC = require('browserchannel'),
	BCServer = BC.server,
	BCSocket = BC.BCSocket,
	connect = require('connect');

var server, PORT;

exports.prepareServer = function(port){
	PORT = port;
	var app = connect();
	var middleware = BCServer(function(socket){
		socket.on('message', function(message) {
			socket.send(message);
		});

		socket.on('close', function() {
			socket = null;
		});
	});
	app.use(middleware);
	server = app.listen(PORT);
}

exports.prepareClient = function(port){
	PORT = port;
}

exports.test = function(messages, callback){
	var socket;
	var returnedMessages = 0;

	var connect = function(){
		socket = new BCSocket('http://127.0.0.1:'+PORT+'/channel', {reconnect: true});

		socket.onmessage = function(e){
			if(++returnedMessages === messages){
				socket.close();
				return;
			}
		};

		socket.onopen = function(){
			for(var i=0; i<messages; ++i){
				socket.send('data');
			}
		};

		socket.onclose= function(){
			if(returnedMessages === messages){
				callback();
			} else {
				connect();
			}
		};
	}

	connect();
}