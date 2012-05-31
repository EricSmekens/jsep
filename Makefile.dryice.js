#!/usr/bin/env node
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
	console.log("Building...");
	do_build();
	console.log("Done!");
} else { // Included via require
	exports.build = function(callback) {
		do_build();
		if(callback) {
			callback();
		}
	};
}
