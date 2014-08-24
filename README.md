# Scraperjs
[![Build Status](https://travis-ci.org/ruipgil/scraperjs.svg?branch=master)](https://travis-ci.org/ruipgil/scraperjs) [![Dependency Status](https://gemnasium.com/ruipgil/scraperjs.svg)](https://gemnasium.com/ruipgil/scraperjs) [![Coverage Status](https://coveralls.io/repos/ruipgil/scraperjs/badge.png)](https://coveralls.io/r/ruipgil/scraperjs) [![NPM version](https://badge.fury.io/js/scraperjs.svg)](http://badge.fury.io/js/scraperjs)

Scraperjs is a web scraper module that make scraping the web an easy job.

## Installing

```
npm install scraperjs
```

If you would like to test (this is optional and requires the installation with the ``` --save-dev ``` tag),
```
grunt test
```

# Getting started

Scraperjs exposes two different scrapers,
+ a **SimpleScraper**, that is light fast and with a low footprint, however it doesn't allow for more complex situations, like scraping dynamic content.
+ a **DynamicScraper**, that is a bit more heavy, but allows you to scrape dynamic content, like in the browser console.
both scrapers expose a *very* similar API, with some minor differences when it comes to scraping.

## Lets scrape [Hacker News](https://news.ycombinator.com/), with both scrapers.

Try to spot the differences.

### Static Scraper

```javascript
var scraperjs = require('scraperjs');
scraperjs.StaticScraper.create('https://news.ycombinator.com/')
	.scrape(function($) {
		return $(".title a").map(function() {
			return $(this).text();
		}).get();
	}, function(news) {
		console.log(news);
	})
```

The ```scrape``` promise receives two functions, the first will scrape the page and return the result. The second will receive the result of the scraping.
This scraper function only receives jQuery a parameter to scrape the page. Still, very powerful. It uses [cheerio](https://github.com/cheeriojs/cheerio) to do the magic behind the scenes.

### Dynamic Scraper

```javascript
var scraperjs = require('scraperjs');
scraperjs.DynamicScraper.create('https://news.ycombinator.com/')
	.scrape(function() {
		return $(".title a").map(function() {
			return $(this).text();
		}).get();
	}, function(news) {
		console.log(news);
	})
```

Again, the ```scrape``` promise receives two functions, the only difference is that, because we're using a dynamic scraper, the scraping function is [sandboxed](https://github.com/sgentle/phantomjs-node/wiki#evaluating-pages) only with the page scope, so **no closures(!)**. This means that in *this* (and only in this) scraper you can't call a function that has not been defined inside the scraping function. Also, the result of the scraping function must be [JSON-serializable](https://github.com/sgentle/phantomjs-node/wiki#evaluating-pages).
We use [phantom](https://github.com/sgentle/phantomjs-node) and [phantomjs](https://github.com/ariya/phantomjs) to make it happen, we also inject jQuery for you.

## Show me the way! (aka Routes)

For a more flexible scraping and crawling of the web sometimes we need to go through multiple web sites and we don't want map every possible url format. For that scraperjs provides the Router class.

### Example

```javascript
var scraperjs = require('scraperjs'),
	router = new scraperjs.Router();

router
	.otherwise(function(url) {
	console.log("Url '"+url+"' couldn't be routed.");
});

var path = {};

router.on('https?://(www.)?youtube.com/watch/:id')
	.createStatic()
	.scrape(function($) {
		return $("a").map(function() {
			return $(this).attr("href");
		}).get();
	}, function(links, utils) {
		path[utils.params.id] = links
	})

router.route("https://www.youtube.com/watch/YE7VzlLtp-4", function() {
	console.log("i'm done");
});
```

Code that allows for parameters in paths is from the project [Routes.js](https://github.com/aaronblohowiak/routes.js), information about the [path formating](https://github.com/aaronblohowiak/routes.js#path-formats) is there too.

# API overview

Scraperjs uses promises whenever possible.

#### StaticScraper, DynamicScraper and ScraperPromise

So, the scrapers should be used with the ScraperPromise. By creating a scraper
```javascript
var scraperPromise = scraperjs.StaticScraper.create() // or DynamicScraper
```
The following promises can be made over it, they all return a scraper promise,
+ ```onStatusCode(code:number, callback:function(utils))```, executes the callback when the status code is equal to the code,
+ ```onStatusCode(callback:function(code:number, utils))```, executes the callback when receives the status code. The callback receives the current status code,
+ ```delay(time:number, callback:function(utils))```, delays the execution of the chain by time milliseconds,
+ ```timeout(time:number, callback:function(utils))```, executes the callback function after time milliseconds,
+ ```then(callback:function(utils))```, executes the callback after the last promise,
+ ```async(callback:function(done, utils))```, executes the callback, stopping the promise chain, resuming it when the ```done``` function is called,
+ ```onError(callback:function(utils))```, executes the callback when there was an error, errors block the execution of the chain even if the promise was not defined,
+ ```done(callback:function(utils))```, executes the callback at the end of the promise chain, this is always executed, even if there was an error,
+ ```get(url:string)```, makes a simple HTTP GET request to the url. This promise should be used only once per scraper.
+ ```request(options:Object)```, makes a (possibly) more complex HTTP request, scraperjs uses the [request](https://github.com/mikeal/request) module, and this method is a simple wrapper of ```request.request()```. This promise should be used only once per scraper.
+ ```use(ScraperPromise)```, uses a ScraperPromise already instantiated.
+ ```scrape(scrapeFn:function(...?), callback:function(result:?, utils), ...?)```, scrapes the page. It executes the scrapeFn and passes it's result to the callback. When using the StaticScraper, the scrapeFn receives a jQuery function that is used to scrape the page. When using the DynamicScraper, the scrapeFn doesn't receive nothing and can only return a [JSON-serializable](https://github.com/sgentle/phantomjs-node/wiki#evaluating-pages) type. Optionally an arbitrary number of arguments can be passed to the scraping function.

All callback functions receive as their last parameter a utils object, with it the parameters of an url from a router can be accessed. Also the chain can be stopped.
```javascript
DynamicScraper.create()
	.get("http://news.ycombinator.com")
	.then(function(utils) {
		utils.stop();
		// utils.params.paramName
	});
```

The promise chain is fired with the same sequence it was declared, with the exception of the promises get and request that fire the chain when they've received a valid response, and the promises done and onError, which were explained above.

You can also waterfall values between promises by returning them (with the exception of the promise ```timeout```, that will always return ```undefined```) and it can be access through ```utils.lastReturn```.

##### A more powerful DynamicScraper.

When lots of instances of DynamicScraper are needed, it's creation gets really heavy on resources and takes a lot of time. To make this more lighter you can use a *factory*, that will create only one PhantomJS instance, and every DynamicScraper will request a page to work with. To use it you must start the factory before any DynamicSrcaper is created, ``` scraperjs.DynamicScraper.startFactory() ``` and then close the factory after the execution of your program, ``` scraperjs.DynamicScraper.closeFactory() ```.
To make the scraping function more robust you can inject code into the page,
```js
var ds = scraperjs.DynamicScraper
	.create('http://news.ycombinator.com')
	.async(function(done, utils) {
		utils.scraper.inject(__dirname+'/path/to/code.js', function(err) {
			// in this case if there was an error won't fire onError promise.
			if(err) {
				utils.stop();
			} else {
				done();
			}
		});
	})
	.scrape(function() {
			return functionInTheCodeInjected();
		}, function(result) {
			console.log(result);
		});
```

#### Router

The router should be initialized like a class
```javascript
var router = new scraperjs.Router(options);
```

The options object is optional, and these are the options:
+ ``` firstMatch ```, a boolean, if true the routing will stop once the first path is matched, the default is false.

The following promises can be made over it,
+ ```on(path:string|RegExp|function(url:string))```, makes the promise for the match url or regular expression, alternatively you can use a function to accept or not a passed url. The promises ```get``` or ```request``` and ```createStatic``` or ```createDynamic``` are expected after the on promise.
+ ```get()```, makes so that the page matched will be requested with a simple HTTP request,
+ ```request(options:Object)```, makes so that the page matched will be requested with a possible more complex HTTP request, , scraperjs uses the [request](https://github.com/mikeal/request) module, and this method is a simple wrapper of [request.request()](https://github.com/mikeal/request#requestoptions-callback),
+ ```createStatic()```, associates a static scraper to use to scrape the matched page, this returns ScraperPromise, so any promise made from now on will be made over a ScraperPromise of a StaticScraper. Also the ```done``` promise of the scraper will not be available.
+ ```createDynamic()```, associates a dynamic scraper to use to scrape the matched page, this returns ScraperPromise, so any promise made from now on will be made over a ScraperPromise of a DynamicScraper. Also the ```done``` promise of the scraper will not be available.
+ ```route(url:string, callback:function(boolean))```, routes an url through all matched paths, calls the callback when it's executed, true is passed if the route was successful, false otherwise.
+ ```otherwise(callback:function(url:string))```, executes the callback function if the routing url didn't match any path.
+ ```onError(callback:function(url:string, error:Error))```, executes the callback when an error occurred on the routing scope, not on any scraper, for that situations you should use the ```onError``` promise of the scraper.

#### More

Check the [examples](./doc/examples), the [tests](./test) or just dig into the code, it's well documented and it's simple to understand.

# Dependencies

As mentioned above, scraperjs is uses some dependencies to do the the heavy work, such as
+ [```async```](https://github.com/caolan/async), for flow control
+ [```request```](https://github.com/mikeal/request), to make HTTP requests, again, if you want more complex requests see it's [documentation](https://github.com/mikeal/request#requestoptions-callback)
+ [```phantom```](https://github.com/sgentle/phantomjs-node) + [```phantomjs```](https://github.com/ariya/phantomjs), phantom is an awesome module that links node to phantom, used in the DynamicScraper
+ [```cheerio```](https://github.com/cheeriojs/cheerio), light and fast DOM manipulation, used to implement the StaticScraper
+ [```jquery```](https://github.com/jquery/jquery), to include jquery in the DynamicScraper
+ although [```Routes.js```](https://github.com/aaronblohowiak/routes.js) is great, scraperjs doesn't use it to maintain it's "interface layout", but the code to transform the path given on the on promise to regular expressions is from them

# License

This project is under the [MIT](./LICENCE) license. 
