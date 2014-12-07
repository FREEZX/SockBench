var path = require("path");
module.exports = function(grunt) {
	var results = path.normalize(__dirname+"/results");
	grunt.file.mkdir(results);

	// Project configuration.
	grunt.initConfig({
	    exec: {
			ws: {
				cmd: 'node server.js ws > results/ws.json'
			},
			engineio: {
				cmd: 'node server.js engine.io > results/engine.io.json'
			},
			socketio: {
				cmd: 'node server.js socket.io > results/socket.io.json'
			},
			sockjs: {
				cmd: 'node server.js sockjs > results/sockjs.json'
			},
			primus_ws: {
				cmd: 'node server.js primus websockets > results/primus_ws.json'
			},
			primus_eio: {
				cmd: 'node server.js primus engine.io > results/primus_eio.json'
			},
			primus_faye: {
				cmd: 'node server.js primus faye > results/primus_faye.json'
			},
			primus_browserchannel: {
				cmd: 'node server.js primus browserchannel > results/primus_browserchannel.json'
			},
			primus_socketio: {
				cmd: 'node server.js primus socket.io > results/primus_socketio.json'
			},
			primus_sockjs: {
				cmd: 'node server.js primus sockjs > results/primus_sockjs.json'
			}
		}
	});

	grunt.registerTask('default', 'executes all benchmarks', function () {
		var tasks = ['exec'];
		grunt.option('force', true);
		grunt.task.run(tasks);
	});

	grunt.registerTask('primus', function () {
		var tasks = ['exec:primus_ws', 'exec:primus_eio', 'exec:primus_faye', 'exec:primus_browserchannel', 'exec:primus_sockjs', 'exec:primus_socketio'];
		grunt.option('force', true);
		grunt.task.run(tasks);
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-exec');

};