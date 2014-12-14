var async = require("async");

exports.getSchema = function() {
	return {
		data: {
			type: Array,
			required: true
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {
	async.each(obj.data, function(entry, cb) {
		run({
			getSchema: function() {
				return {
					type: Object,
					body: {
						type: Object,
						required: true
					},
					statusCode: {
						type: Number,
						required: true
					}
				}
			}
		}, entry, cb);
	}, done);
}