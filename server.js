var async = require('async'),
	microtime = require('microtime'),
	bunyan = require('bunyan'),
	usage = require('usage'),
	child_process = require('child_process'),
	spawn = child_process.spawn;

var benchtest = require('./' + process.argv[2]);


var pid = process.pid;
var log = bunyan.createLogger({name: 'SockBench'});

var options = { keepHistory: true };
setInterval(function() {
	usage.lookup(pid, function(err, result) {
		log.info(result, 'stat');
	});
}, 500);


var PORT = 3000;
benchtest.prepareServer(PORT);

function performTest(sockets, messages, endCallback){
	var clientRunner = spawn('node', ['client.js', process.argv[2], process.argv[3], PORT, sockets, messages]);
	var time;
	var interval;
	var failed;
	var lost;
	clientRunner.stdout.on('data', function (data) {
		data = JSON.parse(data);
		if(data.message === 'start'){
			time = microtime.nowDouble();
		}
	});
	clientRunner.stdout.on('data', function (data) {
		data = JSON.parse(data);
		if(data.message === 'start'){
			time = microtime.nowDouble();
		}
		else{
			interval = microtime.nowDouble()-time;
		}
	});
	clientRunner.on('exit', function(){
		endCallback(interval);
	});
	clientRunner.stderr.on('data', function (data) {
		console.error(data.toString());
	});
}

var testFunctions = [];

sockets = [1, 10, 100, 1000, 10000];
messages = [1, 10, 100];

testFunctions.push(function(callback){
	log.info('Start');
	callback();
});

// Adding realtime tests
for(var i=0; i<messages.length; ++i){
	for(var j=0; j<sockets.length; ++j){
		(function(tests, conc){
			testFunctions.push(function(callback){
				performTest(sockets[conc], messages[tests], function(time){
					log.info({interval:time, messages:messages[tests], sockets:sockets[conc]}, 'messages');
					callback();
				});
			});
		})(i, j);
	}
}

async.series(
	testFunctions,
	function(){
		log.info('End');
		process.exit();
	}
);