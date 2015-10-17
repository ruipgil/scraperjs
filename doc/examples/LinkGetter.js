var sjs = require('../../src/Scraper'),
	url = process.argv.slice(2)[0];

if(!url) {
	console.log('Usage: node LinkGetter.js <url>');
	return;
}

/*
 Get all the links in a page.
 */
sjs.StaticScraper
	.create()
	.onStatusCode(function(code) {
		console.log(code);
	})
	.scrape(function($) {
		return $('a').map(function() {
			return $(this).attr('href');
		}).get();
	})
	.then(function(links) {
		links.forEach(function(link) {
			console.log(link);
		});
	})
	.get(url);