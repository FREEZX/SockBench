var socketio = require('socket.io'),
	ioClient = require('socket.io-client');

var io, PORT;

exports.prepareServer = function(port){
	PORT = port;
	io = socketio.listen(PORT, {log: false});
	io.configure(function () {
		io.set('transports', ['websocket']);
	});
	io.on('connection', function(socket){
		socket.on('data', function(message){
			socket.emit('data', message);
		});
	});
}

exports.prepareClient = function(port){
	PORT = port;
}

exports.test = function(messages, callback){
	var socket;
	var retryInterval;
	var cbCalled = false;
	socket = ioClient.connect('http://127.0.0.1:'+PORT, {'force new connection': true, 'try multiple transports': false, 'reconnect': false});
	var responses = 0;
	
	var socketTimeout;

	var callCallback = function(){
		if(!cbCalled){
			callback(messages - responses);
			cbCalled = true;
			socket.disconnect();
		}
	}

	socket.on('data', function(e){
		clearTimeout(socketTimeout);
		if(++responses === messages){
			socket.disconnect();
		}
		else{
			socketTimeout = setTimeout(callCallback, 30000);
		}
	});

	socket.on('connect', function(){
		for(var i=0; i<messages; ++i){
			socket.emit('data', 'data');
		}
	});

	socket.on('disconnect', function(){
		callCallback();
	});

	//Fallback if socket.io loses the connection or doesn't connect properly
	socketTimeout = setTimeout(callCallback, 30000);
}