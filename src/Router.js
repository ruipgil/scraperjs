var async = require('async'),
	StaticScraper = require('./StaticScraper'),
	DynamicScraper = require('./DynamicScraper'),
	ScraperError = require('./ScraperError');
/**
 * @constructor
 */
var Router = function() {
	this.promises = [];
	this.otherwiseFn = function() {};
	this.errorFn = function() {};
};
Router.prototype = {
	constructor: Router,
	on: function(urlPattern) {
		this.promises.push({
			callback: function(url) {
				return url == urlPattern;
			},
			scraper: null
		});
		return this;
	},
	onError: function(callback) {
		this.errorFn = callback;
		return this;
	},
	otherwise: function(callback) {
		this.otherwiseFn = callback;
		return this;
	},
	createStatic: function() {
		var length = this.promises.length,
			last = this.promises[length - 1];
		if (length && last && !last.scraper) {
			var ss = StaticScraper.create();
			last.scraper = ss;
			return ss;
		} else {
			throw new ScraperError('');
		}
	},
	createDynamic: function() {
		var length = this.promises.length,
			last = this.promises[length - 1];
		if (length && last && !last.scraper) {
			var ss = DynamicScraper.create();
			last.scraper = ss;
			return ss;
		} else {
			throw new ScraperError('');
		}
	},
	route: function(url, callback) {
		var atLeastOne = false;
		var that = this;
		callback = callback || function() {};
		async.each(this.promises, function(promiseObj, done) {
			var promiseFn = promiseObj.callback,
				scraperPromise = promiseObj.scraper;
			if (!!promiseFn(url)) {
				atLeastOne = true;
				scraperPromise.get(url, function() {});
				done();
			} else {
				done();
			}
		}, function(err) {
			if (err) {
				that.errorFn(err);
			} else if (!atLeastOne) {
				that.otherwiseFn(url);
			}
			callback();
		});
	}
};

module.exports = Router;