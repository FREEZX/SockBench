var async = require('async');

var benchtest = require('./' + process.argv[2]);
benchtest.prepareClient(parseInt(process.argv[4]), process.argv[3]);
console.log(JSON.stringify({message: 'start'}));

var sockets = parseInt(process.argv[5]);
var messages = parseInt(process.argv[6]);

var failed = 0;
var lostMessages = 0;
var q = async.queue(function(task, callback){
	benchtest.test(messages, function(lost){
		lostMessages += (lost || 0);
		if(lost>0){
			++failed;
		}
		callback();
	});
}, sockets);

for(var i=0; i<sockets; ++i){
	q.push();
}

q.drain = function() {
	console.log(JSON.stringify({failed: failed, lost: lostMessages, message: 'end'}));
	process.exit();
}