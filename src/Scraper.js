var SimpleScraper = require('./staticScraper.js'),
	DynamicScraper = require('./dynamicScraper.js'),
	ScraperPromise = require('./scraperPromise.js');

function initScraper(type, url) {
	var promise = new ScraperPromise();
	if (url) {
		type(url, function(error, scraper) {
			promise._fire(error, scraper);
		});
	} else {
		type(function(error, scraper) {
			promise._fire(error, scraper);
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
	},
	SimpleScraper: SimpleScraper,
	DynamicScraper: DynamicScraper,
	ScraperPromise: ScraperPromise
};