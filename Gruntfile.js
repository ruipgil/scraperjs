var testServer = require('./test/setupServer');

var MOCHA_TIMEOUT_S = 10,
	MOCHA_TIMEOUT_MS = MOCHA_TIMEOUT_S * 1000,
	MOCHA_OPTIONS = {
		reporter: 'spec',
		timeout: MOCHA_TIMEOUT_MS
	},
	COVERAGE_THRESHOLD = 95;

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-exec');

	grunt.initConfig({
		exec: {
			coverage: {
				command: 'istanbul cover ./node_modules/mocha/bin/_mocha -x src/PhantomWrapper.js -- -t ' + MOCHA_TIMEOUT_MS + ' --root src/ test/'
			},
			coveralls: {
				command: 'istanbul cover ./node_modules/mocha/bin/_mocha -x src/PhantomWrapper.js --report lcovonly -- -t ' + MOCHA_TIMEOUT_MS + ' -x src/PhantomWrapper.js --root src/ test/ && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js'
			},
			'check-coverage': {
				command: 'istanbul check-coverage --lines ' + COVERAGE_THRESHOLD + ' --statements ' + COVERAGE_THRESHOLD + ' --functions ' + COVERAGE_THRESHOLD + ' --branches ' + COVERAGE_THRESHOLD + ' ./coverage/coverage.json'
			}
		},
		clean: {
			coverage: {
				src: ['coverage/']
			}
		},
		watch: {
			common: {
				files: ['src/**/*.js', 'test/**/*.js', 'Gruntfile.js'],
				tasks: ['test']
			}
		},
		jshint: {
			all: ['src/**/*.js', 'test/**/*.js']
		},
		mochaTest: {
			abstractScraper: {
				src: 'test/AbstractScraper.js',
				options: MOCHA_OPTIONS
			},
			staticScraper: {
				src: 'test/StaticScraper.js',
				options: MOCHA_OPTIONS
			},
			dynamicScraper: {
				src: 'test/DynamicScraper.js',
				options: MOCHA_OPTIONS
			},
			scraperPromise: {
				src: 'test/ScraperPromise.js',
				options: MOCHA_OPTIONS
			},
			router: {
				src: 'test/Router.js',
				options: MOCHA_OPTIONS
			},
			scraperError: {
				src: 'test/ScraperError.js',
				options: MOCHA_OPTIONS
			},
			commandLine: {
				src: 'test/commandLine.js',
				options: MOCHA_OPTIONS
			},
			all: {
				src: ['test/AbstractScraper.js', 'test/StaticScraper.js', 'test/DynamicScraper.js', 'test/ScraperPromise.js', 'test/Router.js', 'test/ScraperError.js', 'test/commandLine.js'],
				options: MOCHA_OPTIONS
			}
		}
	});

	var server;

	grunt.registerTask('serve', 'Starts express testing server', function() {
		server = testServer(grunt);
	});

	grunt.registerTask('unserve', function() {
		if (server) {
			server.close();
		}
	});

	grunt.registerTask('serve-and-test', ['serve', 'mochaTest:all', 'unserve']);

	grunt.registerTask('coverage', ['clean', 'jshint', 'serve', 'exec:coverage', 'exec:check-coverage', 'unserve']);
	grunt.registerTask('coveralls', ['clean', 'jshint', 'serve', 'exec:coveralls', 'exec:check-coverage', 'unserve']);

	grunt.registerTask('unit', ['jshint', 'serve-and-test']);
	grunt.registerTask('test', ['coverage']);

	grunt.registerTask('watch-all', ['serve', 'watch', 'unserve']);
};