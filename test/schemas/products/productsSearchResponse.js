var async = require("async");

exports.errorMsg = "Unexpected products search response schema.";

exports.getSchema = function() {
	return {
		data: {
			type: Array,
			required: true,
			length: {
				max: 30
			}
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj, function(product, cb) {
		run(require('./productHeader'), product, cb);
	}, done);
}