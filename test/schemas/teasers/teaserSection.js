var async = require("async");
var assert = require("assert");

exports.errorMsg = "Unexpected sections schema";

exports.getSchema = function() {
	return {
		title: {
			type: String,
			required: true
		},
		flowType: {
			type: String,
			required: true,
			test: /^(PRODUCT_DETAIL|PINTEREST)$/
		},
		sortOptions: {
			type: Array,
			required: true
		},
		itemsQuery: {
			type: Object,
			required: true,
			tags: { 
				type: Array, 
				required: true, 
				length: { 
					min: 1 
				},
				test: /^[a-z]$/gi
			}
		}
	}
}

exports.runCustomSchemas = function(run, obj, done) {	
	async.each(obj.sortOptions, function(key, cb) {
		assert(typeof key == "string", "Unexpected teaser type");
		assert(/^(relevance|popularity|price|discount|time)$/.test(key), "Unexpected sort option: " + key);
		cb();
	}, done);
};