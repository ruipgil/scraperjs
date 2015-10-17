/**
 * DISCLAIMER
 * This is a relatively simple example, to illustrate some of the
 *   possible functionalities and how to achieve them.
 *   There is no guarantee that this example will provide useful
 *   results.
 *   Use this example with and at your own responsibility.
 *
 * In this example we run through some urls and try to extract their
 *   30th link. It demonstrates how to deal with errors.
 *
 * To run:
 * 'node ErrorHandling.js'
 */

var sjs = require('../../');

var log = console.log;
var router = new sjs.Router();

function create30thLinkError() {
  var err = new Error("Page doesn't have 30th link");
  err.code = '30THLINK';
  return err;
}

router
  .on('*')
  .createStatic()
  .onStatusCode(function(code, utils) {
    // if it's not Ok pause and log.
    if (code != 200) {
      log("Page '%s' has status code %d", utils.url, code);
      utils.stop();
    }
  })
  .catch(function(err, utils) {
    // deal identify with errors and recover or panic
    // this has the same problems as js error handling,
    // it's messy and ugly
    switch (err.code) {
      case 'ENOTFOUND':
        log("Page '%s' not found", err.hostname);
        break;
      case '30THLINK':
        log("Page '%s' doesn't have a 30th link", utils.url);
        break;
      default:
        log('Unknown error found %s', err);
    }
  })
  .scrape(function($) {
    var thirty = $('a')[30];
    if (thirty) {
      return $(thirty).attr('href');
    } else {
      throw create30thLinkError();
    }
  })
  .then(function(thirty, utils) {
    log("'%s' has '%s' as it's 30th link", utils.url, thirty);
  });

// Front page of google doesn't have a 30th link
router.route('http://google.com');
// This page doesn't exist
router.route('http://wouvoogle.com');
// Hacker new have a 30th link
router.route('http://news.ycombinator.com');