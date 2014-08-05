var phantom = require('phantom'),
	AbstractScraper = require('./AbstractScraper'),
	ScraperError = require('./ScraperError');
/**
 * A dynamic scraper. This is a very versatile and powerful. This
 *   solution is a little heavier and slower than the {@see StaticScraper}.
 * This version uses phantomjs {@link http://phantomjs.org/}, and {@link https://github.com/sgentle/phantomjs-node}.
 *
 * @extends {AbstractScraper}
 */
var DynamicScraper = function(callback) {
	AbstractScraper.call(this, callback);
	/**
	 * Phantom instance.
	 *
	 * @type {?}
	 * @private
	 */
	this.ph = null;
	/**
	 * Phantom's page.
	 *
	 * @type {?}
	 * @private
	 */
	this.page = null;
	/**
	 * Error.
	 *
	 * @type {?ErrorScraper}
	 * @private
	 */
	this.error = null;
};
DynamicScraper.prototype = Object.create(AbstractScraper.prototype);
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.loadBody = function(done) {
	var that = this;
	phantom.create({
		onStdout: function() {},
		onStderr: function() {}
	}, function(ph) {
		that.ph = ph;
		ph.createPage(function(page) {
			that.page = page;
			page.setContent(that.body, null, function(success) {
				if (!success) {
					that.error = new ScraperError('Couldn\'t set the content of the page');
				}
				page.injectJs('./bower_components/jquery/dist/jquery.min.js', function(success) {
					if (!success) {
						that.error = new ScraperError('Couldn\'t inject jQuery into the page.');
					}
					done();
				});
			});
		});
	});
	return this;
};
/**
 * The scraper function has it's own scope (can't access outside its
 *   own scope), and only JSON serializable information can be return
 *   by the function. For more information {@link https://github.com/sgentle/phantomjs-node}.
 *
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.scrape = function(scraperFn, callbackFn) {
	var that = this;

	function close() {
		that.page.close();
		that.ph.exit();
	}

	if (this.error) {
		close();
		return callbackFn(that.error, null);
	}
	this.page.evaluate(scraperFn, function(result) {
		close();
		callbackFn(null, result);
	});
	return this;
};

module.exports = DynamicScraper;