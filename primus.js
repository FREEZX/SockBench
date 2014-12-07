var http = require('http'),
	Primus = require('primus');

var server, primus, Socket, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = http.createServer();
	primus = new Primus(server, { transformer: process.argv[3], ping: false, pong: false, timeout: false, strategy: false });

	primus.on('connection', function(socket){
		socket.on('data', function(message){
			socket.write(message);
		});

		socket.on('error', function(err){
			console.log('ERROR!');
		});
	});

	server.listen(PORT);
}

exports.prepareClient = function(port, transformer){
	PORT = port;
	Socket = Primus.createSocket({ transformer: transformer, ping: false, pong: false, timeout: false, strategy: false });
}

exports.test = function(messages, callback){
	var cbCalled = false;
	var client = new Socket('http://localhost:'+PORT);
	var responses = 0;
	var socketTimeout;

	var callCallback = function(){
		if(!cbCalled){
			callback(messages - responses);
			cbCalled = true;
			client.end();
		}
	}

	client.on('open', function(){
		for(var i=0; i<messages; ++i){
			client.write('data');
		}
	});

	client.on('data', function(){
		clearTimeout(socketTimeout);
		if(++responses === messages){
			client.end();
		}
		else{
			socketTimeout = setTimeout(callCallback, 30000);
		}
	});

	client.on('end', function(){
		callCallback();
	});

	//Fallback if primus loses the connection or doesn't connect properly
	socketTimeout = setTimeout(callCallback, 30000);
}