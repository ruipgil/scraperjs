var request = require('request'),
	ScraperPromise = require('./ScraperPromise');

/**
 * An abstract scraper, this class should not be used directly as a
 *   scraper, instead a concrete scraper should inherit or use this
 *   class as a composite this class.
 *
 * @constructor
 */
var AbstractScraper = function() {
	/**
	 * Status code of the requested page.
	 *
	 * @type {!number}
	 * @protected
	 */
	this.statusCode = null;
	/**
	 * Body of the webpage, as a string.
	 *
	 * @type {!string}
	 * @protected
	 */
	this.body = null;
};
AbstractScraper.prototype = {
	constructor: AbstractScraper,
	/**
	 * Executes an HTTP GET request to the given url.
	 *
	 * @param  {!string} url URL to request.
	 * @param  {!function(Error=)} callback Function to call when the
	 *   request is done. If the request was successful then it's
	 *   called with no arguments or null argument. Otherwise, if
	 *   there was an error the it's called with one argument not
	 *   null, that should be an error instance.
	 * @return {!AbstractScraper} This scraper.
	 * @public
	 */
	get: function(url, callback) {
		var that = this;
		request.get(url, function processGet(error, response, body) {
			that.statusCode = response.statusCode;
			that.body = body;
			if (error) {
				callback(error);
			} else {
				that.loadBody(function() {
					callback(null);
				});
			}
		});
		return this;
	},
	/**
	 * Gets the status code of a request.
	 *
	 * @return {?number} The status code, if a there was a successful
	 *   request, null otherwise.
	 * @public
	 */
	getStatusCode: function() {
		return this.statusCode;
	},
	/* jshint unused:false */
	/**
	 * Loads the string, to a representation that can be used in the
	 *   scraping process.
	 *
	 * @param  {!function()} done Callback function, for when the body
	 *   is done loading.
	 * @return {!AbstractScraper} This scraper.
	 * @protected
	 */
	loadBody: function(done) {},
	/**
	 * Scrapes the webpage. According to a function, and a callback.
	 *
	 * @param  {!function()} scraperFn Function to scrape the content.
	 * @param  {!function(?)} callbackFn Function that receives the
	 *   result of the scraping.
	 * @return {!AbstractScraper} This scraper.
	 * @public
	 */
	scrape: function(scraperFn, callbackFn) {}
};

AbstractScraper.create = function(ScraperType, url) {
	var promise = new ScraperPromise(new ScraperType());
	if (url) {
		promise.get(url);
	}
	return promise;
};

module.exports = AbstractScraper;