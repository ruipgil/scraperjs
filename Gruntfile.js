var testServer = require('./test/setupServer');

var MOCHA_TIMEOUT_S = 10,
	MOCHA_OPTIONS = {
		reporter: 'spec',
		timeout: MOCHA_TIMEOUT_S*1000
	};

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.initConfig({
		watch: {
			common: {
				files: ['src/**/*.js', 'test/**/*.js'],
				tasks: ['jshint', 'mochaTest']
			}
		},
		jshint: {
			all: ['src/**/*.js', 'test/**/*.js']
		},
		mochaTest: {
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
			all: {
				src: ['test/StaticScraper.js', 'test/DynamicScraper.js', 'test/ScraperPromise.js', 'test/Router.js'],
				options: MOCHA_OPTIONS
			}
		}
	});

	var server;

	grunt.registerTask('start-express', 'Starts express testing server', function() {
		server = testServer(grunt);
	});

	grunt.registerTask('stop-express', function() {
		if (server) {
			server.close();
		}
	});

	grunt.registerTask('express-test', ['jshint', 'start-express', 'mochaTest:all', 'stop-express']);

	grunt.registerTask('test', ['express-test']);

	grunt.registerTask('watch-all', ['start-express', 'watch', 'stop-express']);
};