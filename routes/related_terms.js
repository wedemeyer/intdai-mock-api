var async = require("async");

exports.route = function(app, router) {

	router.get(/^\/related_terms\/([^\/]+)$/, function(req, resp) {
		var tags = req.params[0].split(" ");
		var query = "SELECT `tag` FROM `product_tags`";
		app.db.all(query, function(err, res) {
			if (!!err) return resp.status(501).end();
			if (!res) return resp.status(404).end();
			var terms = [];
			res.forEach(function(data) { terms.push(data.tag); });
			Array.prototype.diff = function(a) {
				return this.filter(function(i) {return a.indexOf(i) < 0;});
			};
			terms = terms.diff(tags);
			resp.status(200).json(app.limitResponse(req, { data: terms }));
		});
	});

}