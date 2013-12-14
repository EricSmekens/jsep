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
				banner: '/* <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>) */',
				report: 'gzip',
				sourceMap: "build/jsep.min.js.map",
				sourceMappingURL: "jsep.min.js.map",
				sourceMapPrefix: 1
			},
			build: {
				src: "build/jsep.js", // Use built file
				dest: "build/jsep.min.js"
			}
		},
		concat: {
			options: {
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
			build: ["build/", "annotated_source/"]
		},
		watch: {
			files: src_files.concat(['test/unit_tests.js', 'test/unit_tests/*.js']),
			tasks: ['concat']
		},
		compress: {
				production: {
						options: {
								archive: 'jsep-<%= pkg.version %>.zip'
						},
						files: [{
								expand: true,
								cwd: 'build/',
								src: '*',
								dest: 'jsep-<%= pkg.version %>'
						}]
				}
		},
		docco: {
			package: {
				src: ['build/jsep.js'],
				options: {
					output: 'annotated_source/',
					css: "src/docco.css"
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-docco');

	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('test', ['concat', 'jshint', 'qunit']); // Skip uglification if just testing
	grunt.registerTask('package', ['clean', 'concat', 'jshint', 'qunit', 'uglify', 'compress', 'docco']);
};
