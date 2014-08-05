var request = require('request');

/**
 * An abstract scraper, this class should not be used directly as a
 *   scraper, instead a concrete scraper should inherit or use this
 *   class as a composite this class.
 *
 * @param {!function(?, ?)} callback Callback function, to be executed
 *   when an HTTP request is successfully made.
 * @constructor
 */
var AbstractScraper = function(callback) {
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
	/**
	 * Function to be called when the body is loaded. With two
	 *   parameters, an error (or null if there was none) and this
	 *   parser (or null if there was an error).
	 *
	 * @type {!function(?, ?)}
	 * @private
	 */
	this.callback = callback || function() {};
};
AbstractScraper.prototype = {
	constructor: AbstractScraper,
	/**
	 * Executes an HTTP GET request to the given url.
	 *
	 * @param  {!string} url URL to request.
	 * @return {!AbstractScraper} This scraper.
	 * @public
	 */
	get: function(url) {
		var that = this;
		request.get(url, function processGet(error, response, body) {
			that.statusCode = response.statusCode;
			that.body = body;
			if (error) {
				that.callback(error, null);
			} else {
				that.loadBody(function() {
					that.callback(null, that);
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

module.exports = AbstractScraper;