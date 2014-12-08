var path = require("path");
module.exports = function(grunt) {
	var results = path.normalize(__dirname+"/results/"+(new Date()).getTime()+'/');
	grunt.file.mkdir(results);

	// Project configuration.
	grunt.initConfig({
	    exec: {
			ws: {
				cmd: 'node server.js ws > '+results+'/ws.json 2> '+results+'/ws.err'
			},
			faye: {
				cmd: 'node server.js faye > '+results+'/faye.json 2> '+results+'/faye.err'
			},
			engineio: {
				cmd: 'node server.js engine.io > '+results+'/engine.io.json 2> '+results+'/engine.io.err'
			},
			socketio: {
				cmd: 'node server.js socket.io > '+results+'/socket.io.json 2> '+results+'/socket.io.err'
			},
			sockjs: {
				cmd: 'node server.js sockjs > '+results+'/sockjs.json 2> '+results+'/sockjs.err'
			},
			// browserchannel: {
			// 	cmd: 'node server.js browserchannel > '+results+'/browserchannel.json 2> '+results+'/browserchannel.err'
			// },
			primus_ws: {
				cmd: 'node server.js primus websockets > '+results+'/primus_ws.json 2> '+results+'/primus_ws.err'
			},
			primus_engineio: {
				cmd: 'node server.js primus engine.io > '+results+'/primus_engineio.json 2> '+results+'/primus_engineio.err'
			},
			primus_socketio: {
				cmd: 'node server.js primus socket.io > '+results+'/primus_socketio.json 2> '+results+'/primus_socketio.err'
			},
			primus_sockjs: {
				cmd: 'node server.js primus sockjs > '+results+'/primus_sockjs.json 2> '+results+'/primus_sockjs.err'
			},
			primus_faye: {
				cmd: 'node server.js primus faye > '+results+'/primus_faye.json 2> '+results+'/primus_faye.err'
			},
			primus_browserchannel: {
				cmd: 'node server.js primus browserchannel > '+results+'/primus_browserchannel.json 2> '+results+'/primus_browserchannel.err'
			}
		}
	});

	grunt.registerTask('default', 'executes all benchmarks', function () {
		var tasks = ['exec'];
		grunt.option('force', true);
		grunt.task.run(tasks);
	});

	grunt.registerTask('primus', function () {
		var tasks = ['exec:primus_ws', 'exec:primus_engineio', 'exec:primus_faye', 'exec:primus_browserchannel', 'exec:primus_sockjs', 'exec:primus_socketio'];
		grunt.option('force', true);
		grunt.task.run(tasks);
	});

	grunt.loadNpmTasks('grunt-exec');

};