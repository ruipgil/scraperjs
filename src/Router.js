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
	this.promises = [];
	this.otherwiseFn = function() {};
	this.errorFn = function() {};
};
Router.prototype = {
	constructor: Router,
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
	}
};

module.exports = Router;