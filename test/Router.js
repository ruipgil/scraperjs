/* global describe, it, $ */
var scraper = require('../src/Scraper'),
	Router = scraper.Router,
	assert = require('assert'),
	LH = 'http://localhost:3000';

function compareObjects(obj1, obj2) {
	function co(a, b) {
		for (var x in a) {
			if (a[x] !== b[x]) {
				return false;
			}
		}
		return true;
	}
	return co(obj1, obj2) && co(obj2, obj1);
}

describe('Router', function() {

	describe('#pathMatcher', function() {
		it('with string', function(done) {
			var fn = Router.pathMatcher(':protocol(https?://)?:www(www.)?youtube.com/(watch/:id)?');
			assert.equal(typeof fn, 'function');
			assert.ok(compareObjects(fn('youtube.com/'), {
				url: 'youtube.com/',
				protocol: undefined,
				www: undefined,
				id: undefined
			}));
			assert.ok(compareObjects(fn('https://youtube.com/'), {
				url: 'https://youtube.com/',
				protocol: 'https://',
				www: undefined,
				id: undefined
			}));
			assert.ok(compareObjects(fn('https://www.youtube.com/'), {
				url: 'https://www.youtube.com/',
				protocol: 'https://',
				www: 'www.',
				id: undefined
			}));
			assert.ok(compareObjects(fn('https://www.youtube.com/watch/mNhMogx3YmU'), {
				url: 'https://www.youtube.com/watch/mNhMogx3YmU',
				protocol: 'https://',
				www: 'www.',
				id: 'mNhMogx3YmU'
			}));
			assert.ok(compareObjects(Router.pathMatcher('*')('https://www.youtube.com/watch/mNhMogx3YmU'), {
				url: 'https://www.youtube.com/watch/mNhMogx3YmU'
			}));
			try {
				Router.pathMatcher(function() {});
			} catch (e) {
				assert.equal(e.name, 'ScraperError');
				done();
			}
		});
		it('with regular expression', function(done) {
			var fn = Router.pathMatcher(/s*crape/);
			assert.equal(typeof fn, 'function');
			assert.ok(!!fn('craper'));
			assert.ok(!!fn('scraper'));
			assert.ok(!!fn('ssscraper'));
			done();
		});
	});
	describe('on', function() {
		var r = new Router();
		it('with path', function(done) {
			r.on(LH + '/info/:id')
				.createStatic()
				.onStatusCode(200, function() {
					done();
				});
			r.route(LH + '/info/ajhfdhsgf', function(found) {
				assert.ok(found);
			});
		});
		it('with function', function(done) {
			r
				.on(Router.pathMatcher(LH + '/watch/:id'))
				.createStatic()
				.onStatusCode(200, function() {
					done();
				});
			r.route(LH + '/watch/hjsgdfhdgf', function(found) {
				assert.ok(found);
			});
		});
	});
	it('get', function(done) {
		var r = new Router();
		r
			.on(LH + '/info/:id')
			.get()
			.createStatic()
			.onStatusCode(200, function() {
				done();
			});
		r.route(LH + '/info/8973iuhrwjhef');
	});
	it('request', function(done) {
		var r = new Router();
		r
			.on(LH + '/watch/:id')
			.request({
				method: 'POST'
			})
			.createStatic()
			.onStatusCode(200, function() {
				done();
			});
		r.route(LH + '/watch/8973iuhrwjhef', function(found) {
			assert.ok(found);
		});
	});
	it('otherwise', function(done) {
		var r = new Router(),
			testURL = LH + 'infoo/fjsdgfmhgsdf';
		r.on(LH + '/watch/:id');
		r.otherwise(function(url) {
			assert.equal(url, testURL);
			done();
		});
		r.route(testURL, function(found) {
			assert.ok(!found);
		});
	});
	it('route', function(done) {
		var r = new Router();
		r.on(LH + '/watch/:id')
			.createStatic();
		r.route(LH + '/watch/fjsdgfmhgsdf', function(found) {
			assert.ok(found);
			r.route(LH + '/scrpng', function(found) {
				assert.ok(!found);
				done();
			});
		});
	});
	it('createStatic', function(done) {
		var r = new Router();
		r.on(LH + '/hacker-news-clone')
			.createStatic()
			.scrape(function($) {
				return $('.title a').map(function() {
					return $(this).text();
				}).get();
			}, function(news) {
				assert.equal(news.length, 10);
				done();
			});
		r.route(LH + '/hacker-news-clone', function(found) {
			assert.ok(found);
		});
	});
	it('createDynamic', function(done) {
		var r = new Router();
		r.on(LH + '/hacker-news-clone')
			.createDynamic()
			.delay(100)
			.scrape(function() {
				return $('.title a').map(function() {
					return $(this).text();
				}).get();
			}, function(news) {
				assert.equal(news.length, 9);
				done();
			});
		r.route(LH + '/hacker-news-clone', function(found) {
			assert.ok(found);
		});
	});
	it('use', function(done) {
		var r = new Router(),
			stInstance;
		stInstance = scraper.StaticScraper
			.create()
			.scrape(function($) {
				return $('.title a').map(function() {
					return $(this).text();
				}).get();
			}, function(news) {
				assert.equal(news.length, 10);
				done();
			});
		r.on(LH + '/hacker-news-clone')
			.use(stInstance);
		r.route(LH + '/hacker-news-clone', function(found) {
			assert.ok(found);
		});
	});

	it('usage of params', function(done) {
		var r = new Router();
		r
			.on(LH + '/info/:id')
			.createStatic()
			.then(function(last, utils) {
				assert.ok(utils.params.id, '7623hgjfs73');
			});
		r.route(LH + '/info/7623hgjfs73', function(found) {
			assert.ok(found);
			done();
		});
	});

	describe('instantiation', function() {
		function testCase(firstMatch, expected) {
			it('with' + (firstMatch ? '' : 'out') + ' firstMatch', function(done) {
				var c = 0;
				var r = new Router({
					firstMatch: !!firstMatch
				});
				r.on(LH + '/info/:id')
					.createStatic()
					.then(function() {
						c++;
					});
				r.on(LH + '/info/:id')
					.createStatic()
					.then(function() {
						c++;
					});
				r.route(LH + '/info/7623hgjfs73', function(found) {
					assert.ok(found);
					assert.equal(c, expected);
					done();
				});
			});
		}

		testCase(true, 1);
		testCase(false, 2);
	});

	describe('bad formatting', function() {
		it('get', function(done) {
			var r = new Router();
			try {
				r.get();
			} catch (e) {
				assert.equal(e.name, 'ScraperError');
				done();
			}
		});
		it('request', function(done) {
			var r = new Router();
			try {
				r.request();
			} catch (e) {
				assert.equal(e.name, 'ScraperError');
				done();
			}
		});
		it('createStatic', function(done) {
			var r = new Router();
			try {
				r.createStatic();
			} catch (e) {
				assert.equal(e.name, 'ScraperError');
				done();
			}
		});
		it('createDynamic', function(done) {
			var r = new Router();
			try {
				r.createDynamic();
			} catch (e) {
				assert.equal(e.name, 'ScraperError');
				done();
			}
		});
		it('use', function(done) {
			var r = new Router();
			try {
				r.use(scraper.StaticScraper.create());
			} catch (e) {
				assert.equal(e.name, 'ScraperError');
				done();
			}
		});
	});
});