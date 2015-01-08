var async = require("async");

exports.errorMsg = "Unexpected terms search response schema.";

exports.getSchema = function() {
	return {
		data: {
			type: Array,
			required: true
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj, function(entry, cb) {
		run({ getSchema: function() { return { type: String }; } }, entry, cb);
	}, done);
}