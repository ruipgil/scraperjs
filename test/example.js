var scraper = require('../src/Scraper.js');

/*
	scraper promises:
		onStatusCode( statusCode:Number, fn:function() )
			- when receives a status code
		scrape(fn:function(window:object, $:object))
			- function to use when scraping
		done(fn:function(result:object?))
			- callback function
		delay
			- pauses the execution by x ms
		timeout
			- delays the execution by x ms

	desirable features:
		- stop() method, on every promise, except on the scrape
		? repeat() method
 */
/*scraper.createStatic("https://news.ycombinator.com/")
	.onStatusCode(404, function() {
		console.log("404");
	})
	.scrape(
		function($) {
			return $(".title a").map(function(elm) {
				return $(this).text();
			}).get();
		}, function(news) {
			news.forEach(function(newsElm) {
				console.log(newsElm);
			});
		})
	.onError(function(error) {
		console.log("there's an error", error, error.stack);
	})
	.done(function() {
		console.log("i'm done");
	});*/

scraper.createDynamic("https://news.ycombinator.com/")
	.onStatusCode(404, function() {
		console.log("404");
	})
	.scrape(
		function() {
			return $(".title a").map(function(elm) {
				return $(this).text();
			}).get();
		}, function(news) {
			news.forEach(function(newsElm) {
				console.log(newsElm);
			});
		})
	.onError(function(error) {
		console.log("there's an error", error, error.stack);
	})
	.done(function() {
		console.log("i'm done");
	});

/*
var router = scraper.createRouter();
router.on("http://{www}youtube.com/{}").createDynamic()
	.onStatusCode(500, function() {})
	.timeout(function() {})
	.scrape(function(window, $) {})
	.done(function(result) {});


router.on("http://{www}youtube.com/{}").createDynamic()
	.onStatusCode(500, function() {})
	.timeout(function() {})
	.scrape(function(window, $) {})
	.done(function(result) {});

router.route(url);*/