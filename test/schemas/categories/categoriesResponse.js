var async = require("async");

exports.errorMsg = "Unexpected response schema.";

exports.getSchema = function() {
	return {
		type: Object,
		data: {
			type: Array,
			required: true
		}
	};
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj, function(category, cb) {
		run(require('./category'), category, cb);
	}, done);
}