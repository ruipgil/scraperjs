var async = require('async');

/**
 * @constructor
 */
ScraperPromise = function() {
	/**
	 * Scraper to use. This means that the promise can be recycled.
	 *
	 * @type {?Scraper}
	 * @private
	 */
	this.scraper = null;
	/**
	 * Promise chunks.
	 *
	 * @type {!Array.<function(function(?))>}
	 * @private
	 */
	this.promises = [];
	/**
	 * Function to call when all the promises are fulfilled.
	 *
	 * @type {!function(?)}
	 * @private
	 */
	this.doneCallback = function() {};
	/**
	 * Function to call when there's an error.
	 *
	 * @type {!function(?)}
	 * @private
	 */
	this.errorCallback = function() {};
};
ScraperPromise.prototype = {
	constructor: ScraperPromise,
	/**
	 * Sets a promise for a status code, of a response of a request.
	 *
	 * @param  {!(number|function(number))} code Status code to
	 *   dispatch the message. Or a callback function, in this case
	 *   the function's first parameter is the status code, as a
	 *   number.
	 * @param  {!function()} callback Callback function for the case
	 *   where the status code is provided.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	onStatusCode: function(code, callback) {
		var that = this;
		if (typeof code == "function") {
			callback = code;
			this.promises.push(function onGenericStatusCode(done) {
				callback(that.scraper.getStatusCode());
				done();
			});
		} else {
			this.promises.push(function onStatusCode(done) {
				if (code === that.scraper.getStatusCode()) {
					callback();
				}
				done();
			});
		}
		return this;
	},
	/**
	 * Sets a promise to scrape the retrieved webpage.
	 *
	 * @param  {!function(?, ?)} scrapeFn Function to scrape the
	 *   webpage. The parameters depend on what kind of scraper.
	 * @param  {!function(?)} callback Callback function with the
	 *   result of the scraping function.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	scrape: function(scrapeFn, callback) {
		var that = this;
		this.promises.push(function scrape(done) {
			that.scraper.scrape(scrapeFn, function(err, result) {
				if (err) {
					done(err);
				} else {
					callback(result);
					done();
				}
			});
		});
		return this;
	},
	/**
	 * Sets a promise to delay the execution of the promises.
	 *
	 * @param  {!number} time Time in milliseconds to delay the
	 *   execution.
	 * @param  {!function()} callback Function to call after the
	 *   delay.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	delay: function(time, callback) {
		this.promises.push(function delay(done) {
			setTimeout(function() {
				callback();
				done();
			}, time);
		});
		return this;
	},
	/**
	 * Sets a promise to execute a promise after a time period. This
	 *   does not cause the promise chain to block.
	 *
	 * @param  {!number} time Time in milliseconds to the execution of
	 *   the callback.
	 * @param  {!function()} callback Function to call after the
	 *   time period has passed.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	timeout: function(time, callback) {
		var scraper = this.scraper;
		this.promises.push(function timeout(done) {
			setTimeout(function() {
				callback();
			}, time);
			done();
		});
		return this;
	},
	/**
	 * Sets the end of the promise chain callback, if there were no
	 *   errors.
	 *
	 * @param  {!function()} doneFn Callback function.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	done: function(doneFn) {
		this.doneCallback = doneFn;
		return this;
	},
	/**
	 * Sets a generic promise.
	 *
	 * @param  {!function()} callback Callback.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	then: function(callback) {
		this.promises.push(function then(done) {
			callback();
			done();
		});
		return this;
	},
	/**
	 * Sets a promise to when an error occur, note that an error will
	 *   break the promise chain, so this one is the next and the last
	 *   promise to be called (if the done promise is not set).
	 *
	 * @param  {!function(?)} callback Callback.
	 * @return {!ScraperPromise} This object, so that new promises can
	 *   be made.
	 * @public
	 */
	onError: function(callback) {
		this.errorCallback = callback;
		return this;
	},
	/**
	 * Starts the promise chain.
	 *
	 * @param  {!Scraper} scraper Scraper to use in the promise chain.
	 * @protected
	 */
	_fire: function(scraper) {
		var that = this;
		this.scraper = scraper;
		async.eachSeries(this.promises, function dispatcher(fn, done) {
			try {
				fn(done);
			} catch (err) {
				done(err);
			}
		}, function(err) {
			if (err) {
				that.errorCallback(err);
			}
			that.doneCallback();
		});
	}
};

module.exports = ScraperPromise;