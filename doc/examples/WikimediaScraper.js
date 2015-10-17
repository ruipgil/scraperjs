/**
 * DISCLAIMER
 * This is a relatively simple example, to illustrate some of the
 *   possible functionalities and how to achieve them.
 *   There is no guarantee that this example will provide useful
 *   results.
 *   Use this example with and at your own responsibility.
 *
 * In this example we run through a list of links, if they have a
 *   route defined they will be scraped. Their title, language and 
 *   first paragraph.
 *
 * To run:
 * 'node WikimediaScraper.js link1 [... linkN]'
 */

var sjs = require('../../src/Scraper'),
	async = require('../../node_modules/async'),
	parseUrl = require('url').parse,
	urls = process.argv.slice(2);

if(!urls || !urls.length) {
	console.log("Usage: node WikimediaScraper.js url [...url]");
	return;
}

var IMDB_SELECTOR = '[itemprop=description]',
	gatheredInformation = [],
	unknownRoutes = [];

var router = new sjs.Router({
	firstMatch: true
});

router
	.on('https?://:lang.wikipedia.org/wiki/:article')
	.get()
	.createStatic()
	// if the status code is different from OK (200) we stop
	.onStatusCode(function(statusCode, utils) {
		if(statusCode!==200) {
			utils.stop();
		}
	})
	.scrape(function($) {
		return {
			title: $('h1').first().text(),
			text: $('p').first().text()
		};
	})
	.then(function(last, utils) {
		last.lang = utils.params.lang;
		return last;
	});

// the same functionality than the above
var scraperForWiki = sjs.StaticScraper
	.create()
	.onStatusCode(function(statusCode, utils) {
		if(statusCode!==200) {
			utils.stop();
		}
	})
	.scrape(function($) {
		return {
			title: $('h1').first().text(),
			text: $('p').first().text()
		};
	})
	.then(function(last, utils) {
		if(utils.params) {
			last.lang = utils.params.lang;
		} else {
			last.lang = "?";
		}
		return last;
	});

router
	.on(function(url) {
		return parseUrl(url).host === 'en.wikiquote.com';
	})
	.use(scraperForWiki);

router
	.on('https?://:lang.wikinews.org/wiki/:place')
	.use(scraperForWiki);

router.otherwise(function(url) {
	unknownRoutes.push(url);
});

async.eachLimit(urls, 2, function(url, done) {
	router.route(url, function(found, returned) {
		if(found && returned) {
			gatheredInformation.push(returned);
		}
		done();
	});
}, function(err) {
	if(err) {
		return;
	}

	gatheredInformation.forEach(function(item) {
		console.log(item.title.toUpperCase()+" ("+item.lang+")");
		console.log("\t"+item.text);
	});
})