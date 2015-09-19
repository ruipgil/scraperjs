# Change Log

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
