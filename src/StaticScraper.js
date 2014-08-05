var cheerio = require('cheerio'),
	AbstractScraper = require('./AbstractScraper');

/**
 * A static scraper. This can only scrape static content, with the
 *   help of jQuery.
 * This version uses cheerio {@link https://github.com/cheeriojs/cheerio}.
 *
 * @extends {AbstractScraper}
 */
StaticScraper = function(callback) {
	AbstractScraper.call(this, callback);
	/**
	 * jQuery.
	 *
	 * @type {!function}
	 * @private
	 */
	this.$ = null;
};
StaticScraper.prototype = Object.create(AbstractScraper.prototype);
/**
 * @override
 * @inheritDoc
 */
StaticScraper.prototype.loadBody = function(done) {
	this.$ = cheerio.load(this.body);
	done();
	return this;
};
/**
 * Scrapes the webpage. According to a function, and a callback.
 *
 * @param  {!function()} scraperFn Function to scrape the content.
 * @param  {!function(?)} callbackFn Function that receives the
 *   result of the scraping.
 * @return {!AbstractScraper} This scraper.
 * @public
 */
StaticScraper.prototype.scrape = function(scraperFn, callbackFn) {
	var result = null;
	try {
		result = scraperFn(this.$);
		callbackFn(null, result);
	} catch (err) {
		callbackFn(err, null);
	}
	return this;
};

module.exports = function(url, callback) {
	var scraper = new StaticScraper(callback);
	if (url) {
		return scraper.get(url);
	} else {
		return scraper;
	}
};