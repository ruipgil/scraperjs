var scraper = require('../src/scraper.js');

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
 */
scraper.createStatic("https://news.ycombinator.com/")
	.onStatusCode(404, function() {
		console.log("404");
	})
	.onStatusCode(200, function() {
		console.log("200");
	})
	.scrape(function($) {
		return $(".title a").map(function(elm) {
			return $(this).text();
		}).get();
	}, function(news) {
		news.forEach(function(newsElm) {
			console.log(newsElm);
		});
	})
	.done(function(err) {
		console.log("i'm done");
	});
/*
scraper.createDynamic("http://google.com")
	.onStatusCode(500, function() {})
	.timeout(function() {})
	.scrape(function(window, $) {}, function(err, result) {});

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