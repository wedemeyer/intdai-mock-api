var async = require("async");

exports.errorMsg = "Unexpected products search response schema.";

exports.getSchema = function() {
	return {
		data: {
			type: Array,
			required: true
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj, function(product, cb) {
		run(require('./searchProduct'), product, cb);
	}, done);
}