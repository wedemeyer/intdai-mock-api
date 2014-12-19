var async = require("async");

exports.errorMsg = "Unexpected response schema.";

exports.getSchema = function() {
	return {
		data: {
			type: Array,
			required: true
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj.data, function(recommendation, cb) {
		run(require('./recommendation'), recommendation, cb);
	}, done);
}