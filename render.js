var _ = require('lodash'),
	async = require('async'),
	glob = require('glob'),
	fs = require('fs'),
	ejs = require('ejs'),
	os = require('os');

var results = [];
var stats = [];
var template, minmaxtemplate;
var i, j;

async.series([
	function(done){
		glob("results/**/*.json", function (er, files) {
			var functions = [];
			for(i=0;i<files.length;++i){
				(function(i){
					var j;
					functions.push(function(done){
						fs.readFile(files[i], function (err, data) {
							if (err) throw err;
							data = data.toString();
							data = data.substr(0, data.length-1);
							var parts = data.split("\n");
							var currentResult = {name: (JSON.parse(parts[0])).name, data: []};
							for(j=0;j<parts.length;++j){
								parts[j] = JSON.parse(parts[j]);
								if(parts[j].msg === 'messages'){
									currentResult.data.push(parts[j]);
								}
							}
							results.push(currentResult);
							done();
						});
					})
				})(i)
			}
			functions.push(function(done){
				fs.readFile('chart.ejs', 'utf8', function(err, data){
					template = data;
					done();
				});
			});
			functions.push(function(done){
				fs.readFile('minmaxchart.ejs', 'utf8', function(err, data){
					minmaxtemplate = data;
					done();
				});
			});
			async.series(functions, function(){
				done();
			});
		})
	},
	function(done){
		var groupedNumMsgs = {};
		// var socketNums = {};

		var minTimes = {};
		var maxTimes = {};
		var meanTimes = {};

		for(var i=0; i<results.length; ++i){
			var resultData = results[i].data;
			for(var j=0; j<resultData.length; ++j){
				if(!groupedNumMsgs[resultData[j].messages]){
					groupedNumMsgs[resultData[j].messages] = {};
					minTimes[resultData[j].messages] = {};
					maxTimes[resultData[j].messages] = {};
					meanTimes[resultData[j].messages] = {};
				}
				if(!groupedNumMsgs[resultData[j].messages][results[i].name]){
					groupedNumMsgs[resultData[j].messages][results[i].name] = {};
					minTimes[resultData[j].messages][results[i].name] = {};
					maxTimes[resultData[j].messages][results[i].name] = {};
					meanTimes[resultData[j].messages][results[i].name] = {};
				}
				if(!groupedNumMsgs[resultData[j].messages][results[i].name][resultData[j].sockets]){
					groupedNumMsgs[resultData[j].messages][results[i].name][resultData[j].sockets] = [];
					meanTimes[resultData[j].messages][results[i].name][resultData[j].sockets] = 0;
				}

				groupedNumMsgs[resultData[j].messages][results[i].name][resultData[j].sockets].push(resultData[j].interval);
				minTimes[resultData[j].messages][results[i].name][resultData[j].sockets] = Math.min(minTimes[resultData[j].messages][results[i].name][resultData[j].sockets] || Infinity, resultData[j].interval);
				maxTimes[resultData[j].messages][results[i].name][resultData[j].sockets] = Math.max(maxTimes[resultData[j].messages][results[i].name][resultData[j].sockets] || 0, resultData[j].interval);
				meanTimes[resultData[j].messages][results[i].name][resultData[j].sockets] += resultData[j].interval;

			}
		}

		var msgNums = Object.keys(groupedNumMsgs);

		//Generate mean vals
		for(var i=0; i<msgNums.length; ++i){
			var keys = Object.keys(groupedNumMsgs[msgNums[i]]);
			for(var j=0; j<keys.length; ++j){
				var socks = Object.keys(groupedNumMsgs[msgNums[i]][keys[j]]);
				for(var k=0; k<socks.length; ++k){
					meanTimes[msgNums[i]][keys[j]][socks[k]] /= groupedNumMsgs[msgNums[i]][keys[j]][socks[k]].length;
				}
			}
		}

		//Render full chart for different message number counts
		for(var i=0; i<msgNums.length; ++i){
			var remapped = [];
			var keys = Object.keys(groupedNumMsgs[msgNums[i]]);
			for(var j=0; j<keys.length; ++j){
				var socks = Object.keys(meanTimes[msgNums[i]][keys[j]]);
				var mapped = [];
				for(var k=0; k<socks.length; ++k){
					var meanPart = [];
					meanPart.push(parseInt(socks[k]));
					meanPart.push(meanTimes[msgNums[i]][keys[j]][socks[k]]);
					mapped.push(meanPart);
				}
				var currentObj = {
					name: keys[j],
					data: mapped
				}
				// console.log(currentObj);
				// process.exit();
				remapped.push(currentObj);
			}
			var renderRes = ejs.render(template, { messages: msgNums[i], results: remapped, os: [os.type(), os.platform(), os.arch(), os.release()].join(' ')});
			fs.writeFileSync('./renders/'+msgNums[i]+'.html', renderRes);
		}

		//Render charts for each socket type, with min and max vals
		for(var i=0; i<msgNums.length; ++i){
			var remapped = [];
			var keys = Object.keys(groupedNumMsgs[msgNums[i]]);
			for(var j=0; j<keys.length; ++j){
				var socks = Object.keys(meanTimes[msgNums[i]][keys[j]]);
				var mean = [];
				var minmax = [];
				for(var k=0; k<socks.length; ++k){
					var meanPart = [], minmaxPart = [];
					meanPart.push(parseInt(socks[k]));
					meanPart.push(meanTimes[msgNums[i]][keys[j]][socks[k]]);
					mean.push(meanPart);

					minmaxPart.push(parseInt(socks[k]));
					minmaxPart.push(minTimes[msgNums[i]][keys[j]][socks[k]]);
					minmaxPart.push(maxTimes[msgNums[i]][keys[j]][socks[k]]);
					minmax.push(minmaxPart);
				}
				var currentObjMean = {
					name: keys[j],
					data: mean,
					zIndex: 1
				}
				var minmaxObj = {
					name: keys[j]+' range',
					data: minmax,
					color: '#CCCCCC',
					type: 'arearange',
		            fillOpacity: 0.3,
		            zIndex: 0
				}
				var renderRes = ejs.render(minmaxtemplate, {messages: msgNums[i], mean: currentObjMean, range: minmaxObj, os: [os.type(), os.platform(), os.arch(), os.release()].join(' ')});
				fs.writeFileSync('./renders/'+msgNums[i]+'_'+keys[j]+'.html', renderRes);
			}
		}
		done();
	}
	]
);