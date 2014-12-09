var engine = require('engine.io')
	engineClient = require('engine.io-client');

var server, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = engine.listen(PORT);
	server.on('connection', function(socket){
		socket.on('message', function(message){
			socket.send(message);
		});
	});
}

exports.prepareClient = function(port){
	PORT = port;
}

exports.test = function(messages, callback){
	var socket;
	socket = engineClient('ws://127.0.0.1:'+PORT);
	var returnedMessages = 0;

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
		callback();
	});
}