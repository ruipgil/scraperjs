var async = require('async'),
	StaticScraper = require('./StaticScraper'),
	DynamicScraper = require('./DynamicScraper'),
	ScraperError = require('./ScraperError');

/**
 * Transforms a string into a regular expression.
 * This function is from the project Routes.js, under the MIT licence,
 *   {@link https://github.com/aaronblohowiak/routes.js} it's present
 *   in the file {@link https://github.com/aaronblohowiak/routes.js/blob/bdad0a1ae10d11981bb286550bb3b8a1a71909bd/dist/routes.js#L49}.
 *
 * @param  {!string} path String path.
 * @param  {!Array.<string>} keys Empty array to be filled with the
 *   keys ids.
 * @return {!RegExp} Regular expression.
 */
function pathToRegExp(path, keys) {
	path = path
		.concat('/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, function(_, slash, format, key, capture, optional) {
			if (_ === '*') {
				return _;
			}

			keys.push(key);
			slash = slash || '';
			return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || '([^/]+?)') + ')' + (optional || '');
		})
		.replace(/([\/.])/g, '\\$1')
		.replace(/\*/g, '(.*)');
	return new RegExp('^' + path + '$', 'i');
}

/**
 * Routes an url thought a valid, predefined, path.
 *
 * @param {!Object=} options Setup options.
 * @param {!boolean=} options.firstMatch If true the router will stop
 *   at the first path matched. The default is false, and tries to
 *   match every path.
 * @constructor
 */
var Router = function(options) {
	options = options || {};
	/**
	 * Stops routing at first successful match.
	 *
	 * @type {!boolean}
	 * @private
	 */
	this.firstMatchStop = options.firstMatch || false;
	/**
	 * Chain of promises.
	 *
	 * @type {!Array.<!Object>}
	 * @private
	 */
	this.promises = [];
	/**
	 * Otherwise promise.
	 *
	 * @type {!function(!string=)}
	 * @private
	 */
	this.otherwiseFn = function() {};
};
Router.prototype = {
	constructor: Router,
	/**
	 * Promise to url match. It's promise will fire only if the path
	 *   matches with and url being routed.
	 *
	 * @param  {!(string|RegExp|function(string):?)} path The
	 *   path or regular expression to match an url.
	 *   Alternatively a function that receives the url to be matched
	 *   can be passed. If the result is false, or any
	 *   !!result===false), the path is considered valid and the
	 *   scraping should be done. If ,in case of a valid path, an Object is returned, it will be associated with the params of this
	 *   route/path.
	 *   For more information on the path matching refer to {@link https://github.com/aaronblohowiak/routes.js/blob/76bc517037a0321507c4d84a0cdaca6db31ebaa4/README.md#path-formats}
	 * @return {!Router} This router.
	 * @public
	 */
	on: function(path) {
		var callback;
		if (typeof path === 'function') {
			callback = path;
		}

		this.promises.push({
			callback: callback ? function(url) {
				return callback(url);
			} : Router.pathMatcher(path),
			scraper: null,
			rqMethod: null
		});
		return this.get();
	},
	/**
	 * Sets the request method to be a simple HTTP GET.
	 * {@see AbstractScraper.get}
	 *
	 * @return {!Router} This router.
	 * @public
	 */
	get: function() {
		var length = this.promises.length,
			last = this.promises[length - 1];
		if (length && last) {
			last.rqMethod = function(scraper, url) {
				scraper.get(url);
			};
			return this;
		} else {
			throw new ScraperError('');
		}
	},
	/**
	 * Sets the request method to be according to the options.
	 * {@see AbstractScraper.request}
	 *
	 * @param  {!Object} options Request options.
	 * @return {!Router} This router.
	 * @public
	 */
	request: function(options) {
		var length = this.promises.length,
			last = this.promises[length - 1];
		if (length && last) {
			last.rqMethod = function(scraper, url) {
				options.uri = url;
				scraper.request(options);
			};
			return this;
		} else {
			throw new ScraperError('');
		}
	},
	/**
	 * A promise to be triggered when none of the paths where matched.
	 * This is a one time promise, which means that the last promise
	 *   is gonna be the one to be executed.
	 *
	 * @param  {!function(!string=)} callback Function with the url as
	 *   a parameter.
	 * @return {!Router} This router.
	 * @public
	 */
	otherwise: function(callback) {
		this.otherwiseFn = callback;
		return this;
	},
	/**
	 * Creates a static scraper, and associates it with the current
	 *   router promise chain. Note that this method returns a
	 *   {@see ScraperPromise} of a {@see StaticScraper}.
	 *
	 * @return {!ScraperPromise} A promise for the scraper.
	 * @public
	 */
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
	/**
	 * Associates the current route with the a scraper (promise)
	 *   instance. Keep in mind that the done promise will not be
	 *   available.
	 *
	 * @param  {!AbstractScraper} scraper A scraper instance to use.
	 * @return {!Router} This router.
	 * @public
	 */
	use: function(scraper) {
		var length = this.promises.length,
			last = this.promises[length - 1];
		if (length && last && !last.scraper) {
			last.scraper = scraper;
			return this;
		} else {
			throw new ScraperError('');
		}
	},
	/**
	 * Creates a dynamic scraper, and associates it with the current
	 *   router promise chain. Note that this method returns a
	 *   {@see ScraperPromise} of a {@see DynamicScraper}.
	 *
	 * @return {!ScraperPromise} A promise for the scraper.
	 * @public
	 */
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
	/**
	 * Routes a url through every path that matches it.
	 *
	 * @param  {!string} url The url to route.
	 * @param  {!function(boolean)} callback Function to call when the
	 *   routing is complete. If any of the paths was found the
	 *   parameter is true, false otherwise.
	 * @return {!Router} This router.
	 * @public
	 */
	route: function(url, callback) {
		var that = this,
			atLeastOne = false,
			stopFlag = {},
			lastReturn;
		callback = callback || function() {};
		async.eachSeries(this.promises, function(promiseObj, done) {

			var matcher = promiseObj.callback,
				scraper,
				reqMethod = promiseObj.rqMethod;
			var result = matcher(url);
			if (!!result) {
				scraper = promiseObj.scraper.clone();
				atLeastOne = true;
				scraper._setChainParameter(result);
				scraper.done(function(lr, utils) {
					lastReturn = lr;
					done(that.firstMatchStop ? stopFlag : undefined);
				});
				reqMethod(scraper, url);
			} else {
				done();
			}

		}, function() {
			if (!atLeastOne) {
				that.otherwiseFn(url);
			}
			callback(atLeastOne, lastReturn);
		});
		return this;
	}
};
/**
 * Creates a function to match a path against a string.
 *
 * @param  {!(string|RegExp)} pathOrRE Pattern to match, if it's a
 *   string it will be transformed into a regular expression.
 * @return {!function(string):(Object|booelan)} A matching function,
 *   that given a string will check if it matches the path. If the
 *   path has parameters it will return an object with the parameters
 *   as keys and the values as the values of the parameters. An empty
 *   object if there were no valid parameters or false if the path
 *   doesn't match with the string.
 * @public
 * @static
 */
Router.pathMatcher = function(pathOrRE) {
	var pattern,
		keys = ['url'];
	if (pathOrRE instanceof RegExp) {
		pattern = pathOrRE;
	} else if (typeof pathOrRE === 'string') {
		pattern = pathToRegExp(pathOrRE, keys);
	} else {
		throw new ScraperError('A path must be a string or a regular expression.');
	}

	return function patternMatchingFunction(url) {
		var match = pattern.exec(url);
		if (!match) {
			return false;
		} else {
			return keys.reduce(function(obj, value, index) {
				obj[value] = match[index];
				return obj;
			}, {});
		}
	};
};

module.exports = Router;
