exports.route = function(app, router) {

	router.get(/^\/categories\/top$/, function(req, resp) {
		var query = "SELECT c.id, label, img_url_4x4 as `imgUrl4x4`, tags "
		+ "FROM `categories` AS c "
		+ "LEFT JOIN `item_queries` AS iq "
		+ "ON c.item_query_id = iq.id "
		+ "WHERE parent_id IS NULL"
		app.db.all(query, function(err, res) {
			res.map(function(item) {
      			item.itemsQuery = { tags: JSON.parse(item.tags) };
      			delete item.tags;
      		});
			if (err != null) return resp.status(501).end();
      		if (!res) return resp.status(404).end();
			var categoriesResponse = {"data": res};
			resp.status(200).json(app.limitResponse(req, categoriesResponse));
		});
	});

	router.get(/^\/categories\/([^\/]+)\/subcategories/, function(req, resp) {
		var query = "SELECT c.id, label, img_url_4x4 as `imgUrl4x4`, tags "
		+ "FROM `categories` AS c "
		+ "LEFT JOIN `item_queries` AS iq "
		+ "ON c.item_query_id = iq.id "
		+ "WHERE parent_id = ?";
		app.db.all(query, req.params[0], function(err, res) {
			if (err != null) return resp.status(501).end();
      		if (!res) return resp.status(404).end();
      		res.map(function(cat) {
      			cat.itemsQuery = { tags: JSON.parse(cat.tags) };
      			delete cat.tags;
      		});
			var categoryResponse = {"data": res};
			resp.status(200).json(app.limitResponse(req, categoryResponse));
		});
	});

	router.get(/^\/categories\/([^\/]+)$/, function(req, resp) {
	  	var query = "SELECT c.id, label, img_url_4x4 as `imgUrl4x4`, tags "
		+ "FROM `categories` AS c "
		+ "LEFT JOIN `item_queries` AS iq "
		+ "ON c.item_query_id = iq.id "
		+ "WHERE c.id = ?";
		app.db.get(query, req.params[0], function(err, res) {
			if (err != null) return resp.status(501).end();
      		if (!res) return resp.status(404).end();
      		res.itemsQuery = { tags: JSON.parse(res.tags) };
      		delete res.tags;
			var categoryResponse = {"data": res};
			resp.status(200).json(app.limitResponse(req, categoryResponse));
		});
	});

}