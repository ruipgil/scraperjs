/* global describe, it, beforeEach, afterEach, $ */
var assert = require('assert'),
	sjs = require('../src/Scraper'),
	StaticScraper = sjs.StaticScraper,
	DynamicScraper = sjs.DynamicScraper,
	ScraperPromise = sjs.ScraperPromise,
	HN_CLONE = 'http://localhost:3000/hacker-news-clone';

function exec(ScraperType) {
	function isDynamic() {
		return ScraperType === DynamicScraper;
	}

	describe('onStatusCode', function() {
		it('with code', function(done) {
			var s = new ScraperPromise(new ScraperType())
				.get(HN_CLONE);
			var temp = s.onStatusCode(200, function() {
				done();
			});
			assert.ok(temp === s);
		});

		it('without code', function(done) {
			var s = new ScraperPromise(new ScraperType())
				.get(HN_CLONE);
			var temp = s.onStatusCode(function(code) {
				assert.equal(code, 200);
				done();
			});
			assert.ok(temp === s);
		});
	});

	it('timeout', function(done) {
		var s = new ScraperPromise(new ScraperType())
			.get(HN_CLONE)
			.onStatusCode(function(code) {
				assert.equal(code, 200);
			});
		var temp = s.timeout(100, function() {
			done();
		});
		assert.ok(temp === s);
	});

	it('then', function(done) {
		var s = new ScraperPromise(new ScraperType())
			.get(HN_CLONE);
		var temp = s.then(function() {
			done();
		});
		assert.ok(temp === s);
	});

	it('onError', function(done) {
		var s = new ScraperPromise(new ScraperType())
			.get(HN_CLONE)
			.then(function() {
				throw new Error('random message');
			});
		var temp = s.onError(function(err) {
			assert.equal(err.message, 'random message');
			done();
		});
		assert.ok(s === temp);
	});

	describe('scrape', function() {
		var expectedVal;
		if (isDynamic()) {
			expectedVal = 9;
		} else {
			expectedVal = 10;
		}
		it('without extra arguments', function(done) {
			var s = new ScraperPromise(new ScraperType())
				.get(HN_CLONE);
			var fn;
			if (isDynamic()) {
				fn = function() {
					return $('.title a').map(function() {
						return $(this).text();
					}).get();
				};
			} else {
				fn = function($) {
					return $('.title a').map(function() {
						return $(this).text();
					}).get();
				};
			}
			var temp = s.scrape(fn, function(news) {
				assert.equal(news.length, expectedVal);
				done();
			});
			assert.ok(temp === s);
		});

		it('without extra arguments', function(done) {
			var s = new ScraperPromise(new ScraperType())
				.get(HN_CLONE);
			var fn;
			if (isDynamic()) {
				fn = function(selector) {
					return $(selector).map(function() {
						return $(this).text();
					}).get();
				};
			} else {
				fn = function($, selector) {
					return $(selector).map(function() {
						return $(this).text();
					}).get();
				};
			}
			var temp = s.scrape(fn, function(news) {
				assert.equal(news.length, expectedVal);
				done();
			}, '.title a');
			assert.ok(temp === s);
		});
	});

	it('delay', function(done) {
		var s = new ScraperPromise(new ScraperType())
			.get(HN_CLONE)
			.onStatusCode(function(code) {
				assert.equal(code, 200);
			});
		var temp = s.delay(100);
		assert.ok(temp === s);
		if (isDynamic()) {
			s.scrape(function() {
				return $('.dynamic').text();
			}, function(result) {
				assert.equal(result, 'Dynamic Content');
				done();
			});
		} else {
			s.scrape(function($) {
				return $('.dynamic').length;
			}, function(result) {
				assert.equal(result, 0);
				done();
			});
		}
	});

	it('request', function(done) {
		var s = new ScraperPromise(new ScraperType());
		var temp = s.request({
			url: HN_CLONE,
			method: 'POST'
		});
		assert.ok(temp === s);
		var fn;
		if (isDynamic()) {
			fn = function() {
				return $('#POST_MESSAGE').text();
			};
		} else {
			fn = function($) {
				return $('#POST_MESSAGE').text();
			};
		}
		s.scrape(fn, function(result) {
			assert.equal(result, 'random text');
			done();
		});
	});

	// done
	// _setChainParameter
	// _fire
	// _setPromises
	// clone
}

describe('Scraper Promise', function() {

	describe('with StaticScraper', function() {
		exec(StaticScraper);
	});
	describe('with DynamicScraper', function() {
		describe('with Factory', function() {
			beforeEach(function() {
				DynamicScraper.startFactory();
			});
			afterEach(function() {
				DynamicScraper.closeFactory();
			});
			exec(DynamicScraper);
		});
		describe('without Factory', function() {
			exec(DynamicScraper);
		});
	});


});