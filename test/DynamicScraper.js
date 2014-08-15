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
	});
});