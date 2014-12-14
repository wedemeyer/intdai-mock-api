var schema = {
	type: Object,
	required: true,
	id: {
		type: String,
		required: true,
		length: { 
			min: 36 
		}, 
		test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i 
	},
	type: {
		type: String,
		required: true,
		length: {
			min: 1
		}
	},
	key: {
		type: String,
		required: true,
		length: {
			min: 1
		}
	},
	value: {
		type: String,
		required: true
	}
};

exports.getSchema = function() {
	return schema;
}