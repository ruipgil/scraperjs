/* global describe, it */
var sjs = require('../src/Scraper'),
	ScraperPromise = sjs.ScraperPromise,
	StaticScraper = sjs.StaticScraper,
	assert = require('assert'),
	HN_CLONE = 'http://localhost:3000/hacker-news-clone';

describe('StaticScraper', function() {

	describe('#create', function() {
		it('with argument', function(done) {
			var ds = StaticScraper.create(HN_CLONE);
			ds
				.done(function() {
					assert.ok(ds instanceof ScraperPromise);
					done();
				});
		});

		it('without argument', function(done) {
			var ds = StaticScraper.create();
			ds
				.get(HN_CLONE)
				.done(function() {
					assert.ok(ds instanceof ScraperPromise);
					done();
				});
		});
	});

	it('.loadBody, .scrape, .close', function(done) {
		var ds = new StaticScraper();
		ds.body = '<html><head></head><body><div id="f">text</div></body></html>';
		var temp = ds.loadBody(function() {
			var temp2 = ds.scrape(function($) {
				return $('#f').text();
			}, function(err, result) {
				assert.ok(err === null);
				assert.equal(result, 'text');
				assert.ok(ds.close() === ds);
				assert.ok(ds.$);
				done();
			});
			assert.ok(temp2 === ds);
		});
		assert.ok(temp === ds);
	});

	it('.clone', function() {
		var ds = new StaticScraper(),
			clone = ds.clone();
		assert.ok(clone instanceof StaticScraper);
		assert.ok(ds != clone);
	});
});