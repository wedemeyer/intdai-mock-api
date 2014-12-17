exports.route = function(app, router) {
	router.get(/^\/health$/, function (req, resp) {
		resp.status(200).end();
	});
}