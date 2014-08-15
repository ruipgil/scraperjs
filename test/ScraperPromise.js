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

	it('done', function(done) {
		var s = new ScraperPromise(new ScraperType());
		s.get(HN_CLONE);
		var temp = s.done(function() {
			done();
		});
		assert.ok(temp === s);
	});

	it('_setChainParameter', function() {
		var s = new ScraperPromise(new ScraperType());
		s._setChainParameter(5);
		assert.equal(s.chainParameter, 5);
	});

	describe('_fire', function() {
		it('without error', function(done) {
			var s = new ScraperPromise(new ScraperType());
			s.done(function() {
				done();
			});
			s._fire();
		});
		it('with error', function(done) {
			var c = 0;
			var s = new ScraperPromise(new ScraperType())
				.done(function() {
					assert.equal(c, 1);
					done();
				})
				.onError(function(err) {
					c++;
					assert.equal(err.message, 'msg');
				});
			s._fire(new Error('msg'));
		});
	});

	it('_setPromises', function() {
		var s = new ScraperPromise(new ScraperType());
		var promises = [

			function() {}
		];
		s._setPromises(promises);
		assert.ok(s.promises === promises);
	});

	it('clone', function() {
		var s = new ScraperPromise(new ScraperType())
			.onError(function() {})
			.done(function() {})
			.then(function() {})
			.onStatusCode(200, function() {})
			.onStatusCode(function() {})
			.timeout(10)
			.delay(10);
		var clone = s.clone();
		assert.ok(clone instanceof ScraperPromise);
		assert.ok(clone.promises === s.promises);
		assert.ok(clone.scraper !== s.scraper);
		assert.ok(clone.doneCallback === s.doneCallback);
		assert.ok(clone.errorCallback === s.errorCallback);
		assert.ok(clone.chainParameter === s.chainParameter);
	});

	describe('usage of utils', function() {
		it('stop()', function(done) {
			var c = 0;
			new ScraperPromise(new ScraperType())
				.get(HN_CLONE)
				.then(function() {
					c++;
				})
				.then(function(utils) {
					c++;
					utils.stop();
				})
				.then(function() {
					c++;
				})
				.done(function() {
					assert.equal(c, 2);
					done();
				});
		});
		it('scraper', function(done) {
			var s = new ScraperPromise(new ScraperType());
			s.get(HN_CLONE)
				.done(function(utils) {
					assert.ok(utils.scraper === s);
					done();
				});
		});
		it('params', function(done) {
			var s = new ScraperPromise(new ScraperType());
			s.get(HN_CLONE)
				.done(function(utils) {
					assert.ok(!utils.params);
					done();
				});
		});

	});
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