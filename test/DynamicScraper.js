/* global describe, it, $ */
var DynamicScraper = require('../src/Scraper').DynamicScraper,
	assert = require('assert'),
	HN_CLONE = 'http://localhost:3000/hacker-news-clone';


describe('DynamicScraper', function() {

	describe('create', function() {
		it('with argument', function(done) {
			DynamicScraper
				.create(HN_CLONE)
				.done(function() {
					done();
				});
		});

		it('without argument', function(done) {
			DynamicScraper
				.create()
				.get(HN_CLONE)
				.done(function() {
					done();
				});
		});
	});

	describe('onStatusCode', function() {
		it('with code', function(done) {
			DynamicScraper
				.create()
				.get(HN_CLONE)
				.onStatusCode(200, function() {
					done();
				});
		});

		it('without code', function(done) {
			DynamicScraper
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
			DynamicScraper
				.create()
				.get(HN_CLONE)
				.scrape(function() {
					
					return $('.title a').map(function() {
						return $(this).text();
					}).get();
				}, function(news) {
					assert.equal(news.length, 9);
					done();
				});
		});

		it('without extra arguments', function(done) {
			DynamicScraper
				.create()
				.get(HN_CLONE)
				.scrape(function(id) {
					return $(id).map(function() {
						return $(this).text();
					}).get();
				}, function(news) {
					assert.equal(news.length, 9);
					done();
				}, '.title a');
		});
	});

	it('delay', function(done) {
		DynamicScraper
			.create()
			.get(HN_CLONE)
			.onStatusCode(function(code) {
				assert.equal(code, 200);
			})
			.delay(100, function() {})
			.scrape(function() {
				return $('.dynamic').text();
			}, function(result) {
				assert.equal(result, 'Dynamic Content');
				done();
			});
	});

	it('timeout', function(done) {
		DynamicScraper
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
		DynamicScraper
			.create()
			.get(HN_CLONE)
			.then(function() {
				done();
			});
	});

	it('onError', function(done) {
		DynamicScraper
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
		DynamicScraper
			.create()
			.request({
				url: HN_CLONE,
				method: 'POST'
			})
			.scrape(function() {
				return $('#POST_MESSAGE').text();
			}, function(result) {
				assert.equal(result, 'random text');
				done();
			});
	});
});