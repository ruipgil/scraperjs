/**
 * A scraper error, to refer error occurred in the scope of this
 *   package. For more information about the error use it's message
 *   property.
 *
 * @param   {!string} message Error message.
 * @extends {Error}
 */
var ScraperError = function(message) {
	/**
	 * Error message.
	 *
	 * @type {!string}
	 * @public
	 */
	this.message = message;
	/**
	 * This type.
	 *
	 * @type {!string}
	 * @public
	 */
	this.name = 'ScraperError';
	/**
	 * Stack message.
	 *
	 * @type {!string}
	 * @public
	 */
	this.stack = (new Error()).stack;
};
ScraperError.prototype = new Error();
ScraperError.prototype.constructor = ScraperError;

module.exports = ScraperError;