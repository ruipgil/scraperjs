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
};
DynamicScraper.prototype = Object.create(AbstractScraper.prototype);
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.loadBody = function(done) {
	var that = this;
	phantom.create('--load-images=no', {
		onStdout: function() {},
		onStderr: function() {}
	}, function(ph) {
		that.ph = ph;
		ph.createPage(function(page) {
			that.page = page;
			page.setContent(that.body, that.url, function() {
				that.inject(DynamicScraper.JQUERY_FILE, function(err) {
					done(err ? new ScraperError('Couldn\'t inject jQuery into the page.') : undefined);
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
	args = args || [];
	args.unshift(function(result) {
		callbackFn(null, result);
	});
	args.unshift(scraperFn);

	this.page.evaluate.apply(this.page, args);
	return this;
};
/**
 * Injects a javascript file into the page.
 *
 * @param  {!string} file File to inject.
 * @param  {!function(!ScraperError=)} callback Function to be called
 *   when the file has injected. If the injection fails, then the
 *   first argument is not is a {@see ScraperError}.
 * @public
 */
DynamicScraper.prototype.inject = function(file, callback) {
	if (this.page) {
		this.page.injectJs(file, function(success) {
			if (success) {
				callback();
			} else {
				callback(new ScraperError('Couldn\'t inject code, at "' + file + '".'));
			}
		});
	} else {
		throw new ScraperError('Couldn\'t inject code, at "' + file + '". The page has not been initialized yet.');
	}
};
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.close = function() {
	if (this.page) {
		this.page.close();
	}
	if (this.ph) {
		this.ph.exit();
	}
	return this;
};
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.clone = function() {
	return new DynamicScraper();
};
/**
 * Creates a dynamic scraper, wrapped around a scraper promise.
 *
 * @param  {!string=} url If provided makes an HTTP GET request to the
 *   given URL.
 * @return {!ScraperPromise} Scraper promise, with a dynamic scraper.
 * @public
 * @static
 */
DynamicScraper.create = function(url) {
	return AbstractScraper.create(DynamicScraper, url);
};
/**
 * Starts the factory. A factory should only be open once, and after
 *   it's open it must be closed with {@see DynamicScraper#closeFactory}.
 *   A factory makes so that there's only one instance of phantom at a
 *   time, which makes the creation/usage of dynamic scrapers much
 *   more efficient.
 *
 * @return {!DynamicScraper}
 * @public
 * @static
 */
DynamicScraper.startFactory = function() {
	phantom = new PhantomPoll();
	return DynamicScraper;
};
/**
 * Closes the factory. For more information {@see DynamicScraper#closeFactory}
 *
 * @return {!DynamicScraper}
 * @public
 * @static
 */
DynamicScraper.closeFactory = function() {
	if (phantom instanceof PhantomPoll) {
		phantom.close();
	}
	phantom = phantomOrig;
	return DynamicScraper;
};
/**
 * Location of the jquery file.
 *
 * @type {!string}
 * @private
 * @static
 */
DynamicScraper.JQUERY_FILE = __dirname + '/../node_modules/jquery/dist/jquery.min.js';

module.exports = DynamicScraper;