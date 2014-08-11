/* global describe, it */
var StaticScraper = require('../src/Scraper').StaticScraper,
	assert = require('assert'),
	HN_CLONE = 'http://localhost:3000/hacker-news-clone';


describe('StaticScraper', function() {

	describe('create', function() {
		it('with argument', function(done) {
			StaticScraper
				.create(HN_CLONE)
				.done(function() {
					done();
				});
		});

		it('without argument', function(done) {
			StaticScraper
				.create()
				.get(HN_CLONE)
				.done(function() {
					done();
				});
		});
	});

	describe('onStatusCode', function() {
		it('with code', function(done) {
			StaticScraper
				.create()
				.get(HN_CLONE)
				.onStatusCode(200, function() {
					done();
				});
		});

		it('without code', function(done) {
			StaticScraper
				.create()
				.get(HN_CLONE)
				.onStatusCode(function(code) {
					assert.equal(code, 200);
					done();
				});
		});
	});

	describe('scrape', function() {
		it('without extra arguments', function(done) {
			StaticScraper
				.create()
				.get(HN_CLONE)
				.scrape(function($) {
					return $('.title a').map(function() {
						return $(this).text();
					}).get();
				}, function(news) {
					assert.equal(news.length, 10);
					done();
				});
		});

		it('without extra arguments', function(done) {
			StaticScraper
				.create()
				.get(HN_CLONE)
				.scrape(function($, id) {
					return $(id).map(function() {
						return $(this).text();
					}).get();
				}, function(news) {
					assert.equal(news.length, 10);
					done();
				}, '.title a');
		});
	});

	it('delay', function(done) {
		StaticScraper
			.create()
			.get(HN_CLONE)
			.onStatusCode(function(code) {
				assert.equal(code, 200);
			})
			.delay(100, function() {
				done();
			});
	});

	it('timeout', function(done) {
		StaticScraper
			.create()
			.get(HN_CLONE)
			.onStatusCode(function(code) {
				assert.equal(code, 200);
			})
			.timeout(100, function() {
				done();
			});
	});

	it('then', function(done) {
		StaticScraper
			.create()
			.get(HN_CLONE)
			.then(function() {
				done();
			});
	});

	it('onError', function(done) {
		StaticScraper
			.create()
			.get(HN_CLONE)
			.onError(function(err) {
				assert.equal(err.message, 'random message');
				done();
			})
			.then(function() {
				throw new Error('random message');
			});
	});

	it('request', function(done) {
		StaticScraper
			.create()
			.request({
				url: HN_CLONE,
				method: 'POST'
			})
			.scrape(function($) {
				return $('#POST_MESSAGE').text();
			}, function(result) {
				assert.equal(result, 'random text');
				done();
			});
	});
});