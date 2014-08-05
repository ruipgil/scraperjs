/**
 * @extends {Error}
 */
var ScraperError = function(message) {
	this.message = message;
	this.name = "ScraperError";
	this.stack = (new Error()).stack;
};
ScraperError.prototype = new Error();
ScraperError.prototype.constructor = ScraperError;

module.exports = ScraperError;