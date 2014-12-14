async = require("async");

exports.getSchema = function() {
	return {
		type: Object,
		data : {
			type: Array,
			required: true,
			length: {
				min: 1
			}
		}
	};
};

exports.runCustomSchemas = function(run, obj, done) {
	for (var i=0; i<obj.data.length; i++) {
		async.each(obj, function(category, cb) {
			run(require('./category'), category, cb);
		}, done);
	}
}