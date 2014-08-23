/* global describe, it, $ */
var sjs = require('../src/Scraper'),
	ScraperPromise = sjs.ScraperPromise,
	DynamicScraper = sjs.DynamicScraper,
	assert = require('assert'),
	HN_CLONE = 'http://localhost:3000/hacker-news-clone';


describe('DynamicScraper', function() {

	describe('#create', function() {
		it('with argument', function(done) {
			var ds = DynamicScraper.create(HN_CLONE);
			ds
				.done(function() {
					assert.ok(ds instanceof ScraperPromise);
					done();
				});
		});

		it('without argument', function(done) {
			var ds = DynamicScraper.create();
			ds
				.get(HN_CLONE)
				.done(function() {
					assert.ok(ds instanceof ScraperPromise);
					done();
				});
		});
	});

	it('.loadBody, .scrape, .close', function(done) {
		var ds = new DynamicScraper();
		ds.body = '<html><body><div id="f">text</div></body></html>';
		var temp = ds.loadBody(function() {
			var temp = ds.scrape(function() {
				return $('#f').text();
			}, function(err, result) {
				assert.equal(err, null);
				assert.equal(result, 'text');
				assert.ok(ds.close() === ds);
				assert.ok(!!ds.ph);
				assert.ok(!!ds.page);
				done();
			});
			assert.ok(temp === ds);
		});
		assert.ok(temp === ds);
	});

	describe('.inject', function() {
		it('page not loaded', function() {
			var ds = new DynamicScraper();
			try {
				ds.inject('');
				assert.fail('Should have thrown');
			} catch (e) {
				assert.equal(e.message, 'Couldn\'t inject code, at "". The page has not been initialized yet.');
			}
		});

		it('success', function(done) {
			var ds = new DynamicScraper();
			ds.get(HN_CLONE, function(err) {
				if (err) {
					assert.fail('Shouldn\'t have returned an error.');
				}
				ds.inject(__dirname + '/static/code.js', function(err) {
					if (err) {
						assert.fail('Should load code successfully.');
					} else {
						done();
					}
				});

			});
		});

		it('fails', function(done) {
			var ds = new DynamicScraper();
			ds.get(HN_CLONE, function(err) {
				if (err) {
					assert.fail('Shouldn\'t have returned an error.');
				}
				var file = __dirname + '/static/invalid-code.js';
				ds.inject(file, function(err) {
					if (err) {
						assert.equal(err.message, 'Couldn\'t inject code, at "' + file + '".');
						done();
					} else {
						assert.fail('Shouldn\'t load code successfully.');
					}
				});

			});
		});

		it('fails jQuery', function(done) {
			var jq = DynamicScraper.JQUERY_FILE;
			DynamicScraper.JQUERY_FILE += '.non';
			var ds = new DynamicScraper();
			ds.get(HN_CLONE, function(err) {
				DynamicScraper.JQUERY_FILE = jq;
				if (err) {
					assert.equal(err.message, 'Couldn\'t inject jQuery into the page.');
				} else {
					assert.fail('Should have returned an error.');
				}
				done();
			});
		});
	});

	it('.clone', function() {
		var ds = new DynamicScraper(),
			clone = ds.clone();
		assert.ok(clone instanceof DynamicScraper);
		assert.ok(ds != clone);
	});

	it('#startFactory, #closeFactory', function() {
		var temp;
		temp = DynamicScraper.startFactory();
		assert.ok(temp === DynamicScraper);
		temp = DynamicScraper.closeFactory();
		assert.ok(temp === DynamicScraper);
		temp = DynamicScraper.closeFactory();
		assert.ok(temp === DynamicScraper);
	});
});