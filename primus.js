var http = require('http'),
	Primus = require('primus');

var server, primus, Socket, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = http.createServer();
	primus = new Primus(server, { transformer: process.argv[3], ping: false, pong: false, timeout: false, strategy: false });

	Socket = primus.Socket;

	primus.on('connection', function(socket){
		socket.on('data', function(message){
			socket.write(message);
		});
	});

	server.listen(PORT);
}

exports.test = function(messages, callback){
	var cbCalled = false;
	var client = new Socket('http://localhost:'+PORT);
	var responses = 0;

	client.on('open', function(){
		for(var i=0; i<messages; ++i){
			client.write('data');
		}
	});

	client.on('data', function(){
		++responses;
		if(responses === messages){
			client.end();
		}
	});

	client.on('end', function(){
		if(!cbCalled){
			callback();
			cbCalled = true;
		}
	});

	//Fallback if primus loses the connection or doesn't connect properly
	socketTimeout = setTimeout(function(){
		if(!cbCalled){
			callback(false);
			cbCalled = true;
			client.end();
		}
	}, 30000);
}