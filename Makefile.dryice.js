#!/usr/bin/env node
var args = process.argv.slice(2)
var command = args[0];

if(!command) {
	command = "build";
}

var copy = require('dryice').copy;

var do_build_main = function() {
	copy({
		source: ["src/jsep.js"]
		, dest: "build/jsep.js"
	});
	copy({
		source: ["src/jsep.js"]
		, dest: "build/jsep.min.js"
		, filter: copy.filter.uglifyjs
	});
};

var do_build = function() {
	do_build_main();
};


if(require.main === module) { // Called directly
	if(command === "build") {
		console.log("Building...");
		do_build();
		console.log("Done!");
	} else if(command === "dist") {
		//http://stackoverflow.com/questions/5754153/zip-archives-in-node-js
		var spawn = require('child_process').spawn
			, fs = require('fs');

		var package_info = JSON.parse(fs.readFileSync("package.json")); 
		var version = package_info.version;
		var filename = "dist/jsep_"+version+".zip";
		var zip = spawn('zip', ['-rj', filename, "build/jsep.js", "build/jsep.min.js"], {cwd: __dirname});
		zip.on('exit', function (code) {
			if(code !== 0) {
				console.log('zip process exited with code ' + code);
			}
		});
	}
} else { // Included via require
	exports.build = function(callback) {
		do_build();
		if(callback) {
			callback();
		}
	};
}
