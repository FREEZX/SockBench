var async = require('async');

var benchtest = require('./backends/' + process.argv[2]);
benchtest.prepareClient(parseInt(process.argv[4]), process.argv[3]);
console.log(JSON.stringify({message: 'start'}));

var sockets = parseInt(process.argv[5]);
var messages = parseInt(process.argv[6]);

var q = async.queue(function(task, callback){
	benchtest.test(messages, callback);
}, 50);

for(var i=0; i<sockets; ++i){
	q.push();
}

q.drain = function() {
	console.log(JSON.stringify({message: 'end'}));
}