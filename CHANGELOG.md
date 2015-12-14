# Change Log

## [1.2.0] - 2015-12-14
- Change order of parameters when continuing promise chain.
- ``` async ```'s callback function receives (err, result) parameters.
- Last result is passed to ``` done ``` promise.

## [1.1.0] - 2015-12-12
- Result of last promise is passed as first parameter to the ``` async ``` promise.

## [1.0.2] - 2015-12-10
- Dependency bump

## [1.0.0] - 2015-10-17
- ``` catch ``` promise is the new standard way to deal with errors. ``` onError ``` is being deprecated, the two work the same way.
- ``` then ``` promise receives the value returned in the last promise as the first parameter, the second parameter is the ``` utils ``` object.
- Errors generated inside the dynamic scraper's scraping function will fire the ``` catch ``` promise.

## [0.4.1] - 2015-10-04
- Url of the page being scraped can now be easily accessed using ``` utils.url ```.
- Added error handling example.

## [0.4.0] - 2015-09-19
- Passing utils to the error callback by @rvernica
- Add an 'options' argument to DynamicScraper that get passed to Phantom by @vdraceil
- Updated dependencies

## [0.3.4] - 2015-04-26
- Minor fixes related with documentation.
- Fixed ``` async ``` promise works. It can receive values to be passed to the next promise. Internally it now uses this mechanism.
- Support for node 0.12.
- Changes in the command-line interface.

## [0.3.3] - 2015-02-11
- Fixed bug where no argument was given to the ```done``` promise when there was an error.
- Added experimental support for command-line interface.
- Added example.

## [0.3.2] - 2014-12-20
- The ```lastResult``` is now made accessible to a ```Router```.
