var async = require('async'),
	microtime = require('microtime'),
	bunyan = require('bunyan'),
	usage = require('usage');

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
	var testsDone = 0;
	var q = async.queue(function(task, callback){
		benchtest.test(messages, callback);
	}, sockets);

	for(var i=0; i<sockets; ++i){
		q.push();
	}

	q.drain = function() {
		endCallback();
	}
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
				var time = microtime.nowDouble();
				performTest(sockets[conc], messages[tests], function(){
					log.info({interval:(microtime.nowDouble()-time), messages:messages[tests], sockets:sockets[conc]}, 'messages');
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