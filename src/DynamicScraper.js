var phantomOrig = require('phantom'),
	PhantomPoll = require('./PhantomPoll.js'),
	phantom = phantomOrig,
	AbstractScraper = require('./AbstractScraper'),
	ScraperError = require('./ScraperError');

/**
 * A dynamic scraper. This is a very versatile and powerful. This
 *   solution is a little heavier and slower than the {@see StaticScraper}.
 * This version uses phantomjs {@link http://phantomjs.org/}, and {@link https://github.com/sgentle/phantomjs-node}.
 *
 * @extends {AbstractScraper}
 */
var DynamicScraper = function() {
	AbstractScraper.call(this);
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
				page.injectJs('./node_modules/jquery/dist/jquery.min.js', function(success) {
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
 * @param  {!function(...?)} scraperFn Function to scrape the content.
 *   It receives the args as parameters, if passed.
 * @param  {!function(?)} callbackFn Function that receives the
 *   result of the scraping.
 * @param  {!Array=} args Additional arguments to pass to the scraping
 *   function. They must be JSON serializable.
 * @return {!AbstractScraper} This scraper.
 * @override
 * @public
 */
DynamicScraper.prototype.scrape = function(scraperFn, callbackFn, args) {
	var that = this;
	if (this.error) {
		return callbackFn(that.error, null);
	}

	args = args || [];
	args.unshift(function(result) {
		callbackFn(null, result);
	});
	args.unshift(scraperFn);

	this.page.evaluate.apply(this.page, args);
	return this;
};
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.close = function() {
	this.page.close();
	this.ph.exit();
	return this;
};
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.clone = function() {
	return new DynamicScraper();
};

DynamicScraper.create = function(url) {
	return AbstractScraper.create(DynamicScraper, url);
};

DynamicScraper.startFactory = function() {
	phantom = new PhantomPoll();
	return DynamicScraper;
};
DynamicScraper.closeFactory = function() {
	if (phantom instanceof PhantomPoll) {
		phantom.close();
	}
	phantom = phantomOrig;
	return DynamicScraper;
};
module.exports = DynamicScraper;