module.exports = function(grunt) {
	var package = grunt.file.readJSON('package.json'); // Project configuration.

	var src_files = ["src/jsep.js"];

	grunt.initConfig({
		pkg: package,
		jshint: {
			build: {
				src: src_files
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
						'<%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %> */\n',
				report: 'gzip'
			},
			build: {
				src: "build/jsep.js", // Use concatenated files
				dest: "build/jsep.min.js"
			}
		},
		concat: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
						'<%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %> */\n',
				process: {
					data: {
						version: package.version // the updated version will be added to the concatenated file
					}
				}
			},
			js: {
				src: src_files,
				dest: "build/jsep.js"
			}
		},
		qunit: {
			files: ['test/unit_tests.html']
		},
		clean: {
			build: ["build/"]
		},
		watch: {
			files: src_files.concat(['test/unit_tests.js', 'test/unit_tests/*.js']),
			tasks: ['concat']
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('test', ['concat', 'jshint', 'qunit']); // Skip uglification if just testing
};
