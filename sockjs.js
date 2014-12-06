var http = require('http'),
	sockjs = require('sockjs'),
	sockjsClient = require('sockjs-client')

var sock, server, PORT;

exports.prepareServer = function(port) {
	PORT = port;

	var sock = sockjs.createServer({
		log: function(){}
	});
	sock.on('connection', function(conn){
		conn.on('data', function(message){
			conn.write(message);
		});
	});

	var server = http.createServer();
	sock.installHandlers(server, {prefix: '/echo'});
	server.listen(PORT, '0.0.0.0');
}

exports.test = function(messages, callback){
	var sock = new sockjsClient('http://127.0.0.1:'+PORT+'/echo');
	
	var responses = 0;

	sock.onmessage = function(e){
		if(++responses === messages){
			sock.close();
			return;
		}
	}
	sock.onopen = function(){
		for(var i=0; i<messages; ++i){
			sock.send('data');
		}
	}
	sock.onclose = function(){
		callback();
	}
}