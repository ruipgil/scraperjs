/* global it */
var ScraperError = require('../src/ScraperError'),
	assert = require('assert');

it('ScraperError', function() {
	var err = new ScraperError('random message');
	assert.equal(err.message, 'random message');
	assert.equal(err.name, 'ScraperError');
	assert.ok(err.stack);
});