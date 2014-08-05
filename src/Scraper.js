var StaticScraper = require('./StaticScraper.js'),
	DynamicScraper = require('./DynamicScraper.js'),
	ScraperPromise = require('./ScraperPromise.js');

function initScraper(ScraperType, url) {
	var promise = new ScraperPromise(),
		scraper = new ScraperType(function(err, scraper) {
			promise._fire(err, scraper);
		});
	if (url) {
		scraper.get(url);
	}
	return promise;
}

module.exports = {
	createStatic: function createStatic(url) {
		return initScraper(StaticScraper, url);
	},
	createDynamic: function createDynamic(url) {
		return initScraper(StaticScraper, url);
	},
	StaticScraper: StaticScraper,
	DynamicScraper: DynamicScraper,
	ScraperPromise: ScraperPromise
};