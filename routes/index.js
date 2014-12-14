path = require("path");

exports.route = function(app) {
	// Except this file to not lock dead, connect all route configurations in this folder
	var normalizedPath = path.join(__dirname, "./");
	require("fs").readdirSync(normalizedPath).forEach(function(file) {
		if (file == "index.js") return;
	  	require("./" + file).route(app);
	});
};