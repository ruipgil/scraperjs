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
	 * @type {!Array.<function>}
	 * @private
	 */
	this.promises = [];
	/**
	 * Function to call when all the promises are fulfilled.
	 *
	 * @type {!function}
	 * @private
	 */
	this.doneCallback = function() {};
};
ScraperPromise.prototype = {
	constructor: ScraperPromise,
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
	scrape: function(scrapeFn, callback) {
		var that = this;
		this.promises.push(function scrape(done) {
			that.scraper.scrape(scrapeFn, function(err, result) {
				if (err) {
					// TODO handle error
				}
				callback(result);
				done();
			});
		});
		return this;
	},
	delay: function(time, callback) {
		this.promises.push(function delay(done) {
			setTimeout(function() {
				callback();
				done();
			}, time);
		});
		return this;
	},
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
	done: function(doneFn) {
		this.doneCallback = doneFn;
		return this;
	},
	then: function(callback) {
		this.promises.push(function then(done) {
			callback();
			done();
		});
	},
	_fire: function(scraper) {
		var that = this;
		this.scraper = scraper;
		async.eachSeries(this.promises, function dispatcher(fn, done) {
			//try {
			fn(done);
			/*} catch (err) {
				done(err);
			}*/
		}, function(err) {
			that.doneCallback(err);
		});
	}
};

module.exports = ScraperPromise;