async = require("async");
assert = require("assert");

exports.getSchema = function() {
	return {
		id: { 
			type: String, 
			required: true, 
			length: { 
				min: 36 
			}, 
			test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i 
		},
		title: {
			type: String,
			required: true
		},
		imgUrls: {
			type: Object,
			required: true
		}
	};
}

exports.runCustomSchemas = function(run, obj, done) {	
	async.each(Object.keys(obj.imgUrls), function(key, cb) {
		assert(/^http(s)?:\/\/.+\.[a-z]+$/.test(obj.imgUrls[key]), "Unexpected teaser image URL format");
		cb();
	}, done);
};