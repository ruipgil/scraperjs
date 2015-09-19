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
	 * Status code of the last requested page.
	 *
	 * @type {!number}
	 * @protected
	 */
	this.statusCode = null;
	/**
	 * Response of the last requested page.
	 *
	 * @type {!Object}
	 * @protected
	 */
	this.response = null;
	/**
	 * Body of the last webpage, as a string.
	 *
	 * @type {!string}
	 * @protected
	 */
	this.body = null;
	/**
	 * URL.
	 *
	 * @type {!string}
	 * @protected
	 */
	this.url = '';
};
AbstractScraper.prototype = {
	constructor: AbstractScraper,
	/**
	 * Executes a simple HTTP GET request to the given url.
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
			if (error) {
				callback(error);
			} else {
				that.response = response;
				that.statusCode = response.statusCode;
				that.body = body;
				that.url = response.request.href;
				that.loadBody(function(err) {
					callback(err);
				});
			}
		});
		return this;
	},
	/**
	 * Executes an HTTP request to an url. This method allows for the
	 *   powerful use of the request package {@link https://github.com/mikeal/request},
	 *   since it's basically a wrapper around the method request.
	 *   For more information about how it's used refer to {@link https://github.com/mikeal/request#requestoptions-callback}.
	 *
	 * @param  {!(Object|string)} options Options of the request.
	 * @param  {!function(Error=)} callback Function to call when the
	 *   request is done. If the request was successful then it's
	 *   called with no arguments or null argument. Otherwise, if
	 *   there was an error the it's called with one argument not
	 *   null, that should be an error instance.
	 * @return {!AbstractScraper} This scraper.
	 * @public
	 */
	request: function(options, callback) {
		var that = this;
		request(options, function processRequest(error, response, body) {
			if (error) {
				callback(error);
			} else {
				that.response = response;
				that.statusCode = response.statusCode;
				that.body = body;
				that.url = response.request.href;
				that.loadBody(function(err) {
					callback(err);
				});
			}
		});
		return this;
	},
	/**
	 * Gets the status code of the last request.
	 *
	 * @return {?number} The status code, if a there was a successful
	 *   request, null otherwise.
	 * @public
	 */
	getStatusCode: function() {
		return this.statusCode;
	},
	/**
	 * Gets the response of the last request.
	 *
	 * @return {?number} The status code, if a there was a successful
	 *   request, null otherwise.
	 * @public
	 */
	getResponse: function() {
		return this.response;
	},
	/**
	 * Gets the body of the last request.
	 *
	 * @return {?number} The status code, if a there was a successful
	 *   request, null otherwise.
	 * @public
	 */
	getBody: function() {
		return this.body;
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
	loadBody: function(done) {
		done();
		return this;
	},
	/**
	 * Scrapes the webpage. According to a function, and a callback.
	 *
	 * @param  {!function(...?)} scraperFn Function to scrape the
	 *   content.
	 * @param  {!function(?)} callbackFn Function that receives the
	 *   result of the scraping.
	 * @param  {!Array} args Aditional arguments to pass to the
	 *   scraping function.
	 * @return {!AbstractScraper} This scraper.
	 * @public
	 */
	scrape: function(scraperFn, callbackFn, args) {},
	/**
	 * Closes the scraper.
	 *
	 * @return {!AbstractScraper} This scraper.
	 * @public
	 */
	close: function() {},
	/**
	 * Clones the scraper.
	 *
	 * @return {!AbstractScraper} Empty clone.
	 * @public
	 */
	clone: function() {}
};
/* jshint unused:true */

/**
 * Creates a scraper, based on a scraper type, and creates it's
 *   promise.
 *
 * @param  {!AbstractScraper} ScraperType Some concrete implementation
 *   of an abstract scraper.
 * @param  {!string=} url Url to make an HTTP GET request.
 * @return {!ScraperPromise} A scraper promise.
 * @public
 * @static
 */
AbstractScraper.create = function(ScraperType, url, options) {
	var promise = new ScraperPromise(new ScraperType(options));
	if (url) {
		promise.get(url);
	}
	return promise;
};

module.exports = AbstractScraper;