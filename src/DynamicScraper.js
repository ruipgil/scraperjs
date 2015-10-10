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
var DynamicScraper = function(options) {
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
	 * Phantom's options
	 *
	 * @type {?}
	 * @private
	 */
	this.options = {
		onStdout: function() {},
		onStderr: function() {}
	};
	for (var key in options) { this.options[key] = options[key]; }
};
DynamicScraper.prototype = Object.create(AbstractScraper.prototype);
/**
 * @override
 * @inheritDoc
 */
DynamicScraper.prototype.loadBody = function(done) {
	var that = this;
	phantom.create('--load-images=no', that.options, function(ph) {
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
 * @param  {!string=} stackTrace Stack trace to produce better error
 *   messages.
 * @return {!AbstractScraper} This scraper.
 * @override
 * @public
 */
DynamicScraper.prototype.scrape = function(scraperFn, callbackFn, args, stackTrace) {
	args = args || [];

	var wrapper = function wrapper(fnStr) {
	  var args = Array.prototype.slice.call(arguments);
	  var rg = /^function\s+([a-zA-Z_$][a-zA-Z_$0-9]*)?\((.*?)\) {/g;
	  var a = rg.exec(fnStr);
	  var fnArgs = a[2].match(/([^,\s]+)/g) || [];
	  var fnBody = fnStr.slice(fnStr.indexOf("{")+1, fnStr.lastIndexOf("}"));
	  fnArgs.push(fnBody);
	  var scraperFn = Function.apply(this, fnArgs);

	  try {
	    var gs = args.slice(1);
	    gs.unshift($);
	    var result = scraperFn.apply(this, gs);
	    return {
	      error: null,
	      result: result
	    };
	  } catch(e) {
	  	var errObj = {
	  		message: e.message
	  	};
	  	for(var x in e) {
	  		errObj[x] = e[x];
	  	}
	    return {
	      error: errObj,
	      result: null
	    };
	  }
	};

	args.unshift(scraperFn.toString());
	args.unshift(function(result) {
		if(result.error) {
			callbackFn(DynamicScraper.generateMockErrorMessage(result.error, stackTrace), null);
		} else {
			callbackFn(null, result.result);
		}
	});
	args.unshift(wrapper);

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
DynamicScraper.create = function(url, options) {
	return AbstractScraper.create(DynamicScraper, url, options);
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
 * Generates a mock error message that is similar to one produced
 *   by a function runned in node, and not phantomjs.
 * @param  {!Object} err       	Error object sent by Phantom.
 * @param  {!string} stackTrace Stack trace of where the promise was defined.
 * @return {!Error}             Error message.
 * @private
 * @static
 */
DynamicScraper.generateMockErrorMessage = function(err, stackTrace) {
	var rg = /^\s{4}at ([^\s]+) \(([^\s]*)\:(\d+):(\d+)\)$/mg;
	rg.exec(stackTrace);
	var emsg = rg.exec(stackTrace);
	var sob = emsg[1];
	var sfile = emsg[2];
	var sline = emsg[3];
	var sc = emsg[4];

	var line = Number(sline) + Math.max(err.line-1, 0);

	var mock = new Error(err.message);
	// Prevents the use of a property named 'line'!
	delete err.line;
	for(var x in err) {
		mock[x] = err[x];
	}
	mock.stack = mock.stack.replace(/\t/g, '    ');

	var ats = mock.stack.split('\n');
	ats.unshift('    at ' + sob + ' (' + sfile + ':' + line + ':' + sc + ')');
	ats.unshift('Error' + (err.message?': '+err.message:''));
	mock.stack = ats.join('\n');

	return mock;
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