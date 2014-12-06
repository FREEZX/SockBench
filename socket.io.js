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

exports.test = function(messages, callback){
	var socket;
	var retryInterval;
	var cbCalled = false;
	socket = ioClient.connect('http://127.0.0.1:'+PORT, {'force new connection': true, 'try multiple transports': false, 'reconnect': false});
	var returnedMessages = 0;
	var socketTimeout;

	socket.on('data', function(e){
		if(++returnedMessages === messages){
			clearTimeout(socketTimeout);
			socket.disconnect();
		}
	});

	socket.on('connect', function(){
		for(var i=0; i<messages; ++i){
			socket.emit('data', 'data');
		}
	});

	socket.on('disconnect', function(){
		if(!cbCalled){
			callback();
		}
		cbCalled = true;
	});

	//Fallback if socket.io loses the connection or doesn't connect properly
	socketTimeout = setTimeout(function(){
		if(!cbCalled){
			callback();
		}
		cbCalled = true;
	}, 10000);
}