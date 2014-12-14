var async = require("async");
var request = require("request");

exports.route = function(app) {

	app.get(/^\/batches$/, function (req, resp) {
		var urls = req.query["urls"];
		if (!urls) return resp.status(404).end();
		async.map(urls, function (url, cb) {
			request(url, function (err, res, body) {
				// If there was an error respond the batches with an internal error
				if (!!err) return cb(err);
				var contentType = null;
				if (!!body && !!(contentType = res.headers['content-type']) && contentType.indexOf("application/json") > -1) {
					body = JSON.parse(body);
				}
				cb(null, { body: body, statusCode: res.statusCode });
			});
		}, function (err, res) {
			if (!!err) return resp.status(501).end();
			resp.status(200).json(app.limitResponse(req, {data: res}));
		});
	});

}