var sjs = require('../../src/Scraper');
/*
 Scrape the news in Hacker News.
 */
sjs.StaticScraper
	.create('https://news.ycombinator.com')
	.scrape(function($) {
		return $('.title a').map(function() {
			return $(this).text();
		}).get().filter(function(elm) {
			return elm != 'More';
		});
	})
	.then(function(news) {
		news.forEach(function(elm) {
			console.log(elm);
		});
	});