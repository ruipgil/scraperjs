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
				keys.push(undefined);
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
 * @constructor
 */
var Router = function() {
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
	/**
	 * Error promise.
	 *
	 * @type {!function(!string=)}
	 * @private
	 */
	this.errorFn = function() {};
};
Router.prototype = {
	constructor: Router,
	/**
	 * Promise to url match. It's promise will fire only if the path
	 *   matches with and url being routed.
	 *
	 * @param  {!(string|RegExp)} path The path to match an url. For
	 *   more information on the path matching refer to {@link https://github.com/aaronblohowiak/routes.js/blob/76bc517037a0321507c4d84a0cdaca6db31ebaa4/README.md#path-formats}
	 * @return {!Router} This router.
	 * @public
	 */
	on: function(path) {
		var pattern = null,
			ids = ['url'];
		if (path instanceof RegExp) {
			pattern = path;
		} else if (typeof path === 'string') {
			pattern = pathToRegExp(path, ids);
		} else {
			throw new ScraperError('Invalid path.');
		}

		this.promises.push({
			callback: function(url) {
				var match = pattern.exec(url);
				if (!match) {
					return null;
				} else {
					var params = {};
					ids.forEach(function(id, index) {
						params[id] = match[index];
					});
					return params;
				}
			},
			scraper: null
		});
		return this;
	},
	/**
	 * On error promise. This promise fires when an error is thrown,
	 *   at this level there shouldn't be any error.
	 * This is a one time promise, which means that the last promise
	 *   is gonna be the one to be executed, if needed be.
	 *
	 * @param  {!function(!string, ?)} callback Function with the url
	 *   and the error as the parameters.
	 * @return {!Router} This router.
	 * @public
	 */
	onError: function(callback) {
		this.errorFn = callback;
		return this;
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
	 * @param  {!function()} callback Function to call when the
	 *   routing is complete.
	 * @return {!Router} This router.
	 * @public
	 */
	route: function(url, callback) {
		var atLeastOne = false;
		var that = this;
		callback = callback || function() {};
		async.each(this.promises, function(promiseObj, done) {

			var promiseFn = promiseObj.callback,
				scraperPromise = promiseObj.scraper;
			var result = promiseFn(url);
			if (result !== null) {
				atLeastOne = true;
				scraperPromise._setChainParameter(result);
				scraperPromise.get(url);
			}
			done();

		}, function(err) {
			if (err) {
				that.errorFn(err);
			} else if (!atLeastOne) {
				that.otherwiseFn(url);
			}
			callback();
		});
		return this;
	}
};

module.exports = Router;