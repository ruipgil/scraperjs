var request = require('request'),
	cheerio = require('cheerio');

/**
 * @constructor
 */
AbstractScraper = function(callback) {
	this.$ = null;
	this.response = null;
	this.body = null;
	this.callback = callback || function() {};
};
AbstractScraper.prototype = {
	constructor: AbstractScraper,
	get: function(url) {
		var that = this;
		request.get(url, function(error, response, body) {
			that.response = response;
			that.body = body;
			if (error) {} else {
				that.loadBody();
				that.callback(that); //TODO include error
			}
		});
		return this;
	},
	getStatusCode: function() {
		return this.response.statusCode;
	},
	loadBody: function() {
		this.$ = cheerio.load(this.body);
		return this;
	},
	scrape: function(scraperFn, callbackFn) {
		var result = null;
		try {
			result = scraperFn(this.$);
			callbackFn(null, result);
		} catch (err) {
			callbackFn(err, null);
		}
		return this;
	}

};

module.exports = function(url, callback) {
	var scraper = new AbstractScraper(callback);
	if (url) {
		return scraper.get(url);
	} else {
		return scraper;
	}
};