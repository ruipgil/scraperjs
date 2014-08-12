var express = require('express'),
	fs = require('fs');

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
				options: {
					reporter: 'spec'
				}
			},
			dynamicScraper: {
				src: 'test/DynamicScraper.js',
				options: {
					reporter: 'spec'
				}
			}
		}
	});

	var server;

	grunt.registerTask('start-express', 'Starts express testing server', function() {
		var app = express(),
			HN_CLONE = fs.readFileSync(__dirname + '/test/static/hacker-news-clone.html');

		app.get('/hacker-news-clone', function(req, res) {
			res.status(200);
			res.send(HN_CLONE);
		});

		app.post('/hacker-news-clone', function(req, res) {
			res.status(200);
			res.send('<html><head></head><body><div id="POST_MESSAGE">random text</div></body></html>');
		});

		server = app.listen(3000, function() {
			console.log('Listening on port %d', server.address().port);
		});
	});

	grunt.registerTask('stop-express', function() {
		if (server) {
			server.close();
		}
	});

	grunt.registerTask('express-test', ['start-express', 'mochaTest', 'stop-express', ]);

	grunt.registerTask('watch-all', ['start-express', 'watch', 'stop-express']);
};