exports.errorMsg = "Unexpected banner teaser schema";

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
		imgUrl4x4: {
			type: String, 
			required: false, 
			length: { 
				min: 8 
			} 
		}
	};
}

exports.runCustomSchemas = require('./_anyTeaser').runCustomSchemas;