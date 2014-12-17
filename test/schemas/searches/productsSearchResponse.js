var async = require("async");

exports.errorMsg = "Unexpected products search response schema.";

exports.getSchema = function() {
	return {
		data: {
			type: Object,
			required: true,
			page: {
				type: Object,
				required: true,
				page: {
					Object: Number,
					required: true
				},
				size: {
					Object: Number,
					required: true
				},
				count: {
					Object: Number,
					required: true
				}
			},
			items: {
				type: Array,
				required: true
			}
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj, function(product, cb) {
		run(require('./searchProduct'), product, cb);
	}, done);
}