/* global $ */
var sjs = require('../../');
/**
 * Displays the movies opening this week, from IMDB.
 * This example is inspired by user jasode at Hacker News.
 *   {@link https://news.ycombinator.com/item?id=8193522}
 *   Note that the list of movies opening this week is loaded
 *   dynamically. A static scraper can't scrape this content, this way.
 */
sjs.DynamicScraper
	.create('https://www.imdb.com')
	.scrape(function($) {
		return $('.otw-title').map(function() {
			return $(this).text().trim();
		}).get();
	})
	.then(function(movies) {
		movies.forEach(function(movie) {
			console.log(movie);
		});
	});