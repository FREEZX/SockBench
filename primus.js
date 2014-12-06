var http = require('http'),
	Primus = require('primus');

var server, primus, Socket, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = http.createServer();
	primus = new Primus(server, { transformer: process.argv[3] });

	Socket = primus.Socket;

	primus.on('connection', function(socket){
		socket.on('data', function(message){
			socket.write(message);
		});
	});

	server.listen(PORT);
}

exports.test = function(messages, callback){
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
		callback();
	});
}