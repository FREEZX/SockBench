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
			primus_sockjs: {
				cmd: 'node server.js primus sockjs > results/primus_sockjs.json'
			},
			primus_socketio: {
				cmd: 'node server.js primus socket.io > results/primus_sio.json'
			},
			primus_browserchannel: {
				cmd: 'node server.js primus browserchannel > results/primus_browserchannel.json'
			}
		}
	});

	grunt.registerTask('default', ['exec']);
	grunt.registerTask('primus', ['exec:primus_ws', 'exec:primus_eio', 'exec:primus_faye', 'exec:primus_browserchannel', 'exec:primus_sockjs', 'exec:primus_socketio']);

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-exec');

	// Default task(s).
	grunt.registerTask('default', ['exec']);

};