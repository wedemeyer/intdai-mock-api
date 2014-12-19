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
		sections: {
			type: Array,
			required: true,
			length: { 
				min: 1 
			} 		
		},
		imgUrls: {
			type: Object,
			required: true
		}
	};
}

exports.runCustomSchemas = function(run, obj, done) {
	async.parallel([
		function(cb) {
			async.each(obj.sections, function(section, cb) {
				run(require("./teaserSection"), section, cb);
			}, cb);
		},
		function(cb) {
			async.each(Object.keys(obj.imgUrls), function(key, cb) {
				assert(/^http(s)?:\/\/.+\.[a-z]+$/.test(obj.imgUrls[key]), "Unexpected teaser image URL format");
				cb();
			}, cb);
		}
	], done);
};