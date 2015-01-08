var async = require("async");

exports.route = function(app, router) {

	router.get(/^\/related_queries\/([^\/]+)$/, function(req, resp) {
		var query = "SELECT `tag` FROM `product_tags`";
		app.db.all(query, function(err, res) {
			if (!!err) return resp.status(501).end();
			if (!res) return resp.status(404).end();
			var terms = [];
			res.forEach(function(data) { terms.push(data.tag); });
			var queries = [];
			for (var i=0; i<=(Math.random()*1000 % 10); i++) {
				var query = [];
				for (var j=0; j<=(Math.random()*1000 % Math.max(terms.length, 3)); j++) {
					query.push(terms[j]);
				}
				queries.push(query.join(" "));
			}
			Array.prototype.diff = function(a) {
				return this.filter(function(i) {return a == i;});
			};
			queries = queries.diff(req.query["q"]);
			resp.status(200).json(app.limitResponse(req, { data: queries }));
		});
	});

}