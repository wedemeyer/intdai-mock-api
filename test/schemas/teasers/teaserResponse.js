var async = require("async");

exports.errorMsg = "Unexpected response schema.";

exports.getSchema = function() {
	return {
		data: {
			type: Object,
			required: true
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	run(require('./teaser'), obj.data, done);
}