var phantom = require('phantom');

/**
 * This maintains only one PhantomJS instance. It works like a proxy
 *   between the phantom package, and should expose the methods same
 *   methods. An additional call to close the phantomJS instance
 *   properly is needed.
 *
 * @constructor
 */
var PhantomPoll = function() {
	/**
	 * The real PhantomJS instance.
	 *
	 * @type {?}
	 * @private
	 */
	this.instance = null;
	/**
	 * The PhantomJS instance is being created.
	 *
	 * @type {!boolean}
	 * @private
	 */
	this.creating = false;
	/**
	 * PhantomJS flags.
	 *
	 * @type {!string}
	 * @private
	 */
	this.flags = '';
	/**
	 * PhantomJS options.
	 *
	 * @type {!Object}
	 * @private
	 */
	this.options = {
		onStdout: function() {},
		onStderr: function() {}
	};
	/**
	 * List of functions waiting to be called after the PhantomJS
	 *   instance is created.
	 *
	 * @type {!Array.<!function(?)>}
	 * @private
	 */
	this.waiting = [];
	this._createInstance();
};
PhantomPoll.prototype = {
	constructor: PhantomPoll,
	/**
	 * Creates a PhantomJS page, to be called with a callback, which
	 *   will receive the page.
	 *
	 * @param  {!function(?)} callback Function to be called after the
	 *   page is created, it receives the page object.
	 * @public
	 */
	createPage: function(callback) {
		if (this.instance) {
			this.instance.createPage(function(page) {
				callback(page);
			});
		} else {
			var that = this;
			this._createInstance(function() {
				that.createPage(callback);
			});
		}
	},
	/**
	 * Creates a PhantomJS instance.
	 *
	 * @param  {!string} flags Creation flags.
	 * @param  {!Object} options Creation options.
	 * @param  {!function(?)} callback Function to be called after
	 *   the phantom instance is created.
	 *
	 * @public
	 */
	create: function(flags, options, callback) {
		this.flags = flags;
		this.options = options;
		callback(this);
	},
	/**
	 * Creates PhantomJS instance if needed be, and when it's done
	 *   triggers all the callbacks.
	 *
	 * @param  {!function(?)} callback Function to be called when the
	 *   instance is created, if a phantom instance is waiting to be
	 *   created the callback will be added to a waiting list.
	 * @private
	 */
	_createInstance: function(callback) {
		if (this.creating && callback) {
			this.waiting.push(callback);
		} else {
			var that = this;
			this.creating = true;
			phantom.create(this.flags, this.options, function(ph) {
				that.instance = ph;
				that.creating = false;
				that.waiting.forEach(function(callback) {
					callback(ph);
				});
				that.waiting = [];
			});
		}
	},
	/**
	 * This is a function just to maintain the same interface
	 *   with the phantom module. If the PhantomJS instance needs be
	 *   destroyed the method close must be used.
	 *
	 * @public
	 */
	exit: function() {},
	/**
	 * Exits the phantom instance.
	 *
	 * @public
	 */
	close: function() {
		if (this.instance) {
			this.instance.exit();
		}
	}
};

module.exports = PhantomPoll;