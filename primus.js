var http = require('http'),
	Primus = require('primus');

var server, primus, Socket, PORT;

exports.prepareServer = function(port){
	PORT = port;
	server = http.createServer();
	primus = new Primus(server, { transformer: process.argv[3] });

	primus.on('connection', function(socket){
		socket.on('data', function(message){
			socket.write(message);
		});
	});

	server.listen(PORT);
}

exports.prepareClient = function(port, transformer){
	PORT = port;
	Socket = Primus.createSocket({ transformer: transformer });
}

exports.test = function(messages, callback){
	var client;
	var responses = 0;

	var url = 'http://localhost:'+PORT;

	var connect = function(){
		client = new Socket(url);

		client.on('open', function(){
			for(var i=0; i<messages-responses; ++i){
				client.write('data');
			}
		});

		client.on('data', function(){
			if(++responses === messages){
				client.end();
			}
		});

		client.on('end', function(){
			if(messages === responses){
				callback();
			}
			else{
				connect();
			}
		});
	}
	connect();
}