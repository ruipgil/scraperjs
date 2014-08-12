var express = require('express'),
	fs = require('fs');

module.exports = function(grunt, port) {
	var app = express(),
		HN_CLONE = fs.readFileSync(__dirname + '/static/hacker-news-clone.html');

	app.get('/hacker-news-clone', function(req, res) {
		res.status(200);
		res.send(HN_CLONE);
	});

	app.post('/hacker-news-clone', function(req, res) {
		res.status(200);
		res.send('<html><head></head><body><div id="POST_MESSAGE">random text</div></body></html>');
	});

	app.param('id', function(req, res, next, id) {
		var regex = /^[\d\w]+$/;
		if (regex.test(id)) {
			next();
		} else {
			next('route');
		}
	});
	app.get('/watch/:id', function(req, res, next) {
		res.status(200);
		res.send(req.params.id);
	});
	app.get('/info/:id', function(req, res, next) {
		res.status(200);
		res.send(req.params.id);
	});
	app.post('/watch/:id', function(req, res, next) {
		res.status(200);
		res.send(req.params.id + "post");
	});

	var server = app.listen(port || 3000, function() {
		console.log('Listening on port %d', server.address().port);
	});

	return server;
};