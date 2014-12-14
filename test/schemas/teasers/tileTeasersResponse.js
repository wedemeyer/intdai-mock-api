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
	async.each(obj.data, function(teaser, cb) {
		run(require('./tileTeaser'), teaser, cb);
	}, done);
}