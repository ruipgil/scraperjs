var SimpleScraper = require('./staticScraper.js'),
	DynamicScraper = require('./staticScraper.js'),
	ScraperPromise = require('./scraperPromise.js');

function initScraper(type, url) {
	var promise = new ScraperPromise();
	if (url) {
		type(url, function(scraper) {
			promise._fire(scraper);
		});
	} else {
		type(function(scraper) {
			promise._fire(scraper);
		});
	}
	return promise;
}

module.exports = {
	createStatic: function createStatic(url) {
		return initScraper(SimpleScraper, url);
	},
	createDynamic: function createDynamic(url) {
		return initScraper(DynamicScraper, url);
	}
};