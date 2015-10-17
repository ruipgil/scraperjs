/* global describe, it, $ */
var scraper = require('../src/Scraper'),
  exec = require('child_process').exec,
  Router = scraper.Router,
  assert = require('assert'),
  LH = 'http://localhost:3000';

function execSjs(more, callback) {
  var command = 'node ./bin/scraperjs ' + LH + '/hacker-news-clone ' + more;
  exec(command, function(error, out, err) {
    if(err || error) {
      return;
    } else {
      callback(JSON.parse(out));
    }
  });
}

describe('Command line tool', function() {
  describe('--text', function() {
    describe('--selector', function(done) {
      it('--static', function(done) {
        execSjs('--selector ".title a" --text -s', function(result) {
          assert.equal(result.length, 10);
          done();
        });
      });
      it('--dynamic', function(done) {
        execSjs('--selector ".title a" --text -d', function(result) {
          assert.equal(result.length, 9);
          done();
        });
      });
    });
  });

  describe('--html', function() {
    describe('--selector', function(done) {
      it('--static', function(done) {
        execSjs('--selector ".title a" --html -s', function(result) {
          assert.equal(result.length, 10);
          done();
        });
      });
      it('--dynamic', function(done) {
        execSjs('--selector ".title a" --html -d', function(result) {
          assert.equal(result.length, 9);
          done();
        });
      });
    });
  });

  describe('--attr', function() {
    describe('--selector', function(done) {
      it('--static', function(done) {
        execSjs('--selector ".title a" --attr href -s', function(result) {
          assert.equal(result.length, 10);
          done();
        });
      });
      it('--dynamic', function(done) {
        execSjs('--selector ".title a" --attr href -d', function(result) {
          assert.equal(result.length, 9);
          done();
        });
      });
    });
  });
});
