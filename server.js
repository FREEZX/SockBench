var async = require('async'),
	microtime = require('microtime'),
	bunyan = require('bunyan'),
	child_process = require('child_process'),
	os = require('os'),
	util = require('util'),
	spawn = child_process.spawn;

var benchtest = require('./backends/' + process.argv[2]);
var cpuCount = os.cpus().length;

var pid = process.pid;
var log = bunyan.createLogger({name: process.argv[2]+(process.argv[3] ? '_' + process.argv[3] : '' )});

var options = { keepHistory: true };
setInterval(function() {
	log.info({mem: process.memoryUsage()}, 'stat');
}, 500);


var PORT = 3000;
benchtest.prepareServer(PORT, process.argv[3]);

function performTest(sockets, messages, endCallback){

	//Calculate socks per process. Leave one core for the server.
	var socksPerProc = Math.floor(sockets/cpuCount-1);
	var startedProcesses = 0;
	var endedProcesses = 0;

	var leftSocks = sockets;

	for(var i=0; i<cpuCount-1; ++i){
		var procSocks = (i===cpuCount-2) ? leftSocks : socksPerProc;
		if(procSocks === 0){
			continue;
		}
		var clientRunner = spawn('node', ['client.js', process.argv[2], process.argv[3], PORT, procSocks, messages]);
		++startedProcesses;
		leftSocks -= procSocks;
		var time;
		var interval;
		var failed;
		var lost;
		clientRunner.stdout.on('data', function (data) {
			data = JSON.parse(data);
			if(data.message === 'start'){
				time = time || microtime.nowDouble();
			}
			else{
				interval = microtime.nowDouble()-time;
			}
		});
		clientRunner.on('exit', function(){
			if(++endedProcesses === startedProcesses){
				endCallback(interval)
			};
		});
		clientRunner.stderr.on('data', function (data) {
			console.error(data.toString());
		});
	}
}

var testFunctions = [];

sockets = [1, 25000, 50000, 75000, 100000];
messages = [1, 100];

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