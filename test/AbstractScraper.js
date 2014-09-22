/* global describe, it */
var AbstractScraper = require('../src/AbstractScraper'),
	fs = require('fs'),
	assert = require('assert'),
	MISSING = 'http://0.0.0.0',
	HN_CLONE = 'http://localhost:3000/hacker-news-clone';


describe('AbstractScraper', function() {
	it('get', function(done) {
		var as = new AbstractScraper();
		as.get(MISSING, function(err) {
			assert.ok((err.code == 'EADDRNOTAVAIL') || (err.code == 'ECONNREFUSED'));
			done();
		});
	});
	it('request', function(done) {
		var as = new AbstractScraper();
		as.request({
			url: MISSING
		}, function(err) {
			assert.ok((err.code == 'EADDRNOTAVAIL') || (err.code == 'ECONNREFUSED'));
			done();
		});
	});
	it('getStatusCode', function(done) {
		var as = new AbstractScraper();
		as.get(HN_CLONE, function(err) {
			assert.ok(!err);
			assert.equal(as.getStatusCode(), 200);
			done();
		});
	});
	it('getResponse', function(done) {
		var as = new AbstractScraper();
		as.get(HN_CLONE, function(err) {
			assert.ok(!err);
			assert.ok(!!as.getResponse());
			assert.equal(as.getResponse().statusCode, 200);
			done();
		});
	});
	it('getBody', function(done) {
		var as = new AbstractScraper();
		as.get(HN_CLONE, function(err) {
			assert.ok(!err);
			assert.equal(as.getBody(), fs.readFileSync(__dirname + '/static/hacker-news-clone.html').toString());
			done();
		});
	});
	it('loadBody', function(done) {
		var as = new AbstractScraper();
		as.loadBody(function() {
			done();
		});
	});
	it('scrape', function() {
		var as = new AbstractScraper();
		as.scrape(function() {
			assert.fail('Function shouldn\'t be called');
		}, function() {
			assert.fail('Function shouldn\'t be called');
		});
	});
	it('close', function() {
		var as = new AbstractScraper();
		assert.ok(as.close() === undefined);
	});
	it('clone', function() {
		var as = new AbstractScraper();
		assert.ok(as.clone() === undefined);
	});
});