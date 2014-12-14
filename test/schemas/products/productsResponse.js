var async = require("async");

exports.errorMsg = "Unexpected products response schema.";

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
		run(require('./product'), product, cb);
	}, done);
}